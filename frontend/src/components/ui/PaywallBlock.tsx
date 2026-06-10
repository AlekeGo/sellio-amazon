import { Crown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PaywallBlockProps {
  title?: string
  subtitle?: string
  creditsLine?: string
  primaryCta?: { label: string; to: string }
  secondaryCta?: { label: string; to: string }
}

export default function PaywallBlock({
  title = "You've used your free audit.",
  subtitle = 'Choose a plan to continue improving your Amazon listings with AI audits and premium image packs.',
  creditsLine,
  primaryCta = { label: 'View Plans', to: '/dashboard/billing' },
  secondaryCta = { label: 'Manage Billing', to: '/dashboard/billing' },
}: PaywallBlockProps) {
  return (
    <div
      style={{
        borderRadius: '0.875rem',
        padding: '1.75rem 1.5rem',
        background: 'rgba(163,230,53,0.03)',
        border: '1px solid rgba(163,230,53,0.18)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '0.75rem',
          background: 'rgba(163,230,53,0.06)',
          border: '1px solid rgba(163,230,53,0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
        }}
      >
        <Crown size={22} color="var(--dp-primary)" />
      </div>

      <h3
        style={{
          fontSize: '1.0625rem',
          fontWeight: 800,
          color: 'var(--dp-ink)',
          margin: '0 0 0.5rem',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: '#64748b',
          margin: creditsLine ? '0 0 0.625rem' : '0 0 1.25rem',
          lineHeight: 1.6,
          maxWidth: 380,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {subtitle}
      </p>

      {creditsLine && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: '#475569',
            margin: '0 0 1.25rem',
            fontWeight: 600,
          }}
        >
          {creditsLine}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Link
          to={primaryCta.to}
          className="btn-primary"
          style={{ fontSize: '0.875rem', padding: '0.625rem 1.25rem' }}
        >
          {primaryCta.label}
          <ArrowRight size={14} />
        </Link>
        <Link
          to={secondaryCta.to}
          className="btn-secondary"
          style={{ fontSize: '0.875rem', padding: '0.625rem 1.25rem' }}
        >
          {secondaryCta.label}
        </Link>
      </div>
    </div>
  )
}
