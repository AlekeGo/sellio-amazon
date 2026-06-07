import { useState } from 'react'
import { Copy, Check, Layers } from 'lucide-react'
import type { ImagePackPlanItem } from '../../types/audit'

const GRADIENTS = [
  'linear-gradient(135deg, #166534, #4ade80)',
  'linear-gradient(135deg, #065f46, #34d399)',
  'linear-gradient(135deg, #14532d, #22c55e)',
  'linear-gradient(135deg, #3f6212, #a3e635)',
  'linear-gradient(135deg, #166534, #4ade80)',
  'linear-gradient(135deg, #065f46, #34d399)',
]

function buildPrompt(item: ImagePackPlanItem, productName: string, category: string): string {
  const lines = [
    `Create a premium Amazon-ready ${item.image_type} for "${productName}" in the ${category} category.`,
    '',
    `Goal: ${item.goal}`,
    `Headline: "${item.headline}"`,
    `Visual Direction: ${item.visual_direction}`,
    `Text Elements: ${item.text_elements.join(', ')}`,
  ]
  if (item.buyer_objection) lines.push(`Buyer Objection to Address: ${item.buyer_objection}`)
  if (item.suggested_layout) lines.push(`Suggested Layout: ${item.suggested_layout}`)
  lines.push('')
  lines.push(`Style: Clean product infographic, marketplace-ready composition, premium dark brand aesthetic, Amazon listing optimized, high-converting visual hierarchy.`)
  return lines.join('\n')
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: '0.5625rem', fontWeight: 700, color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.375rem',
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

interface Props {
  item: ImagePackPlanItem
  productName: string
  category: string
  index: number
}

export default function ImageBriefPanel({ item, productName, category, index }: Props) {
  const [copied, setCopied] = useState(false)
  const prompt = buildPrompt(item, productName, category)

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  return (
    <div style={{
      borderRadius: '0.875rem',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(163,230,53,0.2)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '1.125rem 1.375rem',
        background: 'rgba(163,230,53,0.03)',
        borderBottom: '1px solid rgba(163,230,53,0.11)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '0.5rem',
          background: GRADIENTS[index % GRADIENTS.length],
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Layers size={13} color="white" />
        </div>
        <div>
          <div style={{
            fontSize: '0.5625rem', fontWeight: 700, color: 'rgba(52,211,153,0.7)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 1,
          }}>
            Creative Brief
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            {item.image_type}
          </div>
        </div>
      </div>

      <div style={{ padding: '1.25rem 1.375rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FieldRow label="Goal">
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: 0, lineHeight: 1.65 }}>
            {item.goal}
          </p>
        </FieldRow>

        {item.headline && (
          <FieldRow label="Headline">
            <div style={{
              padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
              background: 'rgba(163,230,53,0.04)', border: '1px solid rgba(163,230,53,0.12)',
              fontSize: '0.9375rem', fontWeight: 700, color: '#a3e635',
              letterSpacing: '-0.01em', wordBreak: 'break-word',
            }}>
              &ldquo;{item.headline}&rdquo;
            </div>
          </FieldRow>
        )}

        <FieldRow label="Visual Direction">
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: 0, lineHeight: 1.65 }}>
            {item.visual_direction}
          </p>
        </FieldRow>

        {Array.isArray(item.text_elements) && item.text_elements.length > 0 && (
          <FieldRow label="Text Elements">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {item.text_elements.map((el, i) => (
                <span key={i} style={{
                  padding: '0.25rem 0.625rem', borderRadius: '0.375rem',
                  background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.14)',
                  fontSize: '0.75rem', color: '#94a3b8',
                }}>
                  {el}
                </span>
              ))}
            </div>
          </FieldRow>
        )}

        {item.buyer_objection && (
          <FieldRow label="Buyer Objection Addressed">
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: 0, lineHeight: 1.65 }}>
              {item.buyer_objection}
            </p>
          </FieldRow>
        )}

        {item.suggested_layout && (
          <FieldRow label="Suggested Layout">
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: 0, lineHeight: 1.65 }}>
              {item.suggested_layout}
            </p>
          </FieldRow>
        )}
      </div>

      <div style={{ margin: '0 1.375rem 1.375rem', borderRadius: '0.625rem', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{
          padding: '0.625rem 0.875rem',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
        }}>
          <span style={{
            fontSize: '0.5625rem', fontWeight: 700, color: '#6b7280',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Prompt Preview
          </span>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
              padding: '0.25rem 0.625rem', borderRadius: '0.375rem',
              background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${copied ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`,
              color: copied ? '#4ade80' : '#64748b',
              fontSize: '0.6875rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy Brief'}
          </button>
        </div>
        <div style={{ padding: '0.875rem 1rem', background: 'rgba(0,0,0,0.25)' }}>
          <pre style={{
            fontSize: '0.75rem', color: '#94a3b8', margin: 0,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            whiteSpace: 'pre-wrap', lineHeight: 1.75, wordBreak: 'break-word',
          }}>
            {prompt}
          </pre>
        </div>
      </div>
    </div>
  )
}
