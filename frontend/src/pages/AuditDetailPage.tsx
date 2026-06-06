import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Zap, ExternalLink, Copy, Check,
  RefreshCw, AlertTriangle, Layers,
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

// ── Shared primitives ─────────────────────────────────────────────

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
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3125rem',
        padding: '0.3125rem 0.625rem',
        borderRadius: '0.375rem',
        background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${copied ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`,
        color: copied ? '#4ade80' : '#64748b',
        fontSize: '0.6875rem',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : label}
    </button>
  )
}

function ScoreRing({ score }: { score: number }) {
  const size = 120
  const r = 48
  const cx = 60
  const cy = 60
  const circumference = 2 * Math.PI * r
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circumference
  const color = score >= 80 ? '#a3e635' : score >= 60 ? '#fbbf24' : '#f97316'
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: '1.875rem', fontWeight: 900, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: '0.5625rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          / 100
        </span>
      </div>
    </div>
  )
}

function RC({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: '0.875rem',
      padding: '1.375rem 1.5rem',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SL({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.6875rem',
      fontWeight: 700,
      color: '#475569',
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      marginBottom: '0.875rem',
    }}>
      {children}
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
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.1875rem 0.5rem',
      borderRadius: '99px',
      fontSize: '0.625rem',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: c.color,
      background: c.bg,
      border: `1px solid ${c.border}`,
      flexShrink: 0,
    }}>
      {priority}
    </span>
  )
}

// ── Full AI report ────────────────────────────────────────────────

function AuditReport({
  result,
  audit,
  onRegenerate,
  regenerating,
  regenError,
}: {
  result: AuditResult
  audit: AuditDetail
  onRegenerate: () => void
  regenerating: boolean
  regenError: string | null
}) {
  const scoreColor = result.score >= 80 ? '#a3e635' : result.score >= 60 ? '#fbbf24' : '#f97316'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Score card */}
      <RC>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ScoreRing score={result.score} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{
              fontSize: '0.6875rem', fontWeight: 700, color: '#475569',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem',
            }}>
              Sellio Score
            </div>
            <div style={{
              fontSize: '1.125rem', fontWeight: 900, color: scoreColor,
              letterSpacing: '-0.03em', marginBottom: '0.5rem', lineHeight: 1.3,
            }}>
              {result.score_label}
            </div>
            <div className="score-bar-track" style={{ marginBottom: '0.75rem' }}>
              <div className="score-bar-fill" style={{ width: `${result.score}%` }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {audit.submitted_at && (
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                  {formatDate(audit.submitted_at)}
                </span>
              )}
              <button
                type="button"
                disabled={regenerating}
                onClick={onRegenerate}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.3125rem 0.6875rem',
                  borderRadius: '0.375rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: regenerating ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: regenerating ? 0.6 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <RefreshCw
                  size={12}
                  style={{ animation: regenerating ? 'spin 1s linear infinite' : 'none' }}
                />
                {regenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
            {regenError && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                background: 'rgba(239,68,68,0.07)',
                border: '1px solid rgba(239,68,68,0.16)',
                fontSize: '0.8125rem',
                color: '#fca5a5',
              }}>
                {regenError}
              </div>
            )}
          </div>
        </div>
      </RC>

      {/* Executive Summary */}
      {result.executive_summary && (
        <RC>
          <SL>Executive Summary</SL>
          <p style={{ fontSize: '0.9375rem', color: '#cbd5e1', lineHeight: 1.75, margin: 0 }}>
            {result.executive_summary}
          </p>
        </RC>
      )}

      {/* Conversion Diagnosis */}
      {result.conversion_diagnosis && (
        <RC>
          <SL>Conversion Diagnosis</SL>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}>
            {(['attention', 'trust', 'clarity', 'conversion'] as const).map(key => (
              <div key={key} style={{
                padding: '0.875rem 1rem',
                borderRadius: '0.625rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  fontSize: '0.625rem', fontWeight: 700, color: '#a3e635',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem',
                }}>
                  {key}
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  {result.conversion_diagnosis[key]}
                </p>
              </div>
            ))}
          </div>
        </RC>
      )}

      {/* Weak Points */}
      {Array.isArray(result.weak_points) && result.weak_points.length > 0 && (
        <RC>
          <SL>Weak Points ({result.weak_points.length})</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.weak_points.map((wp, i) => (
              <div key={i} style={{
                padding: '1rem',
                borderRadius: '0.625rem',
                background: 'rgba(248,113,113,0.04)',
                border: '1px solid rgba(248,113,113,0.1)',
              }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{
                    padding: '0.1875rem 0.5625rem',
                    borderRadius: '99px',
                    background: 'rgba(248,113,113,0.12)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: '#f87171',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {wp.area}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#f1f5f9', fontWeight: 600, margin: '0 0 0.375rem', lineHeight: 1.5 }}>
                  {wp.issue}
                </p>
                {wp.impact && (
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 0.375rem', lineHeight: 1.5 }}>
                    <span style={{ color: '#fbbf24', fontWeight: 600 }}>Impact: </span>{wp.impact}
                  </p>
                )}
                {wp.fix && (
                  <p style={{ fontSize: '0.8125rem', color: '#a3e635', margin: 0, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600 }}>Fix: </span>{wp.fix}
                  </p>
                )}
              </div>
            ))}
          </div>
        </RC>
      )}

      {/* Improved Title */}
      {result.improved_title && (
        <RC>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.75rem',
          }}>
            <SL>Improved Title</SL>
            <CopyButton text={result.improved_title} />
          </div>
          <div style={{
            padding: '0.875rem 1rem',
            borderRadius: '0.625rem',
            background: 'rgba(163,230,53,0.04)',
            border: '1px solid rgba(163,230,53,0.12)',
          }}>
            <p style={{ fontSize: '0.9375rem', color: '#f1f5f9', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
              {result.improved_title}
            </p>
          </div>
          {result.title_analysis?.strategy && (
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.625rem 0 0', lineHeight: 1.55 }}>
              {result.title_analysis.strategy}
            </p>
          )}
        </RC>
      )}

      {/* Improved Bullet Points */}
      {Array.isArray(result.improved_bullets) && result.improved_bullets.length > 0 && (
        <RC>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.875rem',
          }}>
            <SL>Improved Bullet Points</SL>
            <CopyButton text={result.improved_bullets.join('\n')} label="Copy All" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.improved_bullets.map((bullet, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem 0.875rem',
                borderRadius: '0.5rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(163,230,53,0.1)',
                  border: '1px solid rgba(163,230,53,0.2)',
                  color: '#a3e635',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
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
        </RC>
      )}

      {/* Improved Description */}
      {result.improved_description && (
        <RC>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.75rem',
          }}>
            <SL>Improved Description</SL>
            <CopyButton text={result.improved_description} />
          </div>
          <div style={{
            padding: '0.875rem 1rem',
            borderRadius: '0.625rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
              {result.improved_description}
            </p>
          </div>
        </RC>
      )}

      {/* Keyword Opportunities */}
      {Array.isArray(result.keyword_opportunities) && result.keyword_opportunities.length > 0 && (
        <RC>
          <SL>Keyword Opportunities ({result.keyword_opportunities.length})</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.keyword_opportunities.map((kw, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{
                  padding: '0.1875rem 0.625rem',
                  borderRadius: '99px',
                  background: 'rgba(163,230,53,0.08)',
                  border: '1px solid rgba(163,230,53,0.18)',
                  color: '#a3e635',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}>
                  {kw.keyword}
                </span>
                <span style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  {kw.reason}
                </span>
              </div>
            ))}
          </div>
        </RC>
      )}

      {/* Review Insights */}
      {Array.isArray(result.review_insights) && result.review_insights.length > 0 && (
        <RC>
          <SL>Review Insights ({result.review_insights.length})</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.review_insights.map((ri, i) => (
              <div key={i} style={{
                padding: '0.875rem 1rem',
                borderRadius: '0.625rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 0.375rem' }}>
                  {ri.signal}
                </p>
                {ri.what_it_means && (
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 0.375rem', lineHeight: 1.5 }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Means: </span>{ri.what_it_means}
                  </p>
                )}
                {ri.listing_fix && (
                  <p style={{ fontSize: '0.8125rem', color: '#a3e635', margin: 0, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600 }}>Fix: </span>{ri.listing_fix}
                  </p>
                )}
              </div>
            ))}
          </div>
        </RC>
      )}

      {/* Buyer Objections */}
      {Array.isArray(result.buyer_objections) && result.buyer_objections.length > 0 && (
        <RC>
          <SL>Buyer Objections ({result.buyer_objections.length})</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {result.buyer_objections.map((bo, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.625rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div>
                  <div style={{
                    fontSize: '0.625rem', fontWeight: 700, color: '#f97316',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem',
                  }}>
                    Objection
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: 0, lineHeight: 1.55 }}>
                    {bo.objection}
                  </p>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.625rem', fontWeight: 700, color: '#a3e635',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem',
                  }}>
                    How to Address
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: 0, lineHeight: 1.55 }}>
                    {bo.how_to_address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </RC>
      )}

      {/* A+ Content Ideas */}
      {Array.isArray(result.a_plus_content_ideas) && result.a_plus_content_ideas.length > 0 && (
        <RC>
          <SL>A+ Content Ideas ({result.a_plus_content_ideas.length})</SL>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {result.a_plus_content_ideas.map((idea, i) => (
              <div key={i} style={{
                padding: '0.875rem 1rem',
                borderRadius: '0.625rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.25rem' }}>
                  {idea.section}
                </div>
                {idea.purpose && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    {idea.purpose}
                  </div>
                )}
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0, lineHeight: 1.55 }}>
                  {idea.content_idea}
                </p>
              </div>
            ))}
          </div>
        </RC>
      )}

      {/* Image Pack Plan */}
      {Array.isArray(result.image_pack_plan) && result.image_pack_plan.length > 0 && (
        <RC>
          <SL>Image Pack Plan ({result.image_pack_plan.length} images)</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.image_pack_plan.map((img, i) => (
              <div key={i} style={{
                padding: '1rem',
                borderRadius: '0.625rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '0.1875rem 0.625rem',
                    borderRadius: '99px',
                    background: 'rgba(52,211,153,0.1)',
                    border: '1px solid rgba(52,211,153,0.2)',
                    color: '#34d399',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    Image {i + 1}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>
                    {img.image_type}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.625rem 1.25rem' }}>
                  {img.goal && (
                    <div>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Goal</div>
                      <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{img.goal}</p>
                    </div>
                  )}
                  {img.headline && (
                    <div>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Headline</div>
                      <p style={{ fontSize: '0.8125rem', color: '#a3e635', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{img.headline}</p>
                    </div>
                  )}
                  {img.visual_direction && (
                    <div>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Visual Direction</div>
                      <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{img.visual_direction}</p>
                    </div>
                  )}
                  {Array.isArray(img.text_elements) && img.text_elements.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Text Elements</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                        {img.text_elements.map((el, j) => (
                          <span key={j} style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            fontSize: '0.75rem',
                            color: '#64748b',
                          }}>{el}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </RC>
      )}

      {/* Priority Checklist */}
      {Array.isArray(result.priority_checklist) && result.priority_checklist.length > 0 && (
        <RC>
          <SL>Priority Checklist ({result.priority_checklist.length} items)</SL>
          <div>
            {result.priority_checklist.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                padding: '0.75rem 0',
                borderBottom: i < result.priority_checklist.length - 1
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none',
              }}>
                <PriorityBadge priority={item.priority} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', margin: '0 0 0.25rem', lineHeight: 1.4 }}>
                    {item.task}
                  </p>
                  {item.reason && (
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      {item.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </RC>
      )}

      {/* Image Studio CTA */}
      <div style={{
        borderRadius: '0.875rem',
        padding: '1.375rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(163,230,53,0.06), rgba(52,211,153,0.04))',
        border: '1px solid rgba(163,230,53,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, #166534, #4ade80)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Layers size={22} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <h3 style={{
            fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9',
            margin: '0 0 0.25rem', letterSpacing: '-0.02em',
          }}>
            Generate Image Pack
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Turn your audit insights into premium Amazon-ready visuals.
          </p>
        </div>
        <Link
          to="/dashboard/image-studio"
          className="btn-primary glow-button"
          style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem' }}
        >
          <Zap size={14} />
          Image Studio
        </Link>
      </div>

    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────

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
          padding: '0.875rem 1rem',
          borderRadius: '0.625rem',
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.16)',
          fontSize: '0.875rem',
          color: '#fca5a5',
        }}>
          {error ?? 'Audit not found.'}
        </div>
      </div>
    )
  }

  const pageWidth = audit.status === 'completed' && audit.result ? 860 : 700

  return (
    <div style={{ maxWidth: pageWidth }}>
      {backLink}

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.625rem',
          flexWrap: 'wrap',
        }}>
          <StatusBadge status={audit.status} />
          <span style={{ fontSize: '0.75rem', color: '#475569' }}>
            {audit.entry_type === 'amazon_url' ? 'Amazon URL' : 'Product Photos'}
            {' · '}
            {formatDate(audit.created_at)}
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.25rem, 3vw, 1.625rem)',
          fontWeight: 900,
          color: '#f1f5f9',
          letterSpacing: '-0.03em',
          margin: 0,
        }}>
          {audit.product_name || 'Untitled Audit'}
        </h1>
        {audit.category && (
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.375rem 0 0' }}>
            {audit.category}
          </p>
        )}
        {audit.amazon_url && (
          <a
            href={audit.amazon_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3125rem',
              fontSize: '0.8125rem',
              color: '#475569',
              textDecoration: 'none',
              marginTop: '0.375rem',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a3e635')}
            onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
          >
            <ExternalLink size={12} />
            View on Amazon
          </a>
        )}
      </div>

      {/* Pending / loading state */}
      {audit.status === 'pending_analysis' && (
        <div style={{
          borderRadius: '0.875rem',
          padding: '3rem 2rem',
          background: 'rgba(163,230,53,0.03)',
          border: '1px solid rgba(163,230,53,0.1)',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
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

      {/* Failed state */}
      {audit.status === 'failed' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            padding: '1.25rem 1.375rem',
            borderRadius: '0.875rem',
            background: 'rgba(248,113,113,0.05)',
            border: '1px solid rgba(248,113,113,0.15)',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f87171', marginBottom: '0.25rem' }}>
                  Analysis failed
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  The AI analysis could not complete. This may be due to a temporary service issue.
                </p>
              </div>
            </div>
          </div>
          {submitError && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.625rem',
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.16)',
              fontSize: '0.8125rem',
              color: '#fca5a5',
              marginBottom: '1rem',
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
              <RefreshCw
                size={14}
                style={{ animation: submitting ? 'spin 1s linear infinite' : 'none' }}
              />
              {submitting ? 'Analyzing...' : 'Try Again'}
            </button>
            <Link
              to="/dashboard/new-audit"
              className="btn-secondary"
              style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem' }}
            >
              New Audit
            </Link>
          </div>
        </div>
      )}

      {/* Draft / ready — submit for analysis */}
      {(audit.status === 'draft' || audit.status === 'ready_for_analysis') && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          background: 'rgba(163,230,53,0.04)',
          border: '1px solid rgba(163,230,53,0.12)',
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
              padding: '0.625rem 0.875rem',
              borderRadius: '0.5rem',
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.16)',
              fontSize: '0.8125rem',
              color: '#fca5a5',
              marginBottom: '0.75rem',
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
      {audit.status === 'completed' && audit.result ? (
        <AuditReport
          result={audit.result}
          audit={audit}
          onRegenerate={handleRegenerate}
          regenerating={regenerating}
          regenError={regenError}
        />
      ) : audit.status === 'completed' && !audit.result ? (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          background: 'rgba(251,191,36,0.05)',
          border: '1px solid rgba(251,191,36,0.15)',
          fontSize: '0.875rem',
          color: '#fbbf24',
        }}>
          Analysis completed but report data is missing. Try regenerating.
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{
              marginLeft: '0.75rem',
              background: 'transparent',
              border: 'none',
              color: '#a3e635',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textDecoration: 'underline',
            }}
          >
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      ) : null}

      {/* Bottom CTAs for non-completed states */}
      {audit.status !== 'completed' && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <Link
            to="/dashboard"
            className="btn-secondary"
            style={{ padding: '0.6875rem 1.25rem', fontSize: '0.875rem' }}
          >
            <ArrowLeft size={14} />
            Dashboard
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
      )}
    </div>
  )
}
