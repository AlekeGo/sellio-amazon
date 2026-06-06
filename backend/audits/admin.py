from django.contrib import admin

from .models import Audit, AuditImage, AuditResult


class AuditImageInline(admin.TabularInline):
    model = AuditImage
    extra = 0
    readonly_fields = ('uploaded_at',)


@admin.register(Audit)
class AuditAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'product_name', 'entry_type', 'status', 'created_at')
    list_filter = ('entry_type', 'status')
    search_fields = ('user__email', 'product_name', 'amazon_url')
    readonly_fields = ('created_at', 'updated_at', 'submitted_at')
    inlines = [AuditImageInline]


@admin.register(AuditImage)
class AuditImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'audit', 'original_filename', 'uploaded_at')
    readonly_fields = ('uploaded_at',)


@admin.register(AuditResult)
class AuditResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'audit', 'score', 'score_label', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    search_fields = ('audit__product_name', 'audit__user__email')
