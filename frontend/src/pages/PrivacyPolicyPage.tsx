import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'

export default function PrivacyPolicyPage() {
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
                Privacy Policy
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)' }}>Last updated: June 12, 2026</p>
            </div>

            <div style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--dp-ink-secondary)' }}>
              <Section title="Introduction">
                <p>Sellio ("we", "us", or "our") operates the Sellio platform at wesellio.com. This Privacy Policy explains how we collect, use, and protect information when you use our service.</p>
                <p>By using Sellio, you agree to the practices described in this policy. If you have questions, contact us at <a href="mailto:support@wesellio.com" style={linkStyle}>support@wesellio.com</a>.</p>
              </Section>

              <Section title="Information We Collect">
                <p>We collect the following types of information:</p>
                <ul style={listStyle}>
                  <li><strong>Account information</strong> — your name and email address when you register.</li>
                  <li><strong>Product and listing data</strong> — Amazon product information, titles, descriptions, images, and other listing content you submit for analysis.</li>
                  <li><strong>Usage data</strong> — basic information about how you use the platform (pages visited, features used) to improve the service.</li>
                </ul>
              </Section>

              <Section title="How We Use Your Information">
                <p>We use collected information to:</p>
                <ul style={listStyle}>
                  <li>Provide, operate, and improve the Sellio platform.</li>
                  <li>Send account-related emails such as email verification and password reset messages via our email provider.</li>
                  <li>Process your listings through AI analysis services to generate audit reports and recommendations.</li>
                  <li>Handle billing and subscription management through our payment provider.</li>
                </ul>
              </Section>

              <Section title="Third-Party Services">
                <p>Sellio relies on trusted third-party providers to deliver its service. These may include:</p>
                <ul style={listStyle}>
                  <li><strong>Payment processing</strong> — Payment data is processed by Polar/Stripe or our payment provider. Sellio does not store your payment card details directly.</li>
                  <li><strong>Email delivery</strong> — Transactional emails (verification, password reset) are sent through our email provider (Resend).</li>
                  <li><strong>AI processing</strong> — Listing text, product data, and images you submit may be processed by AI/ML providers (such as OpenAI or Google) to generate recommendations. Data is transmitted securely and used solely for analysis.</li>
                  <li><strong>Hosting and infrastructure</strong> — Our platform is hosted on cloud infrastructure providers.</li>
                </ul>
                <p>These third parties operate under their own privacy policies and security practices.</p>
              </Section>

              <Section title="Data Retention">
                <p>We retain your account and audit data for as long as your account is active. You can request deletion at any time by contacting support.</p>
              </Section>

              <Section title="Your Rights">
                <p>You have the right to:</p>
                <ul style={listStyle}>
                  <li>Access the personal data we hold about you.</li>
                  <li>Request correction or deletion of your data.</li>
                  <li>Cancel your account and request data removal.</li>
                </ul>
                <p>To exercise any of these rights, contact us at <a href="mailto:support@wesellio.com" style={linkStyle}>support@wesellio.com</a>.</p>
              </Section>

              <Section title="Cookies">
                <p>Sellio uses essential cookies to keep you logged in and maintain session state. We do not use advertising or cross-site tracking cookies.</p>
              </Section>

              <Section title="Changes to This Policy">
                <p>We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
              </Section>

              <Section title="Contact">
                <p>For any privacy questions or data requests, contact us at <a href="mailto:support@wesellio.com" style={linkStyle}>support@wesellio.com</a>. We typically respond within 1–2 business days.</p>
              </Section>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(196,188,255,0.35)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/terms-of-service" style={footLinkStyle}>Terms of Service</Link>
              <Link to="/refund-policy" style={footLinkStyle}>Refund Policy</Link>
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
