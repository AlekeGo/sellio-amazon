import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Zap, ExternalLink } from 'lucide-react'
import { getAudit } from '../lib/auditsApi'
import StatusBadge from '../components/ui/StatusBadge'
import type { AuditDetail } from '../types/audit'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value?.trim()) return null
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr',
        gap: '0.75rem',
        padding: '0.625rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          paddingTop: 2,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '0.875rem',
          color: '#cbd5e1',
          lineHeight: 1.6,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function DetailUrlRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value?.trim()) return null
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr',
        gap: '0.75rem',
        padding: '0.625rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          paddingTop: 2,
        }}
      >
        {label}
      </span>
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.8125rem',
          color: '#a3e635',
          textDecoration: 'none',
          wordBreak: 'break-all',
        }}
      >
        {value}
        <ExternalLink size={12} style={{ flexShrink: 0 }} />
      </a>
    </div>
  )
}

export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [audit, setAudit] = useState<AuditDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getAudit(Number(id))
      .then(res => setAudit(res.data))
      .catch(() => setError('Audit not found or you do not have access.'))
      .finally(() => setLoading(false))
  }, [id])

  const backLink = (
    <Link
      to="/dashboard/audits"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontSize: '0.875rem',
        color: '#64748b',
        textDecoration: 'none',
        marginBottom: '1.5rem',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
      onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
    >
      <ArrowLeft size={14} />
      All audits
    </Link>
  )

  if (loading) {
    return (
      <div style={{ maxWidth: 700 }}>
        {backLink}
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 0',
            fontSize: '0.875rem',
            color: '#475569',
          }}
        >
          Loading audit...
        </div>
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div style={{ maxWidth: 700 }}>
        {backLink}
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
          {error ?? 'Audit not found.'}
        </div>
      </div>
    )
  }

  const hasListingContent =
    audit.current_title ||
    audit.bullet_points ||
    audit.description ||
    audit.main_benefit ||
    audit.target_audience ||
    audit.seller_goal ||
    audit.notes

  return (
    <div style={{ maxWidth: 700 }}>
      {backLink}

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.625rem',
            flexWrap: 'wrap',
          }}
        >
          <StatusBadge status={audit.status} />
          <span style={{ fontSize: '0.75rem', color: '#475569' }}>
            {audit.entry_type === 'amazon_url' ? 'Amazon URL' : 'Product Photos'}
            {' · '}
            {formatDate(audit.created_at)}
          </span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.625rem)',
            fontWeight: 900,
            color: '#f1f5f9',
            letterSpacing: '-0.03em',
            margin: 0,
          }}
        >
          {audit.product_name || 'Untitled Audit'}
        </h1>
        {audit.category && (
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.375rem 0 0' }}>
            {audit.category}
          </p>
        )}
      </div>

      {/* Pending notice */}
      {audit.status !== 'completed' && audit.status !== 'failed' && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '0.75rem',
            background: 'rgba(163,230,53,0.04)',
            border: '1px solid rgba(163,230,53,0.12)',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#a3e635',
              marginBottom: '0.25rem',
            }}
          >
            Awaiting AI analysis
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6 }}>
            AI analysis will be connected next. Your audit input is saved and ready for analysis.
          </div>
        </div>
      )}

      {/* Images */}
      {audit.images.length > 0 && (
        <div
          style={{
            borderRadius: '0.875rem',
            padding: '1.25rem',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            marginBottom: '1rem',
          }}
        >
          <h3
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#64748b',
              margin: '0 0 0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Product Images ({audit.images.length})
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {audit.images.map(img => (
              <div
                key={img.id}
                style={{
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  aspectRatio: '1',
                  background: '#0a1510',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <img
                  src={img.image}
                  alt={img.original_filename}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listing details */}
      <div
        style={{
          borderRadius: '0.875rem',
          padding: '1.25rem 1.5rem',
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          marginBottom: '1.75rem',
        }}
      >
        <h3
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#64748b',
            margin: '0 0 0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Listing Details
        </h3>

        {audit.entry_type === 'amazon_url' && (
          <DetailUrlRow label="Amazon URL" value={audit.amazon_url} />
        )}
        <DetailRow label="Product Name" value={audit.product_name} />
        <DetailRow label="Category" value={audit.category} />

        {(audit.price || audit.rating || audit.review_count) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr',
              gap: '0.75rem',
              padding: '0.625rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingTop: 2,
              }}
            >
              Metrics
            </span>
            <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
              {[
                audit.price && `$${audit.price}`,
                audit.rating && `${audit.rating} ★`,
                audit.review_count && `${audit.review_count} reviews`,
              ]
                .filter(Boolean)
                .join('  ·  ')}
            </span>
          </div>
        )}

        {hasListingContent && (
          <>
            <DetailRow label="Current Title" value={audit.current_title} />
            <DetailRow label="Bullet Points" value={audit.bullet_points} />
            <DetailRow label="Description" value={audit.description} />
            <DetailRow label="Main Benefit" value={audit.main_benefit} />
            <DetailRow label="Target Audience" value={audit.target_audience} />
            <DetailRow label="Seller Goal" value={audit.seller_goal} />
            <DetailRow label="Notes" value={audit.notes} />
          </>
        )}

        {!hasListingContent && !audit.amazon_url && !audit.product_name && (
          <p
            style={{
              fontSize: '0.875rem',
              color: '#334155',
              margin: '0.75rem 0 0',
              fontStyle: 'italic',
            }}
          >
            No listing details provided.
          </p>
        )}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link
          to="/dashboard"
          className="btn-secondary"
          style={{ padding: '0.6875rem 1.25rem', fontSize: '0.875rem' }}
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
        <Link
          to="/dashboard/new-audit"
          className="btn-primary glow-button"
          style={{ padding: '0.6875rem 1.25rem', fontSize: '0.875rem' }}
        >
          <Zap size={14} />
          Create Another Audit
        </Link>
      </div>
    </div>
  )
}
