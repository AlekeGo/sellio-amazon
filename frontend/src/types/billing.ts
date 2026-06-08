export interface BillingPlan {
  key: string
  name: string
  price_display: string
  amount_cents: number
  mode: 'free' | 'payment' | 'subscription'
  audit_credits: number
  full_upgrade_credits: number
  image_generation_credits: number
  features: string[]
}

export interface UserBillingProfile {
  current_plan: string
  subscription_status: string
  payment_provider: string
  created_at: string
  updated_at: string
}

export interface CreditBalance {
  audit_credits: number
  full_upgrade_credits: number
  image_generation_credits: number
  updated_at: string
}

export interface CreditTransaction {
  id: number
  transaction_type: 'grant' | 'consume' | 'refund' | 'adjustment'
  credit_type: 'audit' | 'full_upgrade' | 'image_generation'
  amount: number
  reason: string
  created_at: string
}

export interface Payment {
  id: number
  provider: string
  plan_key: string
  amount_cents: number
  currency: string
  status: string
  mode: string
  credits_granted: boolean
  created_at: string
  updated_at: string
}

export interface BillingMeResponse {
  profile: UserBillingProfile
  balance: CreditBalance
  can_run_audit: boolean
  can_generate_image: boolean
  upgrade_required: boolean
  recent_transactions: CreditTransaction[]
  recent_payments: Payment[]
}

export interface CheckoutSessionResponse {
  payment_id: number
  checkout_url: string
  message: string
}
