import { useState, useEffect, useRef, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Link2, Upload, ArrowLeft, ChevronRight, ChevronDown, X, AlertCircle, Zap } from 'lucide-react'
import { createAudit, submitAudit, uploadAuditImages } from '../lib/auditsApi'
import { getMyBilling } from '../lib/billingApi'
import type { CreateAuditPayload } from '../types/audit'
import type { BillingMeResponse } from '../types/billing'
import PaywallBlock from '../components/ui/PaywallBlock'

const AMAZON_URL_RE =
  /amazon\.(com|co\.(uk|jp)|de|fr|es|it|ca|com\.(au|br|mx|tr)|in|nl|sg|ae|sa|pl|se)/i

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
}

type FormState = typeof initialForm

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
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '0.5rem',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f1f5f9',
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
  color: '#64748b',
  marginBottom: '0.375rem',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const helperStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#475569',
  marginTop: '0.375rem',
  lineHeight: 1.5,
}

const backBtnStyle: React.CSSProperties = {
  padding: '0.5625rem 1rem',
  borderRadius: '0.5rem',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#94a3b8',
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
                    done || active ? 'linear-gradient(135deg, #166534, #4ade80)' : 'rgba(255,255,255,0.06)',
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
                  color: active ? '#f1f5f9' : done ? '#64748b' : '#334155',
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
          border: `1.5px dashed ${dragOver ? 'rgba(163,230,53,0.5)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '0.875rem',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(163,230,53,0.04)' : 'rgba(255,255,255,0.02)',
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
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.25rem' }}>
          Drop images here, or{' '}
          <span style={{ color: '#a3e635' }}>click to browse</span>
        </p>
        <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0 }}>
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
                  color: '#f1f5f9',
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
        background: 'rgba(163,230,53,0.04)',
        border: '1px solid rgba(163,230,53,0.1)',
        fontSize: '0.8125rem',
        color: '#64748b',
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
                color: '#a3e635',
                background: 'rgba(163,230,53,0.08)',
                border: '1px solid rgba(163,230,53,0.18)',
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

export default function NewAuditPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [entryType, setEntryType] = useState<'amazon_url' | 'product_photos' | null>(null)
  const [form, setForm] = useState<FormState>({ ...initialForm })
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [creditExhausted, setCreditExhausted] = useState(false)
  const [billing, setBilling] = useState<BillingMeResponse | null>(null)

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

  const sf = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.border = '1px solid rgba(163,230,53,0.4)')
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
        {optional && <span style={{ color: '#334155', fontWeight: 400, marginLeft: 4 }}>(optional)</span>}
      </label>
      {inp(field, placeholder)}
      {helper && <p style={helperStyle}>{helper}</p>}
    </div>
  )

  const tfld = (label: string, field: keyof FormState, placeholder?: string, optional = false, rows = 3, helper?: string) => (
    <div>
      <label style={labelStyle}>
        {label}
        {optional && <span style={{ color: '#334155', fontWeight: 400, marginLeft: 4 }}>(optional)</span>}
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
    if (billing && !billing.can_run_audit) {
      setCreditExhausted(true)
      return
    }
    setLoading(true)
    setSubmitError(null)
    setCreditExhausted(false)
    try {
      const payload = buildPayload(entryType!, form)
      const { data: audit } = await createAudit(payload)
      if (entryType === 'product_photos' && files.length > 0) {
        await uploadAuditImages(audit.id, files)
      }
      await submitAudit(audit.id)
      navigate(`/dashboard/audits/${audit.id}`)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 402) {
        setCreditExhausted(true)
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
    background: active ? 'rgba(163,230,53,0.04)' : 'rgba(255,255,255,0.025)',
    border: `1px solid ${active ? 'rgba(163,230,53,0.25)' : 'rgba(255,255,255,0.08)'}`,
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
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.08)',
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
          color: '#64748b',
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
            color: '#f1f5f9',
            letterSpacing: '-0.03em',
            margin: '0 0 0.5rem',
          }}
        >
          Start with your Amazon listing
          <br />
          <span className="gradient-text">or product photos.</span>
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748b', margin: 0 }}>
          Sellio will do the rest — audit your listing, score it, and generate premium visuals.
        </p>
      </div>

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
              e.currentTarget.style.borderColor = 'rgba(163,230,53,0.25)'
              e.currentTarget.style.background = 'rgba(163,230,53,0.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #166534, #4ade80)',
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
                  color: '#f1f5f9',
                  margin: '0 0 0.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Paste Amazon URL
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.5rem' }}>
                For sellers with an existing listing.
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>
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
              e.currentTarget.style.borderColor = 'rgba(163,230,53,0.25)'
              e.currentTarget.style.background = 'rgba(163,230,53,0.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #166534, #4ade80)',
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
                  color: '#f1f5f9',
                  margin: '0 0 0.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Upload Product Photos
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.5rem' }}>
                For sellers starting from product images.
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>
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
              color: '#f1f5f9',
              margin: '0 0 0.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Enter your Amazon product URL
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 1.5rem' }}>
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
              color: '#f1f5f9',
              margin: '0 0 0.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Upload your product photos
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 1.5rem' }}>
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
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(163,230,53,0.12)',
          textAlign: 'center',
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
          <h3 style={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: '#f1f5f9',
            margin: '0 0 0.625rem',
            letterSpacing: '-0.02em',
          }}>
            Generating AI audit...
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, lineHeight: 1.7 }}>
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
                color: '#f1f5f9',
                margin: '0 0 0.25rem',
                letterSpacing: '-0.02em',
              }}
            >
              Confirm your listing details
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 1rem' }}>
              Review and fill in the listing information before analysis. The more you add, the better the audit.
            </p>
            <InfoNote>
              Auto-fill coming soon. For now, paste each section directly from your Amazon product page.
            </InfoNote>
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

          {/* Section 6: Images & Customer Signals */}
          <CollapsibleSection title="Images & Customer Signals" defaultOpen={false}>
            {tfld(
              'Product Images / Gallery Notes',
              'productImagesNotes',
              'Describe what images are currently in the gallery (main image, lifestyle, infographic, etc.)...',
              true,
              3
            )}
            {tfld(
              'Reviews / Q&A / Customer Complaints',
              'reviewsQna',
              'Paste notable customer reviews, Q&A highlights, or recurring complaints...',
              true,
              4
            )}
            {tfld(
              'Seller Goal',
              'sellerGoal',
              'What are you trying to achieve? (e.g. increase CTR, reduce returns, boost conversion for a specific audience)',
              true,
              2
            )}
          </CollapsibleSection>

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
                className="btn-primary glow-button"
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
              color: '#f1f5f9',
              margin: '0 0 0.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Confirm your product details
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 1.25rem' }}>
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
                className="btn-primary glow-button"
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
