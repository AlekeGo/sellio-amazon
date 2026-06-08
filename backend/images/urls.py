from django.urls import path

from .views import (
    ImageGenerationDetailView,
    ImageGenerationListCreateView,
    ImageGenerationRetryView,
)

urlpatterns = [
    path('generations/', ImageGenerationListCreateView.as_view()),
    path('generations/<int:pk>/', ImageGenerationDetailView.as_view()),
    path('generations/<int:pk>/retry/', ImageGenerationRetryView.as_view()),
]
