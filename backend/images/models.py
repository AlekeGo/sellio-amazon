from django.conf import settings
from django.db import models


class ImageGeneration(models.Model):
    STATUS_QUEUED = 'queued'
    STATUS_GENERATING = 'generating'
    STATUS_COMPLETED = 'completed'
    STATUS_FAILED = 'failed'

    STATUS_CHOICES = [
        (STATUS_QUEUED, 'Queued'),
        (STATUS_GENERATING, 'Generating'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_FAILED, 'Failed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='image_generations',
    )
    audit = models.ForeignKey(
        'audits.Audit',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='image_generations',
    )
    image_type = models.CharField(max_length=255)
    prompt = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_GENERATING)
    provider = models.CharField(max_length=50, default='fal')
    model_name = models.CharField(max_length=255)
    image_url = models.TextField(blank=True)
    provider_response = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    brief = models.JSONField(null=True, blank=True)
    product_visual_details = models.TextField(blank=True)
    style_direction = models.CharField(max_length=100, blank=True)
    background_preference = models.CharField(max_length=100, blank=True)
    text_intensity = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} — {self.image_type} ({self.status})"
