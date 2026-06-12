import json
import logging
import os

import cloudinary
import cloudinary.uploader
from django.utils import timezone
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from billing.services import consume_credit, has_credit, refund_credit

from .models import Audit, AuditImage, AuditResult
from .serializers import (
    AuditCreateSerializer,
    AuditDetailSerializer,
    AuditImageSerializer,
    AuditListSerializer,
    AuditUpdateSerializer,
)
from .services.ai_provider import AITemporaryError, is_ai_configured, run_audit

logger = logging.getLogger('audits')

_ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
_MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB

_SCORE_CATEGORY_LABELS = [
    ('title_quality', 'Title Quality'),
    ('bullet_points', 'Bullet Points'),
    ('description', 'Description'),
    ('seo_keywords', 'SEO / Keywords'),
    ('images', 'Images'),
    ('conversion_trust', 'Conversion / Trust'),
]


def _build_advanced_details(result_data: dict) -> dict:
    breakdown = result_data.get('score_breakdown', {})
    reasoning = result_data.get('score_reasoning', {})
    score_breakdown_details = []
    for key, label in _SCORE_CATEGORY_LABELS:
        val = breakdown.get(key)
        if val is not None:
            try:
                score_val = max(0, min(100, int(float(val))))
            except (TypeError, ValueError):
                score_val = 0
            score_breakdown_details.append({
                'category': label,
                'score': score_val,
                'reasoning': str(reasoning.get(key, '')),
            })

    kw_list = result_data.get('keyword_opportunities', [])
    if not isinstance(kw_list, list):
        kw_list = []
    keywords = [k.get('keyword', '') for k in kw_list if isinstance(k, dict) and k.get('keyword')]

    title_suggestions = list(result_data.get('title_suggestions', []))
    if not isinstance(title_suggestions, list):
        title_suggestions = []
    title_suggestions = [str(t) for t in title_suggestions if t]
    title_upgrade = result_data.get('title_upgrade', {})
    if isinstance(title_upgrade, dict):
        t = title_upgrade.get('improved_title', '')
        if t and t not in title_suggestions:
            title_suggestions.insert(0, str(t))
    pro = result_data.get('pro_upgrade_pack', {})
    if isinstance(pro, dict):
        pt = pro.get('copy_ready_title', '')
        if pt and pt not in title_suggestions:
            title_suggestions.append(str(pt))

    bullet_suggestions = []
    about_upgrade = result_data.get('about_this_item_upgrade', {})
    if isinstance(about_upgrade, dict):
        bullets = about_upgrade.get('improved_bullets', [])
        if isinstance(bullets, list):
            bullet_suggestions = [str(b) for b in bullets if b]
    if not bullet_suggestions and isinstance(pro, dict):
        bullets = pro.get('copy_ready_bullets', [])
        if isinstance(bullets, list):
            bullet_suggestions = [str(b) for b in bullets if b]

    description_suggestion = ''
    desc_upgrade = result_data.get('description_upgrade', {})
    if isinstance(desc_upgrade, dict):
        description_suggestion = str(desc_upgrade.get('improved_description', ''))
    if not description_suggestion and isinstance(pro, dict):
        description_suggestion = str(pro.get('copy_ready_description', ''))

    image_gallery = result_data.get('image_gallery_plan', [])
    image_recommendations = []
    for img in (image_gallery if isinstance(image_gallery, list) else []):
        if isinstance(img, dict):
            img_type = img.get('image_type', '')
            goal = img.get('goal', '')
            if img_type:
                image_recommendations.append(f'{img_type}: {goal}' if goal else img_type)

    buyer_trust_gaps = []
    objections = result_data.get('buyer_objections', [])
    for obj in (objections if isinstance(objections, list) else []):
        if isinstance(obj, dict):
            o = obj.get('objection', '')
            h = obj.get('how_to_address', '')
            if o:
                buyer_trust_gaps.append(f'{o} — {h}' if h else o)

    aplus = result_data.get('a_plus_brand_plan', [])
    a_plus_content_plan = []
    for item in (aplus if isinstance(aplus, list) else []):
        if isinstance(item, dict):
            section = item.get('section', '')
            idea = item.get('content_idea', '')
            if section and idea:
                a_plus_content_plan.append(f'{section}: {idea}')
            elif section or idea:
                a_plus_content_plan.append(section or idea)

    details = result_data.get('details', {})
    detailed_notes = [
        str(v).strip()
        for v in (details.values() if isinstance(details, dict) else [])
        if v and isinstance(v, str) and str(v).strip()
    ]

    quick_wins = result_data.get('quick_wins', [])
    if not isinstance(quick_wins, list):
        quick_wins = []

    return {
        'score_breakdown_details': score_breakdown_details,
        'keyword_opportunities': kw_list,
        'keywords': keywords,
        'title_suggestions': title_suggestions,
        'bullet_suggestions': bullet_suggestions,
        'description_suggestion': description_suggestion,
        'image_recommendations': image_recommendations,
        'buyer_trust_gaps': buyer_trust_gaps,
        'a_plus_content_plan': a_plus_content_plan,
        'detailed_notes': detailed_notes,
        'quick_wins': quick_wins,
    }


def _upload_to_cloudinary(f, audit_id):
    """Upload a file-like object to Cloudinary. Returns (secure_url, public_id)."""
    if hasattr(f, 'seek'):
        f.seek(0)
    result = cloudinary.uploader.upload(
        f,
        folder='sellio/audit-images',
        resource_type='image',
    )
    return result['secure_url'], result['public_id']


class AuditListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        audits = Audit.objects.filter(user=request.user).prefetch_related('images', 'result').order_by('-created_at')
        serializer = AuditListSerializer(audits, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = AuditCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        audit = serializer.save()
        for f in request.FILES.getlist('images'):
            try:
                secure_url, _ = _upload_to_cloudinary(f, audit.id)
            except Exception as exc:
                logger.error(
                    "Cloudinary upload failed on audit create | audit_id=%s | filename=%s | "
                    "size=%s | cloudinary_url_set=%s | exc_type=%s | exc=%s",
                    audit.id, f.name, getattr(f, 'size', 'unknown'),
                    bool(os.environ.get('CLOUDINARY_URL')),
                    type(exc).__name__, exc,
                )
                return Response(
                    {'detail': 'Image upload failed. Please try again.', 'code': 'image_upload_failed'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            AuditImage.objects.create(audit=audit, image_url=secure_url, original_filename=f.name)
        return Response(AuditDetailSerializer(audit, context={'request': request}).data, status=status.HTTP_201_CREATED)


class AuditDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_audit(self, request, pk):
        try:
            return Audit.objects.prefetch_related('images', 'result').get(pk=pk, user=request.user)
        except Audit.DoesNotExist:
            return None

    def get(self, request, pk):
        audit = self._get_audit(request, pk)
        if audit is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AuditDetailSerializer(audit, context={'request': request}).data)

    def patch(self, request, pk):
        audit = self._get_audit(request, pk)
        if audit is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AuditUpdateSerializer(audit, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        audit = self._get_audit(request, pk)
        return Response(AuditDetailSerializer(audit, context={'request': request}).data)


def _run_ai_and_save(audit):
    audit.status = 'pending_analysis'
    audit.save(update_fields=['status', 'updated_at'])

    result_data = run_audit(audit)

    # Build rich advanced_details from full response data (overrides AI-produced version)
    advanced_details = _build_advanced_details(result_data)
    cr = result_data.get('compact_report')
    if isinstance(cr, dict):
        cr['advanced_details'] = advanced_details

    title_upgrade = result_data.get('title_upgrade', {})
    about_upgrade = result_data.get('about_this_item_upgrade', {})
    desc_upgrade = result_data.get('description_upgrade', {})

    AuditResult.objects.update_or_create(
        audit=audit,
        defaults={
            'score': result_data['score'],
            'score_label': result_data['score_label'],
            'executive_summary': result_data['executive_summary'],
            'conversion_diagnosis': {},
            'weak_points': result_data.get('top_critical_issues', []),
            'title_analysis': {
                'current_problem': title_upgrade.get('current_issue', ''),
                'strategy': '',
            },
            'improved_title': title_upgrade.get('improved_title', ''),
            'bullet_improvements': [],
            'improved_bullets': about_upgrade.get('improved_bullets', []),
            'description_analysis': {
                'current_problem': desc_upgrade.get('current_issue', ''),
                'improvement_strategy': '',
            },
            'improved_description': desc_upgrade.get('improved_description', ''),
            'keyword_opportunities': result_data.get('keyword_opportunities', []),
            'review_insights': [],
            'buyer_objections': result_data.get('buyer_objections', []),
            'a_plus_content_ideas': result_data.get('a_plus_brand_plan', []),
            'image_pack_plan': result_data.get('image_gallery_plan', []),
            'priority_checklist': result_data.get('priority_checklist', []),
            'concise_report': result_data,
            'pro_upgrade_pack': result_data.get('pro_upgrade_pack'),
            'report_version': 'v2',
        },
    )

    audit.status = 'completed'
    audit.submitted_at = audit.submitted_at or timezone.now()
    audit.save(update_fields=['status', 'submitted_at', 'updated_at'])


class AuditSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            audit = Audit.objects.prefetch_related('images').get(pk=pk, user=request.user)
        except Audit.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if audit.status == 'completed':
            audit = Audit.objects.prefetch_related('images', 'result').get(pk=pk)
            return Response(AuditDetailSerializer(audit, context={'request': request}).data)

        if audit.status == 'pending_analysis':
            return Response(
                {'detail': 'Audit analysis is already in progress. Please wait.'},
                status=status.HTTP_202_ACCEPTED,
            )

        if audit.status not in ('draft', 'ready_for_analysis', 'failed'):
            return Response(
                {'detail': 'Audit cannot be submitted in its current status.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not is_ai_configured():
            return Response(
                {'detail': 'AI provider is not configured.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            existing_result = audit.result
            already_has_result = True
        except AuditResult.DoesNotExist:
            already_has_result = False

        credit_consumed = False
        if not already_has_result:
            if not has_credit(request.user, 'audit', 1):
                return Response(
                    {
                        'code': 'NO_AUDIT_CREDITS',
                        'detail': 'You have no audit credits left. Choose a plan to continue.',
                        'upgrade_required': True,
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )
            consume_credit(
                request.user,
                'audit',
                1,
                reason=f"Audit {audit.id} submitted",
                metadata={'audit_id': str(audit.id)},
            )
            credit_consumed = True

        audit.submitted_at = timezone.now()
        audit.save(update_fields=['submitted_at', 'updated_at'])

        try:
            _run_ai_and_save(audit)
        except json.JSONDecodeError:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            if credit_consumed:
                try:
                    refund_credit(request.user, 'audit', 1,
                                  reason=f"Refund: analysis failed for audit {audit.id}",
                                  metadata={'audit_id': audit.id})
                except Exception:
                    pass
            return Response(
                {'detail': 'AI response was incomplete. Please try again or reduce input length.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except ValueError as exc:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            if credit_consumed:
                try:
                    refund_credit(request.user, 'audit', 1,
                                  reason=f"Refund: analysis failed for audit {audit.id}",
                                  metadata={'audit_id': audit.id})
                except Exception:
                    pass
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except AITemporaryError as exc:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            if credit_consumed:
                try:
                    refund_credit(request.user, 'audit', 1,
                                  reason=f"Refund: analysis failed for audit {audit.id}",
                                  metadata={'audit_id': audit.id})
                except Exception:
                    pass
            return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            if credit_consumed:
                try:
                    refund_credit(request.user, 'audit', 1,
                                  reason=f"Refund: analysis failed for audit {audit.id}",
                                  metadata={'audit_id': audit.id})
                except Exception:
                    pass
            return Response(
                {'detail': 'AI analysis is temporarily unavailable. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        audit = Audit.objects.prefetch_related('images', 'result').get(pk=pk)
        return Response(AuditDetailSerializer(audit, context={'request': request}).data)


class AuditRegenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            audit = Audit.objects.prefetch_related('images').get(pk=pk, user=request.user)
        except Audit.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not is_ai_configured():
            return Response(
                {'detail': 'AI provider is not configured.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            _run_ai_and_save(audit)
        except json.JSONDecodeError:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            return Response(
                {'detail': 'AI response was incomplete. Please try again or reduce input length.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except ValueError as exc:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except AITemporaryError as exc:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            return Response(
                {'detail': 'AI analysis is temporarily unavailable. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        audit = Audit.objects.prefetch_related('images', 'result').get(pk=pk)
        return Response(AuditDetailSerializer(audit, context={'request': request}).data)


class AuditImageListView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            audit = Audit.objects.get(pk=pk, user=request.user)
        except Audit.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            files = request.FILES.getlist('images')
            if not files:
                return Response({'detail': 'No images provided.'}, status=status.HTTP_400_BAD_REQUEST)

            for f in files:
                ext = os.path.splitext(f.name)[1].lower()
                if ext not in _ALLOWED_IMAGE_EXTENSIONS:
                    return Response(
                        {'detail': f'"{f.name}" is not a supported image type. Allowed: jpg, jpeg, png, webp.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if f.size > _MAX_IMAGE_SIZE:
                    return Response(
                        {'detail': f'"{f.name}" exceeds the 10 MB size limit.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            created = []
            for f in files:
                try:
                    secure_url, _ = _upload_to_cloudinary(f, pk)
                except Exception as exc:
                    logger.exception(
                        "Cloudinary upload failed | audit_id=%s | user_id=%s | "
                        "files_keys=%s | data_keys=%s | field=images | "
                        "filename=%s | content_type=%s | size=%s | "
                        "cloudinary_url_set=%s | exc_type=%s | exc=%s",
                        pk, request.user.id,
                        list(request.FILES.keys()), list(request.data.keys()),
                        f.name, getattr(f, 'content_type', 'unknown'),
                        getattr(f, 'size', 'unknown'),
                        bool(os.environ.get('CLOUDINARY_URL')),
                        type(exc).__name__, exc,
                    )
                    return Response(
                        {'detail': 'Image upload failed. Please try again.', 'code': 'image_upload_failed'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
                img = AuditImage.objects.create(audit=audit, image_url=secure_url, original_filename=f.name)
                created.append(img)

            return Response(
                AuditImageSerializer(created, many=True, context={'request': request}).data,
                status=status.HTTP_201_CREATED,
            )

        except Exception as exc:
            logger.exception(
                "Unexpected error in image upload | audit_id=%s | user_id=%s | "
                "files_keys=%s | data_keys=%s | cloudinary_url_set=%s | exc_type=%s | exc=%s",
                pk, request.user.id,
                list(request.FILES.keys()), list(request.data.keys()),
                bool(os.environ.get('CLOUDINARY_URL')),
                type(exc).__name__, exc,
            )
            return Response(
                {'detail': 'Image upload failed. Please try again.', 'code': 'image_upload_failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AuditImageDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, image_id):
        try:
            audit = Audit.objects.get(pk=pk, user=request.user)
        except Audit.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            image = AuditImage.objects.get(pk=image_id, audit=audit)
        except AuditImage.DoesNotExist:
            return Response({'detail': 'Image not found.'}, status=status.HTTP_404_NOT_FOUND)
        if image.image:
            image.image.delete(save=False)
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
