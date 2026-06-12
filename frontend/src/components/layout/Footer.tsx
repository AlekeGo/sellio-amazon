import React from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../ui/BrandLogo'

const footerLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Login', href: '/login' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Refund Policy', href: '/refund-policy' },
  { label: 'Contact', href: '/contact' },
]

// Inline SVG icons — no react-icons dependency needed
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const TikTokIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.97a8.17 8.17 0 004.78 1.54V7.07a4.85 4.85 0 01-1.01-.38z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

type SocialItem = {
  key: string
  label: string
  icon: () => React.JSX.Element
  href: string | null
  color: string
  borderColor: string
  hoverBg: string
  hoverBorder: string
}

const socialItems: SocialItem[] = [
  {
    key: 'x',
    label: 'X',
    icon: XIcon,
    href: 'https://x.com/aleke_99?s=11',
    color: '#0f0f0f',
    borderColor: 'rgba(15,15,15,0.25)',
    hoverBg: 'rgba(15,15,15,0.06)',
    hoverBorder: 'rgba(15,15,15,0.5)',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    icon: TikTokIcon,
    href: 'https://www.tiktok.com/@aleke_prod?_r=1&_t=ZS-975tCUGpaI1',
    color: '#010101',
    borderColor: 'rgba(1,1,1,0.25)',
    hoverBg: 'rgba(105,201,208,0.08)',
    hoverBorder: 'rgba(105,201,208,0.55)',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: InstagramIcon,
    href: null,
    color: '#C13584',
    borderColor: 'rgba(193,53,132,0.3)',
    hoverBg: 'rgba(193,53,132,0.06)',
    hoverBorder: 'rgba(193,53,132,0.55)',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
    href: null,
    color: '#1877F2',
    borderColor: 'rgba(24,119,242,0.3)',
    hoverBg: 'rgba(24,119,242,0.06)',
    hoverBorder: 'rgba(24,119,242,0.55)',
  },
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
          {/* Logo + description */}
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', marginBottom: '0.625rem' }}>
              <BrandLogo small />
            </Link>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', lineHeight: 1.6, maxWidth: 220 }}>
              AI-powered Amazon listing audits. Improve your score, boost conversions.
            </p>
          </div>

          {/* Nav links + social row stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
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

            {/* Social row — compact inline chips directly under nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              {socialItems.map((s) => {
                const Icon = s.icon
                const chipStyle: React.CSSProperties = {
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.28rem 0.6rem',
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor: s.borderColor,
                  color: s.color,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  background: 'transparent',
                  transition: 'background 0.15s ease, border-color 0.15s ease, transform 0.1s ease',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  lineHeight: 1,
                  userSelect: 'none',
                }

                const chipContent = (
                  <>
                    <Icon />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1 }}>{s.label}</span>
                  </>
                )

                const hoverHandlers = {
                  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                    e.currentTarget.style.background = s.hoverBg
                    e.currentTarget.style.borderColor = s.hoverBorder
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  },
                  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = s.borderColor
                    e.currentTarget.style.transform = 'translateY(0)'
                  },
                }

                if (s.href) {
                  return (
                    <a
                      key={s.key}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={chipStyle}
                      {...hoverHandlers}
                    >
                      {chipContent}
                    </a>
                  )
                }

                return (
                  <a
                    key={s.key}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    style={chipStyle}
                    {...hoverHandlers}
                  >
                    {chipContent}
                  </a>
                )
              })}
            </div>
          </div>
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
