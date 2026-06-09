import { useState } from 'react'
import { Copy, Check, Layers, Zap, Loader2, Camera, AlertTriangle } from 'lucide-react'
import type { ImagePackPlanItem } from '../../types/audit'
import type { ImageGeneration, QualityOptions } from '../../types/imageGeneration'

const GRADIENTS = [
  'linear-gradient(135deg, #166534, #4ade80)',
  'linear-gradient(135deg, #065f46, #34d399)',
  'linear-gradient(135deg, #14532d, #22c55e)',
  'linear-gradient(135deg, #3f6212, #a3e635)',
  'linear-gradient(135deg, #166534, #4ade80)',
  'linear-gradient(135deg, #065f46, #34d399)',
]

const STYLE_DIRECTIONS = [
  { value: '', label: 'Default style' },
  { value: 'Premium ecommerce', label: 'Premium ecommerce' },
  { value: 'Clean Amazon infographic', label: 'Clean Amazon infographic' },
  { value: 'Luxury product ad', label: 'Luxury product ad' },
  { value: 'Minimal studio', label: 'Minimal studio' },
  { value: 'Bold conversion-focused', label: 'Bold conversion-focused' },
]

const BACKGROUND_PREFS = [
  { value: '', label: 'Default background' },
  { value: 'Clean light background', label: 'Clean light background' },
  { value: 'Dark premium background', label: 'Dark premium background' },
  { value: 'Soft gradient background', label: 'Soft gradient background' },
  { value: 'Lifestyle-inspired background', label: 'Lifestyle-inspired background' },
]

const TEXT_INTENSITIES = [
  { value: '', label: 'Default text' },
  { value: 'Minimal text', label: 'Minimal text' },
  { value: 'Balanced text', label: 'Balanced text' },
  { value: 'More explanatory text', label: 'More explanatory text' },
]

function buildPrompt(
  item: ImagePackPlanItem,
  productName: string,
  category: string,
  quality: QualityOptions,
  hasReference: boolean,
): string {
  const lines: string[] = []
  if (productName) lines.push(`Product: ${productName}`)
  if (category) lines.push(`Category: ${category}`)
  if (hasReference) {
    lines.push(
      'PRODUCT IDENTITY LOCK — REFERENCE IMAGE PROVIDED: ' +
      'The reference image shows the exact product to use. ' +
      'Preserve every visible detail from the reference image exactly: ' +
      'shape, packaging, silhouette, color, proportions, cap, lid, label placement, ' +
      'material finish, and all visible design details. ' +
      'Do not replace it with a generic product. ' +
      'Improve lighting, background, and composition only — keep the product identical.',
    )
  } else if (quality.productVisualDetails) {
    lines.push(
      `Product visual details: ${quality.productVisualDetails}. ` +
      'CRITICAL — preserve color, shape, packaging, label position, and materials exactly.',
    )
  }
  lines.push(`Image type: ${item.image_type}`)
  if (item.goal) lines.push(`Goal: ${item.goal}`)
  if (item.headline) lines.push(`Headline: "${item.headline}"`)
  if (item.visual_direction) lines.push(`Visual direction: ${item.visual_direction}`)
  if (item.text_elements?.length) lines.push(`Text elements: ${item.text_elements.join(', ')}`)
  if (item.buyer_objection) lines.push(`Buyer objection addressed: ${item.buyer_objection}`)
  if (item.suggested_layout) lines.push(`Suggested layout: ${item.suggested_layout}`)
  if (quality.styleDirection) lines.push(`Style direction: ${quality.styleDirection}`)
  if (quality.backgroundPreference) lines.push(`Background preference: ${quality.backgroundPreference}`)
  if (quality.textIntensity) lines.push(`Text intensity: ${quality.textIntensity}`)
  lines.push(
    'Style: Clean premium Amazon product infographic, marketplace-ready composition, ' +
    'high-quality studio lighting, modern premium design, high-converting visual hierarchy, ' +
    'readable text at all sizes, product as the main focus.',
  )
  lines.push(
    'Constraints: Preserve product color exactly. Preserve packaging shape exactly. ' +
    'Do not replace the product. No brand logos invented. No Amazon logo. ' +
    'No medical claims. No tiny unreadable text. No cluttered layout. ' +
    'No random extra products. Keep product as primary visual focus.',
  )
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

const selectStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#e2e8f0', fontSize: '0.8125rem',
  fontFamily: 'inherit', outline: 'none',
  appearance: 'none', WebkitAppearance: 'none',
  cursor: 'pointer',
}

interface Props {
  item: ImagePackPlanItem
  productName: string
  category: string
  index: number
  generation?: ImageGeneration
  isGenerating: boolean
  hasReference?: boolean
  onGenerate: (quality: QualityOptions) => void
}

export default function ImageBriefPanel({
  item, productName, category, index,
  generation, isGenerating, hasReference = false, onGenerate,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [quality, setQuality] = useState<QualityOptions>({
    productVisualDetails: '',
    styleDirection: '',
    backgroundPreference: '',
    textIntensity: '',
  })

  const prompt = buildPrompt(item, productName, category, quality, hasReference)

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  const generateLabel = isGenerating
    ? 'Generating Amazon-ready visual...'
    : generation?.status === 'failed'
    ? 'Retry Generation'
    : generation?.status === 'completed'
    ? 'Re-generate Image'
    : 'Generate Image'

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
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '0.5rem',
          background: GRADIENTS[index % GRADIENTS.length],
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Layers size={13} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
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
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
          padding: '0.25rem 0.5625rem', borderRadius: '99px', flexShrink: 0,
          background: hasReference ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${hasReference ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)'}`,
          fontSize: '0.5625rem', fontWeight: 700,
          color: hasReference ? '#34d399' : '#64748b',
          textTransform: 'uppercase' as const, letterSpacing: '0.07em',
        }}>
          <Camera size={9} />
          Photorealistic ecommerce mode
        </span>
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

      <div style={{
        margin: '0 1.375rem',
        padding: '1rem 1.125rem',
        borderRadius: '0.625rem',
        background: 'rgba(163,230,53,0.025)',
        border: '1px solid rgba(163,230,53,0.1)',
        marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.5625rem', fontWeight: 700, color: 'rgba(163,230,53,0.6)',
          textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.875rem',
        }}>
          Quality Controls
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <FieldRow label="Extra visual instruction — optional">
            <textarea
              value={quality.productVisualDetails}
              onChange={e => setQuality(q => ({ ...q, productVisualDetails: e.target.value }))}
              placeholder="e.g. yellow bottle, black cap, rectangular label, glossy plastic, supplement product"
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0', fontSize: '0.8125rem', lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(163,230,53,0.35)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
            <div style={{ fontSize: '0.6875rem', color: '#475569', marginTop: '0.375rem', lineHeight: 1.5 }}>
              Sellio already builds the prompt from your product and audit. Use this only for extra style or layout direction.
            </div>
          </FieldRow>

          <FieldRow label="Style direction">
            <select
              value={quality.styleDirection}
              onChange={e => setQuality(q => ({ ...q, styleDirection: e.target.value }))}
              style={selectStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(163,230,53,0.35)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              {STYLE_DIRECTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#0a1510' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Background">
            <select
              value={quality.backgroundPreference}
              onChange={e => setQuality(q => ({ ...q, backgroundPreference: e.target.value }))}
              style={selectStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(163,230,53,0.35)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              {BACKGROUND_PREFS.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#0a1510' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Text intensity">
            <select
              value={quality.textIntensity}
              onChange={e => setQuality(q => ({ ...q, textIntensity: e.target.value }))}
              style={selectStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(163,230,53,0.35)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              {TEXT_INTENSITIES.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#0a1510' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </FieldRow>
        </div>
      </div>

      <div style={{ margin: '0 1.375rem', borderRadius: '0.625rem', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
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

      <div style={{ padding: '1rem 1.375rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4375rem',
          padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
          background: hasReference ? 'rgba(52,211,153,0.04)' : 'rgba(251,191,36,0.04)',
          border: `1px solid ${hasReference ? 'rgba(52,211,153,0.14)' : 'rgba(251,191,36,0.16)'}`,
        }}>
          {hasReference
            ? <Camera size={12} color="#34d399" style={{ flexShrink: 0 }} />
            : <AlertTriangle size={12} color="rgba(251,191,36,0.7)" style={{ flexShrink: 0 }} />
          }
          <span style={{ fontSize: '0.75rem', color: hasReference ? '#34d399' : '#fbbf24', lineHeight: 1.5 }}>
            {hasReference
              ? 'Your product photo will be used as the visual reference.'
              : 'No reference photo detected. Result may be less accurate.'
            }
          </span>
        </div>

        {generation?.status === 'failed' && (
          <div style={{
            padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
            fontSize: '0.8125rem', color: '#fca5a5', lineHeight: 1.5,
          }}>
            {hasReference
              ? 'Reference image generation failed. Please try again or re-upload a clear product photo.'
              : 'Image generation failed. Please try again.'
            }
            {generation.error_message && (
              <div style={{ fontSize: '0.6875rem', color: 'rgba(248,113,113,0.65)', marginTop: '0.3125rem' }}>
                {generation.error_message.length > 120
                  ? generation.error_message.slice(0, 117) + '…'
                  : generation.error_message
                }
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={isGenerating}
          onClick={() => onGenerate(quality)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '0.6875rem 1.25rem', borderRadius: '0.5rem', width: '100%',
            background: isGenerating ? 'rgba(163,230,53,0.06)' : '#a3e635',
            border: 'none',
            color: isGenerating ? 'rgba(163,230,53,0.55)' : '#071008',
            fontSize: '0.875rem', fontWeight: 700,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'all 0.15s',
            boxShadow: isGenerating ? 'none' : '0 4px 16px rgba(163,230,53,0.2)',
          }}
        >
          {isGenerating
            ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            : <Zap size={15} style={{ flexShrink: 0 }} />
          }
          {generateLabel}
        </button>

        {generation?.status === 'completed' && generation.image_url && (
          <div style={{
            borderRadius: '0.5rem', overflow: 'hidden',
            border: '1px solid rgba(52,211,153,0.18)',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <img
              src={generation.image_url}
              alt={item.image_type}
              style={{ width: '100%', display: 'block', maxHeight: 200, objectFit: 'contain' }}
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  )
}
