from rest_framework import serializers

from .models import ImageGeneration


class ImageGenerationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageGeneration
        fields = [
            'id', 'audit', 'image_type', 'prompt', 'status', 'provider', 'model_name',
            'image_url', 'error_message', 'created_at', 'completed_at',
        ]


class ImageGenerationDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageGeneration
        fields = [
            'id', 'audit', 'image_type', 'prompt', 'status', 'provider',
            'model_name', 'image_url', 'error_message', 'created_at',
            'updated_at', 'completed_at',
        ]


class ImageGenerationCreateSerializer(serializers.Serializer):
    audit_id = serializers.IntegerField(required=False, allow_null=True)
    image_type = serializers.CharField(max_length=255)
    prompt = serializers.CharField(allow_blank=True, default='')
    brief = serializers.DictField(required=False, default=dict)
