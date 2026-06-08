from django.contrib import admin

from .models import CreditBalance, CreditTransaction, Payment, UserBillingProfile


@admin.register(UserBillingProfile)
class UserBillingProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'current_plan', 'subscription_status', 'payment_provider', 'created_at']
    list_filter = ['current_plan', 'subscription_status', 'payment_provider']
    search_fields = ['user__email']


@admin.register(CreditBalance)
class CreditBalanceAdmin(admin.ModelAdmin):
    list_display = ['user', 'audit_credits', 'full_upgrade_credits', 'image_generation_credits', 'updated_at']
    search_fields = ['user__email']


@admin.register(CreditTransaction)
class CreditTransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'transaction_type', 'credit_type', 'amount', 'reason', 'created_at']
    list_filter = ['transaction_type', 'credit_type']
    search_fields = ['user__email', 'reason']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan_key', 'amount_cents', 'status', 'mode', 'credits_granted', 'created_at']
    list_filter = ['status', 'mode', 'provider']
    search_fields = ['user__email', 'plan_key']
