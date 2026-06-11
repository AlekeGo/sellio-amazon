import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { syncPolar } from '../lib/billingApi'
import type { SyncPolarResponse } from '../lib/billingApi'

export default function BillingSuccessPage() {
  const navigate = useNavigate()
  const [syncing, setSyncing] = useState(true)
  const [syncResult, setSyncResult] = useState<SyncPolarResponse | null>(null)

  useEffect(() => {
    syncPolar()
      .then((res) => setSyncResult(res.data))
      .catch(() => {
        // Webhook may have already processed — success page still shown
      })
      .finally(() => setSyncing(false))
  }, [])

  const planLabel = syncResult?.current_plan
    ? syncResult.current_plan.charAt(0).toUpperCase() + syncResult.current_plan.slice(1).replace(/_/g, ' ')
    : null

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
          background: 'rgba(22,163,74,0.08)',
          border: '1px solid rgba(22,163,74,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <CheckCircle2 size={26} color="#16a34a" />
        </div>

        <h1 style={{
          fontSize: '1.375rem',
          fontWeight: 900,
          color: 'var(--dp-ink, #0f172a)',
          letterSpacing: '-0.03em',
          margin: '0 0 0.625rem',
        }}>
          Payment successful.
        </h1>

        {syncing ? (
          <p style={{
            fontSize: '0.9375rem',
            color: 'var(--dp-ink-muted, #64748b)',
            lineHeight: 1.6,
            margin: '0 0 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}>
            <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
            Activating your plan…
          </p>
        ) : (
          <p style={{
            fontSize: '0.9375rem',
            color: 'var(--dp-ink-muted, #64748b)',
            lineHeight: 1.6,
            margin: '0 0 2rem',
          }}>
            {planLabel ? `${planLabel} plan is now active.` : 'Your plan is now active.'}
          </p>
        )}

        <button
          disabled={syncing}
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 2rem',
            borderRadius: '9999px',
            border: 'none',
            cursor: syncing ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '0.9375rem',
            fontFamily: 'inherit',
            color: '#ffffff',
            opacity: syncing ? 0.6 : 1,
            background: 'linear-gradient(135deg, #533AFD 0%, #7C3AED 100%)',
            boxShadow: '0 4px 20px rgba(83,58,253,0.30)',
            transition: 'opacity 0.15s',
          }}
        >
          Go to Dashboard
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
