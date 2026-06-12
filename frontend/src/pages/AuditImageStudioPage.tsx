import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Zap, ArrowLeft, Package } from 'lucide-react'
import { getAudit } from '../lib/auditsApi'
import {
  listImageGenerations, createImageGeneration,
  deleteImageGeneration, regenerateImageGeneration,
} from '../lib/imageGenerationsApi'
import { getMyBilling } from '../lib/billingApi'
import type { AuditDetail, ImagePackPlanItem } from '../types/audit'
import type { ImageGeneration, QualityOptions } from '../types/imageGeneration'
import type { BillingMeResponse } from '../types/billing'
import ImageStudioHeader from '../components/image-studio/ImageStudioHeader'
import ImagePackCard from '../components/image-studio/ImagePackCard'
import ImageBriefPanel from '../components/image-studio/ImageBriefPanel'
import GeneratedImageSlots from '../components/image-studio/GeneratedImageSlots'
import ProductReferenceStatus from '../components/image-studio/ProductReferenceStatus'
import PaywallBlock from '../components/ui/PaywallBlock'

const DEFAULT_ITEMS: ImagePackPlanItem[] = [
  {
    image_type: 'Hero Shot',
    goal: 'Drive click-through with a compelling main image that wins the first impression',
    headline: 'The Product, Front and Center',
    visual_direction: 'Pure white background, product centered and angled for maximum impact, studio-quality lighting that highlights shape and finish',
    text_elements: ['Product name', 'Key differentiator', 'Size or quantity badge'],
  },
  {
    image_type: 'Lifestyle Image',
    goal: 'Build emotional connection and show real-world product value in context',
    headline: 'Made for Real Life',
    visual_direction: 'Natural setting showing product in use by target customer, warm authentic tones, relatable environment',
    text_elements: ['Lifestyle moment', 'Who it\'s for', 'Emotional hook'],
  },
  {
    image_type: 'Infographic / Key Benefits',
    goal: 'Communicate top benefits visually — no reading required',
    headline: 'Why Shoppers Choose This',
    visual_direction: 'Clean gradient background, product anchored in center, 4–5 benefit callouts with icons, bold typography',
    text_elements: ['Benefit 1', 'Benefit 2', 'Benefit 3', 'Benefit 4', 'Benefit 5'],
  },
  {
    image_type: 'Size & Dimensions',
    goal: 'Remove size uncertainty and prevent returns with precise visual measurements',
    headline: 'Exactly the Right Fit',
    visual_direction: 'Clean background with dimension lines and measurements, product shown next to familiar scale reference object',
    text_elements: ['Width', 'Height', 'Depth / Weight', 'Scale comparison'],
  },
  {
    image_type: 'Feature Breakdown',
    goal: 'Highlight product features with close-up callouts and precise detail shots',
    headline: 'Built Better. Every Detail.',
    visual_direction: 'Dark or neutral background, feature callout arrows or zoom circles, technical yet approachable layout',
    text_elements: ['Feature 1', 'Feature 2', 'Feature 3', 'Material / Quality note'],
  },
  {
    image_type: 'Comparison Image',
    goal: 'Disqualify alternatives and position your product as the obvious choice',
    headline: 'The Clear Difference',
    visual_direction: 'Side-by-side layout with checkmarks and X marks, clean table-style format, your product column highlighted',
    text_elements: ['Your product', 'Generic alternative', 'Comparison point 1', 'Comparison point 2'],
  },
  {
    image_type: 'Problem → Solution',
    goal: 'Show the pain point this product solves and the transformation it delivers',
    headline: 'From Frustration to Fixed',
    visual_direction: 'Split layout: problem state on left in muted tones, solution state on right bright and positive',
    text_elements: ['The problem', 'The solution', 'The result', 'Call to action phrase'],
  },
  {
    image_type: 'Gift & Use Case',
    goal: 'Position product as an ideal gift and showcase gifting occasions and recipients',
    headline: 'The Gift They\'ll Actually Love',
    visual_direction: 'Warm inviting setting with gifting context, occasion tags, happy recipient if applicable',
    text_elements: ['Who it\'s for', 'Gifting occasion', 'Recipient benefit', 'Occasion tags'],
  },
]

const DEFAULT_QUALITY: { productVisualDetails: string; styleDirection: string; backgroundPreference: string; textIntensity: string } = {
  productVisualDetails: '',
  styleDirection: '',
  backgroundPreference: '',
  textIntensity: '',
}

function SL({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5625rem', marginBottom: '1rem' }}>
      <div style={{
        width: 3, height: 14, borderRadius: 2,
        background: 'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)', flexShrink: 0,
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

  const [generations, setGenerations] = useState<ImageGeneration[]>([])
  const [generatingTypes, setGeneratingTypes] = useState<Set<string>>(new Set())
  const [regeneratingIds, setRegeneratingIds] = useState<Set<number>>(new Set())
  const [billing, setBilling] = useState<BillingMeResponse | null>(null)
  const [imagePaywall, setImagePaywall] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getAudit(Number(id)),
      listImageGenerations(Number(id)),
    ])
      .then(([auditRes, genRes]) => {
        setAudit(auditRes.data)
        setGenerations(genRes.data)
      })
      .catch(() => setError('Audit not found or you do not have access.'))
      .finally(() => setLoading(false))
    getMyBilling().then(res => setBilling(res.data)).catch(() => {})
  }, [id])

  function normalizeType(t: string) {
    return t.toLowerCase().replace(/\s+/g, ' ').trim()
  }

  // Keep newest generation per type (generations are prepended on creation, so newest is first)
  const genByNormalizedType = new Map<string, ImageGeneration>()
  for (const g of generations) {
    const key = normalizeType(g.image_type)
    if (!genByNormalizedType.has(key)) genByNormalizedType.set(key, g)
  }

  function getGenForItem(itemType: string) {
    return genByNormalizedType.get(normalizeType(itemType))
  }

  function mergeWithDefaults(defaults: ImagePackPlanItem[], aiItems: ImagePackPlanItem[]): ImagePackPlanItem[] {
    if (!aiItems.length) return defaults
    const aiByType = new Map(aiItems.map(item => [normalizeType(item.image_type), item]))
    return defaults.map(def => {
      const ai = aiByType.get(normalizeType(def.image_type))
      return ai ? { ...def, ...ai, image_type: def.image_type } : def
    })
  }

  async function handleGenerate(item: ImagePackPlanItem, quality: QualityOptions) {
    if (!audit || generatingTypes.has(item.image_type)) return

    setGeneratingTypes(prev => new Set([...prev, item.image_type]))

    try {
      const res = await createImageGeneration({
        audit_id: audit.id,
        image_type: item.image_type,
        brief: {
          goal: item.goal,
          headline: item.headline,
          visual_direction: item.visual_direction,
          text_elements: item.text_elements,
          buyer_objection: item.buyer_objection,
          suggested_layout: item.suggested_layout,
        },
        product_visual_details: quality.productVisualDetails,
        style_direction: quality.styleDirection,
        background_preference: quality.backgroundPreference,
        text_intensity: quality.textIntensity,
      })
      setGenerations(prev => [res.data, ...prev])
    } catch (err: unknown) {
      const httpStatus = (err as { response?: { status?: number } })?.response?.status
      if (httpStatus === 402) {
        setImagePaywall(true)
        return
      }
      const apiErr = err as { response?: { data?: { generation?: ImageGeneration } } }
      const failedGen = apiErr?.response?.data?.generation
      if (failedGen) {
        setGenerations(prev => [failedGen, ...prev])
      }
    } finally {
      setGeneratingTypes(prev => {
        const next = new Set(prev)
        next.delete(item.image_type)
        return next
      })
    }
  }

  async function handleDelete(genId: number) {
    try {
      await deleteImageGeneration(genId)
      setGenerations(prev => prev.filter(g => g.id !== genId))
    } catch {
    }
  }

  async function handleRegenerate(genId: number) {
    const orig = generations.find(g => g.id === genId)
    if (!orig) return

    setRegeneratingIds(prev => new Set([...prev, genId]))

    try {
      const res = await regenerateImageGeneration(genId)
      setGenerations(prev => [res.data, ...prev])
    } catch (err: unknown) {
      const httpStatus = (err as { response?: { status?: number } })?.response?.status
      if (httpStatus === 402) {
        setImagePaywall(true)
        return
      }
      const apiErr = err as { response?: { data?: { generation?: ImageGeneration } } }
      const failedGen = apiErr?.response?.data?.generation
      if (failedGen) {
        setGenerations(prev => [failedGen, ...prev])
      }
    } finally {
      setRegeneratingIds(prev => {
        const next = new Set(prev)
        next.delete(genId)
        return next
      })
    }
  }

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
            fontSize: '0.875rem', color: 'var(--dp-ink-muted)', textDecoration: 'none', marginBottom: '1.5rem',
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

  // Always show all 8 default types; merge in AI-generated brief details where type names match
  const items: ImagePackPlanItem[] = mergeWithDefaults(
    DEFAULT_ITEMS,
    Array.isArray(audit.result?.image_pack_plan) ? audit.result.image_pack_plan : [],
  )

  const productName = audit.product_name || 'Your Product'
  const category = audit.category || 'Amazon Product'
  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null
  const totalCount = items.length
  const completedTypeSet = new Set(
    generations.filter(g => g.status === 'completed').map(g => normalizeType(g.image_type)),
  )
  const completedCount = completedTypeSet.size
  const progressPct = totalCount > 0 ? Math.min((completedCount / totalCount) * 100, 100) : 0

  const handleCardSelect = (i: number) => {
    setSelectedIndex(prev => (prev === i ? null : i))
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <ImageStudioHeader audit={audit} result={audit.result} />

      {(imagePaywall || (billing && !billing.can_generate_image)) && (
        <div style={{ marginBottom: '1.5rem' }}>
          <PaywallBlock
            title="You need image generation credits to create more visuals."
            subtitle="Each generation uses 1 credit. Choose a plan to get more image credits."
            creditsLine="Current credits: 0 image generations remaining"
            primaryCta={{ label: 'Manage Billing', to: '/dashboard/billing' }}
            secondaryCta={{ label: 'View Plans', to: '/dashboard/billing#billing-plans' }}
          />
        </div>
      )}

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
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dp-ink-muted)' }}>
              Image Pack Progress
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
              {completedCount} / {totalCount} generated
            </span>
          </div>
          <div className="score-bar-track">
            <div className="score-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {billing && billing.balance.full_upgrade_credits > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
              padding: '0.25rem 0.625rem', borderRadius: '99px',
              background: 'rgba(47,158,111,0.07)', border: '1px solid rgba(47,158,111,0.18)',
              fontSize: '0.6875rem', fontWeight: 700, color: '#2F9E6F',
            }}>
              <Package size={11} />
              Full Upgrade active — unlimited generations
            </span>
          )}
          {billing && billing.balance.full_upgrade_credits === 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
              padding: '0.25rem 0.625rem', borderRadius: '99px',
              background: billing.balance.image_generation_credits > 0
                ? 'rgba(83,58,253,0.07)'
                : 'rgba(239,68,68,0.07)',
              border: billing.balance.image_generation_credits > 0
                ? '1px solid rgba(83,58,253,0.18)'
                : '1px solid rgba(239,68,68,0.22)',
              fontSize: '0.6875rem', fontWeight: 700,
              color: billing.balance.image_generation_credits > 0 ? 'var(--dp-primary)' : '#ef4444',
            }}>
              <Package size={11} />
              {billing.balance.image_generation_credits > 0
                ? `${billing.balance.image_generation_credits} image credit${billing.balance.image_generation_credits !== 1 ? 's' : ''} remaining`
                : '0 image credits — upgrade to generate'
              }
            </span>
          )}
          {[
            { label: 'Planned', active: completedCount === 0 && generatingTypes.size === 0 },
            { label: 'Generating', active: generatingTypes.size > 0 },
            { label: 'Generated', active: completedCount > 0 },
          ].map(s => (
            <span key={s.label} style={{
              padding: '0.1875rem 0.5625rem', borderRadius: '99px',
              background: s.active ? 'rgba(83,58,253,0.07)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${s.active ? 'rgba(83,58,253,0.18)' : 'rgba(255,255,255,0.08)'}`,
              fontSize: '0.5625rem', fontWeight: 700,
              color: s.active ? '#533AFD' : '#475569',
              textTransform: 'uppercase' as const, letterSpacing: '0.05em',
            }}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <ProductReferenceStatus images={audit.images ?? []} auditId={audit.id} />

      <div style={{
        borderRadius: '0.75rem', padding: '1.375rem',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '1.5rem',
      }}>
        <GeneratedImageSlots
          generations={generations}
          regeneratingIds={regeneratingIds}
          onDelete={handleDelete}
          onRegenerate={handleRegenerate}
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.65 }}>
          Select an image type to view its creative brief, set quality controls, and generate.
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
                generation={getGenForItem(item.image_type)}
                isGenerating={generatingTypes.has(item.image_type)}
                onGenerate={() => {
                  if (billing && !billing.can_generate_image) {
                    setImagePaywall(true)
                    return
                  }
                  handleGenerate(item, DEFAULT_QUALITY)
                  setSelectedIndex(i)
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ position: 'sticky', top: '1.5rem' }}>
          {selectedItem !== null ? (
            <ImageBriefPanel
              key={selectedIndex ?? -1}
              item={selectedItem}
              productName={productName}
              category={category}
              index={selectedIndex!}
              generation={getGenForItem(selectedItem.image_type)}
              isGenerating={generatingTypes.has(selectedItem.image_type)}
              hasReference={(audit.images ?? []).length > 0}
              onGenerate={(quality) => handleGenerate(selectedItem, quality)}
            />
          ) : (
            <div style={{
              borderRadius: '0.875rem', padding: '2.5rem 1.5rem',
              background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.07)',
              textAlign: 'center',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '0.875rem',
                background: 'rgba(83,58,253,0.05)', border: '1px solid rgba(83,58,253,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.125rem',
              }}>
                <Zap size={22} color="#533AFD" style={{ opacity: 0.5 }} />
              </div>
              <h3 style={{
                fontSize: '0.9375rem', fontWeight: 700, color: 'var(--dp-ink)',
                margin: '0 0 0.5rem', letterSpacing: '-0.02em',
              }}>
                Select an image type
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: 1.65 }}>
                Click <strong style={{ color: 'var(--dp-primary)' }}>Prepare Brief</strong> on any card to see the creative brief, set quality controls, and generate.
              </p>
            </div>
          )}
        </div>
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
          className="dp-btn-primary"
          style={{ padding: '0.625rem 1.125rem', fontSize: '0.875rem' }}
        >
          <Zap size={14} />
          Start New Audit
        </Link>
      </div>
    </div>
  )
}
