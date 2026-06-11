import base64
import hashlib
import hmac
import json
import logging
import time

import requests as http_requests

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

from .models import Payment, PolarWebhookEvent
from .plans import PLAN_KEYS, PLANS
from .serializers import (
    CreditBalanceSerializer,
    CreditTransactionSerializer,
    PaymentSerializer,
    UserBillingProfileSerializer,
)
from .services import (
    get_credit_status,
    get_or_create_billing_profile,
    get_or_create_credit_balance,
    grant_plan_credits,
)


class BillingConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        token = settings.POLAR_ACCESS_TOKEN
        product_ids = settings.POLAR_PRODUCT_IDS
        has_token = bool(token)
        has_product_ids = {k: bool(v) for k, v in product_ids.items()}
        provider_configured = has_token and all(has_product_ids.values())

        logger.info(
            '[Polar config] server=%s env=%s has_token=%s product_ids=%s configured=%s',
            settings.POLAR_SERVER, settings.POLAR_ENV, has_token, has_product_ids, provider_configured,
        )

        return Response({
            'provider': 'polar',
            'provider_configured': provider_configured,
            'polar_server': settings.POLAR_SERVER,
            'polar_env': settings.POLAR_ENV,
            'has_token': has_token,
            'has_product_ids': has_product_ids,
        })


class PlanListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(list(PLANS.values()))


class BillingMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_or_create_billing_profile(request.user)
        balance = get_or_create_credit_balance(request.user)
        credit_status = get_credit_status(request.user)
        transactions = request.user.credit_transactions.order_by('-created_at')[:20]
        payments = request.user.payments.order_by('-created_at')[:10]

        return Response({
            'profile': UserBillingProfileSerializer(profile).data,
            'balance': CreditBalanceSerializer(balance).data,
            'can_run_audit': credit_status['can_run_audit'],
            'can_generate_image': credit_status['can_generate_image'],
            'upgrade_required': credit_status['upgrade_required'],
            'recent_transactions': CreditTransactionSerializer(transactions, many=True).data,
            'recent_payments': PaymentSerializer(payments, many=True).data,
        })


class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not getattr(request.user, 'email_verified', False):
            return Response(
                {'detail': 'Please verify your email before purchasing a plan.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        plan_key = request.data.get('plan_key')
        if not plan_key or plan_key not in PLAN_KEYS:
            return Response({'detail': 'Invalid plan_key.'}, status=status.HTTP_400_BAD_REQUEST)

        plan = PLANS[plan_key]
        if plan['mode'] == 'free':
            return Response({'detail': 'Cannot create a checkout session for a free plan.'}, status=status.HTTP_400_BAD_REQUEST)

        payment = Payment.objects.create(
            user=request.user,
            provider=settings.PAYMENT_PROVIDER,
            plan_key=plan_key,
            amount_cents=plan['amount_cents'],
            currency='usd',
            status='pending',
            mode=plan['mode'],
        )

        checkout_url = f"{settings.FRONTEND_URL}/dashboard/billing?checkout=mock&plan={plan_key}&payment_id={payment.id}"

        return Response({
            'payment_id': payment.id,
            'checkout_url': checkout_url,
            'message': 'Mock checkout — no real charge will be made.',
        })


class PolarCreateCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    _VALID_PLANS = ('launch', 'pro', 'growth', 'agency')

    def post(self, request):
        if not getattr(request.user, 'email_verified', False):
            return Response(
                {'detail': 'Please verify your email before purchasing a plan.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        plan = request.data.get('plan')
        logger.info('[Polar checkout] plan=%s user=%s', plan, request.user.email)

        if not plan or plan not in self._VALID_PLANS:
            return Response({'detail': 'Invalid plan.'}, status=status.HTTP_400_BAD_REQUEST)

        product_id = settings.POLAR_PRODUCT_IDS.get(plan, '')

        if not product_id:
            logger.error('[Polar checkout] POLAR_%s_PRODUCT_ID is not set', plan.upper())
            return Response(
                {'detail': f'Product not configured for plan: {plan}.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        token = settings.POLAR_ACCESS_TOKEN
        if not token:
            logger.error('[Polar checkout] POLAR_ACCESS_TOKEN is not set')
            return Response({'detail': 'Payment provider not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        base_url = (
            'https://sandbox-api.polar.sh'
            if settings.POLAR_SERVER == 'sandbox'
            else 'https://api.polar.sh'
        )
        endpoint = f'{base_url}/v1/checkouts/'

        # Pre-request config dump — safe: no token value printed
        logger.info(
            '[Polar checkout] PRE-REQUEST '
            'polar_env=%s polar_server=%s '
            'has_token=%s token_length=%s '
            'plan=%s has_product_id=%s '
            'api_url=%s',
            settings.POLAR_ENV,
            settings.POLAR_SERVER,
            bool(token),
            len(token),
            plan,
            bool(product_id),
            endpoint,
        )

        payload = {
            'products': [product_id],
            'success_url': settings.POLAR_SUCCESS_URL,
            'metadata': {
                'user_id': str(request.user.id),
                'email': request.user.email,
                'plan': plan,
            },
        }
        if request.user.email:
            payload['customer_email'] = request.user.email
        full_name = getattr(request.user, 'full_name', '') or ''
        if full_name:
            payload['customer_name'] = full_name

        try:
            resp = http_requests.post(
                endpoint,
                json=payload,
                headers={
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json',
                },
                timeout=15,
            )
        except http_requests.RequestException as exc:
            logger.error('[Polar checkout] network error: %s', exc)
            return Response({'detail': 'Could not reach payment provider.'}, status=status.HTTP_502_BAD_GATEWAY)

        logger.info('[Polar checkout] response status=%s', resp.status_code)

        if resp.status_code not in (200, 201):
            try:
                polar_body = resp.json()
            except Exception:
                polar_body = resp.text
            logger.error(
                '[Polar checkout] Polar API error status=%s body=%s',
                resp.status_code, polar_body,
            )

            if settings.DEBUG:
                return Response(
                    {'detail': f'Polar API error {resp.status_code}: {polar_body}'},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            return Response(
                {'detail': 'Failed to create checkout session.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        data = resp.json()
        checkout_url = data.get('url', '')
        logger.info('[Polar checkout] checkout_url=%s', checkout_url)

        if not checkout_url:
            logger.error('[Polar checkout] No url field in response: %s', data)
            return Response({'detail': 'No checkout URL returned.'}, status=status.HTTP_502_BAD_GATEWAY)

        return Response({'checkout_url': checkout_url})


class MockCompletePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if settings.PAYMENT_PROVIDER != 'mock':
            return Response({'detail': 'Not available.'}, status=status.HTTP_403_FORBIDDEN)

        payment_id = request.data.get('payment_id')
        if not payment_id:
            return Response({'detail': 'payment_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(pk=payment_id, user=request.user)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if payment.status == 'completed':
            return Response({'detail': 'Payment already completed.'}, status=status.HTTP_400_BAD_REQUEST)

        if payment.credits_granted:
            return Response({'detail': 'Credits already granted for this payment.'}, status=status.HTTP_400_BAD_REQUEST)

        payment.status = 'completed'
        payment.save(update_fields=['status', 'updated_at'])

        plan = PLANS.get(payment.plan_key)
        if plan:
            grant_plan_credits(
                request.user,
                payment.plan_key,
                reason=f"Payment {payment.id} completed for plan {payment.plan_key}",
                metadata={'payment_id': payment.id},
            )

            if plan['mode'] == 'subscription':
                profile = get_or_create_billing_profile(request.user)
                profile.current_plan = payment.plan_key
                profile.subscription_status = 'active'
                profile.save(update_fields=['current_plan', 'subscription_status', 'updated_at'])

        payment.credits_granted = True
        payment.save(update_fields=['credits_granted', 'updated_at'])

        balance = get_or_create_credit_balance(request.user)

        return Response({
            'detail': 'Payment completed and credits granted.',
            'balance': CreditBalanceSerializer(balance).data,
        })


# ---------------------------------------------------------------------------
# Polar webhook helpers
# ---------------------------------------------------------------------------

def _verify_polar_signature(raw_body: bytes, headers, secret: str) -> bool:
    msg_id = headers.get('webhook-id', '')
    msg_timestamp = headers.get('webhook-timestamp', '')
    msg_signature = headers.get('webhook-signature', '')

    if not (msg_id and msg_timestamp and msg_signature):
        return False

    try:
        ts = int(msg_timestamp)
        if abs(int(time.time()) - ts) > 300:
            return False
    except (ValueError, TypeError):
        return False

    signed_content = f"{msg_id}.{msg_timestamp}.{raw_body.decode('utf-8', errors='replace')}"

    if secret.startswith('whsec_'):
        secret_bytes = base64.b64decode(secret[6:])
    else:
        secret_bytes = secret.encode('utf-8')

    computed = base64.b64encode(
        hmac.new(secret_bytes, signed_content.encode('utf-8'), hashlib.sha256).digest()
    ).decode('utf-8')

    for part in msg_signature.split(' '):
        if part.startswith('v1,') and hmac.compare_digest(computed, part[3:]):
            return True
    return False


def _product_id_to_plan(product_id: str) -> str:
    if not product_id:
        return ''
    for plan_key, pid in settings.POLAR_PRODUCT_IDS.items():
        if pid and pid == product_id:
            return plan_key
    return ''


def _resolve_user(data: dict):
    User = get_user_model()
    metadata = data.get('metadata') or {}
    user_id = metadata.get('user_id')
    if user_id:
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            pass
    customer_email = (
        data.get('customer_email')
        or (data.get('customer') or {}).get('email', '')
    )
    if customer_email:
        return User.objects.filter(email=customer_email).first()
    return None


def _make_external_ref(order_id: str, subscription_id: str) -> str:
    """Build a stable credit-grant idempotency key.

    For subscription orders we key on subscription_id so that order.paid and
    subscription.active share the same ref — whichever fires first grants
    credits; the other is silently skipped.

    For standalone one-time orders (no subscription_id) we fall back to order_id.
    """
    if subscription_id:
        return f'polar_sub_{subscription_id}_activated'
    if order_id:
        return f'polar_order_{order_id}'
    return ''


def _handle_order_paid(webhook_event: PolarWebhookEvent, data: dict) -> None:
    metadata = data.get('metadata') or {}
    plan_key = metadata.get('plan', '')
    order_id = data.get('id', '')
    product_id = data.get('product_id') or (data.get('product') or {}).get('id', '')
    subscription_id = data.get('subscription_id') or (data.get('subscription') or {}).get('id') or ''
    customer_id = data.get('customer_id') or (data.get('customer') or {}).get('id') or ''

    if not plan_key:
        plan_key = _product_id_to_plan(product_id)

    user = _resolve_user(data)

    logger.info(
        '[Polar webhook] order.paid event_id=%s user_found=%s plan=%s product_id=%s order_id=%s subscription_id=%s',
        webhook_event.event_id, bool(user), plan_key, product_id, order_id, subscription_id,
    )

    if not user:
        logger.warning('[Polar webhook] no user found for order event_id=%s', webhook_event.event_id)
        webhook_event.status = 'failed'
        webhook_event.error_message = 'User not found'
        webhook_event.processed_at = timezone.now()
        webhook_event.save(update_fields=['status', 'error_message', 'processed_at'])
        return

    if not plan_key or plan_key not in PLANS:
        logger.warning('[Polar webhook] unknown plan=%s event_id=%s', plan_key, webhook_event.event_id)
        webhook_event.status = 'failed'
        webhook_event.error_message = f'Unknown plan: {plan_key}'
        webhook_event.processed_at = timezone.now()
        webhook_event.save(update_fields=['status', 'error_message', 'processed_at'])
        return

    # Record payment — idempotent via get_or_create on provider_payment_id
    _, payment_created = Payment.objects.get_or_create(
        provider='polar',
        provider_payment_id=order_id,
        defaults=dict(
            user=user,
            provider_subscription_id=subscription_id,
            plan_key=plan_key,
            amount_cents=data.get('amount', 0),
            currency=data.get('currency', 'usd'),
            status='completed',
            mode='subscription',
            credits_granted=True,
            metadata={'webhook_event_id': webhook_event.event_id},
        ),
    )
    if not payment_created:
        logger.info('[Polar webhook] payment already recorded order_id=%s', order_id)

    profile = get_or_create_billing_profile(user)
    profile.current_plan = plan_key
    profile.subscription_status = 'active'
    profile.payment_provider = 'polar'
    if subscription_id:
        profile.provider_subscription_id = subscription_id
    if customer_id:
        profile.provider_customer_id = customer_id
    profile.save()

    external_ref = _make_external_ref(order_id, subscription_id)
    granted = grant_plan_credits(
        user,
        plan_key,
        reason=f'Polar order.paid {webhook_event.event_id}',
        metadata={'event_id': webhook_event.event_id, 'plan': plan_key},
        external_ref=external_ref,
    )

    logger.info(
        '[Polar webhook] order.paid credits_granted=%s user_id=%s plan=%s event_id=%s external_ref=%s',
        granted, user.id, plan_key, webhook_event.event_id, external_ref,
    )

    webhook_event.status = 'processed'
    webhook_event.processed_at = timezone.now()
    webhook_event.save(update_fields=['status', 'processed_at'])


def _handle_subscription_event(webhook_event: PolarWebhookEvent, event_type: str, data: dict) -> None:
    metadata = data.get('metadata') or {}
    plan_key = metadata.get('plan', '')
    product_id = data.get('product_id') or (data.get('product') or {}).get('id', '')
    sub_id = data.get('id', '')
    customer_id = data.get('customer_id') or (data.get('customer') or {}).get('id') or ''

    if not plan_key:
        plan_key = _product_id_to_plan(product_id)

    user = _resolve_user(data)

    logger.info(
        '[Polar webhook] %s event_id=%s user_found=%s plan=%s subscription_id=%s',
        event_type, webhook_event.event_id, bool(user), plan_key, sub_id,
    )

    if not user:
        webhook_event.status = 'skipped'
        webhook_event.error_message = 'User not found'
        webhook_event.processed_at = timezone.now()
        webhook_event.save(update_fields=['status', 'error_message', 'processed_at'])
        return

    profile = get_or_create_billing_profile(user)
    profile.payment_provider = 'polar'

    if sub_id:
        profile.provider_subscription_id = sub_id
    if customer_id:
        profile.provider_customer_id = customer_id

    if event_type == 'subscription.active':
        profile.subscription_status = 'active'
        if plan_key and plan_key in PLANS:
            profile.current_plan = plan_key
            # Grant credits if order.paid was missed — idempotent via external_ref
            external_ref = f'polar_sub_{sub_id}_activated' if sub_id else ''
            granted = grant_plan_credits(
                user,
                plan_key,
                reason=f'Polar subscription.active {webhook_event.event_id}',
                metadata={'event_id': webhook_event.event_id, 'plan': plan_key},
                external_ref=external_ref,
            )
            logger.info(
                '[Polar webhook] subscription.active credits_granted=%s user_id=%s plan=%s external_ref=%s',
                granted, user.id, plan_key, external_ref,
            )

    elif event_type == 'subscription.updated':
        if plan_key and plan_key in PLANS:
            profile.current_plan = plan_key

    elif event_type == 'subscription.revoked':
        profile.subscription_status = 'cancelled'

    profile.save()

    webhook_event.status = 'processed'
    webhook_event.processed_at = timezone.now()
    webhook_event.save(update_fields=['status', 'processed_at'])


class PolarWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        raw_body = request.body
        secret = settings.POLAR_WEBHOOK_SECRET

        if secret:
            if not _verify_polar_signature(raw_body, request.headers, secret):
                logger.warning('[Polar webhook] signature verification failed')
                return Response({'detail': 'Invalid signature.'}, status=status.HTTP_400_BAD_REQUEST)
        elif not settings.DEBUG:
            logger.error('[Polar webhook] POLAR_WEBHOOK_SECRET not set in production — rejecting')
            return Response({'detail': 'Webhook not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            logger.warning('[Polar webhook] DEBUG=True and no POLAR_WEBHOOK_SECRET — skipping signature verification')

        try:
            payload = json.loads(raw_body)
        except json.JSONDecodeError:
            return Response({'detail': 'Invalid JSON.'}, status=status.HTTP_400_BAD_REQUEST)

        event_id = request.headers.get('webhook-id', '') or str(payload.get('id', ''))
        event_type = payload.get('type', '')

        logger.info('[Polar webhook] event_type=%s event_id=%s', event_type, event_id)

        if not event_id:
            logger.warning('[Polar webhook] no event_id in headers or payload')
            return Response({'detail': 'Missing event id.'}, status=status.HTTP_400_BAD_REQUEST)

        webhook_event, created = PolarWebhookEvent.objects.get_or_create(
            event_id=event_id,
            defaults={
                'event_type': event_type,
                'raw_payload': payload,
                'status': 'pending',
            },
        )

        if not created and webhook_event.status == 'processed':
            logger.info('[Polar webhook] duplicate event_id=%s — already processed', event_id)
            return Response({'detail': 'Already processed.'})

        data = payload.get('data', {})

        try:
            if event_type == 'order.paid':
                _handle_order_paid(webhook_event, data)
            elif event_type in ('subscription.active', 'subscription.updated', 'subscription.revoked'):
                _handle_subscription_event(webhook_event, event_type, data)
            else:
                logger.info('[Polar webhook] unhandled event_type=%s event_id=%s', event_type, event_id)
                webhook_event.status = 'skipped'
                webhook_event.processed_at = timezone.now()
                webhook_event.save(update_fields=['status', 'processed_at'])
        except Exception as exc:
            logger.exception('[Polar webhook] processing error event_id=%s: %s', event_id, exc)
            webhook_event.status = 'failed'
            webhook_event.error_message = str(exc)
            webhook_event.save(update_fields=['status', 'error_message'])
            return Response({'detail': 'Internal error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'OK.'})


# ---------------------------------------------------------------------------
# Polar sync endpoint — for local dev and webhook-missed recovery
# ---------------------------------------------------------------------------

def _polar_api_get(path: str, params: dict) -> dict:
    token = settings.POLAR_ACCESS_TOKEN
    base_url = (
        'https://sandbox-api.polar.sh'
        if settings.POLAR_SERVER == 'sandbox'
        else 'https://api.polar.sh'
    )
    url = f'{base_url}{path}'
    resp = http_requests.get(
        url,
        params=params,
        headers={'Authorization': f'Bearer {token}', 'Accept': 'application/json'},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


class SyncPolarView(APIView):
    """POST /api/billing/sync-polar/

    Queries Polar for the authenticated user's active subscriptions and
    activates any that Sellio has not yet processed.  Idempotent — safe to
    call multiple times (credits are only granted once per external_ref).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        email = user.email
        token = settings.POLAR_ACCESS_TOKEN

        if not token:
            logger.warning('[Polar sync] POLAR_ACCESS_TOKEN not set — cannot sync')
            profile = get_or_create_billing_profile(user)
            balance = get_or_create_credit_balance(user)
            return Response({
                'synced': False,
                'message': 'Payment provider not configured.',
                'current_plan': profile.current_plan,
                'balance': CreditBalanceSerializer(balance).data,
            })

        logger.info('[Polar sync] starting sync for user_id=%s email=%s', user.id, email)

        try:
            data = _polar_api_get('/v1/subscriptions/', {'customer_email': email, 'active': 'true', 'limit': 10})
        except http_requests.RequestException as exc:
            logger.error('[Polar sync] Polar API error: %s', exc)
            profile = get_or_create_billing_profile(user)
            balance = get_or_create_credit_balance(user)
            return Response({
                'synced': False,
                'message': 'Could not reach Polar API.',
                'current_plan': profile.current_plan,
                'balance': CreditBalanceSerializer(balance).data,
            }, status=status.HTTP_502_BAD_GATEWAY)

        items = data.get('items') or data.get('result') or []
        # Filter for active subscriptions only (Polar may return others)
        active_subs = [s for s in items if s.get('status') == 'active']

        logger.info('[Polar sync] found %d active subscription(s) for %s', len(active_subs), email)

        if not active_subs:
            profile = get_or_create_billing_profile(user)
            balance = get_or_create_credit_balance(user)
            return Response({
                'synced': False,
                'message': 'No active Polar subscription found.',
                'current_plan': profile.current_plan,
                'balance': CreditBalanceSerializer(balance).data,
            })

        # Use the first (most recent) active subscription
        sub = active_subs[0]
        sub_id = sub.get('id', '')
        product_id = sub.get('product_id') or (sub.get('product') or {}).get('id', '')
        sub_metadata = sub.get('metadata') or {}
        plan_key = sub_metadata.get('plan', '') or _product_id_to_plan(product_id)

        logger.info(
            '[Polar sync] subscription_id=%s product_id=%s plan=%s',
            sub_id, product_id, plan_key,
        )

        if not plan_key or plan_key not in PLANS:
            logger.warning('[Polar sync] could not determine plan for subscription_id=%s product_id=%s', sub_id, product_id)
            profile = get_or_create_billing_profile(user)
            balance = get_or_create_credit_balance(user)
            return Response({
                'synced': False,
                'message': f'Could not map subscription to a plan (product_id={product_id}).',
                'current_plan': profile.current_plan,
                'balance': CreditBalanceSerializer(balance).data,
            })

        # Update billing profile
        customer_id = sub.get('customer_id') or (sub.get('customer') or {}).get('id') or ''
        profile = get_or_create_billing_profile(user)
        profile.current_plan = plan_key
        profile.subscription_status = 'active'
        profile.payment_provider = 'polar'
        if sub_id:
            profile.provider_subscription_id = sub_id
        if customer_id:
            profile.provider_customer_id = customer_id
        profile.save()

        # Grant credits — idempotent, uses polar_sub_<id>_activated as the key
        external_ref = f'polar_sub_{sub_id}_activated' if sub_id else f'polar_sync_{user.id}_{plan_key}'
        granted = grant_plan_credits(
            user,
            plan_key,
            reason=f'Polar sync activation {sub_id or email}',
            metadata={'subscription_id': sub_id, 'plan': plan_key, 'source': 'sync'},
            external_ref=external_ref,
        )

        balance = get_or_create_credit_balance(user)

        logger.info(
            '[Polar sync] done user_id=%s plan=%s subscription_id=%s credits_granted=%s',
            user.id, plan_key, sub_id, granted,
        )

        return Response({
            'synced': True,
            'credits_granted': granted,
            'current_plan': plan_key,
            'balance': CreditBalanceSerializer(balance).data,
            'message': 'Plan activated.' if granted else 'Already activated.',
        })
