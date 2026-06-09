import { ShieldCheck, AlertTriangle, Camera } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AuditImage } from '../../types/audit'

interface Props {
  images: AuditImage[]
  auditId?: number
}

export default function ProductReferenceStatus({ images }: Props) {
  const hasPhotos = images.length > 0
  const firstImage = images[0]

  if (hasPhotos) {
    return (
      <div style={{
        borderRadius: '0.75rem', padding: '1rem 1.25rem',
        background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.18)',
        marginBottom: '1.5rem',
        display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '0.875rem', flex: 1, minWidth: 220, alignItems: 'flex-start' }}>
          {firstImage && (
            <div style={{
              width: 64, height: 64, borderRadius: '0.5rem', flexShrink: 0,
              border: '1px solid rgba(52,211,153,0.25)', overflow: 'hidden',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <img
                src={firstImage.image}
                alt={firstImage.original_filename}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4375rem' }}>
              <ShieldCheck size={14} color="#34d399" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                Reference product detected
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1875rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#34d399' }}>
                Using your uploaded product photo
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Product identity locked
              </span>
              {images.length > 1 && (
                <span style={{ fontSize: '0.6875rem', color: '#475569' }}>
                  Using 1 of {images.length} product reference photos
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'flex-end' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
            padding: '0.25rem 0.625rem', borderRadius: '99px',
            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)',
            fontSize: '0.6875rem', fontWeight: 700, color: '#34d399',
            whiteSpace: 'nowrap',
          }}>
            <Camera size={10} />
            Photorealistic ecommerce mode
          </span>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {images.slice(1, 4).map(img => (
                <div key={img.id} style={{
                  width: 32, height: 32, borderRadius: '0.3125rem', flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
                  background: 'rgba(0,0,0,0.2)',
                }}>
                  <img
                    src={img.image}
                    alt={img.original_filename}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              ))}
              {images.length > 4 && (
                <div style={{
                  width: 32, height: 32, borderRadius: '0.3125rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5625rem', color: '#64748b', fontWeight: 700,
                }}>
                  +{images.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      borderRadius: '0.75rem', padding: '0.875rem 1.25rem',
      background: 'rgba(251,191,36,0.03)', border: '1px dashed rgba(251,191,36,0.22)',
      marginBottom: '1.5rem',
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap',
    }}>
      <AlertTriangle size={15} color="rgba(251,191,36,0.6)" style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fbbf24', marginBottom: '0.25rem' }}>
          No product reference photo found
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6 }}>
          Sellio will generate an approximate product from text only. For best accuracy, upload 1–3 clean product photos on a clean background.
        </div>
      </div>
      <Link
        to="/dashboard/new-audit"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
          fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24',
          textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.15s',
          flexShrink: 0, alignSelf: 'center',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fde68a')}
        onMouseLeave={e => (e.currentTarget.style.color = '#fbbf24')}
      >
        Add product photos in New Audit →
      </Link>
    </div>
  )
}
