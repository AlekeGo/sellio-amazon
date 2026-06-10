import { FileText, Loader2, Zap } from 'lucide-react'
import type { ImagePackPlanItem } from '../../types/audit'
import type { ImageGeneration } from '../../types/imageGeneration'

interface Props {
  item: ImagePackPlanItem
  index: number
  selected: boolean
  onSelect: () => void
  generation?: ImageGeneration
  isGenerating: boolean
  onGenerate: () => void
}

const GRADIENTS = [
  'linear-gradient(135deg, #166534, #4ade80)',
  'linear-gradient(135deg, #065f46, #34d399)',
  'linear-gradient(135deg, #14532d, #22c55e)',
  'linear-gradient(135deg, #3f6212, #a3e635)',
  'linear-gradient(135deg, #166534, #4ade80)',
  'linear-gradient(135deg, #065f46, #34d399)',
]

function cardStatusBadge(gen?: ImageGeneration, generating?: boolean) {
  if (generating) return { label: 'Generating', c: '#fbbf24', bg: 'rgba(251,191,36,0.08)', bd: 'rgba(251,191,36,0.22)' }
  if (!gen) return { label: 'Planned', c: 'var(--dp-primary)', bg: 'rgba(163,230,53,0.07)', bd: 'rgba(83,58,253,0.18)' }
  if (gen.status === 'completed') return { label: 'Generated', c: '#34d399', bg: 'rgba(52,211,153,0.08)', bd: 'rgba(52,211,153,0.2)' }
  if (gen.status === 'failed') return { label: 'Failed', c: '#f87171', bg: 'rgba(248,113,113,0.07)', bd: 'rgba(248,113,113,0.18)' }
  return { label: 'Planned', c: 'var(--dp-primary)', bg: 'rgba(163,230,53,0.07)', bd: 'rgba(83,58,253,0.18)' }
}

function genButtonLabel(gen?: ImageGeneration, generating?: boolean) {
  if (generating) return 'Generating...'
  if (gen?.status === 'failed') return 'Retry'
  if (gen?.status === 'completed') return 'Re-generate'
  return 'Generate Image'
}

export default function ImagePackCard({
  item, index, selected, onSelect,
  generation, isGenerating, onGenerate,
}: Props) {
  const badge = cardStatusBadge(generation, isGenerating)

  return (
    <div
      onClick={onSelect}
      style={{
        borderRadius: '0.875rem', padding: '1.25rem',
        background: selected ? 'rgba(163,230,53,0.035)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${selected ? 'rgba(163,230,53,0.3)' : 'rgba(196,188,255,0.40)'}`,
        transition: 'all 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(196,188,255,0.40)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.875rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '0.5rem',
          background: GRADIENTS[index % GRADIENTS.length],
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>{index + 1}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.9375rem', fontWeight: 700, color: 'var(--dp-ink)',
            lineHeight: 1.3, letterSpacing: '-0.01em',
          }}>
            {item.image_type}
          </div>
          {item.goal && (
            <div style={{
              fontSize: '0.75rem', color: 'var(--dp-ink-muted)', marginTop: 2, lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {item.goal}
            </div>
          )}
        </div>
        <span style={{
          padding: '0.1875rem 0.5rem', borderRadius: '99px',
          background: badge.bg, border: `1px solid ${badge.bd}`,
          fontSize: '0.5625rem', fontWeight: 700, color: badge.c,
          textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          {badge.label}
        </span>
      </div>

      {item.headline && (
        <div style={{
          padding: '0.5625rem 0.875rem', borderRadius: '0.5rem',
          background: 'rgba(163,230,53,0.04)', border: '1px solid rgba(83,58,253,0.1)',
          marginBottom: '0.875rem',
        }}>
          <span style={{
            fontSize: '0.8125rem', fontWeight: 700, color: 'var(--dp-primary)',
            letterSpacing: '-0.01em', wordBreak: 'break-word',
          }}>
            &ldquo;{item.headline}&rdquo;
          </span>
        </div>
      )}

      {item.visual_direction && (
        <div style={{
          fontSize: '0.75rem', color: 'var(--dp-ink-muted)', lineHeight: 1.55,
          marginBottom: '0.875rem',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {item.visual_direction}
        </div>
      )}

      {Array.isArray(item.text_elements) && item.text_elements.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3125rem', marginBottom: '1rem' }}>
          {item.text_elements.slice(0, 4).map((el, j) => (
            <span key={j} style={{
              padding: '0.1875rem 0.5625rem', borderRadius: '0.3125rem',
              background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.13)',
              fontSize: '0.6875rem', color: '#6b7280',
            }}>
              {el}
            </span>
          ))}
          {item.text_elements.length > 4 && (
            <span style={{
              padding: '0.1875rem 0.5625rem', borderRadius: '0.3125rem',
              background: 'rgba(83,58,253,0.04)', border: '1px solid rgba(196,188,255,0.40)',
              fontSize: '0.6875rem', color: 'var(--dp-ink-muted)',
            }}>
              +{item.text_elements.length - 4} more
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onSelect() }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
            padding: '0.4375rem 0.875rem', borderRadius: '0.4375rem',
            background: selected ? 'var(--dp-primary)' : 'rgba(83,58,253,0.08)',
            border: `1px solid ${selected ? 'var(--dp-primary)' : 'rgba(163,230,53,0.22)'}`,
            color: selected ? '#071008' : 'var(--dp-primary)',
            fontSize: '0.8125rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
        >
          <FileText size={12} />
          {selected ? 'Brief Open' : 'Prepare Brief'}
        </button>

        <button
          type="button"
          disabled={isGenerating}
          onClick={e => { e.stopPropagation(); onGenerate() }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
            padding: '0.4375rem 0.875rem', borderRadius: '0.4375rem',
            background: isGenerating
              ? 'rgba(163,230,53,0.035)'
              : generation?.status === 'failed'
              ? 'rgba(248,113,113,0.07)'
              : 'rgba(163,230,53,0.09)',
            border: isGenerating
              ? '1px solid rgba(83,58,253,0.1)'
              : generation?.status === 'failed'
              ? '1px solid rgba(248,113,113,0.2)'
              : '1px solid rgba(163,230,53,0.25)',
            color: isGenerating
              ? 'rgba(163,230,53,0.45)'
              : generation?.status === 'failed'
              ? '#f87171'
              : 'var(--dp-primary)',
            fontSize: '0.8125rem', fontWeight: 600,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          {isGenerating
            ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
            : <Zap size={12} />
          }
          {genButtonLabel(generation, isGenerating)}
        </button>
      </div>
    </div>
  )
}
