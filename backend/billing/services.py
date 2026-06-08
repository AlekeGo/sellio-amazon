import os

from .models import CreditBalance, CreditTransaction, UserBillingProfile
from .plans import PLANS


def get_or_create_billing_profile(user):
    profile, _ = UserBillingProfile.objects.get_or_create(
        user=user,
        defaults={
            'current_plan': 'free_trial',
            'subscription_status': 'active',
            'payment_provider': os.getenv('PAYMENT_PROVIDER', 'mock'),
        },
    )
    return profile


def get_or_create_credit_balance(user):
    balance, _ = CreditBalance.objects.get_or_create(
        user=user,
        defaults={
            'audit_credits': 1,
            'full_upgrade_credits': 0,
            'image_generation_credits': 0,
        },
    )
    return balance


def grant_plan_credits(user, plan_key, reason, metadata=None):
    plan = PLANS.get(plan_key)
    if not plan:
        raise ValueError(f"Unknown plan key: {plan_key}")

    balance = get_or_create_credit_balance(user)

    if plan['audit_credits'] > 0:
        balance.audit_credits += plan['audit_credits']
        CreditTransaction.objects.create(
            user=user,
            transaction_type='grant',
            credit_type='audit',
            amount=plan['audit_credits'],
            reason=reason,
            metadata=metadata,
        )

    if plan['full_upgrade_credits'] > 0:
        balance.full_upgrade_credits += plan['full_upgrade_credits']
        CreditTransaction.objects.create(
            user=user,
            transaction_type='grant',
            credit_type='full_upgrade',
            amount=plan['full_upgrade_credits'],
            reason=reason,
            metadata=metadata,
        )

    if plan['image_generation_credits'] > 0:
        balance.image_generation_credits += plan['image_generation_credits']
        CreditTransaction.objects.create(
            user=user,
            transaction_type='grant',
            credit_type='image_generation',
            amount=plan['image_generation_credits'],
            reason=reason,
            metadata=metadata,
        )

    balance.save()


def consume_credit(user, credit_type, amount, reason, metadata=None):
    balance = get_or_create_credit_balance(user)

    field_map = {
        'audit': 'audit_credits',
        'full_upgrade': 'full_upgrade_credits',
        'image_generation': 'image_generation_credits',
    }
    field = field_map.get(credit_type)
    if not field:
        raise ValueError(f"Unknown credit type: {credit_type}")

    current = getattr(balance, field)
    if current < amount:
        raise ValueError(f"Insufficient {credit_type} credits.")

    setattr(balance, field, current - amount)
    balance.save(update_fields=[field, 'updated_at'])

    CreditTransaction.objects.create(
        user=user,
        transaction_type='consume',
        credit_type=credit_type,
        amount=amount,
        reason=reason,
        metadata=metadata,
    )


def refund_credit(user, credit_type, amount, reason, metadata=None):
    balance = get_or_create_credit_balance(user)

    field_map = {
        'audit': 'audit_credits',
        'full_upgrade': 'full_upgrade_credits',
        'image_generation': 'image_generation_credits',
    }
    field = field_map.get(credit_type)
    if not field:
        raise ValueError(f"Unknown credit type: {credit_type}")

    setattr(balance, field, getattr(balance, field) + amount)
    balance.save(update_fields=[field, 'updated_at'])

    CreditTransaction.objects.create(
        user=user,
        transaction_type='refund',
        credit_type=credit_type,
        amount=amount,
        reason=reason,
        metadata=metadata,
    )


def has_credit(user, credit_type, amount=1):
    try:
        balance = CreditBalance.objects.get(user=user)
    except CreditBalance.DoesNotExist:
        return False

    field_map = {
        'audit': 'audit_credits',
        'full_upgrade': 'full_upgrade_credits',
        'image_generation': 'image_generation_credits',
    }
    field = field_map.get(credit_type)
    if not field:
        return False

    return getattr(balance, field) >= amount
