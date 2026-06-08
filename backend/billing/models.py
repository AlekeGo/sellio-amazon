from django.conf import settings
from django.db import models


class UserBillingProfile(models.Model):
    PLAN_CHOICES = [
        ('free_trial', 'Free Trial'),
        ('full_upgrade', 'Full Listing Upgrade'),
        ('launch', 'Launch'),
        ('pro', 'Pro'),
        ('growth', 'Growth'),
        ('agency', 'Agency'),
    ]
    SUBSCRIPTION_STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('past_due', 'Past Due'),
        ('expired', 'Expired'),
    ]
    PROVIDER_CHOICES = [
        ('mock', 'Mock'),
        ('polar', 'Polar'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='billing_profile')
    current_plan = models.CharField(max_length=50, choices=PLAN_CHOICES, default='free_trial')
    subscription_status = models.CharField(max_length=50, choices=SUBSCRIPTION_STATUS_CHOICES, default='active')
    payment_provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES, default='mock')
    provider_customer_id = models.CharField(max_length=255, blank=True, null=True)
    provider_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} — {self.current_plan}"


class CreditBalance(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='credit_balance')
    audit_credits = models.IntegerField(default=1)
    full_upgrade_credits = models.IntegerField(default=0)
    image_generation_credits = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} — audits:{self.audit_credits} upgrades:{self.full_upgrade_credits}"


class CreditTransaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('grant', 'Grant'),
        ('consume', 'Consume'),
        ('refund', 'Refund'),
        ('adjustment', 'Adjustment'),
    ]
    CREDIT_TYPE_CHOICES = [
        ('audit', 'Audit'),
        ('full_upgrade', 'Full Upgrade'),
        ('image_generation', 'Image Generation'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='credit_transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    credit_type = models.CharField(max_length=30, choices=CREDIT_TYPE_CHOICES)
    amount = models.IntegerField()
    reason = models.CharField(max_length=255)
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} {self.transaction_type} {self.amount} {self.credit_type}"


class Payment(models.Model):
    PROVIDER_CHOICES = [
        ('mock', 'Mock'),
        ('polar', 'Polar'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    MODE_CHOICES = [
        ('free', 'Free'),
        ('payment', 'One-time Payment'),
        ('subscription', 'Subscription'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES, default='mock')
    provider_checkout_id = models.CharField(max_length=255, blank=True, null=True)
    provider_payment_id = models.CharField(max_length=255, blank=True, null=True)
    provider_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    plan_key = models.CharField(max_length=50)
    amount_cents = models.IntegerField()
    currency = models.CharField(max_length=10, default='usd')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    credits_granted = models.BooleanField(default=False)
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} {self.plan_key} {self.status}"
