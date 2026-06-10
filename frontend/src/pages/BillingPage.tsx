import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Crown, Zap, Star, X, AlertCircle, ArrowRight,
  CreditCard, Check, Loader2, CheckCircle2, Package, Receipt,
} from 'lucide-react'
import { getMyBilling, getBillingPlans, createCheckoutSession, mockCompletePayment } from '../lib/billingApi'
import type { BillingMeResponse, BillingPlan, CreditTransaction, Payment } from '../types/billing'

const SUBSCRIPTION_KEYS = ['launch', 'pro', 'growth', 'agency']
const HIGHLIGHTED_KEY = 'pro'

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free_trial: 'Free Trial',
  launch: 'Launch',
  pro: 'Pro',
  growth: 'Growth',
  agency: 'Agency',
}

function formatCents(cents: number) {
  if (cents === 0) return '$0'
  return `$${(cents / 100).toFixed(0)}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function txLabel(type: string) {
  if (type === 'grant') return { label: '+Grant', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' }
  if (type === 'consume') return { label: '−Use', color: '#f97316', bg: 'rgba(249,115,22,0.08)' }
  if (type === 'refund') return { label: '+Refund', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' }
  return { label: 'Adj', color: 'var(--dp-ink-muted)', bg: 'rgba(196,188,255,0.15)' }
}

function creditTypeLabel(type: string) {
  if (type === 'audit') return 'Audit'
  if (type === 'full_upgrade') return 'Full Upgrade'
  if (type === 'image_generation') return 'Image Gen'
  return type
}

function paymentStatusStyle(status: string): [string, string] {
  if (status === 'completed') return ['#16a34a', 'rgba(22,163,74,0.08)']
  if (status === 'pending') return ['#b45309', 'rgba(180,83,9,0.08)']
  if (status === 'failed') return ['#ef4444', 'rgba(239,68,68,0.08)']
  if (status === 'cancelled') return ['var(--dp-ink-muted)', 'rgba(196,188,255,0.15)']
  return ['var(--dp-ink-muted)', 'rgba(196,188,255,0.15)']
}

function subStatusStyle(status: string): [string, string] {
  if (status === 'active') return ['#16a34a', 'rgba(22,163,74,0.08)']
  if (status === 'cancelled') return ['#f97316', 'rgba(249,115,22,0.08)']
  if (status === 'past_due') return ['#b45309', 'rgba(180,83,9,0.08)']
  if (status === 'expired') return ['#ef4444', 'rgba(239,68,68,0.08)']
  return ['var(--dp-ink-muted)', 'rgba(196,188,255,0.15)']
}

function StatusPill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.5rem',
      borderRadius: 99, fontSize: '0.6875rem', fontWeight: 700, color, background: bg,
      textTransform: 'capitalize', letterSpacing: '0.02em',
    }}>
      {label.replace(/_/g, ' ')}
    </span>
  )
}

function GlassCard({ children, accent, style }: {
  children: React.ReactNode
  accent?: boolean
  style?: React.CSSProperties
}) {
  return (
    <div style={{
      borderRadius: '0.875rem',
      padding: '1.25rem 1.5rem',
      background: accent ? 'rgba(83,58,253,0.05)' : '#ffffff',
      border: `1px solid ${accent ? 'rgba(83,58,253,0.22)' : 'rgba(196,188,255,0.45)'}`,
      boxShadow: '0 2px 12px rgba(83,58,253,0.06)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-ink-muted)',
      textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.875rem',
    }}>
      {children}
    </h2>
  )
}

interface CheckoutModalState {
  planKey: string
  paymentId: number
  plan: BillingPlan
}

export default function BillingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const checkoutParam = searchParams.get('checkout')
  const planParam = searchParams.get('plan')
  const paymentIdParam = searchParams.get('payment_id')

  const [billingData, setBillingData] = useState<BillingMeResponse | null>(null)
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [checkoutState, setCheckoutState] = useState<CheckoutModalState | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [banner, setBanner] = useState<'success' | 'cancelled' | null>(
    checkoutParam === 'success' ? 'success' : checkoutParam === 'cancelled' ? 'cancelled' : null
  )

  const autoCheckoutFired = useRef(false)

  const fetchBilling = useCallback(async () => {
    try {
      const [meRes, plansRes] = await Promise.all([getMyBilling(), getBillingPlans()])
      setBillingData(meRes.data)
      setPlans(plansRes.data)
    } catch {
      setFetchError('Could not load billing information.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBilling() }, [fetchBilling])

  useEffect(() => {
    if (plans.length === 0 || autoCheckoutFired.current) return

    if (checkoutParam === 'mock' && planParam && paymentIdParam) {
      const plan = plans.find(p => p.key === planParam)
      if (plan) {
        autoCheckoutFired.current = true
        setCheckoutState({ planKey: planParam, paymentId: Number(paymentIdParam), plan })
      }
      return
    }

    if (planParam && checkoutParam !== 'success' && checkoutParam !== 'cancelled') {
      const plan = plans.find(p => p.key === planParam)
      if (!plan || plan.mode === 'free') return
      autoCheckoutFired.current = true
      setCheckoutLoading(true)
      createCheckoutSession(planParam)
        .then(res => setCheckoutState({ planKey: planParam, paymentId: res.data.payment_id, plan }))
        .catch(() => setCheckoutError('Could not open checkout. Please try again.'))
        .finally(() => setCheckoutLoading(false))
    }
  }, [plans, planParam, checkoutParam, paymentIdParam])

  const openCheckout = async (planKey: string) => {
    const plan = plans.find(p => p.key === planKey)
    if (!plan) return
    setCheckoutError(null)
    setCheckoutLoading(true)
    try {
      const res = await createCheckoutSession(planKey)
      setCheckoutState({ planKey, paymentId: res.data.payment_id, plan })
    } catch {
      setCheckoutError('Could not open checkout. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleCompletePayment = async () => {
    if (!checkoutState) return
    setPaymentLoading(true)
    setCheckoutError(null)
    try {
      await mockCompletePayment(checkoutState.paymentId)
      await fetchBilling()
      setCheckoutState(null)
      setBanner('success')
      navigate('/dashboard/billing?checkout=success', { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setCheckoutError(msg || 'Payment failed. Please try again.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const subscriptionPlans = plans.filter(p => SUBSCRIPTION_KEYS.includes(p.key))
  const currentPlanKey = billingData?.profile.current_plan ?? 'free_trial'
  const balance = billingData?.balance
  const profile = billingData?.profile
  const transactions = billingData?.recent_transactions ?? []
  const payments = billingData?.recent_payments ?? []

  const isFreePlan = currentPlanKey === 'free_trial'

  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 900,
          color: 'var(--dp-ink)', letterSpacing: '-0.03em', margin: '0 0 0.375rem',
        }}>
          Billing
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: 0 }}>
          Manage your plan, credits, and payments.
        </p>
      </div>

      {banner === 'success' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', padding: '0.875rem 1.125rem', borderRadius: '0.75rem',
          background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.25)',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#16a34a' }}>
              Credits added successfully.
            </span>
          </div>
          <button onClick={() => setBanner(null)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dp-ink-muted)', padding: 0, flexShrink: 0,
          }}>
            <X size={14} />
          </button>
        </div>
      )}

      {banner === 'cancelled' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', padding: '0.875rem 1.125rem', borderRadius: '0.75rem',
          background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.18)',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <AlertCircle size={16} color="#fbbf24" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fde68a' }}>
              Checkout was cancelled — no charge was made.
            </span>
          </div>
          <button onClick={() => setBanner(null)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dp-ink-muted)', padding: 0, flexShrink: 0,
          }}>
            <X size={14} />
          </button>
        </div>
      )}

      {checkoutLoading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.875rem 1.125rem', borderRadius: '0.75rem',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(196,188,255,0.40)',
          marginBottom: '1.25rem',
        }}>
          <Loader2 size={15} color="#64748b" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)' }}>Opening checkout...</span>
        </div>
      )}

      {checkoutError && !checkoutState && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.875rem 1.125rem', borderRadius: '0.75rem',
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
          marginBottom: '1.25rem',
        }}>
          <AlertCircle size={15} color="#f87171" />
          <span style={{ fontSize: '0.875rem', color: '#fca5a5' }}>{checkoutError}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[120, 80, 80].map((h, i) => (
            <div key={i} style={{
              borderRadius: '0.875rem', height: h,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : fetchError ? (
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <AlertCircle size={15} color="#f87171" />
            <span style={{ fontSize: '0.875rem', color: '#fca5a5' }}>{fetchError}</span>
          </div>
        </GlassCard>
      ) : (
        <>
          <GlassCard accent style={{ marginBottom: '1rem' }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Crown size={14} color="var(--dp-primary)" />
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Current Plan
                  </span>
                </div>
                <div className="gradient-text" style={{ fontSize: '1.375rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>
                  {PLAN_DISPLAY_NAMES[currentPlanKey] ?? currentPlanKey}
                </div>
                {profile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <StatusPill
                      label={profile.subscription_status}
                      color={subStatusStyle(profile.subscription_status)[0]}
                      bg={subStatusStyle(profile.subscription_status)[1]}
                    />
                    {profile.payment_provider === 'mock' && (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--dp-ink-muted)' }}>Test mode</span>
                    )}
                  </div>
                )}
              </div>
              {isFreePlan && (
                <button
                  onClick={() => {
                    const proEl = document.getElementById('billing-plans')
                    proEl?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="btn-primary"
                  style={{ flexShrink: 0, alignSelf: 'flex-start' }}
                >
                  Upgrade Plan
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </GlassCard>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.75rem',
          }}>
            {[
              {
                icon: Zap,
                label: 'Audit Credits',
                value: balance?.audit_credits ?? 0,
                sub: 'AI listing audits',
                low: (balance?.audit_credits ?? 0) === 0,
              },
              {
                icon: Star,
                label: 'Full Upgrade Credits',
                value: balance?.full_upgrade_credits ?? 0,
                sub: 'Complete listing upgrades',
                low: (balance?.full_upgrade_credits ?? 0) === 0,
              },
              {
                icon: Package,
                label: 'Image Credits',
                value: balance?.image_generation_credits ?? 0,
                sub: 'AI image generations',
                low: (balance?.image_generation_credits ?? 0) === 0,
              },
            ].map(({ icon: Icon, label, value, sub, low }) => (
              <div key={label} style={{
                borderRadius: '0.75rem', padding: '1rem 1.125rem',
                background: '#ffffff', border: '1px solid rgba(196,188,255,0.40)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '0.4375rem',
                    background: low ? 'rgba(196,188,255,0.08)' : 'rgba(83,58,253,0.08)',
                    border: `1px solid ${low ? 'rgba(196,188,255,0.25)' : 'rgba(83,58,253,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={13} color={low ? 'var(--dp-ink-muted)' : 'var(--dp-primary)'} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--dp-ink-muted)' }}>{label}</span>
                </div>
                <div style={{
                  fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em',
                  color: low ? 'var(--dp-ink-muted)' : 'var(--dp-ink)', lineHeight: 1, marginBottom: '0.25rem',
                }}>
                  {value}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)' }}>{sub}</div>
              </div>
            ))}
          </div>

          <div id="billing-plans" style={{ marginBottom: '1.75rem' }}>
            <SectionLabel>Upgrade Plan</SectionLabel>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem',
            }}>
              {subscriptionPlans.map(plan => {
                const isCurrent = plan.key === currentPlanKey
                const isHighlighted = plan.key === HIGHLIGHTED_KEY
                return (
                  <div key={plan.key} style={{
                    borderRadius: '0.875rem', padding: '1.125rem',
                    background: isHighlighted
                      ? 'linear-gradient(160deg, rgba(83,58,253,0.07) 0%, rgba(106,85,254,0.04) 100%)'
                      : '#ffffff',
                    border: `${isHighlighted ? '1.5px' : '1px'} solid ${isHighlighted ? 'rgba(83,58,253,0.40)' : isCurrent ? 'rgba(196,188,255,0.55)' : 'rgba(196,188,255,0.38)'}`,
                    display: 'flex', flexDirection: 'column', gap: '0.75rem',
                    position: 'relative',
                  }}>
                    {isHighlighted && (
                      <div style={{
                        position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #533AFD, #6A55FE)',
                        color: '#ffffff', fontSize: '0.625rem', fontWeight: 800,
                        padding: '0.1875rem 0.625rem', borderRadius: 99,
                        whiteSpace: 'nowrap', letterSpacing: '0.04em',
                      }}>
                        RECOMMENDED
                      </div>
                    )}
                    {isCurrent && !isHighlighted && (
                      <div style={{
                        position: 'absolute', top: -12, right: 12,
                        background: 'rgba(83,58,253,0.06)', border: '1px solid rgba(196,188,255,0.45)',
                        color: 'var(--dp-primary)', fontSize: '0.625rem', fontWeight: 700,
                        padding: '0.1875rem 0.5rem', borderRadius: 99,
                        whiteSpace: 'nowrap', letterSpacing: '0.04em',
                      }}>
                        CURRENT
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: isHighlighted ? 'var(--dp-primary)' : 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.375rem' }}>
                        {plan.name}
                      </p>
                      <div style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--dp-ink)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                        {plan.price_display}
                      </div>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3125rem' }}>
                      {plan.features.map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                          <Check size={11} color={isHighlighted ? 'var(--dp-primary)' : '#16a34a'} style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)', lineHeight: 1.4 }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => !isCurrent && openCheckout(plan.key)}
                      disabled={isCurrent || checkoutLoading}
                      style={{
                        width: '100%', padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 700,
                        cursor: isCurrent ? 'default' : 'pointer',
                        border: 'none', fontFamily: 'inherit',
                        background: isCurrent
                          ? 'rgba(196,188,255,0.12)'
                          : isHighlighted
                          ? 'linear-gradient(135deg, #533AFD, #6A55FE)'
                          : 'rgba(83,58,253,0.07)',
                        color: isCurrent ? 'var(--dp-ink-muted)' : isHighlighted ? 'white' : 'var(--dp-primary)',
                        transition: 'opacity 0.15s',
                        opacity: checkoutLoading ? 0.6 : 1,
                      }}
                      onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.opacity = '0.8' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    >
                      {isCurrent ? 'Current Plan' : checkoutLoading ? 'Loading…' : `Choose ${plan.name}`}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <SectionLabel>Recent Transactions</SectionLabel>
            <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
              {transactions.length === 0 ? (
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                  <Receipt size={24} color="#1e293b" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: 0 }}>No transactions yet.</p>
                </div>
              ) : (
                <div>
                  {transactions.map((tx: CreditTransaction, i: number) => {
                    const { label, color, bg } = txLabel(tx.transaction_type)
                    const isLast = i === transactions.length - 1
                    return (
                      <div key={tx.id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                        padding: '0.75rem 1.25rem',
                        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                      }}>
                        <span style={{
                          display: 'inline-flex', padding: '0.125rem 0.5rem',
                          borderRadius: 99, fontSize: '0.6875rem', fontWeight: 700,
                          color, background: bg, flexShrink: 0, minWidth: 48, justifyContent: 'center',
                        }}>
                          {label}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--dp-ink-muted)', marginBottom: 1 }}>
                            {creditTypeLabel(tx.credit_type)} · {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--dp-ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tx.reason}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--dp-ink-muted)', flexShrink: 0 }}>
                          {formatDate(tx.created_at)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </GlassCard>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <SectionLabel>Payment History</SectionLabel>
            <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
              {payments.length === 0 ? (
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                  <CreditCard size={24} color="#1e293b" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: 0 }}>No payments yet.</p>
                </div>
              ) : (
                <div>
                  {payments.map((p: Payment, i: number) => {
                    const [statusColor, statusBg] = paymentStatusStyle(p.status)
                    const isLast = i === payments.length - 1
                    return (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                        padding: '0.75rem 1.25rem',
                        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                        flexWrap: 'wrap',
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--dp-ink-muted)', marginBottom: 2 }}>
                            {PLAN_DISPLAY_NAMES[p.plan_key] ?? p.plan_key}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--dp-ink-muted)' }}>
                            {formatDate(p.created_at)} · {p.mode}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--dp-ink-muted)', letterSpacing: '-0.02em' }}>
                            {formatCents(p.amount_cents)}
                          </span>
                          <StatusPill label={p.status} color={statusColor} bg={statusBg} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </GlassCard>
          </div>

          <div style={{
            borderRadius: '0.875rem', padding: '1rem 1.25rem',
            background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
          }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0 }}>
              All plans include a free first audit. Payments are currently in test mode — no real charges.
            </p>
            <Link to="/pricing" style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>
              View full pricing
            </Link>
          </div>
        </>
      )}

      {checkoutState && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(7,14,10,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
          onClick={e => { if (e.target === e.currentTarget) setCheckoutState(null) }}
        >
          <div style={{
            width: '100%', maxWidth: 420,
            borderRadius: '1.125rem',
            background: '#ffffff',
            border: '1px solid rgba(196,188,255,0.50)',
            boxShadow: '0 8px 60px rgba(83,58,253,0.15), 0 0 0 1px rgba(196,188,255,0.25)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(196,188,255,0.38)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={15} color="var(--dp-primary)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--dp-ink-muted)' }}>
                  Mock Checkout
                </span>
              </div>
              <button
                onClick={() => setCheckoutState(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dp-ink-muted)', padding: 2 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.375rem' }}>
                  {checkoutState.plan.mode === 'subscription' ? 'Subscription' : 'One-time Purchase'}
                </p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--dp-ink)', letterSpacing: '-0.03em', margin: '0 0 0.25rem' }}>
                  {checkoutState.plan.name}
                </h3>
                <div className="gradient-text" style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {checkoutState.plan.price_display}
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4375rem' }}>
                {checkoutState.plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Check size={12} color="var(--dp-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <div style={{
                padding: '0.875rem 1rem', borderRadius: '0.625rem',
                background: 'rgba(83,58,253,0.04)', border: '1px solid rgba(196,188,255,0.40)',
                marginBottom: '1.25rem',
              }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.6 }}>
                  This is a test payment — no real charge will be made.
                </p>
              </div>

              {checkoutError && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 0.875rem', borderRadius: '0.5rem',
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.16)',
                  marginBottom: '1rem',
                }}>
                  <AlertCircle size={13} color="#f87171" />
                  <span style={{ fontSize: '0.8125rem', color: '#fca5a5' }}>{checkoutError}</span>
                </div>
              )}

              <button
                onClick={handleCompletePayment}
                disabled={paymentLoading}
                className="dp-btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9375rem', opacity: paymentLoading ? 0.7 : 1 }}
              >
                {paymentLoading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Processing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Complete Test Payment
                  </>
                )}
              </button>

              <button
                onClick={() => setCheckoutState(null)}
                style={{
                  width: '100%', marginTop: '0.625rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', padding: '0.5rem',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
