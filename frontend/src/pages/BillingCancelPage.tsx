import { useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'

export default function BillingCancelPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--dp-surface, #f8f7ff)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        background: '#ffffff',
        borderRadius: '1.125rem',
        border: '1px solid rgba(196,188,255,0.45)',
        boxShadow: '0 8px 40px rgba(83,58,253,0.10)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <XCircle size={26} color="#f59e0b" />
        </div>

        <h1 style={{
          fontSize: '1.375rem',
          fontWeight: 900,
          color: 'var(--dp-ink, #0f172a)',
          letterSpacing: '-0.03em',
          margin: '0 0 0.625rem',
        }}>
          Payment canceled.
        </h1>

        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--dp-ink-muted, #64748b)',
          lineHeight: 1.6,
          margin: '0 0 2rem',
        }}>
          You can choose a plan anytime.
        </p>

        <button
          onClick={() => navigate('/pricing')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 2rem',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.9375rem',
            fontFamily: 'inherit',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #533AFD 0%, #7C3AED 100%)',
            boxShadow: '0 4px 20px rgba(83,58,253,0.30)',
          }}
        >
          Back to Pricing
        </button>
      </div>
    </div>
  )
}
