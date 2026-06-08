import { useState } from 'react'
import { ImageIcon, ExternalLink, Download, Copy, Check, AlertTriangle } from 'lucide-react'
import type { ImageGeneration } from '../../types/imageGeneration'

interface Props {
  generations: ImageGeneration[]
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

function GeneratedCard({ gen }: { gen: ImageGeneration }) {
  const [promptCopied, setPromptCopied] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleDownload = () => {
    if (!gen.image_url) return
    const a = document.createElement('a')
    a.href = gen.image_url
    a.download = `${gen.image_type.replace(/\s+/g, '-').toLowerCase()}.jpg`
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleCopyPrompt = () => {
    if (!gen.prompt) return
    navigator.clipboard.writeText(gen.prompt).then(() => {
      setPromptCopied(true)
      setTimeout(() => setPromptCopied(false), 2200)
    }).catch(() => {})
  }

  return (
    <div
      style={{
        borderRadius: '0.875rem', overflow: 'hidden',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
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
          <div style={{ fontSize: '0.6875rem', color: '#475569', textAlign: 'center' }}>
            Preview unavailable
          </div>
          <a
            href={gen.image_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.3125rem 0.625rem', borderRadius: '0.375rem',
              background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.2)',
              color: '#a3e635', fontSize: '0.6875rem', fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={11} />
            Open Image
          </a>
        </div>
      ) : gen.status === 'failed' ? (
        <div style={{
          aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
          background: 'rgba(239,68,68,0.025)', padding: '1.25rem',
        }}>
          <AlertTriangle size={26} color="rgba(248,113,113,0.45)" />
          <div style={{
            fontSize: '0.75rem', color: '#f87171', textAlign: 'center',
            lineHeight: 1.5, opacity: 0.8,
          }}>
            Generation failed.
            <br />Retry from the brief panel.
          </div>
        </div>
      ) : null}

      <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: '0.5rem',
        }}>
          <div style={{
            fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9',
            lineHeight: 1.35, letterSpacing: '-0.01em', flex: 1, minWidth: 0,
          }}>
            {gen.image_type}
          </div>
          <GenStatusBadge status={gen.status} />
        </div>

        <div style={{ fontSize: '0.6875rem', color: '#475569' }}>
          {formatDate(gen.created_at)}
        </div>

        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '0.25rem' }}>
          {gen.status === 'completed' && gen.image_url && (
            <>
              <a
                href={gen.image_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.3125rem 0.5625rem', borderRadius: '0.375rem',
                  background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.2)',
                  color: '#a3e635', fontSize: '0.6875rem', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(163,230,53,0.14)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(163,230,53,0.08)' }}
              >
                <ExternalLink size={11} />
                Open
              </a>
              <button
                type="button"
                onClick={handleDownload}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.3125rem 0.5625rem', borderRadius: '0.375rem',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', fontSize: '0.6875rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                <Download size={11} />
                Download
              </button>
            </>
          )}
          {gen.prompt && (
            <button
              type="button"
              onClick={handleCopyPrompt}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.3125rem 0.5625rem', borderRadius: '0.375rem',
                background: promptCopied ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${promptCopied ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`,
                color: promptCopied ? '#4ade80' : '#64748b',
                fontSize: '0.6875rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {promptCopied ? <Check size={11} /> : <Copy size={11} />}
              {promptCopied ? 'Copied' : 'Copy Prompt'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GeneratedImageSlots({ generations }: Props) {
  const completed = generations.filter(g => g.status === 'completed')
  const failed = generations.filter(g => g.status === 'failed')

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5625rem',
        marginBottom: '1.125rem', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 3, height: 14, borderRadius: 2,
          background: 'linear-gradient(180deg, #a3e635, #34d399)', flexShrink: 0,
        }} />
        <span style={{
          fontSize: '0.6875rem', fontWeight: 700, color: '#6b7280',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Generated Images
        </span>
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
          border: '1px dashed rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.01)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '0.625rem', textAlign: 'center',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '0.625rem',
            background: 'rgba(163,230,53,0.04)', border: '1px solid rgba(163,230,53,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ImageIcon size={18} color="rgba(163,230,53,0.3)" />
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6 }}>
            No images generated yet.
            <br />Select a type below and click <strong style={{ color: '#a3e635' }}>Generate Image</strong>.
          </div>
        </div>
      ) : (
        <>
          {completed.length > 0 && (
            <div className="gen-images-grid">
              {completed.map(gen => (
                <GeneratedCard key={gen.id} gen={gen} />
              ))}
            </div>
          )}

          {failed.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{
                fontSize: '0.5625rem', fontWeight: 700, color: '#6b7280',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: '0.75rem',
              }}>
                Failed — {failed.length}
              </div>
              <div className="gen-images-grid">
                {failed.map(gen => (
                  <GeneratedCard key={gen.id} gen={gen} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
