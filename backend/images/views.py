import os

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from audits.models import Audit

from .models import ImageGeneration
from .serializers import (
    ImageGenerationCreateSerializer,
    ImageGenerationDetailSerializer,
    ImageGenerationListSerializer,
)
from .services.fal_image_service import FalImageError, generate_image
from .services.prompt_builder import build_image_prompt


class ImageGenerationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = ImageGeneration.objects.filter(user=request.user).order_by('-created_at')
        audit_id = request.query_params.get('audit_id')
        if audit_id:
            qs = qs.filter(audit_id=audit_id)
        serializer = ImageGenerationListSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ImageGenerationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        audit = None
        audit_id = data.get('audit_id')
        if audit_id:
            try:
                audit = Audit.objects.get(id=audit_id, user=request.user)
            except Audit.DoesNotExist:
                return Response(
                    {'detail': 'Audit not found.'},
                    status=status.HTTP_404_NOT_FOUND,
                )

        brief = data.get('brief', {})
        product_name = audit.product_name if audit else ''
        category = audit.category if audit else ''

        prompt = build_image_prompt(
            product_name=product_name,
            category=category,
            image_type=data['image_type'],
            goal=brief.get('goal', ''),
            headline=brief.get('headline', ''),
            visual_direction=brief.get('visual_direction', ''),
            text_elements=brief.get('text_elements', []),
            product_visual_details=brief.get('product_visual_details', ''),
            user_prompt=data.get('prompt', ''),
        )

        model_name = os.getenv('FAL_TEXT_TO_IMAGE_MODEL', 'fal-ai/flux/schnell')

        generation = ImageGeneration.objects.create(
            user=request.user,
            audit=audit,
            image_type=data['image_type'],
            prompt=prompt,
            status=ImageGeneration.STATUS_GENERATING,
            provider='fal',
            model_name=model_name,
        )

        try:
            result = generate_image(prompt)
            generation.image_url = result['image_url']
            generation.provider_response = result['raw']
            generation.status = ImageGeneration.STATUS_COMPLETED
            generation.completed_at = timezone.now()
        except FalImageError as exc:
            generation.status = ImageGeneration.STATUS_FAILED
            generation.error_message = str(exc)

        generation.save()

        if generation.status == ImageGeneration.STATUS_FAILED:
            return Response(
                {
                    'detail': 'Image generation failed. Please try again.',
                    'generation': ImageGenerationDetailSerializer(generation).data,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            ImageGenerationDetailSerializer(generation).data,
            status=status.HTTP_201_CREATED,
        )


class ImageGenerationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            generation = ImageGeneration.objects.get(id=pk, user=request.user)
        except ImageGeneration.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ImageGenerationDetailSerializer(generation).data)


class ImageGenerationRetryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            generation = ImageGeneration.objects.get(
                id=pk,
                user=request.user,
                status=ImageGeneration.STATUS_FAILED,
            )
        except ImageGeneration.DoesNotExist:
            return Response(
                {'detail': 'Not found or not retryable.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        generation.status = ImageGeneration.STATUS_GENERATING
        generation.error_message = ''
        generation.save()

        try:
            result = generate_image(generation.prompt)
            generation.image_url = result['image_url']
            generation.provider_response = result['raw']
            generation.status = ImageGeneration.STATUS_COMPLETED
            generation.completed_at = timezone.now()
        except FalImageError as exc:
            generation.status = ImageGeneration.STATUS_FAILED
            generation.error_message = str(exc)

        generation.save()

        if generation.status == ImageGeneration.STATUS_FAILED:
            return Response(
                {
                    'detail': 'Image generation failed. Please try again.',
                    'generation': ImageGenerationDetailSerializer(generation).data,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(ImageGenerationDetailSerializer(generation).data)
