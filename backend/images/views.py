import logging
import os

import requests as http_requests
from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from audits.models import Audit
from billing.services import consume_credit, get_or_create_credit_balance

from .models import ImageGeneration
from .serializers import (
    ImageGenerationCreateSerializer,
    ImageGenerationDetailSerializer,
    ImageGenerationListSerializer,
)
from .services.fal_image_service import FalImageError, generate_image
from .services.prompt_builder import build_image_prompt

logger = logging.getLogger(__name__)


def _check_image_credit(user):
    balance = get_or_create_credit_balance(user)
    has_image_credit = balance.image_generation_credits > 0
    has_full_upgrade = balance.full_upgrade_credits > 0
    is_dev_mode = settings.DEBUG and os.getenv('PAYMENT_PROVIDER', 'mock') == 'mock'
    allowed = has_image_credit or has_full_upgrade or is_dev_mode
    return allowed, has_image_credit


def _consume_image_credit_if_applicable(user, generation_id, has_image_credit):
    if not has_image_credit:
        return
    try:
        consume_credit(
            user,
            'image_generation',
            1,
            reason=f"Image generation {generation_id}",
            metadata={'generation_id': str(generation_id)},
        )
    except Exception:
        pass


def _get_reference_image_path(audit):
    if audit is None:
        return None
    try:
        img = audit.images.first()
        if not img or not img.image or not img.image.name:
            return None
        try:
            path = img.image.path
            if os.path.exists(path):
                return path
        except (NotImplementedError, ValueError):
            pass
        try:
            url = img.image.url
            if url and url.startswith(('http://', 'https://')):
                return url
        except Exception:
            pass
    except Exception:
        pass
    return None


def _resolve_model_name(reference_image_path):
    if reference_image_path:
        return os.getenv(
            'FAL_REFERENCE_IMAGE_MODEL',
            os.getenv('FAL_KONTEXT_MODEL', 'fal-ai/flux-pro/kontext'),
        )
    return os.getenv('FAL_TEXT_TO_IMAGE_MODEL', 'fal-ai/flux/schnell')


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
        allowed, has_image_credit = _check_image_credit(request.user)
        if not allowed:
            return Response(
                {
                    'code': 'NO_IMAGE_CREDITS',
                    'detail': 'You have no image generation credits left. Choose a plan to continue.',
                    'upgrade_required': True,
                },
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

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
        current_title = audit.current_title if audit else ''
        description = audit.description if audit else ''
        about_this_item = audit.about_this_item if audit else ''

        reference_image_path = _get_reference_image_path(audit)
        product_locked = reference_image_path is not None
        model_name = _resolve_model_name(reference_image_path)

        prompt = build_image_prompt(
            product_name=product_name,
            category=category,
            image_type=data['image_type'],
            goal=brief.get('goal', ''),
            headline=brief.get('headline', ''),
            visual_direction=brief.get('visual_direction', ''),
            text_elements=brief.get('text_elements', []),
            product_visual_details=data.get('product_visual_details', ''),
            style_direction=data.get('style_direction', ''),
            background_preference=data.get('background_preference', ''),
            text_intensity=data.get('text_intensity', ''),
            user_prompt=data.get('prompt', ''),
            current_title=current_title,
            description=description,
            about_this_item=about_this_item,
            reference_image_exists=product_locked,
        )

        generation = ImageGeneration.objects.create(
            user=request.user,
            audit=audit,
            image_type=data['image_type'],
            prompt=prompt,
            status=ImageGeneration.STATUS_GENERATING,
            provider='fal',
            model_name=model_name,
            brief=brief if brief else None,
            product_visual_details=data.get('product_visual_details', ''),
            style_direction=data.get('style_direction', ''),
            background_preference=data.get('background_preference', ''),
            text_intensity=data.get('text_intensity', ''),
            product_locked=product_locked,
        )

        try:
            result = generate_image(prompt, reference_image_path)
            generation.image_url = result['image_url']
            generation.provider_response = result['raw']
            generation.model_name = result['model_used']
            generation.generation_mode = result['generation_mode']
            generation.reference_image_url = result.get('reference_url') or ''
            generation.status = ImageGeneration.STATUS_COMPLETED
            generation.completed_at = timezone.now()
        except FalImageError as exc:
            generation.status = ImageGeneration.STATUS_FAILED
            generation.error_message = str(exc)
            logger.error(
                'Image generation failed for user %s (product_locked=%s): %s',
                request.user.email, product_locked, exc,
            )

        generation.save()

        if generation.status == ImageGeneration.STATUS_COMPLETED:
            _consume_image_credit_if_applicable(request.user, generation.id, has_image_credit)

        if generation.status == ImageGeneration.STATUS_FAILED:
            detail = (
                'Reference image generation failed. Please try again or re-upload a clear product photo.'
                if product_locked
                else 'Image generation failed. Please try again.'
            )
            return Response(
                {
                    'detail': detail,
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

    def delete(self, request, pk):
        try:
            generation = ImageGeneration.objects.get(id=pk, user=request.user)
        except ImageGeneration.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        generation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ImageGenerationDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            generation = ImageGeneration.objects.get(id=pk, user=request.user)
        except ImageGeneration.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not generation.image_url:
            return Response(
                {'detail': 'No image available for this generation.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            remote = http_requests.get(generation.image_url, timeout=30)
            remote.raise_for_status()
        except Exception:
            return Response(
                {'detail': 'Could not fetch image from provider. Try opening the original URL.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        type_slug = generation.image_type.replace(' ', '-').lower()
        filename = f"sellio-{generation.id}-{type_slug}.jpg"

        content_type = remote.headers.get('Content-Type', 'image/jpeg')
        response = HttpResponse(remote.content, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class ImageGenerationRegenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        allowed, has_image_credit = _check_image_credit(request.user)
        if not allowed:
            return Response(
                {
                    'code': 'NO_IMAGE_CREDITS',
                    'detail': 'You have no image generation credits left. Choose a plan to continue.',
                    'upgrade_required': True,
                },
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        try:
            original = ImageGeneration.objects.get(id=pk, user=request.user)
        except ImageGeneration.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        reference_image_path = _get_reference_image_path(original.audit)
        product_locked = reference_image_path is not None
        model_name = _resolve_model_name(reference_image_path)

        new_generation = ImageGeneration.objects.create(
            user=request.user,
            audit=original.audit,
            image_type=original.image_type,
            prompt=original.prompt,
            status=ImageGeneration.STATUS_GENERATING,
            provider='fal',
            model_name=model_name,
            brief=original.brief,
            product_visual_details=original.product_visual_details,
            style_direction=original.style_direction,
            background_preference=original.background_preference,
            text_intensity=original.text_intensity,
            product_locked=product_locked,
        )

        try:
            result = generate_image(new_generation.prompt, reference_image_path)
            new_generation.image_url = result['image_url']
            new_generation.provider_response = result['raw']
            new_generation.model_name = result['model_used']
            new_generation.generation_mode = result['generation_mode']
            new_generation.reference_image_url = result.get('reference_url') or ''
            new_generation.status = ImageGeneration.STATUS_COMPLETED
            new_generation.completed_at = timezone.now()
        except FalImageError as exc:
            new_generation.status = ImageGeneration.STATUS_FAILED
            new_generation.error_message = str(exc)
            logger.error(
                'Image regeneration failed for user %s (product_locked=%s): %s',
                request.user.email, product_locked, exc,
            )

        new_generation.save()

        if new_generation.status == ImageGeneration.STATUS_COMPLETED:
            _consume_image_credit_if_applicable(request.user, new_generation.id, has_image_credit)

        if new_generation.status == ImageGeneration.STATUS_FAILED:
            detail = (
                'Reference image generation failed. Please try again or re-upload a clear product photo.'
                if product_locked
                else 'Image regeneration failed. Please try again.'
            )
            return Response(
                {
                    'detail': detail,
                    'generation': ImageGenerationDetailSerializer(new_generation).data,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            ImageGenerationDetailSerializer(new_generation).data,
            status=status.HTTP_201_CREATED,
        )


class ImageGenerationRetryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        allowed, has_image_credit = _check_image_credit(request.user)
        if not allowed:
            return Response(
                {
                    'code': 'NO_IMAGE_CREDITS',
                    'detail': 'You have no image generation credits left. Choose a plan to continue.',
                    'upgrade_required': True,
                },
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

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

        reference_image_path = _get_reference_image_path(generation.audit)
        product_locked = reference_image_path is not None
        model_name = _resolve_model_name(reference_image_path)

        generation.status = ImageGeneration.STATUS_GENERATING
        generation.error_message = ''
        generation.model_name = model_name
        generation.product_locked = product_locked
        generation.save()

        try:
            result = generate_image(generation.prompt, reference_image_path)
            generation.image_url = result['image_url']
            generation.provider_response = result['raw']
            generation.model_name = result['model_used']
            generation.generation_mode = result['generation_mode']
            generation.reference_image_url = result.get('reference_url') or ''
            generation.status = ImageGeneration.STATUS_COMPLETED
            generation.completed_at = timezone.now()
        except FalImageError as exc:
            generation.status = ImageGeneration.STATUS_FAILED
            generation.error_message = str(exc)
            logger.error(
                'Image retry failed for user %s (product_locked=%s): %s',
                request.user.email, product_locked, exc,
            )

        generation.save()

        if generation.status == ImageGeneration.STATUS_COMPLETED:
            _consume_image_credit_if_applicable(request.user, generation.id, has_image_credit)

        if generation.status == ImageGeneration.STATUS_FAILED:
            detail = (
                'Reference image generation failed. Please try again or re-upload a clear product photo.'
                if product_locked
                else 'Image generation failed. Please try again.'
            )
            return Response(
                {
                    'detail': detail,
                    'generation': ImageGenerationDetailSerializer(generation).data,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(ImageGenerationDetailSerializer(generation).data)
