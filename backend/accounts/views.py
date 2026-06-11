import logging
import os
from datetime import timedelta

from django.conf import settings as django_settings
from django.core.mail import send_mail
from django.utils import timezone
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailVerification, User
from .serializers import LoginSerializer, ProfileUpdateSerializer, RegisterSerializer, UserSerializer

logger = logging.getLogger(__name__)


def _tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)


def _send_verification_email(user, code):
    send_mail(
        subject='Your Sellio verification code',
        message=(
            f'Hi {user.full_name},\n\n'
            f'Your verification code is: {code}\n\n'
            f'This code expires in 10 minutes.\n\n'
            f'If you did not create a Sellio account, you can ignore this email.'
        ),
        from_email=django_settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        verification = EmailVerification.create_for_user(user)
        try:
            _send_verification_email(user, verification.code)
        except Exception as exc:
            logger.error('Failed to send verification email to %s: %s', user.email, exc)
        access, refresh = _tokens_for_user(user)
        return Response(
            {'user': UserSerializer(user).data, 'access': access, 'refresh': refresh},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        access, refresh = _tokens_for_user(user)
        return Response({'user': UserSerializer(user).data, 'access': access, 'refresh': refresh})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class VerifyEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '').strip()
        if not code:
            return Response({'detail': 'code is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.email_verified:
            return Response({'detail': 'Email already verified.'})

        verification = EmailVerification.objects.filter(
            user=request.user,
            code=code,
            is_used=False,
            expires_at__gt=timezone.now(),
        ).order_by('-created_at').first()

        if not verification:
            return Response({'detail': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

        verification.is_used = True
        verification.save(update_fields=['is_used'])

        request.user.email_verified = True
        request.user.save(update_fields=['email_verified'])

        return Response({'detail': 'Email verified successfully.'})


class ResendVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.email_verified:
            return Response({'detail': 'Email already verified.'}, status=status.HTTP_400_BAD_REQUEST)

        one_minute_ago = timezone.now() - timedelta(minutes=1)
        if EmailVerification.objects.filter(user=request.user, created_at__gt=one_minute_ago).exists():
            return Response(
                {'detail': 'Please wait a moment before requesting another code.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        verification = EmailVerification.create_for_user(request.user)
        try:
            _send_verification_email(request.user, verification.code)
        except Exception as exc:
            logger.error('Failed to send verification email to %s: %s', request.user.email, exc)
            return Response(
                {'detail': 'Failed to send email. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({'detail': 'Verification code sent.'})


class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        if not client_id:
            return Response(
                {'detail': 'Google Sign-In is not configured. Set GOOGLE_CLIENT_ID.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        credential = request.data.get('credential')
        if not credential:
            return Response({'detail': 'credential is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            id_info = id_token.verify_oauth2_token(credential, google_requests.Request(), client_id)
        except ValueError:
            return Response({'detail': 'Invalid Google token.'}, status=status.HTTP_400_BAD_REQUEST)
        email = id_info.get('email', '').lower()
        google_id = id_info.get('sub')
        full_name = id_info.get('name', '')
        avatar_url = id_info.get('picture')
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': full_name,
                'avatar_url': avatar_url,
                'provider': 'google',
                'google_id': google_id,
                'email_verified': True,
            },
        )
        if not created:
            update_fields = []
            if user.google_id != google_id:
                user.google_id = google_id
                update_fields.append('google_id')
            if avatar_url and user.avatar_url != avatar_url:
                user.avatar_url = avatar_url
                update_fields.append('avatar_url')
            if not user.provider:
                user.provider = 'google'
                update_fields.append('provider')
            if not user.email_verified:
                user.email_verified = True
                update_fields.append('email_verified')
            if update_fields:
                user.save(update_fields=update_fields)
        access, refresh = _tokens_for_user(user)
        return Response({'user': UserSerializer(user).data, 'access': access, 'refresh': refresh})
