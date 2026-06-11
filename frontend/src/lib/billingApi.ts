import api from './api'
import type { BillingMeResponse, BillingPlan, CheckoutSessionResponse, CreditBalance } from '../types/billing'

export interface BillingConfigResponse {
  provider: string
  provider_configured: boolean
  polar_server: string
  has_token: boolean
  has_product_ids: Record<string, boolean>
}

export interface SyncPolarResponse {
  synced: boolean
  credits_granted?: boolean
  current_plan: string
  balance: CreditBalance
  message: string
}

export const getBillingConfig = () => api.get<BillingConfigResponse>('/billing/config/')
export const getBillingPlans = () => api.get<BillingPlan[]>('/billing/plans/')
export const getMyBilling = () => api.get<BillingMeResponse>('/billing/me/')
export const createPolarCheckout = (plan: string) =>
  api.post<{ checkout_url: string }>('/billing/create-checkout/', { plan })
export const createCheckoutSession = (planKey: string) =>
  api.post<CheckoutSessionResponse>('/billing/create-checkout-session/', { plan_key: planKey })
export const mockCompletePayment = (paymentId: number) =>
  api.post<{ detail: string; balance: CreditBalance }>('/billing/mock-complete-payment/', { payment_id: paymentId })
export const syncPolar = () =>
  api.post<SyncPolarResponse>('/billing/sync-polar/')
