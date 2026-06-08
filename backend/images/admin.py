from django.contrib import admin

from .models import ImageGeneration


@admin.register(ImageGeneration)
class ImageGenerationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'image_type', 'status', 'provider', 'model_name', 'created_at']
    list_filter = ['status', 'provider']
    search_fields = ['user__email', 'image_type', 'prompt']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
