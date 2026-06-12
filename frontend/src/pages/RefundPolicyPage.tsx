import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'

export default function RefundPolicyPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--dp-surface-soft)' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: 68 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid rgba(196,188,255,0.35)',
            boxShadow: '0 4px 32px rgba(83,58,253,0.06)',
            padding: 'clamp(2rem, 5vw, 3rem)',
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <Link to="/" style={{ fontSize: '0.875rem', color: 'var(--dp-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.5rem' }}>
                ← Back to home
              </Link>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--dp-ink)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                Refund Policy
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)' }}>Last updated: June 12, 2026</p>
            </div>

            <div style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--dp-ink-secondary)' }}>
              <Section title="Digital SaaS Product">
                <p>Sellio is a digital software-as-a-service (SaaS) product. All subscriptions, credits, and AI-powered features are delivered digitally. Because of the nature of digital services, our refund policy reflects that credits and AI services may be consumed immediately upon use.</p>
              </Section>

              <Section title="Subscriptions">
                <p>You may cancel your subscription at any time from your account settings or by contacting support. Cancellation stops future billing charges. Your access continues until the end of the current billing period.</p>
                <p>We do not automatically issue refunds for unused time in a billing period after a subscription has been charged, as the service remains accessible throughout that period.</p>
              </Section>

              <Section title="Credits">
                <p>Credits are used to run AI audits and generate image suggestions. Because credits may be consumed immediately upon triggering an analysis, <strong>used credits are generally non-refundable</strong>. Unused credits on a cancelled account may be considered for refund on a case-by-case basis — contact support within 7 days of your last charge.</p>
              </Section>

              <Section title="Billing Errors and Exceptions">
                <p>If you believe you were charged by mistake or experienced a technical billing problem, we want to make it right. Contact us at <a href="mailto:support@wesellio.com" style={linkStyle}>support@wesellio.com</a> <strong>within 7 days</strong> of the charge with the following information:</p>
                <ul style={listStyle}>
                  <li>Your account email address.</li>
                  <li>The date and amount of the charge in question.</li>
                  <li>A brief description of the issue.</li>
                </ul>
                <p>All refund requests are reviewed on a case-by-case basis. We aim to respond within 1–2 business days.</p>
              </Section>

              <Section title="How to Request a Refund">
                <p>Email us at <a href="mailto:support@wesellio.com" style={linkStyle}>support@wesellio.com</a> with the subject line "Refund Request" and include your account email and a description of your situation. We will review your request and respond promptly.</p>
              </Section>

              <Section title="Changes to This Policy">
                <p>We may update this Refund Policy at any time. The "Last updated" date at the top of this page will reflect the most recent changes. Continued use of the Service after changes constitutes acceptance of the updated policy.</p>
              </Section>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(196,188,255,0.35)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/privacy-policy" style={footLinkStyle}>Privacy Policy</Link>
              <Link to="/terms-of-service" style={footLinkStyle}>Terms of Service</Link>
              <Link to="/contact" style={footLinkStyle}>Contact Support</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <h2 style={{ fontSize: '1.0625rem', fontWeight: 650, color: 'var(--dp-ink)', marginBottom: '0.625rem' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>{children}</div>
    </div>
  )
}

const listStyle: React.CSSProperties = {
  paddingLeft: '1.25rem',
  margin: '0.25rem 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
}

const linkStyle: React.CSSProperties = {
  color: 'var(--dp-primary)',
  textDecoration: 'none',
}

const footLinkStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--dp-primary)',
  textDecoration: 'none',
}
