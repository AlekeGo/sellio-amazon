import api from './api'
import type { BillingMeResponse, BillingPlan, CheckoutSessionResponse, CreditBalance } from '../types/billing'

export const getBillingPlans = () => api.get<BillingPlan[]>('/billing/plans/')
export const getMyBilling = () => api.get<BillingMeResponse>('/billing/me/')
export const createCheckoutSession = (planKey: string) =>
  api.post<CheckoutSessionResponse>('/billing/create-checkout-session/', { plan_key: planKey })
export const mockCompletePayment = (paymentId: number) =>
  api.post<{ detail: string; balance: CreditBalance }>('/billing/mock-complete-payment/', { payment_id: paymentId })
