from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    GoogleAuthView, LoginView, MeView, RegisterView,
    RequestPasswordResetView, ResendVerificationView,
    ResetPasswordView, VerifyEmailView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('me/', MeView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('google/', GoogleAuthView.as_view()),
    path('verify-email/', VerifyEmailView.as_view()),
    path('resend-verification/', ResendVerificationView.as_view()),
    path('request-password-reset/', RequestPasswordResetView.as_view()),
    path('reset-password/', ResetPasswordView.as_view()),
]
