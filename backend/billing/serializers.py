from rest_framework import serializers

from .models import CreditBalance, CreditTransaction, Payment, UserBillingProfile


class UserBillingProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBillingProfile
        fields = ['current_plan', 'subscription_status', 'payment_provider', 'created_at', 'updated_at']


class CreditBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditBalance
        fields = ['audit_credits', 'full_upgrade_credits', 'image_generation_credits', 'updated_at']


class CreditTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditTransaction
        fields = ['id', 'transaction_type', 'credit_type', 'amount', 'reason', 'created_at']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'provider', 'plan_key', 'amount_cents', 'currency', 'status', 'mode', 'credits_granted', 'created_at', 'updated_at']
