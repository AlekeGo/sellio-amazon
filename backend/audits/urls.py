from django.urls import path

from .views import (
    AuditDetailView,
    AuditImageDeleteView,
    AuditImageListView,
    AuditListCreateView,
    AuditRegenerateView,
    AuditSubmitView,
)

urlpatterns = [
    path('', AuditListCreateView.as_view()),
    path('<int:pk>/', AuditDetailView.as_view()),
    path('<int:pk>/submit/', AuditSubmitView.as_view()),
    path('<int:pk>/regenerate/', AuditRegenerateView.as_view()),
    path('<int:pk>/images/', AuditImageListView.as_view()),
    path('<int:pk>/images/<int:image_id>/', AuditImageDeleteView.as_view()),
]
