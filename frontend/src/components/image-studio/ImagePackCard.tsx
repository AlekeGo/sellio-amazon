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
  'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)',
  'linear-gradient(135deg, #533AFD 0%, #7C6FFF 100%)',
  'linear-gradient(135deg, #7C6FFF 0%, #9B8FFF 100%)',
  'linear-gradient(135deg, #4B35F0 0%, #6A55FE 100%)',
  'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)',
  'linear-gradient(135deg, #533AFD 0%, #7C6FFF 100%)',
]

function cardStatusBadge(gen?: ImageGeneration, generating?: boolean) {
  if (generating) return { label: 'Generating', c: '#B7791F', bg: 'rgba(183,121,31,0.08)', bd: 'rgba(183,121,31,0.22)' }
  if (!gen) return { label: 'Planned', c: 'var(--dp-primary)', bg: 'rgba(83,58,253,0.07)', bd: 'rgba(83,58,253,0.18)' }
  if (gen.status === 'completed') return { label: 'Generated', c: '#2F9E6F', bg: 'rgba(47,158,111,0.08)', bd: 'rgba(47,158,111,0.22)' }
  if (gen.status === 'failed') return { label: 'Failed', c: '#C2413A', bg: 'rgba(194,65,58,0.07)', bd: 'rgba(194,65,58,0.18)' }
  return { label: 'Planned', c: 'var(--dp-primary)', bg: 'rgba(83,58,253,0.07)', bd: 'rgba(83,58,253,0.18)' }
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
        background: selected ? 'rgba(83,58,253,0.05)' : '#ffffff',
        border: `1px solid ${selected ? 'rgba(83,58,253,0.35)' : 'rgba(196,188,255,0.40)'}`,
        boxShadow: selected ? '0 0 0 3px rgba(83,58,253,0.08)' : '0 2px 8px rgba(83,58,253,0.04)',
        transition: 'all 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(83,58,253,0.3)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(83,58,253,0.08)' } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(196,188,255,0.40)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(83,58,253,0.04)' } }}
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
          background: 'rgba(238,240,255,0.6)', border: '1px solid rgba(196,188,255,0.4)',
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
              background: 'rgba(238,240,255,0.6)', border: '1px solid rgba(196,188,255,0.35)',
              fontSize: '0.6875rem', color: 'var(--dp-ink-muted)',
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
            background: selected ? 'var(--dp-primary)' : 'rgba(83,58,253,0.07)',
            border: `1px solid ${selected ? 'var(--dp-primary)' : 'rgba(83,58,253,0.22)'}`,
            color: selected ? '#ffffff' : 'var(--dp-primary)',
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
              ? 'rgba(83,58,253,0.03)'
              : generation?.status === 'failed'
              ? 'rgba(194,65,58,0.07)'
              : 'rgba(83,58,253,0.07)',
            border: isGenerating
              ? '1px solid rgba(83,58,253,0.1)'
              : generation?.status === 'failed'
              ? '1px solid rgba(194,65,58,0.2)'
              : '1px solid rgba(83,58,253,0.22)',
            color: isGenerating
              ? 'rgba(83,58,253,0.4)'
              : generation?.status === 'failed'
              ? '#C2413A'
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
