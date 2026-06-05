import { Link } from 'react-router-dom'
import { Crown, Zap, ArrowRight } from 'lucide-react'

export default function BillingPage() {
  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
            fontWeight: 900,
            color: '#f1f5f9',
            letterSpacing: '-0.03em',
            margin: '0 0 0.375rem',
          }}
        >
          Billing
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Manage your plan and credits.
        </p>
      </div>

      <div
        style={{
          borderRadius: '0.875rem',
          padding: '1.5rem',
          background: 'rgba(163,230,53,0.04)',
          border: '1px solid rgba(163,230,53,0.16)',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Crown size={16} color="#a3e635" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Current plan
              </span>
            </div>
            <div className="gradient-text" style={{ fontSize: '1.375rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
              Free Trial
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Limited to 1 AI audit. No credit card required.
            </p>
          </div>
          <Link to="/pricing" className="btn-primary" style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
            Upgrade Plan
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div
        style={{
          borderRadius: '0.875rem',
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          marginBottom: '1.25rem',
        }}
      >
        <h2
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#64748b',
            margin: '0 0 1.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Credit balance
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            { icon: Zap, label: 'Full audit credits', value: '0', sub: 'Included with paid plans' },
            { icon: Crown, label: 'Free audit credits', value: '1', sub: 'Your included trial audit' },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                borderRadius: '0.625rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '0.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={14} color="#64748b" />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#334155' }}>{sub}</div>
                </div>
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#475569', letterSpacing: '-0.02em' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          borderRadius: '0.875rem',
          padding: '1.25rem 1.5rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.25rem' }}>
            Ready to unlock full access?
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
            Unlimited audits, premium image generation, and priority support.
          </div>
        </div>
        <Link to="/pricing" className="btn-secondary" style={{ flexShrink: 0 }}>
          View all plans
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
