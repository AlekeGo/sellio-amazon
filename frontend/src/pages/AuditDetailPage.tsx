import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Zap, ExternalLink, Copy, Check,
  RefreshCw, AlertTriangle, Layers,
  Eye, Shield, Target, TrendingUp,
} from 'lucide-react'
import { getAudit, submitAudit, regenerateAudit } from '../lib/auditsApi'
import StatusBadge from '../components/ui/StatusBadge'
import type { AuditDetail, AuditResult } from '../types/audit'

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response: { data: Record<string, unknown> } }).response?.data
    if (typeof data?.detail === 'string') return data.detail
  }
  return 'Something went wrong. Please try again.'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function sc(score: number) {
  return score >= 80 ? '#a3e635' : score >= 60 ? '#fbbf24' : '#f97316'
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }
  return (
    <button
      type="button"
      onClick={handle}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
        padding: '0.3125rem 0.625rem', borderRadius: '0.375rem',
        background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${copied ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`,
        color: copied ? '#4ade80' : '#64748b',
        fontSize: '0.6875rem', fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : label}
    </button>
  )
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = size * 0.4
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circumference
  const color = sc(score)
  const sw = size >= 140 ? 11 : 9
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={sw}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontSize: size >= 140 ? '2.25rem' : '1.875rem',
          fontWeight: 900, color, letterSpacing: '-0.04em', lineHeight: 1,
        }}>
          {score}
        </span>
        <span style={{ fontSize: '0.5625rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          / 100
        </span>
      </div>
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: '0.875rem', padding: '1.375rem 1.5rem',
      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SL({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5625rem', marginBottom: '1.125rem' }}>
      <div style={{
        width: 3, height: 14, borderRadius: 2,
        background: 'linear-gradient(180deg, #a3e635, #34d399)', flexShrink: 0,
      }} />
      <span style={{
        fontSize: '0.6875rem', fontWeight: 700, color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {children}
      </span>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = (priority ?? '').toLowerCase()
  const c =
    p === 'high'
      ? { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' }
      : p === 'medium'
      ? { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' }
      : { color: '#64748b', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.18)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.1875rem 0.5rem', borderRadius: '99px',
      fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.05em',
      textTransform: 'uppercase', color: c.color,
      background: c.bg, border: `1px solid ${c.border}`, flexShrink: 0,
    }}>
      {priority}
    </span>
  )
}

const DIAG = [
  { key: 'attention' as const, label: 'Attention', Icon: Eye, color: '#f97316', bg: 'rgba(249,115,22,0.04)', border: 'rgba(249,115,22,0.11)' },
  { key: 'trust' as const, label: 'Trust', Icon: Shield, color: '#34d399', bg: 'rgba(52,211,153,0.04)', border: 'rgba(52,211,153,0.11)' },
  { key: 'clarity' as const, label: 'Clarity', Icon: Target, color: '#60a5fa', bg: 'rgba(96,165,250,0.04)', border: 'rgba(96,165,250,0.11)' },
  { key: 'conversion' as const, label: 'Conversion', Icon: TrendingUp, color: '#a3e635', bg: 'rgba(163,230,53,0.04)', border: 'rgba(163,230,53,0.11)' },
]

function ReportHeader({ audit, result }: { audit: AuditDetail; result: AuditResult }) {
  const color = sc(result.score)
  return (
    <div style={{
      borderRadius: '1rem', padding: '1.75rem 2rem',
      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)',
      marginBottom: '1.5rem', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 220, height: 220,
        background: `radial-gradient(circle at top right, ${color}09, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap', position: 'relative' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            fontSize: '0.5875rem', fontWeight: 700, color: 'rgba(52,211,153,0.55)',
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.875rem',
          }}>
            Sellio AI Audit Report
          </div>
          <h1 style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.03em',
            margin: '0 0 0.4375rem', lineHeight: 1.2,
          }}>
            {audit.product_name || 'Untitled Audit'}
          </h1>
          {audit.category && (
            <p style={{ fontSize: '0.9375rem', color: '#64748b', margin: '0 0 0.875rem', lineHeight: 1.4 }}>
              {audit.category}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <StatusBadge status={audit.status} />
            <span style={{
              padding: '0.1875rem 0.5625rem', borderRadius: '99px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              fontSize: '0.6875rem', fontWeight: 600, color: '#64748b',
            }}>
              {audit.entry_type === 'amazon_url' ? 'Amazon URL' : 'Product Photos'}
            </span>
            <span style={{ fontSize: '0.6875rem', color: '#334155' }}>
              {formatDate(audit.created_at)}
            </span>
          </div>
          {audit.amazon_url && (
            <a
              href={audit.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
                fontSize: '0.8125rem', color: '#475569', textDecoration: 'none',
                marginBottom: '1.375rem', transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#a3e635')}
              onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
            >
              <ExternalLink size={12} />
              View on Amazon
            </a>
          )}
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              to="/dashboard/audits"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 1rem', borderRadius: '0.5rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                color: '#64748b', fontSize: '0.8125rem', fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
            >
              <ArrowLeft size={13} />
              All Audits
            </Link>
            <Link
              to="/dashboard/image-studio"
              className="btn-primary glow-button"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
            >
              <Layers size={13} />
              Generate Image Pack
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
          <ScoreRing score={result.score} size={140} />
          <div style={{
            fontSize: '0.9375rem', fontWeight: 700, color,
            textAlign: 'center', letterSpacing: '-0.02em', maxWidth: 140,
          }}>
            {result.score_label}
          </div>
        </div>
      </div>
    </div>
  )
}

function AuditReport({
  result, audit, onRegenerate, regenerating, regenError,
}: {
  result: AuditResult
  audit: AuditDetail
  onRegenerate: () => void
  regenerating: boolean
  regenError: string | null
}) {
  const color = sc(result.score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Score */}
      <Card>
        <SL>Sellio Score</SL>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4375rem', marginBottom: '0.4375rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.75rem', fontWeight: 900, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {result.score}
            </span>
            <span style={{ fontSize: '0.9375rem', color: '#475569', fontWeight: 600 }}>/100</span>
            <span style={{ fontSize: '1.0625rem', fontWeight: 700, color, marginLeft: '0.25rem', letterSpacing: '-0.02em' }}>
              — {result.score_label}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.875rem', lineHeight: 1.65 }}>
            {result.score >= 80
              ? 'Your listing is performing well — copy, trust signals, and conversion are in strong shape.'
              : result.score >= 60
              ? 'Your listing has clear opportunities. A focused optimization pass can meaningfully lift conversion.'
              : 'Your listing needs significant work to compete on Amazon. The report below shows exactly where to focus.'}
          </p>
          <div className="score-bar-track" style={{ maxWidth: 340, marginBottom: '0.875rem' }}>
            <div className="score-bar-fill" style={{ width: `${result.score}%` }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {audit.submitted_at && (
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                Analyzed {formatDate(audit.submitted_at)}
              </span>
            )}
            <button
              type="button"
              disabled={regenerating}
              onClick={onRegenerate}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.3125rem 0.6875rem', borderRadius: '0.375rem',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#64748b', fontSize: '0.75rem', fontWeight: 600,
                cursor: regenerating ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: regenerating ? 0.6 : 1, transition: 'all 0.15s',
              }}
            >
              <RefreshCw size={12} style={{ animation: regenerating ? 'spin 1s linear infinite' : 'none' }} />
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
          {regenError && (
            <div style={{
              marginTop: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.16)',
              fontSize: '0.8125rem', color: '#fca5a5',
            }}>
              {regenError}
            </div>
          )}
        </div>

        {result.conversion_diagnosis && (
          <div style={{
            marginTop: '1.25rem', paddingTop: '1.125rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '0.625rem',
          }}>
            {DIAG.map(d => (
              <div key={d.key} style={{
                padding: '0.875rem 1rem', borderRadius: '0.625rem',
                background: d.bg, border: `1px solid ${d.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.4375rem' }}>
                  <d.Icon size={12} color={d.color} strokeWidth={2.5} />
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: d.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {d.label}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.55 }}>
                  {result.conversion_diagnosis[d.key]}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Executive Summary */}
      {result.executive_summary && (
        <Card>
          <SL>Executive Summary</SL>
          <p style={{ fontSize: '0.9375rem', color: '#cbd5e1', lineHeight: 1.85, margin: 0, wordBreak: 'break-word' }}>
            {result.executive_summary}
          </p>
        </Card>
      )}

      {/* Weak Points */}
      {Array.isArray(result.weak_points) && result.weak_points.length > 0 && (
        <Card>
          <SL>Weak Points — {result.weak_points.length} issues found</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.weak_points.map((wp, i) => (
              <div key={i} style={{
                borderRadius: '0.625rem', background: 'rgba(248,113,113,0.04)',
                border: '1px solid rgba(248,113,113,0.1)', overflow: 'hidden',
              }}>
                <div style={{
                  padding: '0.5rem 1rem', background: 'rgba(248,113,113,0.06)',
                  borderBottom: '1px solid rgba(248,113,113,0.08)',
                }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {wp.area}
                  </span>
                </div>
                <div style={{ padding: '0.875rem 1rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#f1f5f9', fontWeight: 600, margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                    {wp.issue}
                  </p>
                  {wp.impact && (
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 0.4375rem', lineHeight: 1.5 }}>
                      <span style={{ color: '#fbbf24', fontWeight: 600 }}>Why it hurts: </span>{wp.impact}
                    </p>
                  )}
                  {wp.fix && (
                    <p style={{ fontSize: '0.8125rem', color: '#a3e635', margin: 0, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 600 }}>Fix: </span>{wp.fix}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Copy Upgrade */}
      {(result.improved_title || (Array.isArray(result.improved_bullets) && result.improved_bullets.length > 0) || result.improved_description) && (
        <Card>
          <SL>Copy Upgrade</SL>

          {result.improved_title && (
            <div style={{ marginBottom: '1.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#94a3b8' }}>Improved Title</span>
                <CopyButton text={result.improved_title} label="Copy Title" />
              </div>
              <div style={{ padding: '1rem 1.125rem', borderRadius: '0.625rem', background: 'rgba(163,230,53,0.04)', border: '1px solid rgba(163,230,53,0.12)' }}>
                <p style={{ fontSize: '0.9375rem', color: '#f1f5f9', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
                  {result.improved_title}
                </p>
              </div>
              {result.title_analysis?.strategy && (
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.5rem 0 0', lineHeight: 1.55 }}>
                  {result.title_analysis.strategy}
                </p>
              )}
            </div>
          )}

          {Array.isArray(result.improved_bullets) && result.improved_bullets.length > 0 && (
            <div style={{ marginBottom: '1.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#94a3b8' }}>Improved Bullet Points</span>
                <CopyButton text={result.improved_bullets.join('\n')} label="Copy All" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4375rem' }}>
                {result.improved_bullets.map((bullet, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.75rem 0.875rem', borderRadius: '0.5rem',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.2)',
                      color: '#a3e635', fontSize: '0.6875rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1,
                    }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0, flex: 1 }}>
                      {bullet}
                    </p>
                    <CopyButton text={bullet} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.improved_description && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#94a3b8' }}>Improved Description</span>
                <CopyButton text={result.improved_description} label="Copy Description" />
              </div>
              <div style={{ padding: '1rem 1.125rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {result.improved_description}
                </p>
              </div>
              {result.description_analysis?.improvement_strategy && (
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.5rem 0 0', lineHeight: 1.55 }}>
                  {result.description_analysis.improvement_strategy}
                </p>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Keyword Opportunities */}
      {Array.isArray(result.keyword_opportunities) && result.keyword_opportunities.length > 0 && (
        <Card>
          <SL>Keyword Opportunities — {result.keyword_opportunities.length} keywords</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.keyword_opportunities.map((kw, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{
                  padding: '0.25rem 0.75rem', borderRadius: '99px',
                  background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.18)',
                  color: '#a3e635', fontSize: '0.8125rem', fontWeight: 700,
                  flexShrink: 0, whiteSpace: 'nowrap',
                }}>
                  {kw.keyword}
                </span>
                <span style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.55, paddingTop: 3 }}>
                  {kw.reason}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Review Insights */}
      {Array.isArray(result.review_insights) && result.review_insights.length > 0 && (
        <Card>
          <SL>Review Insights — what customers are signaling</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.review_insights.map((ri, i) => (
              <div key={i} style={{
                padding: '1rem', borderRadius: '0.625rem',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 0.4375rem', lineHeight: 1.45 }}>
                  {ri.signal}
                </p>
                {ri.what_it_means && (
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 0.375rem', lineHeight: 1.55 }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>What it means: </span>{ri.what_it_means}
                  </p>
                )}
                {ri.listing_fix && (
                  <p style={{ fontSize: '0.8125rem', color: '#a3e635', margin: 0, lineHeight: 1.55 }}>
                    <span style={{ fontWeight: 600 }}>Listing fix: </span>{ri.listing_fix}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Buyer Objections */}
      {Array.isArray(result.buyer_objections) && result.buyer_objections.length > 0 && (
        <Card>
          <SL>Buyer Objections — how to address hesitations</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {result.buyer_objections.map((bo, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.875rem 1.5rem', padding: '1rem', borderRadius: '0.625rem',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div>
                  <div style={{ fontSize: '0.5875rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3125rem' }}>
                    Objection
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: 0, lineHeight: 1.55 }}>{bo.objection}</p>
                </div>
                <div>
                  <div style={{ fontSize: '0.5875rem', fontWeight: 700, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3125rem' }}>
                    How to Address
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: 0, lineHeight: 1.55 }}>{bo.how_to_address}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Image Pack Plan */}
      {Array.isArray(result.image_pack_plan) && result.image_pack_plan.length > 0 && (
        <Card style={{ borderColor: 'rgba(52,211,153,0.15)', background: 'rgba(52,211,153,0.018)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5625rem', marginBottom: '0.3125rem' }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg, #a3e635, #34d399)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Image Pack Plan — {result.image_pack_plan.length} images
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '0 0 0.875rem', lineHeight: 1.5 }}>
                AI-generated creative briefs. Hand these directly to a designer or use Sellio Image Studio.
              </p>
            </div>
            <Link
              to="/dashboard/image-studio"
              className="btn-primary glow-button"
              style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem', flexShrink: 0 }}
            >
              <Layers size={13} />
              Generate in Image Studio
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {result.image_pack_plan.map((img, i) => (
              <div key={i} style={{
                borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(52,211,153,0.12)', overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1.125rem', background: 'rgba(52,211,153,0.05)',
                  borderBottom: '1px solid rgba(52,211,153,0.09)',
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.28)',
                    color: '#34d399', fontSize: '0.6875rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                    {img.image_type}
                  </span>
                </div>
                <div style={{
                  padding: '1rem 1.125rem',
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '1rem 1.5rem',
                }}>
                  {img.goal && (
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem', opacity: 0.7 }}>Goal</div>
                      <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{img.goal}</p>
                    </div>
                  )}
                  {img.headline && (
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem', opacity: 0.7 }}>Headline</div>
                      <p style={{ fontSize: '0.9375rem', color: '#a3e635', margin: 0, lineHeight: 1.5, fontWeight: 700, letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
                        "{img.headline}"
                      </p>
                    </div>
                  )}
                  {img.visual_direction && (
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem', opacity: 0.7 }}>Visual Direction</div>
                      <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{img.visual_direction}</p>
                    </div>
                  )}
                  {Array.isArray(img.text_elements) && img.text_elements.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem', opacity: 0.7 }}>Text on Image</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3125rem' }}>
                        {img.text_elements.map((el, j) => (
                          <span key={j} style={{
                            padding: '0.25rem 0.5625rem', borderRadius: '0.3125rem',
                            background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.14)',
                            fontSize: '0.75rem', color: '#6b7280',
                          }}>{el}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* A+ Content Ideas */}
      {Array.isArray(result.a_plus_content_ideas) && result.a_plus_content_ideas.length > 0 && (
        <Card>
          <SL>A+ Content Ideas — {result.a_plus_content_ideas.length} modules</SL>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {result.a_plus_content_ideas.map((idea, i) => (
              <div key={i} style={{
                padding: '1rem', borderRadius: '0.625rem',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: '0.5875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>
                  {idea.section}
                </div>
                {idea.purpose && (
                  <p style={{ fontSize: '0.75rem', color: '#a3e635', margin: '0 0 0.5rem', fontWeight: 600 }}>
                    {idea.purpose}
                  </p>
                )}
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0, lineHeight: 1.55 }}>
                  {idea.content_idea}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Priority Checklist */}
      {Array.isArray(result.priority_checklist) && result.priority_checklist.length > 0 && (
        <Card>
          <SL>Priority Checklist — your action plan</SL>
          <div>
            {result.priority_checklist.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.875rem 0',
                borderBottom: i < result.priority_checklist.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                  color: '#475569', fontSize: '0.625rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', margin: 0, lineHeight: 1.45, wordBreak: 'break-word' }}>
                      {item.task}
                    </p>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  {item.reason && (
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
                      {item.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Image Studio CTA */}
      <div style={{
        borderRadius: '0.875rem', padding: '1.5rem 1.75rem',
        background: 'linear-gradient(135deg, rgba(163,230,53,0.06), rgba(52,211,153,0.04))',
        border: '1px solid rgba(163,230,53,0.15)',
        display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '0.875rem',
          background: 'linear-gradient(135deg, #166534, #4ade80)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Layers size={24} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9', margin: '0 0 0.3125rem', letterSpacing: '-0.025em' }}>
            Ready to build your Image Pack?
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Turn your audit insights into premium Amazon-ready visuals with Sellio Image Studio.
          </p>
        </div>
        <Link to="/dashboard/image-studio" className="btn-primary glow-button" style={{ padding: '0.6875rem 1.25rem', fontSize: '0.875rem' }}>
          <Zap size={14} />
          Open Image Studio
        </Link>
      </div>

    </div>
  )
}

export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [audit, setAudit] = useState<AuditDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [regenError, setRegenError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    getAudit(Number(id))
      .then(res => setAudit(res.data))
      .catch(() => setError('Audit not found or you do not have access.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || !audit || audit.status !== 'pending_analysis') return
    const timer = setInterval(() => {
      getAudit(Number(id))
        .then(res => setAudit(res.data))
        .catch(() => {})
    }, 3000)
    return () => clearInterval(timer)
  }, [id, audit?.status])

  const handleRegenerate = async () => {
    if (!audit || regenerating) return
    setRegenerating(true)
    setRegenError(null)
    try {
      const { data } = await regenerateAudit(audit.id)
      setAudit(data)
    } catch (err) {
      setRegenError(extractError(err))
    } finally {
      setRegenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!audit || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const { data } = await submitAudit(audit.id)
      setAudit(data)
    } catch (err) {
      setSubmitError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const backLink = (
    <Link
      to="/dashboard/audits"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        fontSize: '0.875rem', color: '#64748b', textDecoration: 'none',
        marginBottom: '1.5rem', transition: 'color 0.15s',
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
        <div style={{ textAlign: 'center', padding: '3rem 0', fontSize: '0.875rem', color: '#475569' }}>
          Loading audit...
        </div>
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div style={{ maxWidth: 700 }}>
        {backLink}
        <div style={{
          padding: '0.875rem 1rem', borderRadius: '0.625rem',
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.16)',
          fontSize: '0.875rem', color: '#fca5a5',
        }}>
          {error ?? 'Audit not found.'}
        </div>
      </div>
    )
  }

  const isCompleted = audit.status === 'completed' && !!audit.result
  const maxWidth = isCompleted ? 900 : 700

  return (
    <div style={{ maxWidth }}>

      {!isCompleted && backLink}

      {/* Minimal header for non-completed states */}
      {!isCompleted && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
            <StatusBadge status={audit.status} />
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>
              {audit.entry_type === 'amazon_url' ? 'Amazon URL' : 'Product Photos'}
              {' · '}
              {formatDate(audit.created_at)}
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.625rem)',
            fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.03em', margin: 0,
          }}>
            {audit.product_name || 'Untitled Audit'}
          </h1>
          {audit.category && (
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.375rem 0 0' }}>{audit.category}</p>
          )}
          {audit.amazon_url && (
            <a
              href={audit.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
                fontSize: '0.8125rem', color: '#475569', textDecoration: 'none',
                marginTop: '0.375rem', transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#a3e635')}
              onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
            >
              <ExternalLink size={12} />
              View on Amazon
            </a>
          )}
        </div>
      )}

      {/* Premium report header for completed */}
      {isCompleted && audit.result && (
        <ReportHeader audit={audit} result={audit.result} />
      )}

      {/* Pending */}
      {audit.status === 'pending_analysis' && (
        <div style={{
          borderRadius: '0.875rem', padding: '3rem 2rem',
          background: 'rgba(163,230,53,0.03)', border: '1px solid rgba(163,230,53,0.1)',
          textAlign: 'center', marginBottom: '1.5rem',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            border: '3px solid rgba(163,230,53,0.15)',
            borderTop: '3px solid #a3e635',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem',
          }} />
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 0.625rem', letterSpacing: '-0.02em' }}>
            Analyzing your Amazon listing...
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, lineHeight: 1.7 }}>
            Reviewing copy, buyer signals, SEO gaps, and visual opportunities.
            <br />
            This page will update automatically.
          </p>
        </div>
      )}

      {/* Failed */}
      {audit.status === 'failed' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            padding: '1.25rem 1.375rem', borderRadius: '0.875rem',
            background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f87171', marginBottom: '0.25rem' }}>
                  Analysis could not be completed.
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Gemini is temporarily busy or encountered an error. Please try again in a moment.
                </p>
              </div>
            </div>
          </div>
          {submitError && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '0.625rem',
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.16)',
              fontSize: '0.8125rem', color: '#fca5a5', marginBottom: '1rem',
            }}>
              {submitError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary glow-button"
              style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem', opacity: submitting ? 0.7 : 1 }}
            >
              <RefreshCw size={14} style={{ animation: submitting ? 'spin 1s linear infinite' : 'none' }} />
              {submitting ? 'Analyzing...' : 'Try Again'}
            </button>
            <Link to="/dashboard/new-audit" className="btn-secondary" style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem' }}>
              New Audit
            </Link>
          </div>
        </div>
      )}

      {/* Draft / ready */}
      {(audit.status === 'draft' || audit.status === 'ready_for_analysis') && (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: '0.75rem',
          background: 'rgba(163,230,53,0.04)', border: '1px solid rgba(163,230,53,0.12)',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#a3e635', marginBottom: '0.25rem' }}>
            Ready for analysis
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 0.875rem' }}>
            Your listing details are saved. Run the AI audit to get your full report.
          </p>
          {submitError && (
            <div style={{
              padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.16)',
              fontSize: '0.8125rem', color: '#fca5a5', marginBottom: '0.75rem',
            }}>
              {submitError}
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary glow-button"
            style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? (
              <>
                <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Generating AI audit...
              </>
            ) : (
              <>
                <Zap size={14} />
                Analyze Listing
              </>
            )}
          </button>
        </div>
      )}

      {/* Full report */}
      {isCompleted && audit.result && (
        <AuditReport
          result={audit.result}
          audit={audit}
          onRegenerate={handleRegenerate}
          regenerating={regenerating}
          regenError={regenError}
        />
      )}

      {/* Completed but no result */}
      {audit.status === 'completed' && !audit.result && (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: '0.75rem',
          background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)',
          fontSize: '0.875rem', color: '#fbbf24',
          display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
        }}>
          Analysis completed but report data is missing.
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{
              background: 'transparent', border: 'none', color: '#a3e635',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', textDecoration: 'underline',
            }}
          >
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      )}

      {/* Bottom CTAs for non-completed */}
      {!isCompleted && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <Link to="/dashboard" className="btn-secondary" style={{ padding: '0.6875rem 1.25rem', fontSize: '0.875rem' }}>
            <ArrowLeft size={14} />
            Dashboard
          </Link>
          <Link to="/dashboard/new-audit" className="btn-primary glow-button" style={{ padding: '0.6875rem 1.25rem', fontSize: '0.875rem' }}>
            <Zap size={14} />
            New Audit
          </Link>
        </div>
      )}

    </div>
  )
}
