from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Audit, AuditImage
from .serializers import (
    AuditCreateSerializer,
    AuditDetailSerializer,
    AuditImageSerializer,
    AuditListSerializer,
    AuditUpdateSerializer,
)


class AuditListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        audits = Audit.objects.filter(user=request.user).prefetch_related('images').order_by('-created_at')
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
            return Audit.objects.prefetch_related('images').get(pk=pk, user=request.user)
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


class AuditSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            audit = Audit.objects.prefetch_related('images').get(pk=pk, user=request.user)
        except Audit.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if audit.status not in ('draft', 'ready_for_analysis'):
            return Response(
                {'detail': 'Audit cannot be submitted in its current status.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        audit.status = 'pending_analysis'
        audit.submitted_at = timezone.now()
        audit.save(update_fields=['status', 'submitted_at', 'updated_at'])
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
