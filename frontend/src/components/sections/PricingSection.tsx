import { Link } from 'react-router-dom'
import { Check, Zap } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get a feel for what Sellio can do.',
    highlight: false,
    badge: null,
    features: [
      '1 limited listing audit',
      'Core score overview',
      '3 keyword suggestions',
      'Basic title feedback',
    ],
    excluded: ['Full copy upgrade', 'Image generation', 'Review insights'],
    cta: 'Get Started Free',
    ctaVariant: 'secondary' as const,
    href: '/dashboard/new-audit',
  },
  {
    name: 'One-Time',
    price: '$29',
    period: 'one time',
    description: 'One complete listing upgrade, no subscription.',
    highlight: false,
    badge: null,
    features: [
      '1 full listing upgrade',
      'Title + bullets + description',
      'Full keyword report',
      '2 image pack concepts',
      'Review insight summary',
    ],
    excluded: [],
    cta: 'Buy Once',
    ctaVariant: 'secondary' as const,
    href: '/dashboard/new-audit',
  },
  {
    name: 'Launch',
    price: '$19',
    period: '/month',
    description: 'Perfect for sellers just starting to scale.',
    highlight: false,
    badge: null,
    features: [
      '3 audits / month',
      '1 full listing upgrade',
      '5 image pack concepts',
      'Keyword tracking',
      'Priority support',
    ],
    excluded: [],
    cta: 'Start with Launch',
    ctaVariant: 'secondary' as const,
    href: '/dashboard/new-audit',
  },
  {
    name: 'Pro',
    price: '$39',
    period: '/month',
    description: 'The right fit for active sellers growing their catalog.',
    highlight: true,
    badge: 'Most Popular',
    features: [
      '7 audits / month',
      '3 full listing upgrades',
      '15 image pack concepts',
      'Advanced keyword tracking',
      'A+ Content strategy',
      'Review signal analysis',
      'Priority support',
    ],
    excluded: [],
    cta: 'Start with Pro',
    ctaVariant: 'primary' as const,
    href: '/dashboard/new-audit',
  },
  {
    name: 'Growth',
    price: '$59',
    period: '/month',
    description: 'For established sellers optimizing multiple products.',
    highlight: false,
    badge: null,
    features: [
      '10 audits / month',
      '5 full listing upgrades',
      '25 image pack concepts',
      'Competitor analysis',
      'A+ Content strategy',
      'Review signal analysis',
      'Advanced keyword tracking',
    ],
    excluded: [],
    cta: 'Start with Growth',
    ctaVariant: 'secondary' as const,
    href: '/dashboard/new-audit',
  },
  {
    name: 'Agency',
    price: '$149',
    period: '/month',
    description: 'For agencies managing multiple Amazon brands.',
    highlight: false,
    badge: null,
    features: [
      '25 audits / month',
      '15 full listing upgrades',
      '60 image pack concepts',
      '3 client brand workspaces',
      'Competitor analysis',
      'All Pro features included',
      'SLA + priority support',
      'API access (coming soon)',
    ],
    excluded: [],
    cta: 'Start with Agency',
    ctaVariant: 'secondary' as const,
    href: '/dashboard/new-audit',
  },
]

const addons = [
  { name: 'Extra Full Upgrade', price: '$19', desc: 'One additional complete listing upgrade, usable anytime.' },
  { name: 'Extra Audit Pack', price: '$9', desc: '5 additional audits added to your current billing cycle.' },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.07) 0%, transparent 60%)',
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

        <AnimatedSection delay={0.1}>
          <div className="pricing-grid mb-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl p-6 flex flex-col relative"
                style={plan.highlight ? {
                  background: 'rgba(14,165,233,0.06)',
                  border: '1.5px solid rgba(56,189,248,0.35)',
                  boxShadow: '0 0 60px rgba(14,165,233,0.12), 0 0 0 1px rgba(56,189,248,0.1)',
                } : {
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
                      color: 'white',
                    }}
                  >
                    <Zap size={10} fill="white" />
                    {plan.badge}
                  </div>
                )}

                <div className="mb-5">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: plan.highlight ? '#38bdf8' : '#64748b' }}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1.5 mb-2">
                    <span
                      className="text-4xl font-black leading-none"
                      style={{ color: '#f1f5f9', letterSpacing: '-0.04em' }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-sm pb-1" style={{ color: '#64748b' }}>{plan.period}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{plan.description}</p>
                </div>

                <div
                  className="h-px mb-5"
                  style={{ background: plan.highlight ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.06)' }}
                />

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0"
                        style={{ color: plan.highlight ? '#38bdf8' : '#4ade80' }}
                      />
                      <span className="text-sm" style={{ color: '#94a3b8' }}>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.href}
                  className={plan.ctaVariant === 'primary' ? 'btn-primary justify-center glow-button' : 'btn-secondary justify-center'}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div
            className="rounded-2xl p-6 mt-8"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-5 text-center" style={{ color: '#475569' }}>
              Add-ons — available on any paid plan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addons.map(addon => (
                <div
                  key={addon.name}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: '#f1f5f9' }}>{addon.name}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>{addon.desc}</p>
                  </div>
                  <span
                    className="text-xl font-black shrink-0"
                    style={{ color: '#38bdf8', letterSpacing: '-0.03em' }}
                  >
                    {addon.price}
                  </span>
                </div>
              ))}
            </div>
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
