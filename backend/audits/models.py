from django.conf import settings
from django.db import models


class Audit(models.Model):
    ENTRY_TYPE_CHOICES = [
        ('amazon_url', 'Amazon URL'),
        ('product_photos', 'Product Photos'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('ready_for_analysis', 'Ready for Analysis'),
        ('pending_analysis', 'Pending Analysis'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='audits')
    entry_type = models.CharField(max_length=20, choices=ENTRY_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    amazon_url = models.URLField(blank=True, null=True)
    product_name = models.CharField(max_length=500, blank=True)
    category = models.CharField(max_length=255, blank=True)
    main_benefit = models.TextField(blank=True)
    current_title = models.CharField(max_length=500, blank=True)
    bullet_points = models.TextField(blank=True)
    description = models.TextField(blank=True)
    backend_keywords = models.TextField(blank=True)
    price = models.CharField(max_length=50, blank=True)
    rating = models.CharField(max_length=20, blank=True)
    review_count = models.CharField(max_length=20, blank=True)
    target_audience = models.TextField(blank=True)
    seller_goal = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.email} — {self.product_name or self.entry_type} ({self.status})"


class AuditImage(models.Model):
    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='audit_images/')
    original_filename = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for Audit #{self.audit_id} — {self.original_filename}"
