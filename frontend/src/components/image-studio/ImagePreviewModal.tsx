import { useState, useEffect } from 'react'
import {
  X, Download, ExternalLink, Copy, Check, RefreshCw, Trash2, Loader2, ImageIcon,
} from 'lucide-react'
import type { ImageGeneration } from '../../types/imageGeneration'
import { downloadImageGeneration } from '../../lib/imageGenerationsApi'

interface Props {
  generation: ImageGeneration
  onClose: () => void
  onDelete: (id: number) => Promise<void>
  onRegenerate: (id: number) => Promise<void>
  isRegenerating: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ImagePreviewModal({
  generation, onClose, onDelete, onRegenerate, isRegenerating,
}: Props) {
  const [promptCopied, setPromptCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadNote, setDownloadNote] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  async function handleDownload() {
    setDownloading(true)
    setDownloadNote('')
    try {
      const res = await downloadImageGeneration(generation.id)
      const blob = new Blob([res.data], {
        type: (res.headers as Record<string, string>)['content-type'] || 'image/jpeg',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const slug = generation.image_type.replace(/\s+/g, '-').toLowerCase()
      a.download = `sellio-${generation.id}-${slug}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setDownloadNote('Download failed — opening original in new tab.')
      if (generation.image_url) {
        window.open(generation.image_url, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setDownloading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(generation.id)
      onClose()
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  function handleCopyPrompt() {
    if (!generation.prompt) return
    navigator.clipboard.writeText(generation.prompt).then(() => {
      setPromptCopied(true)
      setTimeout(() => setPromptCopied(false), 2200)
    }).catch(() => {})
  }

  const statusCfg =
    generation.status === 'completed'
      ? { label: 'Generated', c: '#34d399', bg: 'rgba(52,211,153,0.09)', bd: 'rgba(52,211,153,0.22)' }
      : generation.status === 'generating'
      ? { label: 'Generating', c: '#fbbf24', bg: 'rgba(251,191,36,0.09)', bd: 'rgba(251,191,36,0.22)' }
      : { label: 'Failed', c: '#f87171', bg: 'rgba(248,113,113,0.08)', bd: 'rgba(248,113,113,0.2)' }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: 920,
        maxHeight: 'calc(100vh - 2rem)',
        borderRadius: '1rem',
        background: '#0a1510',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <span style={{
              fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9',
              letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {generation.image_type}
            </span>
            <span style={{
              padding: '0.1875rem 0.5rem', borderRadius: '99px',
              background: statusCfg.bg, border: `1px solid ${statusCfg.bd}`,
              fontSize: '0.5625rem', fontWeight: 700, color: statusCfg.c,
              textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
            }}>
              {statusCfg.label}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: '0.5rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#64748b', cursor: 'pointer', flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
              e.currentTarget.style.color = '#94a3b8'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.color = '#64748b'
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          overflow: 'auto',
          flex: 1,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {generation.status === 'completed' && generation.image_url ? (
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1.5rem',
                minHeight: 280,
              }}>
                <img
                  src={generation.image_url}
                  alt={generation.image_type}
                  style={{
                    maxWidth: '100%', maxHeight: '60vh',
                    objectFit: 'contain', borderRadius: '0.5rem',
                    display: 'block',
                  }}
                />
              </div>
            ) : generation.status === 'completed' && !generation.image_url ? (
              <div style={{
                minHeight: 200,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.75rem', padding: '2rem',
                background: 'rgba(255,255,255,0.01)',
              }}>
                <ImageIcon size={32} color="rgba(148,163,184,0.25)" />
                <div style={{ fontSize: '0.8125rem', color: '#64748b', textAlign: 'center' }}>
                  Image not available
                </div>
              </div>
            ) : generation.status === 'failed' ? (
              <div style={{
                minHeight: 200,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.75rem', padding: '2rem',
                background: 'rgba(239,68,68,0.03)',
              }}>
                <div style={{ fontSize: '0.9375rem', color: '#f87171', fontWeight: 600 }}>
                  Generation failed
                </div>
                {generation.error_message && (
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', textAlign: 'center', maxWidth: 400 }}>
                    {generation.error_message}
                  </div>
                )}
              </div>
            ) : null}

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{
                    fontSize: '0.5625rem', fontWeight: 700, color: '#6b7280',
                    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem',
                  }}>
                    Created
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                    {formatDate(generation.created_at)}
                  </div>
                </div>
                {generation.completed_at && (
                  <div>
                    <div style={{
                      fontSize: '0.5625rem', fontWeight: 700, color: '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem',
                    }}>
                      Completed
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                      {formatDate(generation.completed_at)}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{
                    fontSize: '0.5625rem', fontWeight: 700, color: '#6b7280',
                    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem',
                  }}>
                    Model
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                    {generation.model_name}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {generation.status === 'completed' && generation.image_url && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={downloading}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                        background: '#a3e635', border: 'none',
                        color: '#071008', fontSize: '0.8125rem', fontWeight: 700,
                        cursor: downloading ? 'wait' : 'pointer', fontFamily: 'inherit',
                        transition: 'opacity 0.15s',
                        opacity: downloading ? 0.7 : 1,
                      }}
                    >
                      {downloading
                        ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        : <Download size={13} />
                      }
                      {downloading ? 'Downloading...' : 'Download'}
                    </button>
                    <a
                      href={generation.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                        background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.22)',
                        color: '#a3e635', fontSize: '0.8125rem', fontWeight: 600,
                        textDecoration: 'none', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(163,230,53,0.14)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(163,230,53,0.08)' }}
                    >
                      <ExternalLink size={13} />
                      Open Original
                    </a>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => onRegenerate(generation.id)}
                  disabled={isRegenerating}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 600,
                    cursor: isRegenerating ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    opacity: isRegenerating ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { if (!isRegenerating) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                >
                  {isRegenerating
                    ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    : <RefreshCw size={13} />
                  }
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </button>

                {generation.prompt && (
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                      background: promptCopied ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${promptCopied ? 'rgba(74,222,128,0.22)' : 'rgba(255,255,255,0.08)'}`,
                      color: promptCopied ? '#4ade80' : '#64748b',
                      fontSize: '0.8125rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    {promptCopied ? <Check size={13} /> : <Copy size={13} />}
                    {promptCopied ? 'Copied' : 'Copy Prompt'}
                  </button>
                )}

                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                      background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.14)',
                      color: '#f87171', fontSize: '0.8125rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      marginLeft: 'auto',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)' }}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    marginLeft: 'auto', flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: '0.8125rem', color: '#f87171' }}>Delete this image?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.375rem 0.75rem', borderRadius: '0.4375rem',
                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#f87171', fontSize: '0.8125rem', fontWeight: 700,
                        cursor: deleting ? 'wait' : 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {deleting ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      style={{
                        padding: '0.375rem 0.75rem', borderRadius: '0.4375rem',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                        color: '#64748b', fontSize: '0.8125rem', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {downloadNote && (
                <div style={{
                  padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)',
                  fontSize: '0.8125rem', color: '#fbbf24',
                }}>
                  {downloadNote}
                </div>
              )}

              {generation.prompt && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPrompt(p => !p)}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      fontSize: '0.6875rem', fontWeight: 700, color: '#475569',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      marginBottom: showPrompt ? '0.625rem' : 0,
                    }}
                  >
                    {showPrompt ? '▾ Hide Prompt' : '▸ View Prompt'}
                  </button>
                  {showPrompt && (
                    <div style={{
                      padding: '0.75rem 0.875rem', borderRadius: '0.5rem',
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                      <pre style={{
                        fontSize: '0.75rem', color: '#64748b', margin: 0,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        whiteSpace: 'pre-wrap', lineHeight: 1.7, wordBreak: 'break-word',
                      }}>
                        {generation.prompt}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
