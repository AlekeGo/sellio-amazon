import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, FileText } from 'lucide-react'
import { listAudits } from '../lib/auditsApi'
import StatusBadge from '../components/ui/StatusBadge'
import type { AuditListItem } from '../types/audit'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function AuditRow({ audit }: { audit: AuditListItem }) {
  return (
    <Link
      to={`/dashboard/audits/${audit.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.875rem 1.125rem',
        borderRadius: '0.75rem',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        textDecoration: 'none',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(163,230,53,0.18)'
        e.currentTarget.style.background = 'rgba(163,230,53,0.03)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
      }}
    >
      {audit.thumbnail ? (
        <img
          src={audit.thumbnail}
          alt={audit.product_name}
          style={{
            width: 44,
            height: 44,
            borderRadius: '0.5rem',
            objectFit: 'cover',
            flexShrink: 0,
            background: '#0a1510',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        />
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '0.5rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FileText size={18} color="#334155" />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            marginBottom: '0.25rem',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#f1f5f9',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 280,
            }}
          >
            {audit.product_name || 'Untitled Audit'}
          </span>
          <StatusBadge status={audit.status} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {audit.category && (
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>{audit.category}</span>
          )}
          {audit.category && (
            <span style={{ fontSize: '0.75rem', color: '#334155' }}>·</span>
          )}
          <span style={{ fontSize: '0.75rem', color: '#334155' }}>
            {audit.entry_type === 'amazon_url' ? 'Amazon URL' : 'Product Photos'}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#334155' }}>·</span>
          <span style={{ fontSize: '0.75rem', color: '#334155' }}>{formatDate(audit.created_at)}</span>
        </div>
      </div>

      <ArrowRight size={15} color="#334155" style={{ flexShrink: 0 }} />
    </Link>
  )
}

export default function AuditsListPage() {
  const [audits, setAudits] = useState<AuditListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listAudits()
      .then(res => setAudits(res.data))
      .catch(() => setError('Failed to load audits. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 700 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 900,
              color: '#f1f5f9',
              letterSpacing: '-0.03em',
              margin: '0 0 0.375rem',
            }}
          >
            Your Audits
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            All audit sessions and analysis history.
          </p>
        </div>
        <Link
          to="/dashboard/new-audit"
          className="btn-primary glow-button"
          style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem' }}
        >
          <Zap size={14} />
          New Audit
        </Link>
      </div>

      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 0',
            fontSize: '0.875rem',
            color: '#475569',
          }}
        >
          Loading audits...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '0.625rem',
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.16)',
            fontSize: '0.875rem',
            color: '#fca5a5',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && audits.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 2rem',
            borderRadius: '0.875rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '0.75rem',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <FileText size={22} color="#334155" />
          </div>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#475569',
              margin: '0 0 0.375rem',
              letterSpacing: '-0.02em',
            }}
          >
            No audits yet.
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0 0 1.5rem' }}>
            Start your first audit.
          </p>
          <Link
            to="/dashboard/new-audit"
            className="btn-primary glow-button"
            style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem' }}
          >
            <Zap size={14} />
            Start your first audit
          </Link>
        </div>
      )}

      {!loading && !error && audits.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {audits.map(audit => (
            <AuditRow key={audit.id} audit={audit} />
          ))}
        </div>
      )}
    </div>
  )
}
