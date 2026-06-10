import { useNavigate } from 'react-router-dom'
import { Check, Zap } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { useAuth } from '../../contexts/AuthContext'

const freeTrialFeatures = [
  '1 limited audit',
  'Basic listing diagnosis',
  'Preview recommendations',
  '0 full listing upgrades',
  '0 image generations',
]

const subscriptionPlans = [
  {
    key: 'launch',
    name: 'Launch',
    price: '$9',
    period: '/mo',
    description: 'For sellers starting to scale.',
    highlight: false,
    badge: null,
    features: [
      '5 audits per month',
      '1 full listing upgrade',
      '10 AI image generations/mo',
      'Review insights',
      'Image pack planning',
    ],
    cta: 'Start Launch',
    ctaVariant: 'secondary' as const,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$19',
    period: '/mo',
    description: 'Best for active sellers.',
    highlight: true,
    badge: 'Recommended',
    features: [
      '12 audits per month',
      '3 full listing upgrades',
      '35 AI image generations/mo',
      'Premium image pack workflow',
      'Competitor insights',
    ],
    cta: 'Start Pro',
    ctaVariant: 'primary' as const,
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '$29',
    period: '/mo',
    description: 'For growing brands.',
    highlight: false,
    badge: null,
    features: [
      '15 audits per month',
      '5 full listing upgrades',
      '60 AI image generations/mo',
      'Multi-product optimization',
      'Priority workflow',
    ],
    cta: 'Start Growth',
    ctaVariant: 'secondary' as const,
  },
  {
    key: 'agency',
    name: 'Agency',
    price: '$59',
    period: '/mo',
    description: 'Built for client work.',
    highlight: false,
    badge: null,
    features: [
      '30 audits per month',
      '15 full listing upgrades',
      '150 AI image generations/mo',
      'Agency-ready reporting',
      'Higher volume workflow',
    ],
    cta: 'Start Agency',
    ctaVariant: 'secondary' as const,
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
              background: 'linear-gradient(135deg, rgba(83,58,253,0.04) 0%, rgba(83,58,253,0.02) 100%)',
              border: '1.5px solid rgba(196,188,255,0.45)',
              boxShadow: '0 4px 20px rgba(83,58,253,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div style={{ minWidth: '200px' }}>
                <div
                  className="section-badge w-fit mb-3"
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.625rem' }}
                >
                  Free
                </div>
                <h3
                  className="font-black mb-2"
                  style={{ color: 'var(--dp-ink)', letterSpacing: '-0.02em', fontSize: '1.25rem' }}
                >
                  Free Trial
                </h3>
                <div className="flex items-end gap-2">
                  <span
                    className="font-black"
                    style={{ color: 'var(--dp-primary)', letterSpacing: '-0.04em', lineHeight: 1, fontSize: '2.25rem' }}
                  >
                    $0
                  </span>
                  <span className="text-sm pb-1" style={{ color: 'var(--dp-ink-muted)' }}>free</span>
                </div>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>
                  Try Sellio without commitment.
                </p>
              </div>

              <div
                className="hidden md:block"
                style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(196,188,255,0.40)', flexShrink: 0 }}
              />
              <div
                className="md:hidden h-px"
                style={{ background: 'rgba(196,188,255,0.40)' }}
              />

              <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {freeTrialFeatures.map(feat => (
                  <FeatureItem key={feat} text={feat} />
                ))}
              </ul>

              <div className="flex-shrink-0">
                <button
                  onClick={() => handlePlanClick('free_trial')}
                  className="dp-btn-ghost"
                  style={{ whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                >
                  Start Free
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
                    <span className="text-xs pb-0.5" style={{ color: 'var(--dp-ink-muted)' }}>{plan.period}</span>
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

        <AnimatedSection delay={0.3} className="text-center mt-8">
          <p className="text-sm" style={{ color: 'var(--dp-ink-muted)' }}>
            All plans include a free first audit. No credit card required to start.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
