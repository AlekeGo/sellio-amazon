import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'

export default function ContactPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--dp-surface-soft)' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: 68 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid rgba(196,188,255,0.35)',
            boxShadow: '0 4px 32px rgba(83,58,253,0.06)',
            padding: 'clamp(2rem, 5vw, 3rem)',
          }}>
            <Link to="/" style={{ fontSize: '0.875rem', color: 'var(--dp-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.75rem' }}>
              ← Back to home
            </Link>

            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--dp-ink)', marginBottom: '0.625rem', lineHeight: 1.2 }}>
                Contact Sellio Support
              </h1>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--dp-ink-secondary)' }}>
                For billing questions, account issues, technical problems, or data requests — we're here to help. Reach out and we'll get back to you as soon as possible.
              </p>
            </div>

            {/* Email card */}
            <div style={{
              background: 'var(--dp-surface-indigo)',
              border: '1px solid rgba(196,188,255,0.5)',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '0.75rem',
                background: 'rgba(83,58,253,0.1)',
                border: '1px solid rgba(83,58,253,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--dp-primary)',
              }}>
                <Mail size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--dp-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                  Support Email
                </p>
                <a
                  href="mailto:support@wesellio.com"
                  style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--dp-primary)', textDecoration: 'none', wordBreak: 'break-all' }}
                >
                  support@wesellio.com
                </a>
                <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', marginTop: '0.25rem' }}>
                  We typically respond within 1–2 business days.
                </p>
              </div>
            </div>

            <a
              href="mailto:support@wesellio.com"
              className="dp-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}
            >
              <Mail size={17} />
              Send us an email
            </a>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(196,188,255,0.35)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', marginBottom: '0.75rem' }}>
                Common topics:
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--dp-ink-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <li>Billing questions or subscription changes</li>
                <li>Refund or charge dispute — see our <Link to="/refund-policy" style={{ color: 'var(--dp-primary)', textDecoration: 'none' }}>Refund Policy</Link></li>
                <li>Account access or login issues</li>
                <li>Technical problems with audits or image generation</li>
                <li>Data deletion or privacy requests — see our <Link to="/privacy-policy" style={{ color: 'var(--dp-primary)', textDecoration: 'none' }}>Privacy Policy</Link></li>
              </ul>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(196,188,255,0.35)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/privacy-policy" style={footLinkStyle}>Privacy Policy</Link>
              <Link to="/terms-of-service" style={footLinkStyle}>Terms of Service</Link>
              <Link to="/refund-policy" style={footLinkStyle}>Refund Policy</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

const footLinkStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--dp-primary)',
  textDecoration: 'none',
}
