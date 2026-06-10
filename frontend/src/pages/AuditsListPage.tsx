import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, FileText, ArrowRight } from 'lucide-react'
import { listAudits } from '../lib/auditsApi'
import StatusBadge from '../components/ui/StatusBadge'
import type { AuditListItem } from '../types/audit'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? '#2F9E6F' : score >= 60 ? '#fbbf24' : '#f97316'
  const bg = score >= 80 ? 'rgba(47,158,111,0.1)' : score >= 60 ? 'rgba(251,191,36,0.1)' : 'rgba(249,115,22,0.1)'
  const border = score >= 80 ? 'rgba(47,158,111,0.22)' : score >= 60 ? 'rgba(251,191,36,0.22)' : 'rgba(249,115,22,0.22)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
      padding: '0.25rem 0.625rem', borderRadius: '99px',
      fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '-0.01em',
      color, background: bg, border: `1px solid ${border}`, flexShrink: 0,
    }}>
      {score}<span style={{ fontSize: '0.625rem', fontWeight: 600, opacity: 0.6 }}>/100</span>
    </span>
  )
}

function AuditCard({ audit }: { audit: AuditListItem }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        borderRadius: '0.875rem',
        background: hovered ? 'rgba(83,58,253,0.025)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? 'rgba(83,58,253,0.14)' : 'rgba(255,255,255,0.07)'}`,
        transition: 'all 0.15s ease',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
          {audit.thumbnail ? (
            <img
              src={audit.thumbnail}
              alt={audit.product_name}
              style={{
                width: 44, height: 44, borderRadius: '0.5rem',
                objectFit: 'cover', flexShrink: 0,
                background: '#0a1510', border: '1px solid rgba(255,255,255,0.07)',
              }}
            />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: '0.5rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FileText size={18} color="#334155" />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3125rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                minWidth: 0,
              }}>
                {audit.product_name || 'Untitled Audit'}
              </span>
              <StatusBadge status={audit.status} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
              {audit.category && (
                <span style={{ fontSize: '0.8125rem', color: '#4b5563' }}>{audit.category}</span>
              )}
              {audit.category && <span style={{ fontSize: '0.75rem', color: '#334155' }}>·</span>}
              <span style={{ fontSize: '0.8125rem', color: '#4b5563' }}>
                {audit.entry_type === 'amazon_url' ? 'Amazon URL' : 'Product Photos'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#334155' }}>·</span>
              <span style={{ fontSize: '0.8125rem', color: '#4b5563' }}>{formatDate(audit.created_at)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
          {typeof audit.result_score === 'number' && (
            <ScorePill score={audit.result_score} />
          )}
          <Link
            to={`/dashboard/audits/${audit.id}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
              padding: '0.4375rem 0.875rem', borderRadius: '0.5rem',
              background: hovered ? 'rgba(83,58,253,0.08)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hovered ? 'rgba(83,58,253,0.16)' : 'rgba(255,255,255,0.08)'}`,
              color: hovered ? '#533AFD' : '#64748b',
              fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
          >
            Open Report
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
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
    <div style={{ maxWidth: 820 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
            fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.03em', margin: '0 0 0.375rem',
          }}>
            Your Audits
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            All audit sessions and AI analysis history.
          </p>
        </div>
        <Link to="/dashboard/new-audit" className="btn-primary glow-button" style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem' }}>
          <Zap size={14} />
          New Audit
        </Link>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0', fontSize: '0.875rem', color: '#475569' }}>
          Loading audits...
        </div>
      )}

      {error && (
        <div style={{
          padding: '0.875rem 1rem', borderRadius: '0.625rem',
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.16)',
          fontSize: '0.875rem', color: '#fca5a5',
        }}>
          {error}
        </div>
      )}

      {!loading && !error && audits.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem', borderRadius: '1rem',
          background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '0.875rem',
            background: 'rgba(83,58,253,0.06)', border: '1px solid rgba(83,58,253,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <FileText size={24} color="#533AFD" />
          </div>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#475569', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            No audits yet
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
            Create your first audit to start getting AI-powered<br />conversion insights for your Amazon listing.
          </p>
          <Link to="/dashboard/new-audit" className="btn-primary glow-button" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
            <Zap size={14} />
            Start your first audit
          </Link>
        </div>
      )}

      {!loading && !error && audits.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {audits.map(audit => (
            <AuditCard key={audit.id} audit={audit} />
          ))}
        </div>
      )}
    </div>
  )
}
