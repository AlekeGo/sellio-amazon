import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'

export default function TermsOfServicePage() {
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
                Terms of Service
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)' }}>Last updated: June 12, 2026</p>
            </div>

            <div style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--dp-ink-secondary)' }}>
              <Section title="About Sellio">
                <p>Sellio provides an AI-powered platform for Amazon sellers, including listing audits, AI-generated recommendations, copy improvement suggestions, and image and visual enhancement tools ("the Service").</p>
                <p>By creating an account and using Sellio, you agree to these Terms of Service. Please read them carefully.</p>
              </Section>

              <Section title="Your Responsibilities">
                <p>You are responsible for:</p>
                <ul style={listStyle}>
                  <li>Your own Amazon marketplace compliance. Sellio provides suggestions and analysis, but you make all final listing decisions.</li>
                  <li>Ensuring that any content you upload (product information, images, text) does not infringe third-party rights, violate laws, or include confidential data you are not authorized to use.</li>
                  <li>Keeping your account credentials secure.</li>
                </ul>
              </Section>

              <Section title="No Guarantee of Results">
                <p>Sellio provides AI-generated analysis and recommendations as a tool to help improve your Amazon listings. We do not guarantee any specific outcomes, including but not limited to:</p>
                <ul style={listStyle}>
                  <li>Increased sales, revenue, or conversion rates.</li>
                  <li>Improved search rankings on Amazon or other marketplaces.</li>
                  <li>Amazon approval of listings or compliance with Amazon policies.</li>
                  <li>Any specific marketplace performance results.</li>
                </ul>
                <p>AI recommendations are provided for informational purposes. You retain full responsibility for your listing content and business decisions.</p>
              </Section>

              <Section title="Acceptable Use">
                <p>You agree not to:</p>
                <ul style={listStyle}>
                  <li>Upload illegal, harmful, or infringing content.</li>
                  <li>Attempt to scrape, reverse-engineer, or copy the platform or its outputs at scale.</li>
                  <li>Use automated bots or scripts to bypass credit limits or access the service in ways not intended.</li>
                  <li>Share your account credentials or allow others to use your account.</li>
                  <li>Use Sellio for any purpose that violates applicable laws or regulations.</li>
                </ul>
                <p>Abuse may result in account suspension or termination.</p>
              </Section>

              <Section title="Credits and Subscriptions">
                <p>Access to certain features requires a subscription plan or credits. Credits and subscription access are tied to your individual account and are non-transferable.</p>
                <p>See our <Link to="/refund-policy" style={linkStyle}>Refund Policy</Link> for information about cancellations and refunds.</p>
              </Section>

              <Section title="Service Changes">
                <p>We reserve the right to modify, suspend, or discontinue features or the Service at any time. We will make reasonable efforts to notify users of significant changes. Sellio is not liable for any service interruptions or feature removals.</p>
              </Section>

              <Section title="Intellectual Property">
                <p>Sellio and its underlying technology, branding, and content are owned by Sellio. You retain ownership of the product data and content you submit. By using Sellio, you grant us a limited license to process your submitted content to deliver the Service.</p>
              </Section>

              <Section title="Limitation of Liability">
                <p>To the maximum extent permitted by applicable law, Sellio is not liable for indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid for the Service in the 30 days preceding the claim.</p>
              </Section>

              <Section title="Changes to These Terms">
                <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms. We will update the "Last updated" date when changes are made.</p>
              </Section>

              <Section title="Contact">
                <p>Questions about these Terms? Contact us at <a href="mailto:support@wesellio.com" style={linkStyle}>support@wesellio.com</a>.</p>
              </Section>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(196,188,255,0.35)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/privacy-policy" style={footLinkStyle}>Privacy Policy</Link>
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
