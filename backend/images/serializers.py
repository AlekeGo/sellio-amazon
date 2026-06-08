from rest_framework import serializers

from .models import ImageGeneration


class ImageGenerationListSerializer(serializers.ModelSerializer):
    audit_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = ImageGeneration
        fields = [
            'id', 'audit_id', 'image_type', 'prompt', 'status', 'provider', 'model_name',
            'image_url', 'error_message', 'brief',
            'product_visual_details', 'style_direction', 'background_preference', 'text_intensity',
            'created_at', 'completed_at',
        ]


class ImageGenerationDetailSerializer(serializers.ModelSerializer):
    audit_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = ImageGeneration
        fields = [
            'id', 'audit_id', 'image_type', 'prompt', 'status', 'provider',
            'model_name', 'image_url', 'error_message', 'brief',
            'product_visual_details', 'style_direction', 'background_preference', 'text_intensity',
            'created_at', 'updated_at', 'completed_at',
        ]


class ImageGenerationCreateSerializer(serializers.Serializer):
    audit_id = serializers.IntegerField(required=False, allow_null=True)
    image_type = serializers.CharField(max_length=255)
    prompt = serializers.CharField(allow_blank=True, default='')
    brief = serializers.DictField(required=False, default=dict)
    product_visual_details = serializers.CharField(allow_blank=True, default='')
    style_direction = serializers.CharField(allow_blank=True, default='')
    background_preference = serializers.CharField(allow_blank=True, default='')
    text_intensity = serializers.CharField(allow_blank=True, default='')
