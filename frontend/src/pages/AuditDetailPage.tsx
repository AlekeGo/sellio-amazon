import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Zap, ExternalLink, Copy, Check,
  RefreshCw, AlertTriangle, Layers, ChevronDown,
  Eye, Shield, Target, TrendingUp, Crown, Lock,
} from 'lucide-react'
import { getAudit, submitAudit, regenerateAudit } from '../lib/auditsApi'
import StatusBadge from '../components/ui/StatusBadge'
import type { AuditDetail, AuditResult, ConciseReport, ProUpgradePack, BuyerObjectionRadarItem, CompetitorAnalysisLite, CompactReport, CompactFixFirstRow, CompactNextAction } from '../types/audit'

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
  return score >= 80 ? '#2F9E6F' : score >= 60 ? '#B7791F' : '#C2413A'
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
        background: copied ? 'rgba(22,163,74,0.08)' : 'rgba(83,58,253,0.05)',
        border: `1px solid ${copied ? 'rgba(22,163,74,0.22)' : 'rgba(196,188,255,0.45)'}`,
        color: copied ? '#16a34a' : 'var(--dp-ink-muted)',
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
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(196,188,255,0.30)" strokeWidth={sw} />
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
        <span style={{ fontSize: '0.5625rem', color: 'var(--dp-ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
      background: '#ffffff', border: '1px solid rgba(196,188,255,0.45)',
      boxShadow: '0 2px 12px rgba(83,58,253,0.06)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SL({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5625rem', marginBottom: '1rem' }}>
      <div style={{
        width: 3, height: 16, borderRadius: 2,
        background: 'linear-gradient(180deg, #6A55FE, #533AFD)', flexShrink: 0,
      }} />
      <span style={{
        fontSize: '0.75rem', fontWeight: 800, color: 'var(--dp-ink-muted)',
        textTransform: 'uppercase', letterSpacing: '0.07em',
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
      : { color: 'var(--dp-ink-muted)', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.18)' }
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


const PERSONA_LABELS: Record<string, string> = {
  premium: 'Premium',
  budget_friendly: 'Budget Friendly',
  gift_ready: 'Gift Ready',
  expert_professional: 'Expert / Professional',
  luxury: 'Luxury',
  problem_solver: 'Problem Solver',
  minimal_clean: 'Minimal / Clean',
}

function formatImageBrief(img: { image_type: string; goal: string; headline: string; visual_direction: string }) {
  return `${img.image_type}\nGoal: ${img.goal}\nHeadline: "${img.headline}"\nVisual: ${img.visual_direction}`
}

function ProUpgradePackCTA({
  pack,
  auditId,
  persona,
}: {
  pack: ProUpgradePack
  auditId: number
  persona: string
}) {
  const personaLabel = persona ? (PERSONA_LABELS[persona] || '') : ''
  const titlePreview = pack.copy_ready_title ? pack.copy_ready_title.slice(0, 80) : ''

  return (
    <div style={{
      borderRadius: '1rem',
      border: '1px solid rgba(83,58,253,0.28)',
      background: 'rgba(83,58,253,0.025)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(83,58,253,0.12)',
        background: 'linear-gradient(135deg, rgba(83,58,253,0.07), rgba(106,85,254,0.035))',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5625rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <Crown size={16} color="var(--dp-primary)" strokeWidth={2.5} />
              <h3 style={{
                fontSize: '1.0625rem', fontWeight: 900, color: 'var(--dp-ink)',
                margin: 0, letterSpacing: '-0.025em',
              }}>
                Pro Upgrade Pack ready
              </h3>
              {personaLabel && (
                <span style={{
                  fontSize: '0.5875rem', fontWeight: 700, color: 'var(--dp-primary)',
                  background: 'rgba(83,58,253,0.1)', border: '1px solid rgba(83,58,253,0.22)',
                  padding: '0.125rem 0.5rem', borderRadius: '99px',
                  textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                }}>
                  {personaLabel}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>
              Copy-ready title, 5 bullets, description, product detail fixes, and image briefs.
            </p>
          </div>
          <Link
            to={`/dashboard/audits/${auditId}/image-studio`}
            className="dp-btn-primary"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', flexShrink: 0 }}
          >
            <Layers size={12} />
            Image Studio
          </Link>
        </div>
      </div>

      <div style={{ padding: '1.25rem 1.5rem' }}>
        {titlePreview && (
          <div style={{
            position: 'relative', overflow: 'hidden',
            padding: '0.75rem 1rem', borderRadius: '0.625rem', marginBottom: '1rem',
            background: 'rgba(83,58,253,0.04)', border: '1px solid rgba(83,58,253,0.12)',
          }}>
            <p style={{
              fontSize: '0.875rem', color: 'var(--dp-ink)', fontWeight: 600,
              margin: 0, lineHeight: 1.4,
              filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none',
            }}>
              {titlePreview}{pack.copy_ready_title.length > 80 ? '...' : ''}
            </p>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 30%, rgba(246,249,252,0.95) 80%)',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              paddingRight: '1rem',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-primary)',
              }}>
                <Lock size={11} color="var(--dp-primary)" />
                Locked
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
          {['Improved Title', '5 Copy-Ready Bullets', 'Improved Description', 'Product Detail Fixes', 'Image Briefs'].map(item => (
            <span key={item} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.25rem 0.625rem', borderRadius: '99px',
              background: 'rgba(83,58,253,0.04)', border: '1px solid rgba(196,188,255,0.45)',
              fontSize: '0.6875rem', color: 'var(--dp-ink-muted)', fontWeight: 600,
            }}>
              <Lock size={9} color="#475569" />
              {item}
            </span>
          ))}
        </div>

        <Link
          to="/dashboard/billing"
          className="dp-btn-primary"
          style={{ display: 'inline-flex', padding: '0.5625rem 1.125rem', fontSize: '0.8125rem' }}
        >
          <Crown size={13} />
          Unlock Pro Pack
        </Link>
      </div>
    </div>
  )
}

const DIAG = [
  { key: 'attention' as const, label: 'Attention', Icon: Eye, color: '#B7791F', bg: 'rgba(183,121,31,0.04)', border: 'rgba(183,121,31,0.13)' },
  { key: 'trust' as const, label: 'Trust', Icon: Shield, color: '#2F9E6F', bg: 'rgba(47,158,111,0.04)', border: 'rgba(47,158,111,0.14)' },
  { key: 'clarity' as const, label: 'Clarity', Icon: Target, color: '#533AFD', bg: 'rgba(83,58,253,0.04)', border: 'rgba(83,58,253,0.11)' },
  { key: 'conversion' as const, label: 'Conversion', Icon: TrendingUp, color: 'var(--dp-primary)', bg: 'rgba(83,58,253,0.04)', border: 'rgba(83,58,253,0.11)' },
]

function ReportHeader({ audit, result }: { audit: AuditDetail; result: AuditResult }) {
  const color = sc(result.score)
  return (
    <div style={{
      borderRadius: '1rem', padding: '1.75rem 2rem',
      background: '#ffffff', border: '1px solid rgba(196,188,255,0.45)',
      boxShadow: '0 4px 24px rgba(83,58,253,0.08)',
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
            fontSize: '0.5875rem', fontWeight: 700, color: 'rgba(83,58,253,0.55)',
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.875rem',
          }}>
            Sellio AI Audit Report
          </div>
          <h1 style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            fontWeight: 900, color: 'var(--dp-ink)', letterSpacing: '-0.03em',
            margin: '0 0 0.4375rem', lineHeight: 1.2,
          }}>
            {audit.product_name || 'Untitled Audit'}
          </h1>
          {audit.category && (
            <p style={{ fontSize: '0.9375rem', color: 'var(--dp-ink-muted)', margin: '0 0 0.875rem', lineHeight: 1.4 }}>
              {audit.category}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <StatusBadge status={audit.status} />
            <span style={{
              padding: '0.1875rem 0.5625rem', borderRadius: '99px',
              background: 'rgba(83,58,253,0.05)', border: '1px solid rgba(196,188,255,0.45)',
              fontSize: '0.6875rem', fontWeight: 600, color: 'var(--dp-ink-muted)',
            }}>
              {audit.entry_type === 'amazon_url' ? 'Amazon URL' : 'Product Photos'}
            </span>
            {audit.seller_persona && PERSONA_LABELS[audit.seller_persona] && (
              <span style={{
                padding: '0.1875rem 0.5625rem', borderRadius: '99px',
                background: 'rgba(83,58,253,0.07)', border: '1px solid rgba(83,58,253,0.2)',
                fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-primary)',
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              }}>
                <Crown size={10} />
                {PERSONA_LABELS[audit.seller_persona]}
              </span>
            )}
            <span style={{ fontSize: '0.6875rem', color: 'var(--dp-ink-muted)' }}>
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
                fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', textDecoration: 'none',
                marginBottom: '1.375rem', transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#533AFD')}
              onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
            >
              <ExternalLink size={12} />
              View on Amazon
            </a>
          )}
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              to="/dashboard/audits"
              className="dp-btn-ghost"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
            >
              <ArrowLeft size={13} />
              All Audits
            </Link>
            <Link
              to={`/dashboard/audits/${audit.id}/image-studio`}
              className="dp-btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
            >
              <Layers size={13} />
              Open Image Studio
            </Link>
            <Link
              to="/dashboard/new-audit"
              className="dp-btn-ghost"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
            >
              <Zap size={13} />
              New Audit
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

function BuyerObjectionRadarBlock({ items }: { items?: BuyerObjectionRadarItem[] }) {
  const hasItems = Array.isArray(items) && items.length > 0
  const copyText = hasItems
    ? items!.slice(0, 5).map(it =>
        `OBJECTION: ${it.objection}\nFIX: ${it.listing_fix}\nIMAGE IDEA: ${it.image_fix}`
      ).join('\n\n')
    : ''

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
        <div>
          <SL>Buyer Objection Radar</SL>
          <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>
            What may stop buyers from purchasing вЂ” and how to fix it.
          </p>
        </div>
        {hasItems && <CopyButton text={copyText} label="Copy Objection Fixes" />}
      </div>

      {!hasItems ? (
        <div style={{
          padding: '1rem', borderRadius: '0.625rem',
          background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)',
          fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', lineHeight: 1.6, textAlign: 'center',
        }}>
          Add reviews or Q&A in your next audit to detect stronger buyer objections.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4375rem' }}>
          {items!.slice(0, 5).map((item, i) => (
            <div key={i} style={{
              borderRadius: '0.625rem', border: '1px solid rgba(249,115,22,0.14)',
              background: 'rgba(249,115,22,0.03)', overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                padding: '0.5rem 0.875rem',
                background: 'rgba(249,115,22,0.06)', borderBottom: '1px solid rgba(249,115,22,0.09)',
                flexWrap: 'wrap',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '0.125rem 0.5rem', borderRadius: '99px',
                  background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.22)',
                  fontSize: '0.5625rem', fontWeight: 700, color: '#f97316',
                  textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
                }}>
                  Concern
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--dp-ink)', flex: 1, lineHeight: 1.4 }}>
                  {item.objection}
                </span>
              </div>
              {item.source_signal && (
                <div style={{ padding: '0.375rem 0.875rem', borderBottom: '1px solid rgba(196,188,255,0.25)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--dp-ink-muted)', fontStyle: 'italic' }}>
                    Source: {item.source_signal}
                  </span>
                </div>
              )}
              <div style={{
                padding: '0.5rem 0.875rem',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.375rem 1rem',
              }}>
                {item.why_it_hurts_conversion && (
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '0.1rem 0.4rem', borderRadius: '99px',
                      background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
                      fontSize: '0.5rem', fontWeight: 700, color: '#fbbf24',
                      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem',
                    }}>
                      Why it hurts
                    </span>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>
                      {item.why_it_hurts_conversion}
                    </p>
                  </div>
                )}
                {item.listing_fix && (
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '0.1rem 0.4rem', borderRadius: '99px',
                      background: 'rgba(83,58,253,0.08)', border: '1px solid rgba(83,58,253,0.2)',
                      fontSize: '0.5rem', fontWeight: 700, color: 'var(--dp-primary)',
                      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem',
                    }}>
                      Fix
                    </span>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--dp-primary)', margin: 0, lineHeight: 1.5 }}>
                      {item.listing_fix}
                    </p>
                  </div>
                )}
                {item.image_fix && (
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '0.1rem 0.4rem', borderRadius: '99px',
                      background: 'rgba(47,158,111,0.08)', border: '1px solid rgba(47,158,111,0.18)',
                      fontSize: '0.5rem', fontWeight: 700, color: '#2F9E6F',
                      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem',
                    }}>
                      Image idea
                    </span>
                    <p style={{ fontSize: '0.8125rem', color: '#2F9E6F', margin: 0, lineHeight: 1.5 }}>
                      {item.image_fix}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function CompetitorAnalysisLiteBlock({ data }: { data?: CompetitorAnalysisLite }) {
  const isEmpty = !data || (
    (!Array.isArray(data.competitor_advantages) || data.competitor_advantages.length === 0) &&
    (!Array.isArray(data.where_we_can_win) || data.where_we_can_win.length === 0)
  )

  const copyText = data && !isEmpty ? [
    data.summary,
    Array.isArray(data.competitor_advantages) && data.competitor_advantages.length > 0
      ? `COMPETITOR ADVANTAGES:\n${data.competitor_advantages.map(a => `- ${a.competitor}: ${a.advantage}. ${a.why_it_matters}`).join('\n')}`
      : '',
    Array.isArray(data.where_we_can_win) && data.where_we_can_win.length > 0
      ? `WHERE WE CAN WIN:\n${data.where_we_can_win.map(w => `- ${w.area}: ${w.opportunity} в†’ ${w.recommended_action}`).join('\n')}`
      : '',
  ].filter(Boolean).join('\n\n') : ''

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
        <div>
          <SL>Competitor Analysis Lite</SL>
          <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>
            See where competitors look stronger and where your listing can win.
          </p>
        </div>
        {!isEmpty && copyText && <CopyButton text={copyText} label="Copy Competitor Action Plan" />}
      </div>

      {isEmpty ? (
        <div style={{
          padding: '1rem', borderRadius: '0.625rem',
          background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)',
          fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', lineHeight: 1.6, textAlign: 'center',
        }}>
          No competitor data was provided for this audit.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {data!.summary && data!.summary !== 'No competitor data was provided.' && (
            <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-secondary)', lineHeight: 1.65, margin: 0 }}>
              {data!.summary}
            </p>
          )}

          {Array.isArray(data!.competitor_advantages) && data!.competitor_advantages.length > 0 && (
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                Competitor Advantages
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3125rem' }}>
                {data!.competitor_advantages.map((adv, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '0.25rem 1rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
                    background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.1)',
                  }}>
                    {adv.competitor && (
                      <div>
                        <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.125rem' }}>
                          Competitor
                        </div>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--dp-ink)', margin: 0 }}>{adv.competitor}</p>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.5rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.125rem' }}>
                        Advantage
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#f87171', margin: 0, lineHeight: 1.5 }}>{adv.advantage}</p>
                    </div>
                    {adv.why_it_matters && (
                      <div>
                        <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.125rem' }}>
                          Why it matters
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>{adv.why_it_matters}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(data!.where_we_can_win) && data!.where_we_can_win.length > 0 && (
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                Where We Can Win
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3125rem' }}>
                {data!.where_we_can_win.map((win, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '0.25rem 1rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
                    background: 'rgba(238,240,255,0.5)', border: '1px solid rgba(196,188,255,0.40)',
                  }}>
                    {win.area && (
                      <div>
                        <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.125rem' }}>
                          Area
                        </div>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--dp-primary)', margin: 0 }}>{win.area}</p>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.125rem' }}>
                        Opportunity
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-secondary)', margin: 0, lineHeight: 1.5 }}>{win.opportunity}</p>
                    </div>
                    {win.recommended_action && (
                      <div>
                        <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.125rem' }}>
                          Action
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--dp-primary)', margin: 0, lineHeight: 1.5 }}>{win.recommended_action}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data!.do_not_copy_warning && (
            <div style={{
              padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
              background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)',
              fontSize: '0.75rem', color: '#92400e', lineHeight: 1.55,
            }}>
              <span style={{ fontWeight: 700, color: '#fbbf24' }}>Note: </span>
              <span style={{ color: '#78716c' }}>{data!.do_not_copy_warning}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

function ConciseAuditReport({
  report,
  audit,
  proUpgradePack,
  onRegenerate,
  regenerating,
  regenError,
}: {
  report: ConciseReport
  audit: AuditDetail
  proUpgradePack: ProUpgradePack | null | undefined
  onRegenerate: () => void
  regenerating: boolean
  regenError: string | null
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  const hasDetails =
    (Array.isArray(report.keyword_opportunities) && report.keyword_opportunities.length > 0) ||
    (Array.isArray(report.buyer_objections) && report.buyer_objections.length > 0) ||
    (Array.isArray(report.a_plus_brand_plan) && report.a_plus_brand_plan.length > 0) ||
    (report.details != null && Object.keys(report.details).length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Summary */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <SL>Summary</SL>
          <button
            type="button"
            disabled={regenerating}
            onClick={onRegenerate}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.3125rem 0.6875rem', borderRadius: '0.375rem',
              background: 'rgba(83,58,253,0.04)', border: '1px solid rgba(196,188,255,0.45)',
              color: 'var(--dp-ink-muted)', fontSize: '0.75rem', fontWeight: 600,
              cursor: regenerating ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: regenerating ? 0.6 : 1, transition: 'all 0.15s',
            }}
          >
            <RefreshCw size={12} style={{ animation: regenerating ? 'spin 1s linear infinite' : 'none' }} />
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
        <p style={{ fontSize: '0.9375rem', color: 'var(--dp-ink-secondary)', lineHeight: 1.65, margin: 0 }}>
          {report.executive_summary}
        </p>
        {regenError && (
          <div style={{
            marginTop: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.16)',
            fontSize: '0.8125rem', color: '#fca5a5',
          }}>
            {regenError}
          </div>
        )}
      </Card>

      {proUpgradePack && (
        <ProUpgradePackCTA
          pack={proUpgradePack}
          auditId={audit.id}
          persona={audit.seller_persona ?? ''}
        />
      )}

      {/* Buyer Objection Radar */}
      <BuyerObjectionRadarBlock items={report.buyer_objection_radar} />

      {/* Competitor Analysis Lite */}
      <CompetitorAnalysisLiteBlock data={report.competitor_analysis_lite} />

      {/* Ready-to-Copy Listing Upgrade вЂ” only shown when no Pro Upgrade Pack */}
      {!proUpgradePack && (report.title_upgrade?.improved_title || (report.about_this_item_upgrade?.improved_bullets?.length ?? 0) > 0 || report.description_upgrade?.improved_description) && (
        <Card>
          <SL>Ready-to-Copy Listing Upgrade</SL>

          {report.title_upgrade?.improved_title && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--dp-ink-muted)' }}>Copy-ready Title</span>
                <CopyButton text={report.title_upgrade.improved_title} label="Copy Title" />
              </div>
              <div style={{ padding: '0.875rem 1rem', borderRadius: '0.625rem', background: 'rgba(238,240,255,0.5)', border: '1px solid rgba(196,188,255,0.40)' }}>
                <p style={{ fontSize: '0.9375rem', color: 'var(--dp-ink)', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                  {report.title_upgrade.improved_title}
                </p>
              </div>
            </div>
          )}

          {Array.isArray(report.about_this_item_upgrade?.improved_bullets) && report.about_this_item_upgrade.improved_bullets.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--dp-ink-muted)' }}>Copy-ready Bullets</span>
                <CopyButton text={report.about_this_item_upgrade.improved_bullets.join('\n')} label="Copy All Bullets" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {report.about_this_item_upgrade.improved_bullets.map((bullet, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                    padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
                    background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)',
                  }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(83,58,253,0.08)', border: '1px solid rgba(83,58,253,0.2)',
                      color: 'var(--dp-primary)', fontSize: '0.625rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1,
                    }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-secondary)', lineHeight: 1.55, margin: 0, flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                      {bullet}
                    </p>
                    <CopyButton text={bullet} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.description_upgrade?.improved_description && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--dp-ink-muted)' }}>Copy-ready Description</span>
                <CopyButton text={report.description_upgrade.improved_description} label="Copy Description" />
              </div>
              <div style={{ padding: '0.875rem 1rem', borderRadius: '0.625rem', background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-secondary)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {report.description_upgrade.improved_description}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Product Details Fixes вЂ” only shown when no Pro Upgrade Pack */}
      {!proUpgradePack && Array.isArray(report.product_details_fixes) && report.product_details_fixes.length > 0 && (
        <Card>
          <SL>Product Details Fixes</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {report.product_details_fixes.map((fix, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
                background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)',
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.25rem 1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.125rem' }}>Field</div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--dp-ink)', margin: 0 }}>{fix.field}</p>
                  </div>
                  {fix.recommended_fix && (
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.125rem' }}>Fix</div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--dp-primary)', margin: 0, lineHeight: 1.5 }}>{fix.recommended_fix}</p>
                    </div>
                  )}
                </div>
                {fix.recommended_fix && <CopyButton text={fix.recommended_fix} label="Copy Fix" />}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Image Plan */}
      {Array.isArray(report.image_gallery_plan) && report.image_gallery_plan.length > 0 && (
        <Card style={{ borderColor: 'rgba(196,188,255,0.45)', background: 'rgba(238,240,255,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
            <SL>Image Plan вЂ” {report.image_gallery_plan.length} images</SL>
            <Link
              to={`/dashboard/audits/${audit.id}/image-studio`}
              className="dp-btn-primary"
              style={{ padding: '0.4375rem 0.875rem', fontSize: '0.8125rem', flexShrink: 0 }}
            >
              <Layers size={13} />
              Image Studio
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4375rem' }}>
            {report.image_gallery_plan.slice(0, 6).map((img, i) => (
              <div key={i} style={{
                borderRadius: '0.625rem', background: 'rgba(83,58,253,0.03)',
                border: '1px solid rgba(196,188,255,0.40)', overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4375rem 0.875rem', background: 'rgba(238,240,255,0.6)',
                  borderBottom: '1px solid rgba(196,188,255,0.35)', flexWrap: 'wrap',
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'rgba(83,58,253,0.1)', border: '1px solid rgba(83,58,253,0.22)',
                    color: 'var(--dp-primary)', fontSize: '0.625rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--dp-ink)', flex: 1 }}>
                    {img.image_type}
                  </span>
                  <CopyButton text={formatImageBrief(img)} label="Copy Brief" />
                </div>
                <div style={{
                  padding: '0.625rem 0.875rem',
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.4375rem 1rem',
                }}>
                  {img.goal && (
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.1875rem' }}>Goal</div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>{img.goal}</p>
                    </div>
                  )}
                  {img.headline && (
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.1875rem' }}>Headline</div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--dp-primary)', margin: 0, fontWeight: 700 }}>"{img.headline}"</p>
                    </div>
                  )}
                  {img.visual_direction && (
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.1875rem' }}>Visual Direction</div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>{img.visual_direction}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Next Actions */}
      {Array.isArray(report.priority_checklist) && report.priority_checklist.length > 0 && (
        <Card>
          <SL>Next Actions</SL>
          <div>
            {report.priority_checklist.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.75rem 0',
                borderBottom: i < report.priority_checklist.length - 1 ? '1px solid rgba(196,188,255,0.25)' : 'none',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(83,58,253,0.06)', border: '1px solid rgba(196,188,255,0.45)',
                  color: 'var(--dp-ink-muted)', fontSize: '0.625rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.1875rem', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--dp-ink)', margin: 0, lineHeight: 1.45, wordBreak: 'break-word' }}>
                      {item.task}
                    </p>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  {item.reason && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>
                      {item.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* View Details вЂ” keywords, objections, A+, notes */}
      {hasDetails && (
        <Card>
          <button
            type="button"
            onClick={() => setDetailsOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--dp-ink-muted)', fontSize: '0.8125rem', fontWeight: 600,
              fontFamily: 'inherit', padding: 0, width: '100%', textAlign: 'left',
            }}
          >
            <ChevronDown
              size={14}
              style={{ transform: detailsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
            />
            {detailsOpen ? 'Hide Details' : 'View Details'}
          </button>
          {detailsOpen && (
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {Array.isArray(report.keyword_opportunities) && report.keyword_opportunities.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(196,188,255,0.25)' }}>
                    Keyword Opportunities вЂ” {report.keyword_opportunities.length}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3125rem' }}>
                    {report.keyword_opportunities.map((kw, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                        padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                        background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)',
                        flexWrap: 'wrap',
                      }}>
                        <span style={{
                          padding: '0.1875rem 0.625rem', borderRadius: '99px',
                          background: 'rgba(83,58,253,0.08)', border: '1px solid rgba(83,58,253,0.18)',
                          color: 'var(--dp-primary)', fontSize: '0.8125rem', fontWeight: 700,
                          flexShrink: 0, whiteSpace: 'nowrap',
                        }}>
                          {kw.keyword}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', lineHeight: 1.5, paddingTop: 2 }}>
                          {kw.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(report.buyer_objections) && report.buyer_objections.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(196,188,255,0.25)' }}>
                    Buyer Objections
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3125rem' }}>
                    {report.buyer_objections.map((bo, i) => (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                        gap: '0.375rem 1.25rem', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                        background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)',
                      }}>
                        <div>
                          <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.1875rem' }}>Objection</div>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-secondary)', margin: 0, lineHeight: 1.5 }}>{bo.objection}</p>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.1875rem' }}>How to Address</div>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-secondary)', margin: 0, lineHeight: 1.5 }}>{bo.how_to_address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(report.a_plus_brand_plan) && report.a_plus_brand_plan.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(196,188,255,0.25)' }}>
                    A+ / Brand Content Plan
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.375rem' }}>
                    {report.a_plus_brand_plan.map((item, i) => (
                      <div key={i} style={{
                        padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                        background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)',
                      }}>
                        <div style={{ fontSize: '0.5875rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>
                          {item.section}
                        </div>
                        {item.purpose && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--dp-primary)', margin: '0 0 0.25rem', fontWeight: 600 }}>
                            {item.purpose}
                          </p>
                        )}
                        <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>
                          {item.content_idea}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.details != null && Object.keys(report.details).length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(196,188,255,0.25)' }}>
                    Details
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(report.details).map(([key, value]) => (
                      <div key={key}>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>
                          {key.replace(/_/g, ' ')}
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </Card>
      )}

      {/* Image Studio CTA */}
      <div style={{
        borderRadius: '0.875rem', padding: '1.5rem 1.75rem',
        background: 'rgba(83,58,253,0.04)',
        border: '1px solid rgba(196,188,255,0.45)',
        display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '0.875rem',
          background: 'linear-gradient(135deg, #6A55FE, #533AFD)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Layers size={24} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dp-ink)', margin: '0 0 0.3125rem', letterSpacing: '-0.025em' }}>
            Ready to build your Image Pack?
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>
            Turn your audit insights into premium Amazon-ready visuals with Sellio Image Studio.
          </p>
        </div>
        <Link to={`/dashboard/audits/${audit.id}/image-studio`} className="dp-btn-primary" style={{ padding: '0.6875rem 1.25rem', fontSize: '0.875rem' }}>
          <Zap size={14} />
          Open Image Studio
        </Link>
      </div>

    </div>
  )
}

function SubScoreBar({ label, score }: { label: string; score: number }) {
  const color = sc(score)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color }}>{score}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: '#E5E7EB', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, score))}%`, borderRadius: 2, background: color }} />
      </div>
    </div>
  )
}

function CompactFixTable({ rows }: { rows: CompactFixFirstRow[] }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: '0.5rem', border: '1px solid rgba(196,188,255,0.40)' }}>
      <div style={{ minWidth: 380 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr' }}>
          <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(238,240,255,0.7)', borderBottom: '1px solid rgba(196,188,255,0.35)' }}>
            <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Problem</span>
          </div>
          <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(238,240,255,0.7)', borderBottom: '1px solid rgba(196,188,255,0.35)', borderLeft: '1px solid rgba(196,188,255,0.30)' }}>
            <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Why It Matters</span>
          </div>
          <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(238,240,255,0.7)', borderBottom: '1px solid rgba(196,188,255,0.35)', borderLeft: '1px solid rgba(196,188,255,0.30)' }}>
            <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Fix</span>
          </div>
        </div>
        {rows.slice(0, 3).map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr', borderTop: '1px solid rgba(196,188,255,0.25)', background: i % 2 === 0 ? 'transparent' : 'rgba(238,240,255,0.3)' }}>
            <div style={{ padding: '0.625rem 0.75rem' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--dp-ink)', margin: 0, lineHeight: 1.4 }}>{row.problem}</p>
            </div>
            <div style={{ padding: '0.625rem 0.75rem', borderLeft: '1px solid rgba(196,188,255,0.25)' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.4 }}>{row.why_it_matters}</p>
            </div>
            <div style={{ padding: '0.625rem 0.75rem', borderLeft: '1px solid rgba(196,188,255,0.25)' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--dp-primary)', margin: 0, lineHeight: 1.4 }}>{row.fix}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CompactNextActionsList({ actions }: { actions: CompactNextAction[] }) {
  return (
    <div>
      {actions.slice(0, 5).map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '0.75rem 0',
          borderBottom: i < Math.min(actions.length, 5) - 1 ? '1px solid rgba(196,188,255,0.25)' : 'none',
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'rgba(83,58,253,0.08)', border: '1px solid rgba(83,58,253,0.22)',
            color: 'var(--dp-primary)', fontSize: '0.625rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 1,
          }}>
            {item.step}
          </span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--dp-ink)', margin: 0, lineHeight: 1.45, flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
              {item.action}
            </p>
            <PriorityBadge priority={item.priority} />
          </div>
        </div>
      ))}
    </div>
  )
}

const SUB_SCORE_LABELS: Record<string, string> = {
  seo: 'SEO',
  copy: 'Copy',
  images: 'Images',
  trust: 'Trust',
  competitor_position: 'Position',
}

function CompactAuditReport({
  compact,
  audit,
  proUpgradePack,
  imagePlan,
  onRegenerate,
  regenerating,
  regenError,
}: {
  compact: CompactReport
  audit: AuditDetail
  proUpgradePack: ProUpgradePack | null | undefined
  imagePlan?: Array<{ image_type: string; goal: string; headline: string; visual_direction: string; text_elements?: string[] }>
  onRegenerate: () => void
  regenerating: boolean
  regenError: string | null
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const { score_snapshot, fix_first_table, buyer_and_competitor_insights, next_actions, advanced_details } = compact
  const ss = score_snapshot ?? {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
          <SL>Score Snapshot</SL>
          <button
            type="button"
            disabled={regenerating}
            onClick={onRegenerate}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.3125rem 0.6875rem', borderRadius: '0.375rem',
              background: 'rgba(83,58,253,0.04)', border: '1px solid rgba(196,188,255,0.45)',
              color: 'var(--dp-ink-muted)', fontSize: '0.75rem', fontWeight: 600,
              cursor: regenerating ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: regenerating ? 0.6 : 1, transition: 'all 0.15s',
            }}
          >
            <RefreshCw size={12} style={{ animation: regenerating ? 'spin 1s linear infinite' : 'none' }} />
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>

        {(ss.status || ss.main_problem || ss.quick_win) && (
          <div style={{ marginBottom: '1rem' }}>
            {ss.status && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '0.1875rem 0.625rem', borderRadius: '99px',
                background: 'rgba(83,58,253,0.04)', border: '1px solid rgba(196,188,255,0.45)',
                fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-ink-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem',
              }}>
                {ss.status}
              </span>
            )}
            {ss.main_problem && (
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--dp-ink)', margin: '0 0 0.375rem', lineHeight: 1.4 }}>
                {ss.main_problem}
              </p>
            )}
            {ss.quick_win && (
              <p style={{ fontSize: '0.875rem', color: 'var(--dp-primary)', margin: 0, lineHeight: 1.5 }}>
                Quick win: {ss.quick_win}
              </p>
            )}
          </div>
        )}

        {ss.sub_scores && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.875rem', paddingTop: '1rem', borderTop: '1px solid rgba(196,188,255,0.25)',
          }}>
            {Object.entries(ss.sub_scores).map(([key, val]) => (
              <SubScoreBar key={key} label={SUB_SCORE_LABELS[key] ?? key} score={val as number} />
            ))}
          </div>
        )}

        {regenError && (
          <div style={{
            marginTop: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.16)',
            fontSize: '0.8125rem', color: '#fca5a5',
          }}>
            {regenError}
          </div>
        )}
      </Card>

      {Array.isArray(fix_first_table) && fix_first_table.length > 0 && (
        <Card>
          <SL>Fix This First</SL>
          <CompactFixTable rows={fix_first_table} />
        </Card>
      )}

      {proUpgradePack && (
        <ProUpgradePackCTA
          pack={proUpgradePack}
          auditId={audit.id}
          persona={audit.seller_persona ?? ''}
        />
      )}

      {buyer_and_competitor_insights && (
        <Card>
          <SL>Buyer & Competitor Insights</SL>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>

            {Array.isArray(buyer_and_competitor_insights.buyer_objections) && buyer_and_competitor_insights.buyer_objections.length > 0 && (
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                  Buyer Concerns
                </div>
                <div style={{ borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid rgba(249,115,22,0.14)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(249,115,22,0.06)', borderBottom: '1px solid rgba(249,115,22,0.1)' }}>
                    <div style={{ padding: '0.375rem 0.625rem' }}><span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Buyer Concern</span></div>
                    <div style={{ padding: '0.375rem 0.625rem', borderLeft: '1px solid rgba(249,115,22,0.09)' }}><span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Fix</span></div>
                  </div>
                  {buyer_and_competitor_insights.buyer_objections.slice(0, 3).map((item, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid rgba(249,115,22,0.07)', background: i % 2 === 0 ? 'transparent' : 'rgba(249,115,22,0.02)' }}>
                      <div style={{ padding: '0.5rem 0.625rem' }}>
                        <p style={{ fontSize: '0.8125rem', color: '#f97316', margin: 0, lineHeight: 1.4 }}>{item.buyer_concern}</p>
                      </div>
                      <div style={{ padding: '0.5rem 0.625rem', borderLeft: '1px solid rgba(249,115,22,0.07)' }}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--dp-primary)', margin: 0, lineHeight: 1.4 }}>{item.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(buyer_and_competitor_insights.competitor_actions) && buyer_and_competitor_insights.competitor_actions.length > 0 && (
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                  Competitor Gaps
                </div>
                <div style={{ borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid rgba(196,188,255,0.40)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(238,240,255,0.6)', borderBottom: '1px solid rgba(196,188,255,0.35)' }}>
                    <div style={{ padding: '0.375rem 0.625rem' }}><span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Competitor Wins In</span></div>
                    <div style={{ padding: '0.375rem 0.625rem', borderLeft: '1px solid rgba(196,188,255,0.25)' }}><span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your Action</span></div>
                  </div>
                  {buyer_and_competitor_insights.competitor_actions.slice(0, 3).map((item, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid rgba(196,188,255,0.25)', background: i % 2 === 0 ? 'transparent' : 'rgba(238,240,255,0.3)' }}>
                      <div style={{ padding: '0.5rem 0.625rem' }}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-secondary)', margin: 0, lineHeight: 1.4 }}>{item.competitor_wins_in}</p>
                      </div>
                      <div style={{ padding: '0.5rem 0.625rem', borderLeft: '1px solid rgba(196,188,255,0.25)' }}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--dp-primary)', margin: 0, lineHeight: 1.4 }}>{item.your_action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </Card>
      )}

      {Array.isArray(imagePlan) && imagePlan.length > 0 && (
        <Card style={{ borderColor: 'rgba(196,188,255,0.45)', background: 'rgba(238,240,255,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
            <SL>Image Plan вЂ” {Math.min(imagePlan.length, 6)} images</SL>
            <Link
              to={`/dashboard/audits/${audit.id}/image-studio`}
              className="dp-btn-primary"
              style={{ padding: '0.4375rem 0.875rem', fontSize: '0.8125rem', flexShrink: 0 }}
            >
              <Layers size={13} />
              Image Studio
            </Link>
          </div>
          <div style={{ overflowX: 'auto', borderRadius: '0.5rem', border: '1px solid rgba(196,188,255,0.40)' }}>
            <div style={{ minWidth: 500 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr', background: 'rgba(238,240,255,0.7)', borderBottom: '1px solid rgba(196,188,255,0.35)' }}>
                <div style={{ padding: '0.5rem 0.75rem' }}><span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Image</span></div>
                <div style={{ padding: '0.5rem 0.75rem', borderLeft: '1px solid rgba(196,188,255,0.30)' }}><span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Goal</span></div>
                <div style={{ padding: '0.5rem 0.75rem', borderLeft: '1px solid rgba(196,188,255,0.30)' }}><span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Headline</span></div>
                <div style={{ padding: '0.5rem 0.75rem', borderLeft: '1px solid rgba(196,188,255,0.30)' }}><span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Action</span></div>
              </div>
              {imagePlan.slice(0, 6).map((img, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr', borderTop: '1px solid rgba(196,188,255,0.25)', background: i % 2 === 0 ? 'transparent' : 'rgba(238,240,255,0.3)' }}>
                  <div style={{ padding: '0.625rem 0.75rem' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--dp-primary)', margin: 0, lineHeight: 1.4 }}>{img.image_type}</p>
                  </div>
                  <div style={{ padding: '0.625rem 0.75rem', borderLeft: '1px solid rgba(196,188,255,0.25)' }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.4 }}>{img.goal}</p>
                  </div>
                  <div style={{ padding: '0.625rem 0.75rem', borderLeft: '1px solid rgba(196,188,255,0.25)' }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--dp-primary)', margin: 0, lineHeight: 1.4, fontWeight: 600 }}>{img.headline ? `”${img.headline}”` : '—'}</p>
                  </div>
                  <div style={{ padding: '0.625rem 0.75rem', borderLeft: '1px solid rgba(196,188,255,0.25)', display: 'flex', alignItems: 'flex-start' }}>
                    <CopyButton text={`${img.image_type}\nGoal: ${img.goal}\nHeadline: “${img.headline}”\nVisual: ${img.visual_direction}`} label="Copy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {Array.isArray(next_actions) && next_actions.length > 0 && (
        <Card>
          <SL>Next Actions</SL>
          <CompactNextActionsList actions={next_actions} />
        </Card>
      )}

      {advanced_details && (
        <Card>
          <button
            type="button"
            onClick={() => setAdvancedOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--dp-ink-muted)', fontSize: '0.8125rem', fontWeight: 600,
              fontFamily: 'inherit', padding: 0, width: '100%', textAlign: 'left',
            }}
          >
            <ChevronDown size={14} style={{ transform: advancedOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            {advancedOpen ? 'Hide Advanced Details' : 'View Advanced Details'}
          </button>

          {advancedOpen && (
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {Array.isArray(advanced_details.keywords) && advanced_details.keywords.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(196,188,255,0.25)' }}>
                    Keywords
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {advanced_details.keywords.map((kw, i) => (
                      <span key={i} style={{
                        padding: '0.25rem 0.625rem', borderRadius: '99px',
                        background: 'rgba(83,58,253,0.08)', border: '1px solid rgba(83,58,253,0.18)',
                        color: 'var(--dp-primary)', fontSize: '0.8125rem', fontWeight: 600,
                      }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(advanced_details.a_plus_content_plan) && advanced_details.a_plus_content_plan.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(196,188,255,0.25)' }}>
                    A+ Content Plan
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {advanced_details.a_plus_content_plan.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--dp-primary)', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>в†’</span>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(advanced_details.detailed_notes) && advanced_details.detailed_notes.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(196,188,255,0.25)' }}>
                    Detailed Notes
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {advanced_details.detailed_notes.map((note, i) => (
                      <p key={i} style={{
                        fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.55,
                        paddingBottom: '0.375rem',
                        borderBottom: i < advanced_details.detailed_notes.length - 1 ? '1px solid rgba(196,188,255,0.25)' : 'none',
                      }}>
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </Card>
      )}

      <div style={{
        borderRadius: '0.875rem', padding: '1.5rem 1.75rem',
        background: 'rgba(83,58,253,0.04)',
        border: '1px solid rgba(196,188,255,0.45)',
        display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '0.875rem',
          background: 'linear-gradient(135deg, #6A55FE, #533AFD)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Layers size={24} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dp-ink)', margin: '0 0 0.3125rem', letterSpacing: '-0.025em' }}>
            Ready to build your Image Pack?
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>
            Turn your audit insights into premium Amazon-ready visuals with Sellio Image Studio.
          </p>
        </div>
        <Link to={`/dashboard/audits/${audit.id}/image-studio`} className="dp-btn-primary" style={{ padding: '0.6875rem 1.25rem', fontSize: '0.875rem' }}>
          <Zap size={14} />
          Open Image Studio
        </Link>
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
            <span style={{ fontSize: '0.9375rem', color: 'var(--dp-ink-muted)', fontWeight: 600 }}>/100</span>
            <span style={{ fontSize: '1.0625rem', fontWeight: 700, color, marginLeft: '0.25rem', letterSpacing: '-0.02em' }}>
              вЂ” {result.score_label}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: '0 0 0.875rem', lineHeight: 1.65 }}>
            {result.score >= 80
              ? 'Your listing is performing well вЂ” copy, trust signals, and conversion are in strong shape.'
              : result.score >= 60
              ? 'Your listing has clear opportunities. A focused optimization pass can meaningfully lift conversion.'
              : 'Your listing needs significant work to compete on Amazon. The report below shows exactly where to focus.'}
          </p>
          <div className="score-bar-track" style={{ maxWidth: 340, marginBottom: '0.875rem' }}>
            <div className="score-bar-fill" style={{ width: `${result.score}%` }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {audit.submitted_at && (
              <span style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)' }}>
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
                background: 'rgba(83,58,253,0.04)', border: '1px solid rgba(196,188,255,0.45)',
                color: 'var(--dp-ink-muted)', fontSize: '0.75rem', fontWeight: 600,
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
            borderTop: '1px solid rgba(196,188,255,0.25)',
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
                <p style={{ fontSize: '0.8rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.55 }}>
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
          <p style={{ fontSize: '0.9375rem', color: 'var(--dp-ink-secondary)', lineHeight: 1.85, margin: 0, wordBreak: 'break-word' }}>
            {result.executive_summary}
          </p>
        </Card>
      )}

      {/* Weak Points */}
      {Array.isArray(result.weak_points) && result.weak_points.length > 0 && (
        <Card>
          <SL>Weak Points вЂ” {result.weak_points.length} issues found</SL>
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
                  <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink)', fontWeight: 600, margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                    {wp.issue}
                  </p>
                  {wp.impact && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: '0 0 0.4375rem', lineHeight: 1.5 }}>
                      <span style={{ color: '#fbbf24', fontWeight: 600 }}>Why it hurts: </span>{wp.impact}
                    </p>
                  )}
                  {wp.fix && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--dp-primary)', margin: 0, lineHeight: 1.5 }}>
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
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--dp-ink-muted)' }}>Improved Title</span>
                <CopyButton text={result.improved_title} label="Copy Title" />
              </div>
              <div style={{ padding: '1rem 1.125rem', borderRadius: '0.625rem', background: 'rgba(238,240,255,0.5)', border: '1px solid rgba(196,188,255,0.40)' }}>
                <p style={{ fontSize: '0.9375rem', color: 'var(--dp-ink)', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
                  {result.improved_title}
                </p>
              </div>
              {result.title_analysis?.strategy && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: '0.5rem 0 0', lineHeight: 1.55 }}>
                  {result.title_analysis.strategy}
                </p>
              )}
            </div>
          )}

          {Array.isArray(result.improved_bullets) && result.improved_bullets.length > 0 && (
            <div style={{ marginBottom: '1.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--dp-ink-muted)' }}>Improved Bullet Points</span>
                <CopyButton text={result.improved_bullets.join('\n')} label="Copy All" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4375rem' }}>
                {result.improved_bullets.map((bullet, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.75rem 0.875rem', borderRadius: '0.5rem',
                    background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)',
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'rgba(83,58,253,0.08)', border: '1px solid rgba(83,58,253,0.2)',
                      color: 'var(--dp-primary)', fontSize: '0.6875rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1,
                    }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-secondary)', lineHeight: 1.6, margin: 0, flex: 1 }}>
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
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--dp-ink-muted)' }}>Improved Description</span>
                <CopyButton text={result.improved_description} label="Copy Description" />
              </div>
              <div style={{ padding: '1rem 1.125rem', borderRadius: '0.625rem', background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-secondary)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {result.improved_description}
                </p>
              </div>
              {result.description_analysis?.improvement_strategy && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: '0.5rem 0 0', lineHeight: 1.55 }}>
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
          <SL>Keyword Opportunities вЂ” {result.keyword_opportunities.length} keywords</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.keyword_opportunities.map((kw, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
                background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)',
              }}>
                <span style={{
                  padding: '0.25rem 0.75rem', borderRadius: '99px',
                  background: 'rgba(83,58,253,0.08)', border: '1px solid rgba(83,58,253,0.18)',
                  color: 'var(--dp-primary)', fontSize: '0.8125rem', fontWeight: 700,
                  flexShrink: 0, whiteSpace: 'nowrap',
                }}>
                  {kw.keyword}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', lineHeight: 1.55, paddingTop: 3 }}>
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
          <SL>Review Insights вЂ” what customers are signaling</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.review_insights.map((ri, i) => (
              <div key={i} style={{
                padding: '1rem', borderRadius: '0.625rem',
                background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)',
              }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--dp-ink)', margin: '0 0 0.4375rem', lineHeight: 1.45 }}>
                  {ri.signal}
                </p>
                {ri.what_it_means && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: '0 0 0.375rem', lineHeight: 1.55 }}>
                    <span style={{ color: 'var(--dp-ink-muted)', fontWeight: 600 }}>What it means: </span>{ri.what_it_means}
                  </p>
                )}
                {ri.listing_fix && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--dp-primary)', margin: 0, lineHeight: 1.55 }}>
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
          <SL>Buyer Objections вЂ” how to address hesitations</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {result.buyer_objections.map((bo, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.875rem 1.5rem', padding: '1rem', borderRadius: '0.625rem',
                background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)',
              }}>
                <div>
                  <div style={{ fontSize: '0.5875rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3125rem' }}>
                    Objection
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-secondary)', margin: 0, lineHeight: 1.55 }}>{bo.objection}</p>
                </div>
                <div>
                  <div style={{ fontSize: '0.5875rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3125rem' }}>
                    How to Address
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-secondary)', margin: 0, lineHeight: 1.55 }}>{bo.how_to_address}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Image Pack Plan */}
      {Array.isArray(result.image_pack_plan) && result.image_pack_plan.length > 0 && (
        <Card style={{ borderColor: 'rgba(196,188,255,0.45)', background: 'rgba(238,240,255,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5625rem', marginBottom: '0.3125rem' }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg, #7A66FF, #533AFD)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Image Pack Plan вЂ” {result.image_pack_plan.length} images
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: '0 0 0.875rem', lineHeight: 1.5 }}>
                AI-generated creative briefs. Hand these directly to a designer or use Sellio Image Studio.
              </p>
            </div>
            <Link
              to={`/dashboard/audits/${audit.id}/image-studio`}
              className="dp-btn-primary"
              style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem', flexShrink: 0 }}
            >
              <Layers size={13} />
              Open in Image Studio
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {result.image_pack_plan.map((img, i) => (
              <div key={i} style={{
                borderRadius: '0.75rem', background: 'rgba(83,58,253,0.03)',
                border: '1px solid rgba(196,188,255,0.40)', overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1.125rem', background: 'rgba(238,240,255,0.6)',
                  borderBottom: '1px solid rgba(196,188,255,0.35)',
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(83,58,253,0.1)', border: '1px solid rgba(83,58,253,0.22)',
                    color: 'var(--dp-primary)', fontSize: '0.6875rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dp-ink)', letterSpacing: '-0.02em' }}>
                    {img.image_type}
                  </span>
                </div>
                <div style={{
                  padding: '1rem 1.125rem',
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '1rem 1.5rem',
                }}>
                  {img.goal && (
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>Goal</div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.6 }}>{img.goal}</p>
                    </div>
                  )}
                  {img.headline && (
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem', opacity: 0.7 }}>Headline</div>
                      <p style={{ fontSize: '0.9375rem', color: 'var(--dp-primary)', margin: 0, lineHeight: 1.5, fontWeight: 700, letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
                        "{img.headline}"
                      </p>
                    </div>
                  )}
                  {img.visual_direction && (
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>Visual Direction</div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.6 }}>{img.visual_direction}</p>
                    </div>
                  )}
                  {Array.isArray(img.text_elements) && img.text_elements.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Text on Image</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3125rem' }}>
                        {img.text_elements.map((el, j) => (
                          <span key={j} style={{
                            padding: '0.25rem 0.5625rem', borderRadius: '0.3125rem',
                            background: 'rgba(83,58,253,0.05)', border: '1px solid rgba(196,188,255,0.35)',
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
          <SL>A+ Content Ideas вЂ” {result.a_plus_content_ideas.length} modules</SL>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {result.a_plus_content_ideas.map((idea, i) => (
              <div key={i} style={{
                padding: '1rem', borderRadius: '0.625rem',
                background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.35)',
              }}>
                <div style={{ fontSize: '0.5875rem', fontWeight: 700, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>
                  {idea.section}
                </div>
                {idea.purpose && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--dp-primary)', margin: '0 0 0.5rem', fontWeight: 600 }}>
                    {idea.purpose}
                  </p>
                )}
                <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.55 }}>
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
          <SL>Priority Checklist вЂ” your action plan</SL>
          <div>
            {result.priority_checklist.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.875rem 0',
                borderBottom: i < result.priority_checklist.length - 1 ? '1px solid rgba(196,188,255,0.25)' : 'none',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(83,58,253,0.06)', border: '1px solid rgba(196,188,255,0.45)',
                  color: 'var(--dp-ink-muted)', fontSize: '0.625rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--dp-ink)', margin: 0, lineHeight: 1.45, wordBreak: 'break-word' }}>
                      {item.task}
                    </p>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  {item.reason && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.55 }}>
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
        background: 'rgba(83,58,253,0.04)',
        border: '1px solid rgba(196,188,255,0.45)',
        display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '0.875rem',
          background: 'linear-gradient(135deg, #6A55FE, #533AFD)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Layers size={24} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dp-ink)', margin: '0 0 0.3125rem', letterSpacing: '-0.025em' }}>
            Ready to build your Image Pack?
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>
            Turn your audit insights into premium Amazon-ready visuals with Sellio Image Studio.
          </p>
        </div>
        <Link to={`/dashboard/audits/${audit.id}/image-studio`} className="dp-btn-primary" style={{ padding: '0.6875rem 1.25rem', fontSize: '0.875rem' }}>
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
        fontSize: '0.875rem', color: 'var(--dp-ink-muted)', textDecoration: 'none',
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
        <div style={{ textAlign: 'center', padding: '3rem 0', fontSize: '0.875rem', color: 'var(--dp-ink-muted)' }}>
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
  const isV2 = isCompleted && audit.result?.report_version === 'v2' && !!audit.result?.concise_report
  const hasCompact = isV2 && !!(audit.result?.concise_report as ConciseReport | null)?.compact_report
  const maxWidth = isCompleted ? 900 : 700

  return (
    <div style={{ maxWidth }}>

      {!isCompleted && backLink}

      {/* Minimal header for non-completed states */}
      {!isCompleted && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
            <StatusBadge status={audit.status} />
            <span style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)' }}>
              {audit.entry_type === 'amazon_url' ? 'Amazon URL' : 'Product Photos'}
              {' В· '}
              {formatDate(audit.created_at)}
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.625rem)',
            fontWeight: 900, color: 'var(--dp-ink)', letterSpacing: '-0.03em', margin: 0,
          }}>
            {audit.product_name || 'Untitled Audit'}
          </h1>
          {audit.category && (
            <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: '0.375rem 0 0' }}>{audit.category}</p>
          )}
          {audit.amazon_url && (
            <a
              href={audit.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
                fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', textDecoration: 'none',
                marginTop: '0.375rem', transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#533AFD')}
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
          background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.40)',
          textAlign: 'center', marginBottom: '1.5rem',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            border: '3px solid rgba(83,58,253,0.12)',
            borderTop: '3px solid #533AFD',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem',
          }} />
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--dp-ink)', margin: '0 0 0.625rem', letterSpacing: '-0.02em' }}>
            Analyzing your Amazon listing...
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.7 }}>
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
                <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.6 }}>
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
              className="dp-btn-primary"
              style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem', opacity: submitting ? 0.7 : 1 }}
            >
              <RefreshCw size={14} style={{ animation: submitting ? 'spin 1s linear infinite' : 'none' }} />
              {submitting ? 'Analyzing...' : 'Try Again'}
            </button>
            <Link to="/dashboard/new-audit" className="dp-btn-ghost" style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem' }}>
              New Audit
            </Link>
          </div>
        </div>
      )}

      {/* Draft / ready */}
      {(audit.status === 'draft' || audit.status === 'ready_for_analysis') && (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: '0.75rem',
          background: 'rgba(83,58,253,0.03)', border: '1px solid rgba(196,188,255,0.40)',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--dp-primary)', marginBottom: '0.25rem' }}>
            Ready for analysis
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', lineHeight: 1.6, margin: '0 0 0.875rem' }}>
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
            className="dp-btn-primary"
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

      {/* Full report вЂ” compact v2 */}
      {isCompleted && hasCompact && audit.result?.concise_report && (
        <CompactAuditReport
          compact={(audit.result.concise_report as ConciseReport).compact_report!}
          audit={audit}
          proUpgradePack={audit.result.pro_upgrade_pack}
          imagePlan={(audit.result.concise_report as ConciseReport).image_gallery_plan}
          onRegenerate={handleRegenerate}
          regenerating={regenerating}
          regenError={regenError}
        />
      )}

      {/* Full report вЂ” v2 concise (no compact_report, backward compat) */}
      {isCompleted && isV2 && !hasCompact && audit.result?.concise_report && (
        <ConciseAuditReport
          report={audit.result.concise_report}
          audit={audit}
          proUpgradePack={audit.result.pro_upgrade_pack}
          onRegenerate={handleRegenerate}
          regenerating={regenerating}
          regenError={regenError}
        />
      )}

      {/* Full report вЂ” v1 legacy */}
      {isCompleted && !isV2 && audit.result && (
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
              background: 'transparent', border: 'none', color: 'var(--dp-primary)',
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
          <Link to="/dashboard" className="dp-btn-ghost" style={{ padding: '0.6875rem 1.25rem', fontSize: '0.875rem' }}>
            <ArrowLeft size={14} />
            Dashboard
          </Link>
          <Link to="/dashboard/new-audit" className="dp-btn-primary" style={{ padding: '0.6875rem 1.25rem', fontSize: '0.875rem' }}>
            <Zap size={14} />
            New Audit
          </Link>
        </div>
      )}

    </div>
  )
}
