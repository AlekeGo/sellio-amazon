import json

from django.utils import timezone
from rest_framework import status
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
            AuditImage.objects.create(audit=audit, image=f, original_filename=f.name)
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

    def post(self, request, pk):
        try:
            audit = Audit.objects.get(pk=pk, user=request.user)
        except Audit.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        files = request.FILES.getlist('images')
        if not files:
            return Response({'detail': 'No images provided.'}, status=status.HTTP_400_BAD_REQUEST)
        created = [
            AuditImage.objects.create(audit=audit, image=f, original_filename=f.name)
            for f in files
        ]
        return Response(
            AuditImageSerializer(created, many=True, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
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
        image.image.delete(save=False)
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
