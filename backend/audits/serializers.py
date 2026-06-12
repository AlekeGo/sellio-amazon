from rest_framework import serializers

from .models import Audit, AuditImage, AuditResult


class AuditImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = AuditImage
        fields = ('id', 'image', 'image_url', 'original_filename', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')

    def get_image(self, obj):
        if obj.image_url:
            return obj.image_url
        if obj.image:
            request = self.context.get('request')
            try:
                url = obj.image.url
                if request:
                    return request.build_absolute_uri(url)
                return url
            except Exception:
                return None
        return None


class AuditResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditResult
        fields = (
            'id', 'score', 'score_label', 'executive_summary',
            'conversion_diagnosis', 'weak_points', 'title_analysis',
            'improved_title', 'bullet_improvements', 'improved_bullets',
            'description_analysis', 'improved_description',
            'keyword_opportunities', 'review_insights', 'buyer_objections',
            'a_plus_content_ideas', 'image_pack_plan', 'priority_checklist',
            'concise_report', 'pro_upgrade_pack', 'report_version',
            'created_at', 'updated_at',
        )
        read_only_fields = fields


class AuditListSerializer(serializers.ModelSerializer):
    thumbnail = serializers.SerializerMethodField()
    result_score = serializers.SerializerMethodField()

    class Meta:
        model = Audit
        fields = (
            'id', 'product_name', 'category', 'entry_type', 'status',
            'created_at', 'updated_at', 'thumbnail', 'result_score',
        )

    def get_thumbnail(self, obj):
        first_image = obj.images.first()
        if not first_image:
            return None
        if first_image.image_url:
            return first_image.image_url
        if first_image.image:
            request = self.context.get('request')
            try:
                url = first_image.image.url
                if request:
                    return request.build_absolute_uri(url)
                return url
            except Exception:
                return None
        return None

    def get_result_score(self, obj):
        if obj.status == 'completed' and hasattr(obj, 'result'):
            return obj.result.score
        return None


class AuditDetailSerializer(serializers.ModelSerializer):
    images = AuditImageSerializer(many=True, read_only=True)
    result = serializers.SerializerMethodField()

    class Meta:
        model = Audit
        fields = (
            'id', 'entry_type', 'status',
            'amazon_url', 'product_name', 'category', 'main_benefit',
            'current_title', 'bullet_points', 'description', 'backend_keywords',
            'price', 'rating', 'review_count',
            'target_audience', 'seller_goal', 'notes', 'seller_persona',
            'about_this_item', 'product_details', 'product_specifications',
            'brand_content', 'a_plus_content', 'variations', 'size_guide',
            'product_images_notes', 'videos_notes', 'reviews_qna', 'buyer_complaints',
            'competitors', 'competitor_notes',
            'created_at', 'updated_at', 'submitted_at',
            'images', 'result',
        )
        read_only_fields = ('id', 'status', 'created_at', 'updated_at', 'submitted_at')

    def get_result(self, obj):
        try:
            return AuditResultSerializer(obj.result).data
        except AuditResult.DoesNotExist:
            return None


class AuditCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = (
            'entry_type',
            'amazon_url', 'product_name', 'category', 'main_benefit',
            'current_title', 'bullet_points', 'description', 'backend_keywords',
            'price', 'rating', 'review_count',
            'target_audience', 'seller_goal', 'notes', 'seller_persona',
            'about_this_item', 'product_details', 'product_specifications',
            'brand_content', 'a_plus_content', 'variations', 'size_guide',
            'product_images_notes', 'videos_notes', 'reviews_qna', 'buyer_complaints',
            'competitors', 'competitor_notes',
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
            'target_audience', 'seller_goal', 'notes', 'seller_persona',
            'about_this_item', 'product_details', 'product_specifications',
            'brand_content', 'a_plus_content', 'variations', 'size_guide',
            'product_images_notes', 'videos_notes', 'reviews_qna', 'buyer_complaints',
            'competitors', 'competitor_notes',
        )
