import { Link } from 'react-router-dom'

const footerLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Login', href: '/login' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
]

function SelliöLogo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline select-none w-fit">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%)',
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
          <path d="M6.5 9.5L8 11L11.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="text-[1.125rem] font-bold tracking-tight" style={{ color: '#f1f5f9', letterSpacing: '-0.03em' }}>
        sell<span className="gradient-text">io</span>
      </span>
    </Link>
  )
}

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3,8,18,0.9)' }}>
      <div className="container-xl py-14">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div className="flex flex-col gap-3">
            <SelliöLogo />
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#64748b' }}>
              AI Amazon Conversion Studio. Audit, upgrade, and generate premium visuals for your listings.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              link.href.startsWith('#') || link.href.startsWith('/#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm transition-colors"
                  style={{ color: '#64748b', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm transition-colors"
                  style={{ color: '#64748b', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>
        </div>

        <div
          className="mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-xs" style={{ color: '#475569' }}>
            © 2026 Sellio. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#334155' }}>
            Not affiliated with Amazon.com, Inc.
          </p>
        </div>
      </div>
    </footer>
  )
}
