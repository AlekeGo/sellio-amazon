import { FileText, Clock } from 'lucide-react'
import type { ImagePackPlanItem } from '../../types/audit'

interface Props {
  item: ImagePackPlanItem
  index: number
  selected: boolean
  onSelect: () => void
}

const GRADIENTS = [
  'linear-gradient(135deg, #166534, #4ade80)',
  'linear-gradient(135deg, #065f46, #34d399)',
  'linear-gradient(135deg, #14532d, #22c55e)',
  'linear-gradient(135deg, #3f6212, #a3e635)',
  'linear-gradient(135deg, #166534, #4ade80)',
  'linear-gradient(135deg, #065f46, #34d399)',
]

export default function ImagePackCard({ item, index, selected, onSelect }: Props) {
  return (
    <div
      style={{
        borderRadius: '0.875rem', padding: '1.25rem',
        background: selected ? 'rgba(163,230,53,0.035)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${selected ? 'rgba(163,230,53,0.3)' : 'rgba(255,255,255,0.07)'}`,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
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
            fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9',
            lineHeight: 1.3, letterSpacing: '-0.01em',
          }}>
            {item.image_type}
          </div>
          {item.goal && (
            <div style={{
              fontSize: '0.75rem', color: '#64748b', marginTop: 2, lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {item.goal}
            </div>
          )}
        </div>
        <span style={{
          padding: '0.1875rem 0.5rem', borderRadius: '99px',
          background: 'rgba(163,230,53,0.07)', border: '1px solid rgba(163,230,53,0.18)',
          fontSize: '0.5625rem', fontWeight: 700, color: '#a3e635',
          textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          Planned
        </span>
      </div>

      {item.headline && (
        <div style={{
          padding: '0.5625rem 0.875rem', borderRadius: '0.5rem',
          background: 'rgba(163,230,53,0.04)', border: '1px solid rgba(163,230,53,0.1)',
          marginBottom: '0.875rem',
        }}>
          <span style={{
            fontSize: '0.8125rem', fontWeight: 700, color: '#a3e635',
            letterSpacing: '-0.01em', wordBreak: 'break-word',
          }}>
            &ldquo;{item.headline}&rdquo;
          </span>
        </div>
      )}

      {item.visual_direction && (
        <div style={{
          fontSize: '0.75rem', color: '#475569', lineHeight: 1.55,
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
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              fontSize: '0.6875rem', color: '#475569',
            }}>
              +{item.text_elements.length - 4} more
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onSelect}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
            padding: '0.4375rem 0.875rem', borderRadius: '0.4375rem',
            background: selected ? '#a3e635' : 'rgba(163,230,53,0.08)',
            border: `1px solid ${selected ? '#a3e635' : 'rgba(163,230,53,0.22)'}`,
            color: selected ? '#071008' : '#a3e635',
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
          disabled
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
            padding: '0.4375rem 0.875rem', borderRadius: '0.4375rem',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            color: '#475569', fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'not-allowed', fontFamily: 'inherit',
          }}
        >
          <Clock size={12} />
          Generate — Coming Day 8
        </button>
      </div>
    </div>
  )
}
