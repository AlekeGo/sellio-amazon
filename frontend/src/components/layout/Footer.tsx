import { Link } from 'react-router-dom'

const footerLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Login', href: '/login' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
]

const socialLinks = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.33a8.16 8.16 0 0 0 4.77 1.52V7.4a4.85 4.85 0 0 1-1-.71z"/>
      </svg>
    ),
  },
  {
    label: 'X',
    href: '#',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
]

function SelliöLogo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline select-none w-fit">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #166534 0%, #4ade80 100%)' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="10" width="2.5" height="4" rx="0.75" fill="white" opacity="0.65"/>
          <rect x="6.75" y="6.5" width="2.5" height="7.5" rx="0.75" fill="white" opacity="0.82"/>
          <rect x="11.5" y="2.5" width="2.5" height="11.5" rx="0.75" fill="white"/>
        </svg>
      </div>
      <span
        className="font-bold tracking-tight"
        style={{ color: '#e8f4e8', letterSpacing: '-0.04em', fontSize: '1.1rem' }}
      >
        sell<span className="gradient-text">io</span>
      </span>
    </Link>
  )
}

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(7,14,10,0.97)' }}>
      <div className="container-xl py-14">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div className="flex flex-col gap-3">
            <SelliöLogo />
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#64748b' }}>
              Audit, upgrade, and generate premium visuals for your Amazon listings.
            </p>
            <div className="flex items-center gap-4 mt-1">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{ color: '#475569', transition: 'color 0.15s ease', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              link.href.startsWith('#') || link.href.startsWith('/#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="footer-link text-sm"
                  style={{ textDecoration: 'none' }}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="footer-link text-sm"
                  style={{ textDecoration: 'none' }}
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
        </div>
      </div>
    </footer>
  )
}
