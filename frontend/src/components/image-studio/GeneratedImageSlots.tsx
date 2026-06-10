import { useState } from 'react'
import {
  ImageIcon, ExternalLink, Download, Copy, Check, AlertTriangle,
  RefreshCw, Trash2, Loader2, Eye, ChevronDown, ChevronUp,
} from 'lucide-react'
import type { ImageGeneration } from '../../types/imageGeneration'
import { downloadImageGeneration } from '../../lib/imageGenerationsApi'
import ImagePreviewModal from './ImagePreviewModal'

interface Props {
  generations: ImageGeneration[]
  regeneratingIds: Set<number>
  onDelete: (id: number) => Promise<void>
  onRegenerate: (id: number) => Promise<void>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function GenStatusBadge({ status }: { status: ImageGeneration['status'] }) {
  const cfg =
    status === 'completed'
      ? { label: 'Generated', c: '#34d399', bg: 'rgba(52,211,153,0.08)', bd: 'rgba(52,211,153,0.2)' }
      : status === 'generating'
      ? { label: 'Generating', c: '#fbbf24', bg: 'rgba(251,191,36,0.08)', bd: 'rgba(251,191,36,0.22)' }
      : { label: 'Failed', c: '#f87171', bg: 'rgba(248,113,113,0.07)', bd: 'rgba(248,113,113,0.18)' }
  return (
    <span style={{
      padding: '0.1875rem 0.5rem', borderRadius: '99px',
      background: cfg.bg, border: `1px solid ${cfg.bd}`,
      fontSize: '0.5625rem', fontWeight: 700, color: cfg.c,
      textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  )
}

interface CardProps {
  gen: ImageGeneration
  isRegenerating: boolean
  onDelete: (id: number) => Promise<void>
  onRegenerate: (id: number) => Promise<void>
  onPreview: (gen: ImageGeneration) => void
}

function GeneratedCard({ gen, isRegenerating, onDelete, onRegenerate, onPreview }: CardProps) {
  const [promptCopied, setPromptCopied] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
    if (!gen.image_url) return
    setDownloading(true)
    try {
      const res = await downloadImageGeneration(gen.id)
      const blob = new Blob([res.data], {
        type: (res.headers as Record<string, string>)['content-type'] || 'image/jpeg',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const slug = gen.image_type.replace(/\s+/g, '-').toLowerCase()
      a.download = `sellio-${gen.id}-${slug}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(gen.image_url, '_blank', 'noopener,noreferrer')
    } finally {
      setDownloading(false)
    }
  }

  function handleCopyPrompt(e: React.MouseEvent) {
    e.stopPropagation()
    if (!gen.prompt) return
    navigator.clipboard.writeText(gen.prompt).then(() => {
      setPromptCopied(true)
      setTimeout(() => setPromptCopied(false), 2200)
    }).catch(() => {})
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setDeleting(true)
    try {
      await onDelete(gen.id)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
    padding: '0.3125rem 0.5625rem', borderRadius: '0.375rem',
    fontSize: '0.6875rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
    border: '1px solid transparent',
  }

  return (
    <div
      style={{
        borderRadius: '0.875rem', overflow: 'hidden',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.15s',
        cursor: gen.status === 'completed' ? 'pointer' : 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
      onClick={() => gen.status === 'completed' && onPreview(gen)}
    >
      {gen.status === 'completed' && gen.image_url && !imgError ? (
        <div style={{
          background: 'rgba(0,0,0,0.25)', aspectRatio: '1 / 1',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img
            src={gen.image_url}
            alt={gen.image_type}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </div>
      ) : gen.status === 'completed' && gen.image_url && imgError ? (
        <div style={{
          aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          background: 'rgba(255,255,255,0.015)', padding: '1.25rem',
        }}>
          <ImageIcon size={26} color="rgba(148,163,184,0.3)" />
          <div style={{ fontSize: '0.6875rem', color: 'var(--dp-ink-muted)', textAlign: 'center' }}>
            Preview unavailable
          </div>
          <a
            href={gen.image_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              ...btnBase,
              background: 'rgba(83,58,253,0.08)', borderColor: 'rgba(83,58,253,0.2)',
              color: 'var(--dp-primary)', textDecoration: 'none',
            }}
          >
            <ExternalLink size={11} />
            Open Image
          </a>
        </div>
      ) : gen.status === 'completed' && !gen.image_url ? (
        <div style={{
          aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          background: 'rgba(255,255,255,0.015)', padding: '1.25rem',
        }}>
          <ImageIcon size={26} color="rgba(148,163,184,0.3)" />
          <div style={{ fontSize: '0.6875rem', color: 'var(--dp-ink-muted)', textAlign: 'center' }}>
            Image not available
          </div>
        </div>
      ) : null}

      <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{
            fontSize: '0.8125rem', fontWeight: 700, color: 'var(--dp-ink)',
            lineHeight: 1.35, letterSpacing: '-0.01em', flex: 1, minWidth: 0,
          }}>
            {gen.image_type}
          </div>
          <GenStatusBadge status={gen.status} />
        </div>

        <div style={{ fontSize: '0.6875rem', color: 'var(--dp-ink-muted)' }}>
          {formatDate(gen.created_at)}
        </div>

        {gen.model_name && (
          <div style={{
            fontSize: '0.625rem', color: 'var(--dp-ink-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {gen.provider} · {gen.model_name}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3125rem' }}>
          {gen.generation_mode === 'reference_based' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
              padding: '0.125rem 0.4375rem', borderRadius: '99px',
              background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)',
              fontSize: '0.5625rem', fontWeight: 700, color: '#34d399',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Reference-based
            </span>
          )}
          {gen.generation_mode === 'text_fallback' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
              padding: '0.125rem 0.4375rem', borderRadius: '99px',
              background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)',
              fontSize: '0.5625rem', fontWeight: 700, color: '#fbbf24',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Text fallback
            </span>
          )}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
            padding: '0.125rem 0.4375rem', borderRadius: '99px',
            background: gen.product_locked ? 'rgba(163,230,53,0.06)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${gen.product_locked ? 'rgba(163,230,53,0.15)' : 'rgba(196,188,255,0.40)'}`,
            fontSize: '0.5625rem', fontWeight: 700,
            color: gen.product_locked ? 'var(--dp-primary)' : '#475569',
            textTransform: 'uppercase' as const, letterSpacing: '0.05em',
          }}>
            Product locked: {gen.product_locked ? 'Yes' : 'No'}
          </span>
        </div>

        {gen.warning && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.3125rem',
            padding: '0.3125rem 0.5rem', borderRadius: '0.375rem',
            background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.14)',
          }}>
            <AlertTriangle size={10} color="rgba(251,191,36,0.6)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: '0.625rem', color: '#fbbf24', lineHeight: 1.5 }}>{gen.warning}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.3125rem', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '0.375rem' }}
          onClick={e => e.stopPropagation()}
        >
          {gen.status === 'completed' && gen.image_url && (
            <button
              type="button"
              onClick={() => onPreview(gen)}
              style={{
                ...btnBase,
                background: 'rgba(83,58,253,0.04)', borderColor: 'rgba(255,255,255,0.1)',
                color: 'var(--dp-ink-muted)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(83,58,253,0.04)' }}
            >
              <Eye size={11} />
              Preview
            </button>
          )}

          {gen.status === 'completed' && gen.image_url && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              style={{
                ...btnBase,
                background: downloading ? 'rgba(163,230,53,0.04)' : 'rgba(83,58,253,0.08)',
                borderColor: 'rgba(83,58,253,0.2)',
                color: 'var(--dp-primary)',
                opacity: downloading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!downloading) e.currentTarget.style.background = 'rgba(163,230,53,0.14)' }}
              onMouseLeave={e => { e.currentTarget.style.background = downloading ? 'rgba(163,230,53,0.04)' : 'rgba(83,58,253,0.08)' }}
            >
              {downloading
                ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                : <Download size={11} />
              }
              {downloading ? '...' : 'Download'}
            </button>
          )}

          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRegenerate(gen.id) }}
            disabled={isRegenerating}
            style={{
              ...btnBase,
              background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)',
              color: 'var(--dp-ink-muted)',
              opacity: isRegenerating ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!isRegenerating) e.currentTarget.style.background = 'rgba(196,188,255,0.40)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
          >
            {isRegenerating
              ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
              : <RefreshCw size={11} />
            }
            {isRegenerating ? '...' : 'Regenerate'}
          </button>

          {gen.prompt && (
            <button
              type="button"
              onClick={handleCopyPrompt}
              style={{
                ...btnBase,
                background: promptCopied ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.03)',
                borderColor: promptCopied ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)',
                color: promptCopied ? '#4ade80' : '#64748b',
              }}
            >
              {promptCopied ? <Check size={11} /> : <Copy size={11} />}
              {promptCopied ? 'Copied' : 'Copy Prompt'}
            </button>
          )}

          {!confirmDelete ? (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setConfirmDelete(true) }}
              style={{
                ...btnBase,
                background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.13)',
                color: '#f87171',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.09)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.04)' }}
            >
              <Trash2 size={11} />
              Delete
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.125rem' }}>
              <span style={{ fontSize: '0.6875rem', color: '#f87171', alignSelf: 'center' }}>Delete?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  ...btnBase,
                  background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.28)',
                  color: '#f87171',
                }}
              >
                {deleting ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {deleting ? '...' : 'Yes'}
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setConfirmDelete(false) }}
                style={{
                  ...btnBase,
                  background: 'rgba(83,58,253,0.04)', borderColor: 'rgba(255,255,255,0.09)',
                  color: 'var(--dp-ink-muted)',
                }}
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface FailedRowProps {
  gen: ImageGeneration
  isRegenerating: boolean
  onDelete: (id: number) => Promise<void>
  onRegenerate: (id: number) => Promise<void>
}

function FailedRow({ gen, isRegenerating, onDelete, onRegenerate }: FailedRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setDeleting(true)
    try {
      await onDelete(gen.id)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
    padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
    fontSize: '0.6875rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
    border: '1px solid transparent',
  }

  const rawError = gen.error_message || 'Unknown error'
  const shortError = rawError.length > 80 ? rawError.slice(0, 77) + '…' : rawError

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
      padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
      background: 'rgba(239,68,68,0.025)', border: '1px solid rgba(239,68,68,0.1)',
    }}>
      <AlertTriangle size={13} color="rgba(248,113,113,0.5)" style={{ flexShrink: 0 }} />

      <div style={{
        fontSize: '0.75rem', fontWeight: 600, color: 'var(--dp-ink-muted)',
        flexShrink: 0, minWidth: 0,
      }}>
        {gen.image_type}
      </div>

      <GenStatusBadge status="failed" />

      <div style={{ fontSize: '0.6875rem', color: 'var(--dp-ink-muted)', flexShrink: 0 }}>
        {formatDate(gen.created_at)}
      </div>

      <div style={{
        fontSize: '0.6875rem', color: 'var(--dp-ink-muted)', flex: 1,
        minWidth: '6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}
        title={rawError}
      >
        {shortError}
      </div>

      <div style={{ display: 'flex', gap: '0.3125rem', flexShrink: 0, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRegenerate(gen.id) }}
          disabled={isRegenerating}
          style={{
            ...btnBase,
            background: 'rgba(83,58,253,0.04)', borderColor: 'rgba(255,255,255,0.1)',
            color: 'var(--dp-ink-muted)',
            opacity: isRegenerating ? 0.5 : 1,
          }}
          onMouseEnter={e => { if (!isRegenerating) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(83,58,253,0.04)' }}
        >
          {isRegenerating
            ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
            : <RefreshCw size={11} />
          }
          {isRegenerating ? '...' : 'Retry'}
        </button>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setConfirmDelete(true) }}
            style={{
              ...btnBase,
              background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.13)',
              color: '#f87171',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.09)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.04)' }}
          >
            <Trash2 size={11} />
            Delete
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.6875rem', color: '#f87171' }}>Delete?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                ...btnBase,
                background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.28)',
                color: '#f87171',
              }}
            >
              {deleting ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {deleting ? '...' : 'Yes'}
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setConfirmDelete(false) }}
              style={{
                ...btnBase,
                background: 'rgba(83,58,253,0.04)', borderColor: 'rgba(255,255,255,0.09)',
                color: 'var(--dp-ink-muted)',
              }}
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GeneratedImageSlots({
  generations, regeneratingIds, onDelete, onRegenerate,
}: Props) {
  const [previewGen, setPreviewGen] = useState<ImageGeneration | null>(null)
  const completed = generations.filter(g => g.status === 'completed')
  const failed = generations.filter(g => g.status === 'failed')
  const [failedOpen, setFailedOpen] = useState(completed.length === 0)

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: '0.6875rem', fontWeight: 700, color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: '0.08em',
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5625rem',
        marginBottom: '0.5rem', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 3, height: 14, borderRadius: 2,
          background: 'linear-gradient(180deg, #a3e635, #34d399)', flexShrink: 0,
        }} />
        <span style={sectionLabelStyle}>Generated Images</span>
        {completed.length > 0 && (
          <span style={{
            padding: '0.125rem 0.5rem', borderRadius: '99px',
            background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)',
            fontSize: '0.5625rem', fontWeight: 700, color: '#34d399',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {completed.length} ready
          </span>
        )}
      </div>

      {completed.length === 0 && failed.length === 0 ? (
        <div style={{
          borderRadius: '0.875rem', padding: '2rem 1.5rem',
          border: '1px dashed rgba(196,188,255,0.40)',
          background: 'rgba(255,255,255,0.01)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '0.625rem', textAlign: 'center',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '0.625rem',
            background: 'rgba(163,230,53,0.04)', border: '1px solid rgba(83,58,253,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ImageIcon size={18} color="rgba(163,230,53,0.3)" />
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', lineHeight: 1.6 }}>
            No images generated yet.
            <br />Select a type below and click <strong style={{ color: 'var(--dp-primary)' }}>Generate Image</strong>.
          </div>
        </div>
      ) : (
        <>
          {completed.length === 0 && failed.length > 0 && (
            <div style={{
              borderRadius: '0.875rem', padding: '1.25rem 1.5rem',
              border: '1px dashed rgba(196,188,255,0.40)',
              background: 'rgba(255,255,255,0.01)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.5rem', textAlign: 'center', marginBottom: '1.25rem',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '0.625rem',
                background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertTriangle size={16} color="rgba(248,113,113,0.45)" />
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', lineHeight: 1.6 }}>
                No generated images yet.
                <br />Some attempts failed. You can retry or delete them below.
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <>
              <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: '0 0 1.125rem', lineHeight: 1.6 }}>
                Click any image to preview, download, or manage.
              </p>
              <div className="gen-images-grid">
                {completed.map(gen => (
                  <GeneratedCard
                    key={gen.id}
                    gen={gen}
                    isRegenerating={regeneratingIds.has(gen.id)}
                    onDelete={onDelete}
                    onRegenerate={onRegenerate}
                    onPreview={setPreviewGen}
                  />
                ))}
              </div>
            </>
          )}

          {failed.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setFailedOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'none', border: 'none', padding: '0',
                  cursor: 'pointer', fontFamily: 'inherit', marginBottom: failedOpen ? '0.75rem' : '0',
                }}
              >
                <span style={sectionLabelStyle}>
                  Failed generations — {failed.length}
                </span>
                {failedOpen
                  ? <ChevronUp size={13} color="#6b7280" />
                  : <ChevronDown size={13} color="#6b7280" />
                }
                <span style={{
                  fontSize: '0.6875rem', color: 'var(--dp-ink-muted)', fontWeight: 400,
                  textTransform: 'none', letterSpacing: 0,
                }}>
                  {failedOpen ? 'Hide failed attempts' : 'Show failed attempts'}
                </span>
              </button>

              {failedOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4375rem' }}>
                  {failed.map(gen => (
                    <FailedRow
                      key={gen.id}
                      gen={gen}
                      isRegenerating={regeneratingIds.has(gen.id)}
                      onDelete={onDelete}
                      onRegenerate={onRegenerate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {previewGen && (
        <ImagePreviewModal
          generation={previewGen}
          onClose={() => setPreviewGen(null)}
          onDelete={async (id) => {
            await onDelete(id)
            setPreviewGen(null)
          }}
          onRegenerate={async (id) => {
            await onRegenerate(id)
            setPreviewGen(null)
          }}
          isRegenerating={regeneratingIds.has(previewGen.id)}
        />
      )}
    </div>
  )
}
