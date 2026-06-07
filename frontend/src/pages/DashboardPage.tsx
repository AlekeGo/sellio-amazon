import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, Crown, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { listAudits } from '../lib/auditsApi'
import StatusBadge from '../components/ui/StatusBadge'
import type { AuditListItem } from '../types/audit'

function ChecklistStep({ num, text }: { num: number; text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#64748b',
          marginTop: 1,
        }}
      >
        {num}
      </div>
      <span style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>{text}</span>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function RecentAuditItem({ audit }: { audit: AuditListItem }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.625rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      {audit.thumbnail ? (
        <img
          src={audit.thumbnail}
          alt={audit.product_name}
          style={{ width: 32, height: 32, borderRadius: '0.375rem', objectFit: 'cover', flexShrink: 0, background: '#0a1510' }}
        />
      ) : (
        <div style={{
          width: 32, height: 32, borderRadius: '0.375rem',
          background: 'rgba(255,255,255,0.04)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <FileText size={14} color="#334155" />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
          {audit.product_name || 'Untitled Audit'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6875rem', color: '#475569' }}>
            {audit.category || (audit.entry_type === 'amazon_url' ? 'Amazon URL' : 'Product Photos')}
            {' · '}
            {formatDate(audit.created_at)}
          </span>
          <StatusBadge status={audit.status} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {typeof audit.result_score === 'number' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.125rem 0.4375rem', borderRadius: '99px',
            fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '-0.01em',
            color: audit.result_score >= 80 ? '#a3e635' : audit.result_score >= 60 ? '#fbbf24' : '#f97316',
            background: audit.result_score >= 80 ? 'rgba(163,230,53,0.1)' : audit.result_score >= 60 ? 'rgba(251,191,36,0.1)' : 'rgba(249,115,22,0.1)',
            border: `1px solid ${audit.result_score >= 80 ? 'rgba(163,230,53,0.2)' : audit.result_score >= 60 ? 'rgba(251,191,36,0.2)' : 'rgba(249,115,22,0.2)'}`,
          }}>
            {audit.result_score}
          </span>
        )}
        <Link
          to={`/dashboard/audits/${audit.id}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            fontSize: '0.75rem', fontWeight: 600, color: '#a3e635',
            textDecoration: 'none', transition: 'opacity 0.15s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Open Report
          <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [audits, setAudits] = useState<AuditListItem[]>([])
  const [auditsLoading, setAuditsLoading] = useState(true)
  const [auditsError, setAuditsError] = useState(false)

  const firstName =
    user?.full_name?.trim().split(' ')[0] || user?.email?.split('@')[0] || 'there'

  useEffect(() => {
    listAudits()
      .then(res => setAudits(res.data.slice(0, 5)))
      .catch(() => setAuditsError(true))
      .finally(() => setAuditsLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: 'clamp(1.375rem, 3vw, 1.75rem)',
            fontWeight: 900,
            color: '#f1f5f9',
            letterSpacing: '-0.03em',
            margin: '0 0 0.375rem',
          }}
        >
          Welcome back, {firstName}
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748b', margin: 0 }}>
          Your AI-powered Amazon conversion studio is ready.
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            borderRadius: '0.75rem',
            padding: '1.125rem 1.25rem',
            background: 'rgba(163,230,53,0.06)',
            border: '1px solid rgba(163,230,53,0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Crown size={14} color="#a3e635" />
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Current plan</span>
          </div>
          <div className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Free Trial
          </div>
          <div style={{ fontSize: '0.75rem', color: '#475569' }}>Limited access</div>
        </div>

        <div
          style={{
            borderRadius: '0.75rem',
            padding: '1.125rem 1.25rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <FileText size={14} color="#64748b" />
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Audit credits</span>
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#f1f5f9',
              marginBottom: '0.25rem',
            }}
          >
            1
          </div>
          <div style={{ fontSize: '0.75rem', color: '#475569' }}>limited free audit</div>
        </div>

        <div
          style={{
            borderRadius: '0.75rem',
            padding: '1.125rem 1.25rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <Zap size={14} color="#64748b" />
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Image credits</span>
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#475569',
              marginBottom: '0.25rem',
            }}
          >
            0
          </div>
          <div style={{ fontSize: '0.75rem', color: '#334155' }}>upgrade to generate</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        <Link to="/dashboard/new-audit" className="btn-primary glow-button">
          <Zap size={15} />
          Create New Audit
        </Link>
        <Link to="/pricing" className="btn-secondary">
          View Pricing
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="dashboard-bottom-grid">
        <div
          style={{
            borderRadius: '0.875rem',
            padding: '1.25rem 1.5rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <h3
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#64748b',
              margin: '0 0 0.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Getting started
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '0 0 1rem' }}>
            Three steps to better Amazon conversions
          </p>
          <div>
            <ChecklistStep num={1} text="Start with Amazon URL or product photos" />
            <ChecklistStep num={2} text="Review your AI-powered audit report" />
            <ChecklistStep num={3} text="Generate premium Amazon-ready visuals" />
          </div>
        </div>

        <div
          style={{
            borderRadius: '0.875rem',
            padding: '1.25rem 1.5rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.875rem',
            }}
          >
            <h3
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Recent audits
            </h3>
            {audits.length > 0 && (
              <Link
                to="/dashboard/audits"
                style={{
                  fontSize: '0.75rem',
                  color: '#a3e635',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                View all
              </Link>
            )}
          </div>

          {auditsLoading && (
            <p style={{ fontSize: '0.8125rem', color: '#334155', margin: 0 }}>Loading...</p>
          )}

          {!auditsLoading && auditsError && (
            <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0 }}>
              Could not load recent audits.
            </p>
          )}

          {!auditsLoading && !auditsError && audits.length > 0 && (
            <div>
              {audits.map(audit => (
                <RecentAuditItem key={audit.id} audit={audit} />
              ))}
            </div>
          )}

          {!auditsLoading && !auditsError && audits.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '2rem 1rem', borderRadius: '0.75rem',
              background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '0.625rem',
                background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.875rem',
              }}>
                <Zap size={18} color="#a3e635" />
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.25rem', fontWeight: 600 }}>
                No audits yet
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '0 0 1.25rem' }}>
                Run your first AI audit to get started.
              </p>
              <Link
                to="/dashboard/new-audit"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  fontSize: '0.8125rem', color: '#a3e635', textDecoration: 'none', fontWeight: 600,
                }}
              >
                <Zap size={13} />
                Create first audit
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
