from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment
from .plans import PLAN_KEYS, PLANS
from .serializers import (
    CreditBalanceSerializer,
    CreditTransactionSerializer,
    PaymentSerializer,
    UserBillingProfileSerializer,
)
from .services import (
    get_or_create_billing_profile,
    get_or_create_credit_balance,
    grant_plan_credits,
)


class PlanListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(list(PLANS.values()))


class BillingMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_or_create_billing_profile(request.user)
        balance = get_or_create_credit_balance(request.user)
        transactions = request.user.credit_transactions.order_by('-created_at')[:20]
        payments = request.user.payments.order_by('-created_at')[:10]

        return Response({
            'profile': UserBillingProfileSerializer(profile).data,
            'balance': CreditBalanceSerializer(balance).data,
            'recent_transactions': CreditTransactionSerializer(transactions, many=True).data,
            'recent_payments': PaymentSerializer(payments, many=True).data,
        })


class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
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
            'message': 'Real checkout provider will be connected later with Polar.',
        })


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
