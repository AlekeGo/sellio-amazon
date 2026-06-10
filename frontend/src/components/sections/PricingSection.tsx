import { useNavigate } from 'react-router-dom'
import { Check, Zap, Star } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { useAuth } from '../../contexts/AuthContext'

const oneTimeFeatures = [
  '1 complete listing upgrade',
  'AI audit and strategy',
  'Improved title, bullets, and description',
  'Image pack structure',
  'One-time payment, no commitment',
]

const subscriptionPlans = [
  {
    key: 'free_trial',
    name: 'Free Trial',
    price: '$0',
    period: 'free',
    description: 'Try Sellio without committing.',
    highlight: false,
    badge: null,
    features: [
      '1 limited audit',
      'Basic listing diagnosis',
      'Preview recommendations',
      'Good for trying Sellio',
    ],
    cta: 'Start Free',
    ctaVariant: 'secondary' as const,
  },
  {
    key: 'launch',
    name: 'Launch',
    price: '$19',
    period: '/mo',
    description: 'For sellers starting to scale.',
    highlight: false,
    badge: null,
    features: [
      '3 audits per month',
      '1 full listing upgrade',
      'Review insights',
      'Image pack planning',
    ],
    cta: 'Start Launch',
    ctaVariant: 'secondary' as const,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$39',
    period: '/mo',
    description: 'Best for active sellers.',
    highlight: true,
    badge: 'Recommended',
    features: [
      '7 audits per month',
      '3 full listing upgrades',
      'Premium image pack workflow',
      'Best for active sellers',
    ],
    cta: 'Start Pro',
    ctaVariant: 'primary' as const,
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '$59',
    period: '/mo',
    description: 'For growing brands.',
    highlight: false,
    badge: null,
    features: [
      '10 audits per month',
      '5 full listing upgrades',
      'Multi-product optimization',
      'Better for growing brands',
    ],
    cta: 'Start Growth',
    ctaVariant: 'secondary' as const,
  },
  {
    key: 'agency',
    name: 'Agency',
    price: '$149',
    period: '/mo',
    description: 'Built for client work.',
    highlight: false,
    badge: null,
    features: [
      '25 audits per month',
      '15 full listing upgrades',
      'Built for client work',
      'Higher volume workflow',
    ],
    cta: 'Start Agency',
    ctaVariant: 'secondary' as const,
  },
]

const addons = [
  {
    key: 'extra_upgrade',
    icon: Star,
    name: 'Extra Full Upgrade',
    price: '$19',
    desc: 'One additional complete listing upgrade, usable anytime on any plan.',
    accentColor: 'var(--dp-primary)',
    accentBg: 'rgba(83,58,253,0.05)',
    accentBorder: 'rgba(83,58,253,0.2)',
  },
  {
    key: 'extra_audit_pack',
    icon: Zap,
    name: 'Extra Audit Pack',
    price: '$9',
    desc: '1 additional audit added to your current plan billing cycle.',
    accentColor: '#7C3AED',
    accentBg: 'rgba(124,58,237,0.05)',
    accentBorder: 'rgba(124,58,237,0.18)',
  },
]

function FeatureItem({ text, highlighted }: { text: string; highlighted?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
        style={{
          marginTop: '2px',
          background: highlighted ? 'rgba(83,58,253,0.1)' : 'rgba(83,58,253,0.06)',
          border: `1px solid ${highlighted ? 'rgba(83,58,253,0.28)' : 'rgba(196,188,255,0.5)'}`,
        }}
      >
        <Check size={9} style={{ color: 'var(--dp-primary)' }} />
      </div>
      <span className="text-sm leading-snug" style={{ color: highlighted ? 'var(--dp-ink)' : 'var(--dp-ink-secondary)' }}>
        {text}
      </span>
    </li>
  )
}

export default function PricingSection() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handlePlanClick = (planKey: string) => {
    if (!isAuthenticated) {
      navigate(planKey === 'free_trial' ? '/signup' : '/login')
      return
    }
    if (planKey === 'free_trial') {
      navigate('/dashboard/new-audit')
      return
    }
    navigate(`/dashboard/billing?plan=${planKey}`)
  }

  const handleOneTimeClick = (planKey: string) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate(`/dashboard/billing?plan=${planKey}`)
  }

  return (
    <section id="pricing" className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(83,58,253,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-14">
          <h2
            className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
          >
            Built for sellers at{' '}
            <span className="gradient-text">every stage.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <div
            className="rounded-2xl p-6 mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(83,58,253,0.05) 0%, rgba(83,58,253,0.02) 100%)',
              border: '1.5px solid rgba(83,58,253,0.25)',
              boxShadow: '0 4px 32px rgba(83,58,253,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div style={{ minWidth: '200px' }}>
                <div
                  className="section-badge w-fit mb-3"
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.625rem' }}
                >
                  One-Time
                </div>
                <h3
                  className="font-black mb-2"
                  style={{ color: 'var(--dp-ink)', letterSpacing: '-0.02em', fontSize: '1.25rem' }}
                >
                  Full Listing Upgrade
                </h3>
                <div className="flex items-end gap-2">
                  <span
                    className="font-black"
                    style={{ color: 'var(--dp-primary)', letterSpacing: '-0.04em', lineHeight: 1, fontSize: '2.25rem' }}
                  >
                    $29
                  </span>
                  <span className="text-sm pb-1" style={{ color: 'var(--dp-ink-muted)' }}>one-time</span>
                </div>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>
                  No subscription. Upgrade one listing and you're done.
                </p>
              </div>

              <div
                className="hidden md:block"
                style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(83,58,253,0.15)', flexShrink: 0 }}
              />
              <div
                className="md:hidden h-px"
                style={{ background: 'rgba(83,58,253,0.15)' }}
              />

              <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {oneTimeFeatures.map(feat => (
                  <FeatureItem key={feat} text={feat} highlighted />
                ))}
              </ul>

              <div className="flex-shrink-0">
                <button
                  onClick={() => handleOneTimeClick('full_upgrade')}
                  className="dp-btn-ghost"
                  style={{ whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                >
                  Buy Once — $29
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1" style={{ background: 'rgba(196,188,255,0.40)' }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3"
              style={{ color: 'var(--dp-ink-muted)' }}
            >
              Monthly Plans
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(196,188,255,0.40)' }} />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.12}>
          <div className="subscription-grid mb-8">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl p-5 flex flex-col relative hover-lift"
                style={plan.highlight ? {
                  background: 'linear-gradient(160deg, rgba(83,58,253,0.07) 0%, rgba(83,58,253,0.03) 100%)',
                  border: '1.5px solid rgba(83,58,253,0.38)',
                  boxShadow: '0 0 0 1px rgba(83,58,253,0.08), 0 8px 40px rgba(83,58,253,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
                  zIndex: 1,
                } : {
                  background: '#ffffff',
                  border: '1px solid rgba(196,188,255,0.4)',
                  boxShadow: '0 2px 12px rgba(83,58,253,0.05)',
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, #533AFD, #7A66FF)',
                      color: '#ffffff',
                      boxShadow: '0 2px 12px rgba(83,58,253,0.35)',
                    }}
                  >
                    <Zap size={9} fill="#ffffff" />
                    {plan.badge}
                  </div>
                )}

                <div className="mb-4">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: plan.highlight ? 'var(--dp-primary)' : '#64748b' }}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1.5 mb-1.5">
                    <span
                      className="font-black leading-none"
                      style={{ color: 'var(--dp-ink)', letterSpacing: '-0.04em', fontSize: '1.875rem' }}
                    >
                      {plan.price}
                    </span>
                    {plan.period !== 'free' && (
                      <span className="text-xs pb-0.5" style={{ color: 'var(--dp-ink-muted)' }}>{plan.period}</span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>{plan.description}</p>
                </div>

                <div
                  className="h-px mb-4"
                  style={{ background: plan.highlight ? 'rgba(83,58,253,0.2)' : 'rgba(196,188,255,0.40)' }}
                />

                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map(feat => (
                    <FeatureItem key={feat} text={feat} highlighted={plan.highlight} />
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanClick(plan.key)}
                  className={plan.ctaVariant === 'primary' ? 'btn-primary justify-center' : 'btn-secondary justify-center'}
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.8125rem', width: '100%', fontFamily: 'inherit' }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px flex-1" style={{ background: 'rgba(196,188,255,0.40)' }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3"
              style={{ color: 'var(--dp-ink-muted)' }}
            >
              Add-ons — any paid plan
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(196,188,255,0.40)' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addons.map((addon) => {
              const Icon = addon.icon
              return (
                <div
                  key={addon.name}
                  className="rounded-2xl p-5 flex items-center gap-4"
                  style={{
                    background: addon.accentBg,
                    border: `1px solid ${addon.accentBorder}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${addon.accentColor}18`,
                      border: `1px solid ${addon.accentColor}35`,
                    }}
                  >
                    <Icon size={16} style={{ color: addon.accentColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--dp-ink)' }}>{addon.name}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>{addon.desc}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className="font-black block"
                      style={{
                        color: addon.accentColor,
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        fontSize: '1.5rem',
                        marginBottom: '0.375rem',
                      }}
                    >
                      {addon.price}
                    </span>
                    <button
                      onClick={() => handleOneTimeClick(addon.key)}
                      className="text-xs font-bold px-3 py-1 rounded-lg"
                      style={{
                        background: `${addon.accentColor}14`,
                        border: `1px solid ${addon.accentColor}30`,
                        color: addon.accentColor,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3} className="text-center mt-8">
          <p className="text-sm" style={{ color: 'var(--dp-ink-muted)' }}>
            All plans include a free first audit. No credit card required to start.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
