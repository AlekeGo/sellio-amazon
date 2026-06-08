from django.urls import path

from .views import (
    ImageGenerationDetailView,
    ImageGenerationDownloadView,
    ImageGenerationListCreateView,
    ImageGenerationRegenerateView,
    ImageGenerationRetryView,
)

urlpatterns = [
    path('generations/', ImageGenerationListCreateView.as_view()),
    path('generations/<int:pk>/', ImageGenerationDetailView.as_view()),
    path('generations/<int:pk>/download/', ImageGenerationDownloadView.as_view()),
    path('generations/<int:pk>/regenerate/', ImageGenerationRegenerateView.as_view()),
    path('generations/<int:pk>/retry/', ImageGenerationRetryView.as_view()),
]
