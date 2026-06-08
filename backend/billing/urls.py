from django.urls import path

from .views import BillingMeView, CreateCheckoutSessionView, MockCompletePaymentView, PlanListView

urlpatterns = [
    path('plans/', PlanListView.as_view()),
    path('me/', BillingMeView.as_view()),
    path('create-checkout-session/', CreateCheckoutSessionView.as_view()),
    path('mock-complete-payment/', MockCompletePaymentView.as_view()),
]
