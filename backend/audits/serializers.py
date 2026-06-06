from rest_framework import serializers

from .models import Audit, AuditImage


class AuditImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditImage
        fields = ('id', 'image', 'original_filename', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class AuditListSerializer(serializers.ModelSerializer):
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Audit
        fields = (
            'id', 'product_name', 'category', 'entry_type', 'status',
            'created_at', 'updated_at', 'thumbnail',
        )

    def get_thumbnail(self, obj):
        first_image = obj.images.first()
        if not first_image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(first_image.image.url)
        return first_image.image.url


class AuditDetailSerializer(serializers.ModelSerializer):
    images = AuditImageSerializer(many=True, read_only=True)

    class Meta:
        model = Audit
        fields = (
            'id', 'entry_type', 'status',
            'amazon_url', 'product_name', 'category', 'main_benefit',
            'current_title', 'bullet_points', 'description', 'backend_keywords',
            'price', 'rating', 'review_count',
            'target_audience', 'seller_goal', 'notes',
            'created_at', 'updated_at', 'submitted_at',
            'images',
        )
        read_only_fields = ('id', 'status', 'created_at', 'updated_at', 'submitted_at')


class AuditCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = (
            'entry_type',
            'amazon_url', 'product_name', 'category', 'main_benefit',
            'current_title', 'bullet_points', 'description', 'backend_keywords',
            'price', 'rating', 'review_count',
            'target_audience', 'seller_goal', 'notes',
        )

    def validate(self, data):
        entry_type = data.get('entry_type')
        if entry_type == 'amazon_url' and not data.get('amazon_url'):
            raise serializers.ValidationError({'amazon_url': 'Required for amazon_url entry type.'})
        if entry_type == 'product_photos':
            missing = [f for f in ('product_name', 'category', 'main_benefit') if not data.get(f)]
            if missing:
                raise serializers.ValidationError({f: 'Required for product_photos entry type.' for f in missing})
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AuditUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = (
            'amazon_url', 'product_name', 'category', 'main_benefit',
            'current_title', 'bullet_points', 'description', 'backend_keywords',
            'price', 'rating', 'review_count',
            'target_audience', 'seller_goal', 'notes',
        )
