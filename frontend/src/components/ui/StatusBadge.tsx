import type { AuditStatus } from '../../types/audit'

const STATUS_CONFIG: Record<AuditStatus, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: 'Draft', color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)' },
  ready_for_analysis: { label: 'Ready', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
  pending_analysis: { label: 'Pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
  completed: { label: 'Completed', color: '#2F9E6F', bg: 'rgba(47,158,111,0.1)', border: 'rgba(47,158,111,0.2)' },
  failed: { label: 'Failed', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
}

export default function StatusBadge({ status }: { status: AuditStatus }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.1875rem 0.625rem',
        borderRadius: '99px',
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
        flexShrink: 0,
      }}
    >
      {c.label}
    </span>
  )
}
