import json
import os

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Audit, AuditImage, AuditResult
from .serializers import (
    AuditCreateSerializer,
    AuditDetailSerializer,
    AuditImageSerializer,
    AuditListSerializer,
    AuditUpdateSerializer,
)
from .services.gemini_audit_service import GeminiTemporaryError, run_gemini_audit


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


def _run_gemini_and_save(audit):
    audit.status = 'pending_analysis'
    audit.save(update_fields=['status', 'updated_at'])

    result_data = run_gemini_audit(audit)

    AuditResult.objects.update_or_create(
        audit=audit,
        defaults={
            'score': result_data['score'],
            'score_label': result_data['score_label'],
            'executive_summary': result_data['executive_summary'],
            'conversion_diagnosis': result_data['conversion_diagnosis'],
            'weak_points': result_data['weak_points'],
            'title_analysis': result_data['title_analysis'],
            'improved_title': result_data['improved_title'],
            'bullet_improvements': result_data['bullet_improvements'],
            'improved_bullets': result_data['improved_bullets'],
            'description_analysis': result_data['description_analysis'],
            'improved_description': result_data['improved_description'],
            'keyword_opportunities': result_data['keyword_opportunities'],
            'review_insights': result_data['review_insights'],
            'buyer_objections': result_data['buyer_objections'],
            'a_plus_content_ideas': result_data['a_plus_content_ideas'],
            'image_pack_plan': result_data['image_pack_plan'],
            'priority_checklist': result_data['priority_checklist'],
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

        if audit.status not in ('draft', 'ready_for_analysis', 'failed'):
            return Response(
                {'detail': 'Audit cannot be submitted in its current status.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not os.getenv('GEMINI_API_KEY'):
            return Response(
                {'detail': 'Gemini API key is not configured.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        audit.submitted_at = timezone.now()
        audit.save(update_fields=['submitted_at', 'updated_at'])

        try:
            _run_gemini_and_save(audit)
        except ValueError as exc:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except GeminiTemporaryError as exc:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            return Response({'detail': 'Gemini analysis failed. Please try again.'}, status=status.HTTP_502_BAD_GATEWAY)

        audit = Audit.objects.prefetch_related('images', 'result').get(pk=pk)
        return Response(AuditDetailSerializer(audit, context={'request': request}).data)


class AuditRegenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            audit = Audit.objects.prefetch_related('images').get(pk=pk, user=request.user)
        except Audit.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not os.getenv('GEMINI_API_KEY'):
            return Response(
                {'detail': 'Gemini API key is not configured.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            _run_gemini_and_save(audit)
        except ValueError as exc:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except GeminiTemporaryError as exc:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            audit.status = 'failed'
            audit.save(update_fields=['status', 'updated_at'])
            return Response({'detail': 'Gemini analysis failed. Please try again.'}, status=status.HTTP_502_BAD_GATEWAY)

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
