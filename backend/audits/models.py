from django.conf import settings
from django.db import models


class AuditResult(models.Model):
    audit = models.OneToOneField('Audit', on_delete=models.CASCADE, related_name='result')
    score = models.IntegerField()
    score_label = models.CharField(max_length=255, blank=True)
    executive_summary = models.TextField()
    conversion_diagnosis = models.JSONField(default=dict)
    weak_points = models.JSONField(default=list)
    title_analysis = models.JSONField(default=dict)
    improved_title = models.TextField()
    bullet_improvements = models.JSONField(default=list)
    improved_bullets = models.JSONField(default=list)
    description_analysis = models.JSONField(default=dict)
    improved_description = models.TextField()
    keyword_opportunities = models.JSONField(default=list)
    review_insights = models.JSONField(default=list)
    buyer_objections = models.JSONField(default=list)
    a_plus_content_ideas = models.JSONField(default=list)
    image_pack_plan = models.JSONField(default=list)
    priority_checklist = models.JSONField(default=list)
    concise_report = models.JSONField(null=True, blank=True)
    pro_upgrade_pack = models.JSONField(null=True, blank=True)
    report_version = models.CharField(max_length=10, default='v1')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Result for Audit #{self.audit_id} — score {self.score}"


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
    SELLER_PERSONA_CHOICES = [
        ('premium', 'Premium'),
        ('budget_friendly', 'Budget Friendly'),
        ('gift_ready', 'Gift Ready'),
        ('expert_professional', 'Expert / Professional'),
        ('luxury', 'Luxury'),
        ('problem_solver', 'Problem Solver'),
        ('minimal_clean', 'Minimal / Clean'),
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
    seller_persona = models.CharField(max_length=30, choices=SELLER_PERSONA_CHOICES, blank=True)
    competitors = models.JSONField(null=True, blank=True)
    competitor_notes = models.TextField(blank=True)

    about_this_item = models.TextField(blank=True)
    product_details = models.TextField(blank=True)
    product_specifications = models.TextField(blank=True)
    brand_content = models.TextField(blank=True)
    a_plus_content = models.TextField(blank=True)
    variations = models.TextField(blank=True)
    size_guide = models.TextField(blank=True)
    product_images_notes = models.TextField(blank=True)
    videos_notes = models.TextField(blank=True)
    reviews_qna = models.TextField(blank=True)
    buyer_complaints = models.TextField(blank=True)

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
