import os

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import LoginSerializer, ProfileUpdateSerializer, RegisterSerializer, UserSerializer


def _tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
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
            if update_fields:
                user.save(update_fields=update_fields)
        access, refresh = _tokens_for_user(user)
        return Response({'user': UserSerializer(user).data, 'access': access, 'refresh': refresh})
