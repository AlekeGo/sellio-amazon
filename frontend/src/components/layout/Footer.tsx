import { Link } from 'react-router-dom'
import { BarChart2 } from 'lucide-react'

const footerLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Login', href: '/login' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
]

export default function Footer() {
  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid rgba(196,188,255,0.45)',
      padding: '2.5rem 1.5rem 1.5rem',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '0.625rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BarChart2 size={15} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--dp-ink)', letterSpacing: '-0.02em' }}>
                Sellio
              </span>
            </Link>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', lineHeight: 1.6, maxWidth: 220 }}>
              AI-powered Amazon listing audits. Improve your score, boost conversions.
            </p>
          </div>

          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 2rem' }}>
            {footerLinks.map((link) => (
              link.href.startsWith('#') || link.href.startsWith('/#') ? (
                <a key={link.label} href={link.href} className="footer-link" style={{ fontSize: '0.875rem', textDecoration: 'none' }}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} to={link.href} className="footer-link" style={{ fontSize: '0.875rem', textDecoration: 'none' }}>
                  {link.label}
                </Link>
              )
            ))}
          </nav>
        </div>

        <div style={{
          borderTop: '1px solid rgba(196,188,255,0.35)',
          paddingTop: '1.125rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)' }}>
            © {new Date().getFullYear()} Sellio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
