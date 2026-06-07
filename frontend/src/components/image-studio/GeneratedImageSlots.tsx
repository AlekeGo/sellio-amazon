import { ImageIcon } from 'lucide-react'

const SLOTS = ['Preview 1', 'Preview 2', 'Preview 3', 'Preview 4']

export default function GeneratedImageSlots() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5625rem', marginBottom: '1.125rem' }}>
        <div style={{
          width: 3, height: 14, borderRadius: 2,
          background: 'linear-gradient(180deg, #a3e635, #34d399)', flexShrink: 0,
        }} />
        <span style={{
          fontSize: '0.6875rem', fontWeight: 700, color: '#6b7280',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Generated Images — 0 / 4
        </span>
        <span style={{
          padding: '0.125rem 0.5rem', borderRadius: '99px',
          background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.14)',
          fontSize: '0.5625rem', fontWeight: 700, color: '#6b9e1a',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Coming Day 8
        </span>
      </div>
      <div className="gen-slots-grid">
        {SLOTS.map((label, i) => (
          <div
            key={label}
            style={{
              borderRadius: '0.75rem',
              border: '1px dashed rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.015)',
              aspectRatio: '1 / 1',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.625rem', padding: '1rem',
              minHeight: 120,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '0.625rem',
              background: 'rgba(163,230,53,0.04)', border: '1px solid rgba(163,230,53,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ImageIcon size={18} color="rgba(163,230,53,0.3)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '0.75rem', fontWeight: 600, color: '#64748b',
                marginBottom: '0.1875rem', letterSpacing: '-0.01em',
              }}>
                {label}
              </div>
              <div style={{ fontSize: '0.625rem', color: '#475569', fontWeight: 500 }}>
                Coming Day 8
              </div>
            </div>
            <div style={{
              padding: '0.1875rem 0.5rem', borderRadius: '99px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.5625rem', fontWeight: 600, color: '#475569',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Slot {i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
