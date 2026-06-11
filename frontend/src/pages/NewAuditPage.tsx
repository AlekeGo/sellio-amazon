import { useState, useEffect, useRef, Fragment } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Link2, Upload, ArrowLeft, ChevronRight, ChevronDown, X, AlertCircle, Zap, Plus } from 'lucide-react'
import { createAudit, submitAudit, uploadAuditImages } from '../lib/auditsApi'
import { getMyBilling } from '../lib/billingApi'
import type { CreateAuditPayload } from '../types/audit'
import type { BillingMeResponse } from '../types/billing'
import PaywallBlock from '../components/ui/PaywallBlock'
import { useAuth } from '../contexts/AuthContext'

const AMAZON_URL_RE =
  /amazon\.(com|co\.(uk|jp)|de|fr|es|it|ca|com\.(au|br|mx|tr)|in|nl|sg|ae|sa|pl|se)/i

const PERSONA_OPTIONS = [
  { value: 'premium', label: 'Premium', description: 'Build trust and higher perceived value.' },
  { value: 'budget_friendly', label: 'Budget-friendly', description: 'Emphasize value, practicality, and everyday usefulness.' },
  { value: 'gift_ready', label: 'Gift-ready', description: 'Position the product as a strong gift choice.' },
  { value: 'expert_professional', label: 'Expert / Professional', description: 'Use precise, specification-driven language.' },
  { value: 'luxury', label: 'Luxury', description: 'Create refined, elegant, premium positioning.' },
  { value: 'problem_solver', label: 'Problem-solver', description: 'Lead with the buyer pain point and solution.' },
  { value: 'minimal_clean', label: 'Minimal / Clean', description: 'Keep the listing simple, clear, and direct.' },
]

type CompetitorField = {
  name: string
  url: string
  title: string
  price: string
  rating: string
  review_count: string
  bullets: string
  image_notes: string
  strengths: string
}

const emptyCompetitor = (): CompetitorField => ({
  name: '', url: '', title: '', price: '', rating: '',
  review_count: '', bullets: '', image_notes: '', strengths: '',
})

const initialForm = {
  amazonUrl: '',
  productName: '',
  category: '',
  currentTitle: '',
  bulletPoints: '',
  description: '',
  price: '',
  rating: '',
  reviewCount: '',
  mainBenefit: '',
  targetAudience: '',
  sellerGoal: '',
  notes: '',
  aboutThisItem: '',
  productDetails: '',
  productSpecifications: '',
  brandContent: '',
  aPlusContent: '',
  productImagesNotes: '',
  reviewsQna: '',
  sellerPersona: '',
}

type FormState = typeof initialForm

const DRAFT_KEY = 'sellio_guest_audit_draft'

interface DraftData {
  entryType: 'amazon_url' | 'product_photos' | null
  step: 1 | 2 | 3
  form: FormState
  competitors: CompetitorField[]
  competitorNotes: string
}

function saveDraft(data: DraftData): void {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)) } catch {}
}

function loadDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as DraftData) : null
  } catch {
    return null
  }
}

function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY)
}

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response: { data: Record<string, unknown> } }).response?.data
    if (typeof data?.detail === 'string') return data.detail
    const first = Object.values(data ?? {})[0]
    if (Array.isArray(first)) return String(first[0])
    if (typeof first === 'string') return first
  }
  return 'Something went wrong. Please try again.'
}

function buildPayload(entryType: 'amazon_url' | 'product_photos', form: FormState): CreateAuditPayload {
  const base: CreateAuditPayload = {
    entry_type: entryType,
    product_name: form.productName || undefined,
    category: form.category || undefined,
    main_benefit: form.mainBenefit || undefined,
    target_audience: form.targetAudience || undefined,
    seller_goal: form.sellerGoal || undefined,
    notes: form.notes || undefined,
    seller_persona: form.sellerPersona || undefined,
  }
  if (entryType === 'amazon_url') {
    return {
      ...base,
      amazon_url: form.amazonUrl,
      current_title: form.currentTitle || undefined,
      bullet_points: form.bulletPoints || undefined,
      description: form.description || undefined,
      price: form.price || undefined,
      rating: form.rating || undefined,
      review_count: form.reviewCount || undefined,
      about_this_item: form.aboutThisItem || undefined,
      product_details: form.productDetails || undefined,
      product_specifications: form.productSpecifications || undefined,
      brand_content: form.brandContent || undefined,
      a_plus_content: form.aPlusContent || undefined,
      product_images_notes: form.productImagesNotes || undefined,
      reviews_qna: form.reviewsQna || undefined,
    }
  }
  return {
    ...base,
    product_specifications: form.productSpecifications || undefined,
    reviews_qna: form.reviewsQna || undefined,
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '0.5rem',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  background: '#F6F9FC',
  border: '1.5px solid rgba(196,188,255,0.55)',
  color: 'var(--dp-ink)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: 80,
  lineHeight: 1.6,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: 'var(--dp-ink-muted)',
  marginBottom: '0.375rem',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const helperStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--dp-ink-muted)',
  marginTop: '0.375rem',
  lineHeight: 1.5,
}

const backBtnStyle: React.CSSProperties = {
  padding: '0.5625rem 1rem',
  borderRadius: '0.5rem',
  background: 'transparent',
  border: '1.5px solid rgba(196,188,255,0.55)',
  color: 'var(--dp-ink-muted)',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Choose type', 'Add details', 'Confirm']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
      {steps.map((label, i) => {
        const s = i + 1
        const done = s < current
        const active = s === current
        return (
          <Fragment key={s}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background:
                    done || active ? 'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)' : 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: done || active ? 'white' : '#475569',
                  flexShrink: 0,
                }}
              >
                {done ? '✓' : s}
              </div>
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: active ? '#1e293b' : done ? '#64748b' : '#94a3b8',
                  fontWeight: active ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: done ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.06)',
                  margin: '0 0.75rem',
                  minWidth: 12,
                }}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

function FileUploadZone({
  files,
  onFiles,
  getFileUrl,
}: {
  files: File[]
  onFiles: (f: File[]) => void
  getFileUrl: (file: File) => string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const arr = Array.from(list).filter(f => f.type.startsWith('image/'))
    onFiles([...files, ...arr])
  }

  const remove = (i: number) => onFiles(files.filter((_, idx) => idx !== i))

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
        style={{
          border: `1.5px dashed ${dragOver ? 'rgba(83,58,253,0.5)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '0.875rem',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(83,58,253,0.05)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '0.625rem',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.875rem',
          }}
        >
          <Upload size={20} color="#475569" />
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: '0 0 0.25rem' }}>
          Drop images here, or{' '}
          <span style={{ color: 'var(--dp-primary)' }}>click to browse</span>
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)', margin: 0 }}>
          JPG, PNG, WebP — up to 10 images
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={e => addFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))',
            gap: '0.5rem',
            marginTop: '0.875rem',
          }}
        >
          {files.map((file, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                aspectRatio: '1',
                background: '#0a1510',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <img
                src={getFileUrl(file)}
                alt={file.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); remove(i) }}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.75)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--dp-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        padding: '0.75rem 0.875rem',
        borderRadius: '0.5rem',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.18)',
        fontSize: '0.8125rem',
        color: '#fca5a5',
      }}
    >
      <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
      {message}
    </div>
  )
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderRadius: '0.625rem',
        background: 'rgba(83,58,253,0.05)',
        border: '1px solid rgba(83,58,253,0.1)',
        fontSize: '0.8125rem',
        color: 'var(--dp-ink-muted)',
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  )
}

function CollapsibleSection({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string
  badge?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      style={{
        borderRadius: '0.75rem',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1rem',
          background: open ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '0.75rem',
          fontFamily: 'inherit',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: open ? '#f1f5f9' : '#94a3b8' }}>
            {title}
          </span>
          {badge && (
            <span
              style={{
                fontSize: '0.5875rem',
                fontWeight: 700,
                color: 'var(--dp-primary)',
                background: 'rgba(83,58,253,0.08)',
                border: '1px solid rgba(83,58,253,0.18)',
                padding: '0.125rem 0.4375rem',
                borderRadius: '99px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          color="#475569"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </button>
      {open && (
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

function SellerPersonaPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.4375rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--dp-ink)' }}>Seller Persona Mode</span>
        <span style={{
          fontSize: '0.5625rem', fontWeight: 700, color: 'var(--dp-primary)',
          background: 'rgba(83,58,253,0.08)', border: '1px solid rgba(83,58,253,0.2)',
          padding: '0.125rem 0.4375rem', borderRadius: '99px',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          AI Powered
        </span>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)', margin: '0 0 0.875rem', lineHeight: 1.55 }}>
        Choose how Sellio should position and rewrite your listing.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
        gap: '0.4375rem',
      }}>
        {PERSONA_OPTIONS.map(opt => {
          const selected = value === opt.value
          const isHovered = hovered === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(selected ? '' : opt.value)}
              onMouseEnter={() => setHovered(opt.value)}
              onMouseLeave={() => setHovered(null)}
              style={{
                borderRadius: '0.625rem',
                padding: '0.625rem 0.75rem',
                background: selected
                  ? 'rgba(83,58,253,0.08)'
                  : isHovered
                  ? 'rgba(83,58,253,0.05)'
                  : '#ffffff',
                border: `1px solid ${selected ? 'rgba(83,58,253,0.38)' : isHovered ? 'rgba(83,58,253,0.28)' : 'rgba(196,188,255,0.45)'}`,
                boxShadow: selected
                  ? '0 4px 18px rgba(83,58,253,0.18)'
                  : isHovered
                  ? '0 4px 14px rgba(83,58,253,0.13)'
                  : 'none',
                transform: isHovered && !selected ? 'translateY(-1px)' : 'translateY(0)',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'all 0.18s ease',
                outline: 'none',
              }}
            >
              <div style={{
                fontSize: '0.8125rem', fontWeight: 700,
                color: selected || isHovered ? 'var(--dp-primary)' : 'var(--dp-ink-muted)',
                marginBottom: '0.1875rem',
                transition: 'color 0.15s',
              }}>
                {opt.label}
              </div>
              <div style={{ fontSize: '0.6875rem', color: selected ? '#475569' : '#64748B', lineHeight: 1.45 }}>
                {opt.description}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CompetitorSection({
  competitors,
  competitorNotes,
  onAdd,
  onRemove,
  onUpdate,
  onNotesChange,
}: {
  competitors: CompetitorField[]
  competitorNotes: string
  onAdd: () => void
  onRemove: (i: number) => void
  onUpdate: (i: number, field: keyof CompetitorField, value: string) => void
  onNotesChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)

  const compInp = (i: number, field: keyof CompetitorField, placeholder?: string) => (
    <input
      type="text"
      value={competitors[i][field]}
      onChange={e => onUpdate(i, field, e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={e => (e.currentTarget.style.border = '1px solid rgba(83,58,253,0.4)')}
      onBlur={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
    />
  )

  const compTxta = (i: number, field: keyof CompetitorField, placeholder?: string, rows = 3) => (
    <textarea
      value={competitors[i][field]}
      onChange={e => onUpdate(i, field, e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={textareaStyle}
      onFocus={e => (e.currentTarget.style.border = '1px solid rgba(83,58,253,0.4)')}
      onBlur={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
    />
  )

  return (
    <div style={{ borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1rem',
          background: open ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
          border: 'none', cursor: 'pointer', textAlign: 'left', gap: '0.75rem',
          fontFamily: 'inherit', transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: open ? '#f1f5f9' : '#94a3b8' }}>
            Competitor Analysis Lite
          </span>
          <span style={{
            fontSize: '0.5875rem', fontWeight: 700, color: 'var(--dp-primary)',
            background: 'rgba(83,58,253,0.08)', border: '1px solid rgba(83,58,253,0.18)',
            padding: '0.125rem 0.4375rem', borderRadius: '99px',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Optional
          </span>
          {competitors.length > 0 && (
            <span style={{
              fontSize: '0.5875rem', fontWeight: 700, color: '#2F9E6F',
              background: 'rgba(47,158,111,0.1)', border: '1px solid rgba(47,158,111,0.2)',
              padding: '0.125rem 0.4375rem', borderRadius: '99px',
            }}>
              {competitors.length} added
            </span>
          )}
        </div>
        <ChevronDown
          size={14} color="#475569"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
        />
      </button>

      {open && (
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={helperStyle}>
            Paste 1–3 competitor listings manually. Sellio will compare positioning, copy, trust signals, and image strategy.
            No scraping is used.
          </p>

          {competitors.map((_comp, i) => (
            <div key={i} style={{
              borderRadius: '0.625rem', border: '1px solid rgba(196,188,255,0.40)',
              overflow: 'hidden', background: 'rgba(83,58,253,0.03)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0.875rem',
                background: 'rgba(83,58,253,0.05)', borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2F9E6F' }}>
                  Competitor {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--dp-ink-muted)', padding: '0.125rem', display: 'flex', alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
              <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.625rem' }}>
                  <div>
                    <label style={labelStyle}>Name <span style={{ color: 'var(--dp-ink-muted)', fontWeight: 400 }}>(optional)</span></label>
                    {compInp(i, 'name', 'e.g. BrandX Premium Bamboo Board')}
                  </div>
                  <div>
                    <label style={labelStyle}>Amazon URL <span style={{ color: 'var(--dp-ink-muted)', fontWeight: 400 }}>(optional)</span></label>
                    {compInp(i, 'url', 'https://amazon.com/dp/...')}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Listing Title <span style={{ color: 'var(--dp-ink-muted)', fontWeight: 400 }}>(optional)</span></label>
                  {compInp(i, 'title', 'Their product title...')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.625rem' }}>
                  <div>
                    <label style={labelStyle}>Price</label>
                    {compInp(i, 'price', '$29.99')}
                  </div>
                  <div>
                    <label style={labelStyle}>Rating</label>
                    {compInp(i, 'rating', '4.5')}
                  </div>
                  <div>
                    <label style={labelStyle}>Reviews</label>
                    {compInp(i, 'review_count', '1,200')}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Bullets / About This Item <span style={{ color: 'var(--dp-ink-muted)', fontWeight: 400 }}>(optional)</span></label>
                  {compTxta(i, 'bullets', 'Paste their key bullet points...', 3)}
                </div>
                <div>
                  <label style={labelStyle}>Image Notes <span style={{ color: 'var(--dp-ink-muted)', fontWeight: 400 }}>(optional)</span></label>
                  {compTxta(i, 'image_notes', 'What do their main images show?', 2)}
                </div>
                <div>
                  <label style={labelStyle}>Strengths / Notes <span style={{ color: 'var(--dp-ink-muted)', fontWeight: 400 }}>(optional)</span></label>
                  {compTxta(i, 'strengths', 'What do they do well? What stands out?', 2)}
                </div>
              </div>
            </div>
          ))}

          {competitors.length < 3 && (
            <button
              type="button"
              onClick={onAdd}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.625rem 1rem', borderRadius: '0.5rem',
                background: 'rgba(83,58,253,0.04)', border: '1px dashed rgba(83,58,253,0.22)',
                color: '#2F9E6F', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(83,58,253,0.08)'; e.currentTarget.style.borderColor = 'rgba(83,58,253,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(83,58,253,0.04)'; e.currentTarget.style.borderColor = 'rgba(83,58,253,0.22)' }}
            >
              <Plus size={14} />
              Add Competitor {competitors.length + 1} of 3
            </button>
          )}

          {competitors.length > 0 && (
            <div>
              <label style={labelStyle}>General Competitor Notes <span style={{ color: 'var(--dp-ink-muted)', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                value={competitorNotes}
                onChange={e => onNotesChange(e.target.value)}
                placeholder="Any additional observations about the competitive landscape..."
                rows={2}
                style={textareaStyle}
                onFocus={e => (e.currentTarget.style.border = '1px solid rgba(83,58,253,0.4)')}
                onBlur={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function NewAuditPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [entryType, setEntryType] = useState<'amazon_url' | 'product_photos' | null>(null)
  const [form, setForm] = useState<FormState>({ ...initialForm })
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [creditExhausted, setCreditExhausted] = useState(false)
  const [billing, setBilling] = useState<BillingMeResponse | null>(null)
  const [competitors, setCompetitors] = useState<CompetitorField[]>([])
  const [competitorNotes, setCompetitorNotes] = useState('')
  const [showDraftBanner, setShowDraftBanner] = useState(false)

  const addCompetitor = () => {
    if (competitors.length >= 3) return
    setCompetitors(c => [...c, emptyCompetitor()])
  }
  const removeCompetitor = (i: number) => setCompetitors(c => c.filter((_, idx) => idx !== i))
  const updateCompetitor = (i: number, field: keyof CompetitorField, value: string) =>
    setCompetitors(c => c.map((comp, idx) => idx === i ? { ...comp, [field]: value } : comp))

  const fileUrlsRef = useRef(new Map<File, string>())
  const getFileUrl = (file: File) => {
    if (!fileUrlsRef.current.has(file)) {
      fileUrlsRef.current.set(file, URL.createObjectURL(file))
    }
    return fileUrlsRef.current.get(file)!
  }

  useEffect(() => {
    const current = new Set(files)
    for (const [f, url] of fileUrlsRef.current) {
      if (!current.has(f)) {
        URL.revokeObjectURL(url)
        fileUrlsRef.current.delete(f)
      }
    }
  }, [files])

  useEffect(() => {
    const cache = fileUrlsRef.current
    return () => {
      for (const url of cache.values()) URL.revokeObjectURL(url)
    }
  }, [])

  useEffect(() => {
    getMyBilling()
      .then(res => setBilling(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (searchParams.get('resumeDraft') === '1') {
      const draft = loadDraft()
      if (draft) {
        if (draft.entryType) setEntryType(draft.entryType)
        if (draft.step) setStep(draft.step)
        setForm({ ...initialForm, ...draft.form })
        setCompetitors(draft.competitors || [])
        setCompetitorNotes(draft.competitorNotes || '')
        setShowDraftBanner(true)
      }
    }
  }, [])

  useEffect(() => {
    const hasData = !!(form.amazonUrl || form.productName || entryType)
    if (!hasData) return
    saveDraft({ entryType, step, form, competitors, competitorNotes })
  }, [form, entryType, step, competitors, competitorNotes])

  const sf = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.border = '1px solid rgba(83,58,253,0.4)')
  const blurOff = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')

  const inp = (field: keyof FormState, placeholder?: string, type = 'text') => (
    <input
      type={type}
      value={form[field]}
      onChange={sf(field) as React.ChangeEventHandler<HTMLInputElement>}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={focusOn as React.FocusEventHandler<HTMLInputElement>}
      onBlur={blurOff as React.FocusEventHandler<HTMLInputElement>}
    />
  )

  const txta = (field: keyof FormState, placeholder?: string, rows = 3) => (
    <textarea
      value={form[field]}
      onChange={sf(field) as React.ChangeEventHandler<HTMLTextAreaElement>}
      placeholder={placeholder}
      rows={rows}
      style={textareaStyle}
      onFocus={focusOn as React.FocusEventHandler<HTMLTextAreaElement>}
      onBlur={blurOff as React.FocusEventHandler<HTMLTextAreaElement>}
    />
  )

  const fld = (label: string, field: keyof FormState, placeholder?: string, optional = false, helper?: string) => (
    <div>
      <label style={labelStyle}>
        {label}
        {optional && <span style={{ color: 'var(--dp-ink-muted)', fontWeight: 400, marginLeft: 4 }}>(optional)</span>}
      </label>
      {inp(field, placeholder)}
      {helper && <p style={helperStyle}>{helper}</p>}
    </div>
  )

  const tfld = (label: string, field: keyof FormState, placeholder?: string, optional = false, rows = 3, helper?: string) => (
    <div>
      <label style={labelStyle}>
        {label}
        {optional && <span style={{ color: 'var(--dp-ink-muted)', fontWeight: 400, marginLeft: 4 }}>(optional)</span>}
      </label>
      {txta(field, placeholder, rows)}
      {helper && <p style={helperStyle}>{helper}</p>}
    </div>
  )

  const selectEntryType = (type: 'amazon_url' | 'product_photos') => {
    setEntryType(type)
    setStepError(null)
    setStep(2)
  }

  const goBack = () => {
    setStep(s => (s > 1 ? (s - 1 as 1 | 2 | 3) : s))
    setStepError(null)
    setSubmitError(null)
  }

  const handleStep2Continue = () => {
    if (entryType === 'amazon_url') {
      if (!AMAZON_URL_RE.test(form.amazonUrl.trim())) {
        setStepError('Please enter a valid Amazon product URL (e.g. https://www.amazon.com/dp/...).')
        return
      }
    }
    if (entryType === 'product_photos') {
      const missing: string[] = []
      if (!form.productName.trim()) missing.push('product name')
      if (!form.category.trim()) missing.push('category')
      if (!form.mainBenefit.trim()) missing.push('main benefit')
      if (missing.length) { setStepError(`Please fill in: ${missing.join(', ')}.`); return }
    }
    setStepError(null)
    setStep(3)
  }

  const showPaywall = creditExhausted || (billing !== null && !billing.can_run_audit)

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      saveDraft({ entryType, step, form, competitors, competitorNotes })
      navigate('/login?next=' + encodeURIComponent('/dashboard/new-audit?resumeDraft=1'))
      return
    }
    if (billing && !billing.can_run_audit) {
      setCreditExhausted(true)
      return
    }
    setLoading(true)
    setSubmitError(null)
    setCreditExhausted(false)
    try {
      const payload = buildPayload(entryType!, form)
      const filteredCompetitors = competitors.filter(c => c.url.trim() || c.title.trim() || c.name.trim())
      if (filteredCompetitors.length > 0) {
        payload.competitors = filteredCompetitors.map(c => ({
          ...(c.name && { name: c.name }),
          ...(c.url && { url: c.url }),
          ...(c.title && { title: c.title }),
          ...(c.price && { price: c.price }),
          ...(c.rating && { rating: c.rating }),
          ...(c.review_count && { review_count: c.review_count }),
          ...(c.bullets && { bullets: c.bullets }),
          ...(c.image_notes && { image_notes: c.image_notes }),
          ...(c.strengths && { strengths: c.strengths }),
        }))
      }
      if (competitorNotes.trim()) payload.competitor_notes = competitorNotes
      const { data: audit } = await createAudit(payload)
      if (entryType === 'product_photos' && files.length > 0) {
        await uploadAuditImages(audit.id, files)
      }
      await submitAudit(audit.id)
      clearDraft()
      navigate(`/dashboard/audits/${audit.id}`)
    } catch (err: unknown) {
      const respStatus = (err as { response?: { status?: number } })?.response?.status
      if (respStatus === 402) {
        setCreditExhausted(true)
        setLoading(false)
        return
      }
      if (respStatus === 503) {
        setSubmitError('AI is temporarily busy. Your draft is saved. Please try again in a moment.')
        setLoading(false)
        return
      }
      setSubmitError(extractError(err))
      setLoading(false)
    }
  }

  const cardStyle = (active?: boolean): React.CSSProperties => ({
    borderRadius: '0.875rem',
    padding: '1.5rem',
    background: active ? 'rgba(83,58,253,0.05)' : 'rgba(255,255,255,0.025)',
    border: `1px solid ${active ? 'rgba(83,58,253,0.25)' : 'rgba(196,188,255,0.40)'}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.25rem',
    outline: 'none',
  })

  const formCard: React.CSSProperties = {
    borderRadius: '0.875rem',
    padding: '1.5rem',
    background: '#ffffff',
    border: '1px solid rgba(196,188,255,0.40)',
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <Link
        to="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.875rem',
          color: 'var(--dp-ink-muted)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
        onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
      >
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      <div style={{ marginBottom: '1.75rem' }}>
        <div className="section-badge" style={{ marginBottom: '0.875rem', display: 'inline-flex' }}>
          New Audit
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.375rem, 3vw, 1.75rem)',
            fontWeight: 900,
            color: 'var(--dp-ink)',
            letterSpacing: '-0.03em',
            margin: '0 0 0.5rem',
          }}
        >
          Start with your Amazon listing
          <br />
          <span className="gradient-text">or product photos.</span>
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--dp-ink-muted)', margin: 0 }}>
          Sellio will do the rest — audit your listing, score it, and generate premium visuals.
        </p>
      </div>

      {showDraftBanner && (
        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '0.625rem',
            background: 'rgba(83,58,253,0.06)',
            border: '1px solid rgba(83,58,253,0.2)',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--dp-primary)', fontWeight: 600 }}>
            Your audit draft was restored. Continue where you left off.
          </p>
          {entryType === 'product_photos' && (
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--dp-ink-muted)' }}>
              Please re-upload product images after login.
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button
              type="button"
              onClick={() => setShowDraftBanner(false)}
              style={{
                padding: '0.4375rem 0.875rem',
                borderRadius: '0.5rem',
                background: 'rgba(83,58,253,0.1)',
                border: '1px solid rgba(83,58,253,0.3)',
                color: 'var(--dp-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Continue saved audit
            </button>
            <button
              type="button"
              onClick={() => {
                clearDraft()
                setForm({ ...initialForm })
                setEntryType(null)
                setStep(1)
                setCompetitors([])
                setCompetitorNotes('')
                setShowDraftBanner(false)
              }}
              style={{
                padding: '0.4375rem 0.875rem',
                borderRadius: '0.5rem',
                background: 'transparent',
                border: '1.5px solid rgba(196,188,255,0.55)',
                color: 'var(--dp-ink-muted)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Discard draft
            </button>
          </div>
        </div>
      )}

      <StepIndicator current={step} />

      {/* ── STEP 1: Choose entry type ── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => selectEntryType('amazon_url')}
            onKeyDown={e => e.key === 'Enter' && selectEntryType('amazon_url')}
            style={cardStyle()}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(83,58,253,0.25)'
              e.currentTarget.style.background = 'rgba(83,58,253,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(196,188,255,0.40)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Link2 size={22} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--dp-ink)',
                  margin: '0 0 0.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Paste Amazon URL
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: '0 0 0.5rem' }}>
                For sellers with an existing listing.
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.6 }}>
                Paste your Amazon product URL and confirm the listing details before analysis.
              </p>
            </div>
            <ChevronRight size={18} color="#475569" style={{ flexShrink: 0, marginTop: 4 }} />
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => selectEntryType('product_photos')}
            onKeyDown={e => e.key === 'Enter' && selectEntryType('product_photos')}
            style={cardStyle()}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(83,58,253,0.25)'
              e.currentTarget.style.background = 'rgba(83,58,253,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(196,188,255,0.40)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Upload size={22} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--dp-ink)',
                  margin: '0 0 0.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Upload Product Photos
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: '0 0 0.5rem' }}>
                For sellers starting from product images.
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.6 }}>
                Upload product photos and add the basic details. Sellio will prepare the audit foundation.
              </p>
            </div>
            <ChevronRight size={18} color="#475569" style={{ flexShrink: 0, marginTop: 4 }} />
          </div>
        </div>
      )}

      {/* ── STEP 2A: Amazon URL ── */}
      {step === 2 && entryType === 'amazon_url' && (
        <div style={formCard}>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--dp-ink)',
              margin: '0 0 0.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Enter your Amazon product URL
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: '0 0 1.5rem' }}>
            Paste the full URL of your Amazon listing.
          </p>

          <div style={{ marginBottom: '1.25rem' }}>
            {fld('Amazon Product URL', 'amazonUrl', 'https://www.amazon.com/dp/...')}
          </div>

          {stepError && (
            <div style={{ marginBottom: '1.25rem' }}>
              <ErrorBanner message={stepError} />
            </div>
          )}

          <InfoNote>
            Auto-fill will be connected soon. For now, confirm or add the missing listing details
            manually on the next screen.
          </InfoNote>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={goBack} style={backBtnStyle}>Back</button>
            <button
              type="button"
              onClick={handleStep2Continue}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '0.625rem 1rem', fontSize: '0.875rem' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2B: Product Photos ── */}
      {step === 2 && entryType === 'product_photos' && (
        <div style={formCard}>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--dp-ink)',
              margin: '0 0 0.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Upload your product photos
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: '0 0 1.5rem' }}>
            Add images and enter your basic product details to continue.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <FileUploadZone files={files} onFiles={setFiles} getFileUrl={getFileUrl} />
            {fld('Product Name', 'productName', 'e.g. Bamboo Cutting Board Set')}
            {fld('Category', 'category', 'e.g. Kitchen & Dining')}
            {tfld('Main Benefit', 'mainBenefit', 'What is the primary value or benefit for the customer?', false, 2)}
          </div>

          {stepError && (
            <div style={{ marginTop: '1.25rem' }}>
              <ErrorBanner message={stepError} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={goBack} style={backBtnStyle}>Back</button>
            <button
              type="button"
              onClick={handleStep2Continue}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '0.625rem 1rem', fontSize: '0.875rem' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: AI generating ── */}
      {step === 3 && loading && (
        <div style={{
          borderRadius: '0.875rem',
          padding: '2.75rem 1.5rem',
          background: '#ffffff',
          border: '1px solid rgba(83,58,253,0.12)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            border: '3px solid rgba(83,58,253,0.14)',
            borderTop: '3px solid #533AFD',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem',
          }} />
          <h3 style={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'var(--dp-ink)',
            margin: '0 0 0.625rem',
            letterSpacing: '-0.02em',
          }}>
            Generating AI audit...
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.7 }}>
            Analyzing your Amazon listing...
            <br />
            Reviewing copy, buyer signals, SEO gaps, and visual opportunities.
          </p>
        </div>
      )}

      {/* ── STEP 3: Confirm & Submit — Amazon URL ── */}
      {step === 3 && !loading && entryType === 'amazon_url' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={formCard}>
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--dp-ink)',
                margin: '0 0 0.25rem',
                letterSpacing: '-0.02em',
              }}
            >
              Confirm your listing details
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: '0 0 1rem' }}>
              Review and fill in the listing information before analysis. The more you add, the better the audit.
            </p>
            <InfoNote>
              Auto-fill coming soon. For now, paste each section directly from your Amazon product page.
            </InfoNote>
          </div>

          {/* Seller Persona Mode */}
          <div style={{
            borderRadius: '0.875rem', padding: '1.25rem 1.375rem',
            background: '#ffffff', border: '1px solid rgba(196,188,255,0.40)',
          }}>
            <SellerPersonaPicker
              value={form.sellerPersona}
              onChange={v => setForm(f => ({ ...f, sellerPersona: v }))}
            />
          </div>

          {/* Section 1: Listing Basics */}
          <CollapsibleSection title="Listing Basics" badge="Required" defaultOpen={true}>
            {fld('Amazon Product URL', 'amazonUrl', 'https://www.amazon.com/dp/...')}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
              }}
            >
              {fld('Product Title', 'currentTitle', 'e.g. Bamboo Cutting Board Set with Juice Groove', true)}
              {fld('Category / Product Type', 'category', 'e.g. Kitchen & Dining', true)}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
              }}
            >
              {fld('Price', 'price', '29.99', true)}
              {fld('Rating', 'rating', '4.5', true)}
              {fld('Review Count', 'reviewCount', '1234', true)}
            </div>
          </CollapsibleSection>

          {/* Section 2: About This Item */}
          <CollapsibleSection title="About This Item" defaultOpen={true}>
            {tfld(
              'Bullet Points',
              'aboutThisItem',
              'Paste the bullet points from the "About this item" section...',
              true,
              5,
              'Paste the bullet points from Amazon\'s "About this item" section.'
            )}
          </CollapsibleSection>

          {/* Section 3: Product Details */}
          <CollapsibleSection title="Product Details" defaultOpen={false}>
            {tfld(
              'Top Highlights / Product Details',
              'productDetails',
              'Paste visible product details: brand, color, size, material, model, fabric type, care instructions...',
              true,
              4,
              'Paste visible product details like brand, color, size, material, model, processor, fabric type, care instructions, etc.'
            )}
          </CollapsibleSection>

          {/* Section 4: Product Specifications */}
          <CollapsibleSection title="Product Specifications" defaultOpen={false}>
            {tfld(
              'Technical Specifications',
              'productSpecifications',
              'Paste technical specifications or detailed attribute tables...',
              true,
              4,
              'Paste technical specifications or detailed attribute tables from the product page.'
            )}
          </CollapsibleSection>

          {/* Section 5: Description / Brand Content */}
          <CollapsibleSection title="Description / Brand Content" defaultOpen={false}>
            {tfld(
              'Product Description',
              'description',
              'Paste the full product description...',
              true,
              4
            )}
            {tfld(
              'Brand Content',
              'brandContent',
              'Brand story, brand highlights, or additional brand messaging...',
              true,
              3
            )}
            {tfld(
              'A+ Content',
              'aPlusContent',
              'Paste any A+ or Enhanced Brand Content if present...',
              true,
              3
            )}
          </CollapsibleSection>

          {/* Section 6: Images & Seller Context */}
          <CollapsibleSection title="Images & Seller Context" defaultOpen={false}>
            {tfld(
              'Product Images / Gallery Notes',
              'productImagesNotes',
              'Describe what images are currently in the gallery (main image, lifestyle, infographic, etc.)...',
              true,
              3
            )}
            {tfld(
              'Seller Goal',
              'sellerGoal',
              'What are you trying to achieve? (e.g. increase CTR, reduce returns, boost conversion for a specific audience)',
              true,
              2
            )}
          </CollapsibleSection>

          {/* Section 7: Reviews, Q&A & Buyer Complaints */}
          <CollapsibleSection title="Reviews, Q&A & Buyer Complaints" badge="Boosts AI" defaultOpen={false}>
            {tfld(
              'Reviews, Q&A & Buyer Complaints',
              'reviewsQna',
              'Paste customer reviews, Q&A, complaints, repeated concerns, or feedback...',
              true,
              5,
              'Paste customer reviews, Q&A, complaints, repeated concerns, or feedback. Sellio will detect buyer objections and suggest what to fix.'
            )}
          </CollapsibleSection>

          {/* Section 8: Competitor Analysis Lite */}
          <CompetitorSection
            competitors={competitors}
            competitorNotes={competitorNotes}
            onAdd={addCompetitor}
            onRemove={removeCompetitor}
            onUpdate={updateCompetitor}
            onNotesChange={setCompetitorNotes}
          />

          {showPaywall && (
            <PaywallBlock
              title="You've used your free audit."
              subtitle="Choose a plan to continue improving your Amazon listings with AI audits and premium image packs."
              creditsLine="Current credits: 0 audits left"
            />
          )}

          {submitError && !showPaywall && (
            <ErrorBanner message={submitError} />
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={goBack}
              disabled={loading}
              style={{ ...backBtnStyle, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              Back
            </button>
            {!showPaywall && (
              <button
                type="button"
                onClick={handleSubmit}
                className="dp-btn-primary"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: '0.6875rem 1rem',
                  fontSize: '0.875rem',
                }}
              >
                <Zap size={14} />
                Analyze Listing
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 3: Confirm & Submit — Product Photos ── */}
      {step === 3 && !loading && entryType === 'product_photos' && (
        <div style={formCard}>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--dp-ink)',
              margin: '0 0 0.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Confirm your product details
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: '0 0 1.25rem' }}>
            Add any optional context to help Sellio build a stronger audit.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {files.length > 0 && (
              <div>
                <label style={labelStyle}>Uploaded Photos ({files.length})</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))',
                    gap: '0.5rem',
                  }}
                >
                  {files.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        aspectRatio: '1',
                        background: '#0a1510',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <img
                        src={getFileUrl(file)}
                        alt={file.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
              }}
            >
              {fld('Product Name', 'productName', 'e.g. Bamboo Cutting Board')}
              {fld('Category', 'category', 'e.g. Kitchen & Dining')}
            </div>

            {tfld('Main Benefit', 'mainBenefit', 'Primary customer benefit', false, 2)}
            {fld('Target Audience', 'targetAudience', 'e.g. Home cooks, professional chefs', true)}
            {tfld(
              'Product Specifications',
              'productSpecifications',
              'Dimensions, weight, materials, color options, etc.',
              true,
              3
            )}
            {tfld(
              'Product Visual Details',
              'notes',
              'Describe the product appearance: shape, packaging, texture, colors, finishes...',
              true,
              3,
              'Helps Sellio generate more accurate image prompts.'
            )}
            {tfld('Seller Goal', 'sellerGoal', 'What are you trying to achieve with this listing?', true, 2)}
            <div style={{
              borderRadius: '0.75rem', padding: '1rem 1.125rem',
              background: 'rgba(83,58,253,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <SellerPersonaPicker
                value={form.sellerPersona}
                onChange={v => setForm(f => ({ ...f, sellerPersona: v }))}
              />
            </div>
            <CollapsibleSection title="Reviews, Q&A & Buyer Complaints" badge="Boosts AI" defaultOpen={false}>
              {tfld(
                'Reviews, Q&A & Buyer Complaints',
                'reviewsQna',
                'Paste customer reviews, Q&A, complaints, repeated concerns, or feedback...',
                true,
                4,
                'Paste customer reviews, Q&A, complaints, repeated concerns, or feedback. Sellio will detect buyer objections and suggest what to fix.'
              )}
            </CollapsibleSection>
            <CompetitorSection
              competitors={competitors}
              competitorNotes={competitorNotes}
              onAdd={addCompetitor}
              onRemove={removeCompetitor}
              onUpdate={updateCompetitor}
              onNotesChange={setCompetitorNotes}
            />
          </div>

          {showPaywall && (
            <div style={{ marginTop: '1.25rem' }}>
              <PaywallBlock
                title="You've used your free audit."
                subtitle="Choose a plan to continue improving your Amazon listings with AI audits and premium image packs."
                creditsLine="Current credits: 0 audits left"
              />
            </div>
          )}

          {submitError && !showPaywall && (
            <div style={{ marginTop: '1.25rem' }}>
              <ErrorBanner message={submitError} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={goBack}
              disabled={loading}
              style={{ ...backBtnStyle, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              Back
            </button>
            {!showPaywall && (
              <button
                type="button"
                onClick={handleSubmit}
                className="dp-btn-primary"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: '0.6875rem 1rem',
                  fontSize: '0.875rem',
                }}
              >
                <Zap size={14} />
                Analyze Listing
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
