import { ImageIcon, Sparkles } from 'lucide-react'

const IMAGE_CATEGORIES = [
  {
    title: 'Main Image Refresh',
    desc: 'Clean, high-converting hero image with white background optimization.',
    gradient: 'linear-gradient(135deg, #166534, #4ade80)',
  },
  {
    title: 'Benefit Infographic',
    desc: 'Visual breakdown of your product\'s top features and benefits.',
    gradient: 'linear-gradient(135deg, #065f46, #34d399)',
  },
  {
    title: 'Comparison Graphic',
    desc: 'Side-by-side comparison showing why your product wins.',
    gradient: 'linear-gradient(135deg, #14532d, #22c55e)',
  },
  {
    title: 'How It Works Visual',
    desc: 'Step-by-step visual walkthrough for complex or multi-use products.',
    gradient: 'linear-gradient(135deg, #3f6212, #a3e635)',
  },
  {
    title: 'Lifestyle Visual',
    desc: 'Product in real-world context to build emotional connection.',
    gradient: 'linear-gradient(135deg, #166534, #4ade80)',
  },
  {
    title: 'A+ Banner Concept',
    desc: 'Premium Amazon A+ content banner with your brand positioning.',
    gradient: 'linear-gradient(135deg, #065f46, #34d399)',
  },
]

export default function ImageStudioPage() {
  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="section-badge" style={{ marginBottom: '0.875rem', display: 'inline-flex' }}>
          <Sparkles size={12} />
          Image Studio
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.375rem, 3vw, 1.875rem)',
            fontWeight: 900,
            color: '#f1f5f9',
            letterSpacing: '-0.03em',
            margin: '0 0 0.625rem',
          }}
        >
          Premium Amazon-ready
          <br />
          <span className="gradient-text">image pack generation.</span>
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748b', margin: 0, maxWidth: 520 }}>
          AI-generated image packs tailored to your product, category, and brand — connecting to
          Sellio&apos;s generation engine soon.
        </p>
      </div>

      <div
        style={{
          borderRadius: '0.875rem',
          padding: '1.125rem 1.375rem',
          background: 'rgba(163,230,53,0.04)',
          border: '1px solid rgba(163,230,53,0.14)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #166534, #4ade80)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ImageIcon size={15} color="white" />
        </div>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Premium image pack generation will be connected soon. Browse the categories below to
          see what&apos;s coming.
        </p>
      </div>

      <h2
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#64748b',
          margin: '0 0 1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Image pack categories
      </h2>

      <div className="image-studio-grid">
        {IMAGE_CATEGORIES.map((cat) => (
          <div
            key={cat.title}
            style={{
              borderRadius: '0.75rem',
              padding: '1.25rem',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              gap: '0.875rem',
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(163,230,53,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '0.5rem',
                background: cat.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ImageIcon size={16} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: '#f1f5f9',
                  marginBottom: '0.25rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {cat.title}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5 }}>{cat.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
