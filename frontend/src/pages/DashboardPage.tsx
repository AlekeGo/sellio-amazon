import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, Crown, FileText, Star, Package } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { listAudits } from '../lib/auditsApi'
import { getMyBilling } from '../lib/billingApi'
import StatusBadge from '../components/ui/StatusBadge'
import type { AuditListItem } from '../types/audit'
import type { BillingMeResponse } from '../types/billing'

const PLAN_LABELS: Record<string, string> = {
  free_trial: 'Free Trial',
  full_upgrade: 'Full Listing Upgrade',
  launch: 'Launch',
  pro: 'Pro',
  growth: 'Growth',
  agency: 'Agency',
}

function ChecklistStep({ num, text }: { num: number; text: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      padding: '0.75rem 0', borderBottom: '1px solid rgba(196,188,255,0.25)',
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 700,
        background: 'rgba(83,58,253,0.09)', border: '1px solid rgba(83,58,253,0.2)',
        color: 'var(--dp-primary)', marginTop: 1,
      }}>
        {num}
      </div>
      <span style={{ fontSize: '0.875rem', color: 'var(--dp-ink)', lineHeight: 1.5 }}>{text}</span>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function RecentAuditItem({ audit }: { audit: AuditListItem }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.625rem 0', borderBottom: '1px solid rgba(196,188,255,0.25)',
    }}>
      {audit.thumbnail ? (
        <img src={audit.thumbnail} alt={audit.product_name} style={{ width: 32, height: 32, borderRadius: '0.375rem', objectFit: 'cover', flexShrink: 0, background: '#F6F9FC' }} />
      ) : (
        <div style={{ width: 32, height: 32, borderRadius: '0.375rem', background: 'rgba(83,58,253,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileText size={14} color="var(--dp-primary)" />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--dp-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
          {audit.product_name || 'Untitled Audit'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--dp-ink-muted)' }}>
            {audit.category || (audit.entry_type === 'amazon_url' ? 'Amazon URL' : 'Product Photos')}
            {' · '}
            {formatDate(audit.created_at)}
          </span>
          <StatusBadge status={audit.status} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {typeof audit.result_score === 'number' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.125rem 0.4375rem', borderRadius: '99px',
            fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '-0.01em',
            color: audit.result_score >= 80 ? '#16a34a' : audit.result_score >= 60 ? '#b45309' : '#dc2626',
            background: audit.result_score >= 80 ? 'rgba(22,163,74,0.1)' : audit.result_score >= 60 ? 'rgba(180,83,9,0.1)' : 'rgba(220,38,38,0.1)',
            border: `1px solid ${audit.result_score >= 80 ? 'rgba(22,163,74,0.2)' : audit.result_score >= 60 ? 'rgba(180,83,9,0.2)' : 'rgba(220,38,38,0.2)'}`,
          }}>
            {audit.result_score}
          </span>
        )}
        <Link
          to={`/dashboard/audits/${audit.id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--dp-primary)', textDecoration: 'none', whiteSpace: 'nowrap' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Open Report
          <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [audits, setAudits] = useState<AuditListItem[]>([])
  const [auditsLoading, setAuditsLoading] = useState(true)
  const [auditsError, setAuditsError] = useState(false)
  const [billing, setBilling] = useState<BillingMeResponse | null>(null)

  const firstName = user?.full_name?.trim().split(' ')[0] || user?.email?.split('@')[0] || 'there'

  useEffect(() => {
    listAudits()
      .then(res => setAudits(res.data.slice(0, 5)))
      .catch(() => setAuditsError(true))
      .finally(() => setAuditsLoading(false))
    getMyBilling()
      .then(res => setBilling(res.data))
      .catch(() => {})
  }, [])

  const cardBase = {
    borderRadius: '0.875rem',
    padding: '1.125rem 1.25rem',
    background: '#ffffff',
    border: '1px solid rgba(196,188,255,0.45)',
    boxShadow: '0 2px 12px rgba(83,58,253,0.06)',
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.75rem)', fontWeight: 800, color: 'var(--dp-ink)', letterSpacing: '-0.03em', margin: '0 0 0.375rem' }}>
          Welcome back, {firstName}
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--dp-ink-muted)', margin: 0 }}>
          Your AI-powered Amazon conversion studio is ready.
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div style={{ ...cardBase, background: 'linear-gradient(135deg, rgba(83,58,253,0.07) 0%, rgba(122,102,255,0.04) 100%)', border: '1px solid rgba(83,58,253,0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Crown size={14} color="var(--dp-primary)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)', fontWeight: 500 }}>Current plan</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--dp-primary)', marginBottom: '0.25rem' }}>
            {billing ? (PLAN_LABELS[billing.profile.current_plan] ?? billing.profile.current_plan) : 'Free Trial'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)' }}>
            {billing ? (billing.profile.subscription_status === 'active' ? 'Active' : 'Limited access') : '—'}
          </div>
        </div>

        <div style={{ ...cardBase, background: billing && !billing.can_run_audit ? 'rgba(249,115,22,0.04)' : '#ffffff', border: billing && !billing.can_run_audit ? '1px solid rgba(249,115,22,0.22)' : '1px solid rgba(196,188,255,0.45)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <FileText size={14} color={billing && !billing.can_run_audit ? '#f97316' : 'var(--dp-ink-muted)'} />
            <span style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)', fontWeight: 500 }}>Audit credits</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: billing && billing.balance.audit_credits > 0 ? 'var(--dp-ink)' : 'var(--dp-ink-muted)', marginBottom: '0.25rem' }}>
            {billing?.balance.audit_credits ?? '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: billing && !billing.can_run_audit ? '#f97316' : 'var(--dp-ink-muted)' }}>
            {billing && !billing.can_run_audit ? 'upgrade to audit' : 'AI listing audits'}
          </div>
        </div>

        <div style={cardBase}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <Star size={14} color="var(--dp-ink-muted)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)', fontWeight: 500 }}>Full upgrade</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: billing && billing.balance.full_upgrade_credits > 0 ? 'var(--dp-ink)' : 'var(--dp-ink-muted)', marginBottom: '0.25rem' }}>
            {billing?.balance.full_upgrade_credits ?? '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)' }}>listing upgrades</div>
        </div>

        <div style={cardBase}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <Package size={14} color="var(--dp-ink-muted)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)', fontWeight: 500 }}>Image credits</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: billing && billing.balance.image_generation_credits > 0 ? 'var(--dp-ink)' : 'var(--dp-ink-muted)', marginBottom: '0.25rem' }}>
            {billing?.balance.image_generation_credits ?? '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)' }}>AI image generations</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        <Link to="/dashboard/new-audit" className="dp-btn-primary">
          <Zap size={15} />
          Create New Audit
        </Link>
        {billing?.upgrade_required ? (
          <Link to="/dashboard/billing" className="dp-btn-primary" style={{ background: 'linear-gradient(135deg, #7c3aed, #533AFD)' }}>
            <Crown size={15} />
            Upgrade Plan
          </Link>
        ) : (
          <Link to="/dashboard/billing" className="dp-btn-ghost">
            Manage Billing
            <ArrowRight size={15} />
          </Link>
        )}
      </div>

      <div className="dashboard-bottom-grid">
        <div style={{ ...cardBase }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dp-ink-muted)', margin: '0 0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Getting started
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: '0 0 1rem' }}>
            Three steps to better Amazon conversions
          </p>
          <div>
            <ChecklistStep num={1} text="Start with Amazon URL or product photos" />
            <ChecklistStep num={2} text="Review your AI-powered audit report" />
            <ChecklistStep num={3} text="Generate premium Amazon-ready visuals" />
          </div>
        </div>

        <div style={{ ...cardBase }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dp-ink-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Recent audits
            </h3>
            {audits.length > 0 && (
              <Link to="/dashboard/audits" style={{ fontSize: '0.75rem', color: 'var(--dp-primary)', textDecoration: 'none', fontWeight: 600 }}>
                View all
              </Link>
            )}
          </div>

          {auditsLoading && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0 }}>Loading...</p>
          )}

          {!auditsLoading && auditsError && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0 }}>
              Could not load recent audits.
            </p>
          )}

          {!auditsLoading && !auditsError && audits.length > 0 && (
            <div>
              {audits.map(audit => (
                <RecentAuditItem key={audit.id} audit={audit} />
              ))}
            </div>
          )}

          {!auditsLoading && !auditsError && audits.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', borderRadius: '0.75rem', background: 'rgba(83,58,253,0.03)', border: '1px dashed rgba(83,58,253,0.18)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '0.625rem', background: 'rgba(83,58,253,0.08)', border: '1px solid rgba(83,58,253,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
                <Zap size={18} color="var(--dp-primary)" />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink)', margin: '0 0 0.25rem', fontWeight: 600 }}>
                No audits yet
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: '0 0 1.25rem' }}>
                Run your first AI audit to get started.
              </p>
              <Link to="/dashboard/new-audit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--dp-primary)', textDecoration: 'none', fontWeight: 600 }}>
                <Zap size={13} />
                Create first audit
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
