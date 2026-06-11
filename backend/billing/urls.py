from django.urls import path

from .views import (
    BillingConfigView,
    BillingMeView,
    CreateCheckoutSessionView,
    MockCompletePaymentView,
    PlanListView,
    PolarCreateCheckoutView,
    PolarWebhookView,
    SyncPolarView,
)

urlpatterns = [
    path('config/', BillingConfigView.as_view()),
    path('plans/', PlanListView.as_view()),
    path('me/', BillingMeView.as_view()),
    path('create-checkout/', PolarCreateCheckoutView.as_view()),
    path('create-checkout-session/', CreateCheckoutSessionView.as_view()),
    path('mock-complete-payment/', MockCompletePaymentView.as_view()),
    path('polar/webhook/', PolarWebhookView.as_view()),
    path('sync-polar/', SyncPolarView.as_view()),
]
