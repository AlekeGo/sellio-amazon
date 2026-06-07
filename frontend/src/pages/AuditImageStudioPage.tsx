import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Zap, ArrowLeft } from 'lucide-react'
import { getAudit } from '../lib/auditsApi'
import type { AuditDetail, ImagePackPlanItem } from '../types/audit'
import ImageStudioHeader from '../components/image-studio/ImageStudioHeader'
import ImagePackCard from '../components/image-studio/ImagePackCard'
import ImageBriefPanel from '../components/image-studio/ImageBriefPanel'
import GeneratedImageSlots from '../components/image-studio/GeneratedImageSlots'

const DEFAULT_ITEMS: ImagePackPlanItem[] = [
  {
    image_type: 'Main Image Refresh',
    goal: 'Drive click-through with a clean, conversion-optimized hero image',
    headline: 'Stand Out on Page 1',
    visual_direction: 'White background, product centered, angles optimized for Amazon main image guidelines',
    text_elements: ['Product name', 'Key benefit callout', 'Size or quantity'],
  },
  {
    image_type: 'Benefit Infographic',
    goal: 'Communicate top benefits visually — no reading required',
    headline: 'Why Shoppers Choose This',
    visual_direction: 'Dark gradient background, icons and text callouts, product anchored in center',
    text_elements: ['Benefit 1', 'Benefit 2', 'Benefit 3', 'Benefit 4'],
  },
  {
    image_type: 'Comparison Graphic',
    goal: 'Disqualify alternatives and position your product as the obvious choice',
    headline: 'The Clear Difference',
    visual_direction: 'Side-by-side layout, green and red indicators, clean table format',
    text_elements: ['Your product', 'Competitor', 'Feature checklist'],
  },
  {
    image_type: 'How It Works Visual',
    goal: 'Remove confusion and show ease of use in 3–4 steps',
    headline: 'Simple. Fast. Effective.',
    visual_direction: 'Step-by-step numbered cards, product shown in use, progress flow',
    text_elements: ['Step 1', 'Step 2', 'Step 3', 'Result'],
  },
  {
    image_type: 'Lifestyle Visual',
    goal: 'Build emotional connection and show real-world product value',
    headline: 'Made for Your Life',
    visual_direction: 'Natural setting, product in use by target customer, warm brand tones',
    text_elements: ['Lifestyle context', 'Emotional hook'],
  },
  {
    image_type: 'A+ Banner Concept',
    goal: 'Premium A+ module to elevate brand trust and cross-sell',
    headline: 'Premium Quality, Trusted Brand',
    visual_direction: 'Full-width banner, brand colors, lifestyle imagery with feature callouts',
    text_elements: ['Brand tagline', 'Feature highlights', 'Trust signals'],
  },
]

function SL({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5625rem', marginBottom: '1rem' }}>
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

export default function AuditImageStudioPage() {
  const { id } = useParams<{ id: string }>()
  const [audit, setAudit] = useState<AuditDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    getAudit(Number(id))
      .then(res => setAudit(res.data))
      .catch(() => setError('Audit not found or you do not have access.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', fontSize: '0.875rem', color: '#475569' }}>
        Loading Image Studio...
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div style={{ maxWidth: 600 }}>
        <Link
          to="/dashboard/audits"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', marginBottom: '1.5rem',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
        >
          <ArrowLeft size={14} />
          Back to Audits
        </Link>
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

  const items: ImagePackPlanItem[] =
    Array.isArray(audit.result?.image_pack_plan) && audit.result.image_pack_plan.length > 0
      ? audit.result.image_pack_plan
      : DEFAULT_ITEMS

  const productName = audit.product_name || 'Your Product'
  const category = audit.category || 'Amazon Product'
  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null
  const totalCount = items.length

  const handleCardSelect = (i: number) => {
    setSelectedIndex(prev => (prev === i ? null : i))
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <ImageStudioHeader audit={audit} result={audit.result} />

      <div style={{
        borderRadius: '0.75rem', padding: '0.875rem 1.25rem',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '0.4375rem',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
              Image Pack Progress
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
              0 / {totalCount} generated
            </span>
          </div>
          <div className="score-bar-track">
            <div className="score-bar-fill" style={{ width: '0%' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {(['Planned', 'Ready for generation', 'Generated', 'Needs review'] as const).map(s => (
            <span key={s} style={{
              padding: '0.1875rem 0.5625rem', borderRadius: '99px',
              background: s === 'Planned' ? 'rgba(163,230,53,0.07)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${s === 'Planned' ? 'rgba(163,230,53,0.18)' : 'rgba(255,255,255,0.08)'}`,
              fontSize: '0.5625rem', fontWeight: 700,
              color: s === 'Planned' ? '#a3e635' : '#475569',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {audit.images && audit.images.length > 0 ? (
        <div style={{
          borderRadius: '0.75rem', padding: '1rem 1.25rem',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '1.5rem',
        }}>
          <SL>Reference Images — {audit.images.length} uploaded</SL>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {audit.images.map(img => (
              <div key={img.id} style={{
                width: 80, height: 80, borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.09)', overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)', flexShrink: 0,
              }}>
                <img
                  src={img.image}
                  alt={img.original_filename}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          borderRadius: '0.75rem', padding: '0.875rem 1.25rem',
          background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.07)',
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            No reference images — upload product photos in the audit report for best results.
          </span>
          <Link
            to={`/dashboard/audits/${audit.id}`}
            style={{
              fontSize: '0.8125rem', color: '#64748b', textDecoration: 'none',
              marginLeft: 'auto', whiteSpace: 'nowrap', transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
          >
            Upload in report →
          </Link>
        </div>
      )}

      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, lineHeight: 1.65 }}>
          Select an image type to view its creative brief and prompt. Image generation connects in Day 8.
        </p>
      </div>

      <div className="audit-studio-layout">
        <div>
          <SL>Image Pack — {items.length} types</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {items.map((item, i) => (
              <ImagePackCard
                key={i}
                item={item}
                index={i}
                selected={selectedIndex === i}
                onSelect={() => handleCardSelect(i)}
              />
            ))}
          </div>
        </div>

        <div style={{ position: 'sticky', top: '1.5rem' }}>
          {selectedItem !== null ? (
            <ImageBriefPanel
              item={selectedItem}
              productName={productName}
              category={category}
              index={selectedIndex!}
            />
          ) : (
            <div style={{
              borderRadius: '0.875rem', padding: '2.5rem 1.5rem',
              background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.07)',
              textAlign: 'center',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '0.875rem',
                background: 'rgba(163,230,53,0.05)', border: '1px solid rgba(163,230,53,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.125rem',
              }}>
                <Zap size={22} color="#a3e635" style={{ opacity: 0.5 }} />
              </div>
              <h3 style={{
                fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9',
                margin: '0 0 0.5rem', letterSpacing: '-0.02em',
              }}>
                Select an image type
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: 1.65 }}>
                Click <strong style={{ color: '#a3e635' }}>Prepare Brief</strong> on any card to see the detailed creative brief and prompt preview.
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{
        marginTop: '2rem', padding: '1.375rem',
        borderRadius: '0.875rem',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <GeneratedImageSlots />
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link
          to={`/dashboard/audits/${audit.id}`}
          className="btn-secondary"
          style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem' }}
        >
          <ArrowLeft size={14} />
          Back to Report
        </Link>
        <Link
          to="/dashboard"
          className="btn-secondary"
          style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem' }}
        >
          Dashboard
        </Link>
        <Link
          to="/dashboard/new-audit"
          className="btn-primary glow-button"
          style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem' }}
        >
          <Zap size={14} />
          Start New Audit
        </Link>
      </div>
    </div>
  )
}
