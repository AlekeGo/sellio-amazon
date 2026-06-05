import { Link } from 'react-router-dom'
import { Check, Zap, Star } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const oneTimeFeatures = [
  '1 complete listing upgrade',
  'AI audit and strategy',
  'Improved title, bullets, and description',
  'Image pack structure',
  'One-time payment, no commitment',
]

const subscriptionPlans = [
  {
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
    href: '/dashboard/new-audit',
  },
  {
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
    href: '/dashboard/new-audit',
  },
  {
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
    href: '/dashboard/new-audit',
  },
  {
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
    href: '/dashboard/new-audit',
  },
  {
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
    href: '/dashboard/new-audit',
  },
]

const addons = [
  {
    icon: Star,
    name: 'Extra Full Upgrade',
    price: '$19',
    desc: 'One additional complete listing upgrade, usable anytime on any plan.',
    accentColor: '#a3e635',
    accentBg: 'rgba(163,230,53,0.05)',
    accentBorder: 'rgba(163,230,53,0.2)',
  },
  {
    icon: Zap,
    name: 'Extra Audit Pack',
    price: '$9',
    desc: '5 additional audits added to your current plan billing cycle.',
    accentColor: '#34d399',
    accentBg: 'rgba(52,211,153,0.05)',
    accentBorder: 'rgba(52,211,153,0.18)',
  },
]

function FeatureItem({ text, highlighted }: { text: string; highlighted?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
        style={{
          marginTop: '2px',
          background: highlighted ? 'rgba(163,230,53,0.15)' : 'rgba(74,222,128,0.1)',
          border: `1px solid ${highlighted ? 'rgba(163,230,53,0.3)' : 'rgba(74,222,128,0.25)'}`,
        }}
      >
        <Check size={9} style={{ color: highlighted ? '#a3e635' : '#4ade80' }} />
      </div>
      <span className="text-sm leading-snug" style={{ color: highlighted ? '#d4f5a0' : '#aec0d4' }}>
        {text}
      </span>
    </li>
  )
}

export default function PricingSection() {
  return (
    <section id="pricing" className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(163,230,53,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-14">
          <div className="section-badge mx-auto w-fit mb-5">Pricing</div>
          <h2
            className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
          >
            Built for sellers at{' '}
            <span className="gradient-text">every stage.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.05}>
          <div
            className="rounded-2xl p-6 mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(163,230,53,0.07) 0%, rgba(52,211,153,0.04) 100%)',
              border: '1.5px solid rgba(163,230,53,0.3)',
              boxShadow: '0 4px 40px rgba(163,230,53,0.07), inset 0 1px 0 rgba(255,255,255,0.05)',
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
                  style={{ color: '#f1f5f9', letterSpacing: '-0.02em', fontSize: '1.25rem' }}
                >
                  Full Listing Upgrade
                </h3>
                <div className="flex items-end gap-2">
                  <span
                    className="font-black"
                    style={{ color: '#a3e635', letterSpacing: '-0.04em', lineHeight: 1, fontSize: '2.25rem' }}
                  >
                    $29
                  </span>
                  <span className="text-sm pb-1" style={{ color: '#64748b' }}>one-time</span>
                </div>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#6e849e' }}>
                  No subscription. Upgrade one listing and you're done.
                </p>
              </div>

              <div
                className="hidden md:block"
                style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(163,230,53,0.15)', flexShrink: 0 }}
              />
              <div
                className="md:hidden h-px"
                style={{ background: 'rgba(163,230,53,0.15)' }}
              />

              <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {oneTimeFeatures.map(feat => (
                  <FeatureItem key={feat} text={feat} highlighted />
                ))}
              </ul>

              <div className="flex-shrink-0">
                <Link
                  to="/dashboard/new-audit"
                  className="btn-secondary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Buy Once — $29
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3"
              style={{ color: '#475569' }}
            >
              Monthly Plans
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.12}>
          <div className="subscription-grid mb-8">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl p-5 flex flex-col relative"
                style={plan.highlight ? {
                  background: 'linear-gradient(160deg, rgba(163,230,53,0.08) 0%, rgba(52,211,153,0.05) 100%)',
                  border: '1.5px solid rgba(163,230,53,0.42)',
                  boxShadow: '0 0 60px rgba(163,230,53,0.08), inset 0 1px 0 rgba(255,255,255,0.07)',
                  zIndex: 1,
                } : {
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, #4d7c0f, #a3e635)',
                      color: '#071008',
                    }}
                  >
                    <Zap size={9} fill="#071008" />
                    {plan.badge}
                  </div>
                )}

                <div className="mb-4">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: plan.highlight ? '#a3e635' : '#64748b' }}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1.5 mb-1.5">
                    <span
                      className="font-black leading-none"
                      style={{ color: '#f1f5f9', letterSpacing: '-0.04em', fontSize: '1.875rem' }}
                    >
                      {plan.price}
                    </span>
                    {plan.period !== 'free' && (
                      <span className="text-xs pb-0.5" style={{ color: '#64748b' }}>{plan.period}</span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#6e849e' }}>{plan.description}</p>
                </div>

                <div
                  className="h-px mb-4"
                  style={{ background: plan.highlight ? 'rgba(163,230,53,0.2)' : 'rgba(255,255,255,0.07)' }}
                />

                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map(feat => (
                    <FeatureItem key={feat} text={feat} highlighted={plan.highlight} />
                  ))}
                </ul>

                <Link
                  to={plan.href}
                  className={plan.ctaVariant === 'primary' ? 'btn-primary justify-center' : 'btn-secondary justify-center'}
                  style={{ padding: '0.6rem 0.875rem', fontSize: '0.8125rem' }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3"
              style={{ color: '#475569' }}
            >
              Add-ons — any paid plan
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
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
                    <p className="text-sm font-bold mb-1" style={{ color: '#f1f5f9' }}>{addon.name}</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#6e849e' }}>{addon.desc}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className="font-black block"
                      style={{
                        color: addon.accentColor,
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        fontSize: '1.5rem',
                      }}
                    >
                      {addon.price}
                    </span>
                    <span className="text-xs" style={{ color: '#475569' }}>one-time</span>
                  </div>
                </div>
              )
            })}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3} className="text-center mt-8">
          <p className="text-sm" style={{ color: '#475569' }}>
            All plans include a free first audit. No credit card required to start.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
