import { ArrowLeft, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from '../ui/StatusBadge'
import type { AuditDetail, AuditResult } from '../../types/audit'

function sc(score: number) {
  return score >= 80 ? '#a3e635' : score >= 60 ? '#fbbf24' : '#f97316'
}

interface Props {
  audit: AuditDetail
  result: AuditResult | null
}

export default function ImageStudioHeader({ audit, result }: Props) {
  const color = result ? sc(result.score) : '#64748b'
  const r = 28
  const circumference = 2 * Math.PI * r

  return (
    <div style={{
      borderRadius: '1rem', padding: '1.5rem 1.75rem',
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
      marginBottom: '1.5rem', position: 'relative', overflow: 'hidden',
    }}>
      {result && (
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 180, height: 180,
          background: `radial-gradient(circle at top right, ${color}09, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.125rem', flexWrap: 'wrap' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
            fontSize: '0.8125rem', color: '#475569', textDecoration: 'none',
            padding: '0.3125rem 0.625rem', borderRadius: '0.375rem',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
        >
          <LayoutDashboard size={12} />
          Dashboard
        </Link>
        <span style={{ color: '#374151', fontSize: '0.75rem' }}>/</span>
        <Link
          to="/dashboard/audits"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
            fontSize: '0.8125rem', color: '#475569', textDecoration: 'none',
            padding: '0.3125rem 0.625rem', borderRadius: '0.375rem',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
        >
          Audits
        </Link>
        <span style={{ color: '#374151', fontSize: '0.75rem' }}>/</span>
        <Link
          to={`/dashboard/audits/${audit.id}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
            fontSize: '0.8125rem', color: '#475569', textDecoration: 'none',
            padding: '0.3125rem 0.625rem', borderRadius: '0.375rem',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
        >
          <ArrowLeft size={12} />
          Report
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', position: 'relative' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            fontSize: '0.5875rem', fontWeight: 700, color: 'rgba(52,211,153,0.7)',
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem',
          }}>
            Image Studio
          </div>
          <h1 style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.625rem)', fontWeight: 900,
            color: '#f1f5f9', letterSpacing: '-0.03em', margin: '0 0 0.25rem', lineHeight: 1.2,
          }}>
            {audit.product_name || 'Untitled Audit'}
          </h1>
          {audit.category && (
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
              {audit.category}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <StatusBadge status={audit.status} />
            {result && (
              <span style={{
                padding: '0.1875rem 0.5625rem', borderRadius: '99px',
                background: `${color}14`, border: `1px solid ${color}33`,
                fontSize: '0.6875rem', fontWeight: 700, color,
              }}>
                Score {result.score}
              </span>
            )}
          </div>
        </div>

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 72, height: 72 }}>
              <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={7} />
                <circle
                  cx={36} cy={36} r={r} fill="none"
                  stroke={color} strokeWidth={7}
                  strokeDasharray={`${(result.score / 100) * circumference} ${circumference}`}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {result.score}
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color, textAlign: 'center', maxWidth: 80 }}>
              {result.score_label}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
