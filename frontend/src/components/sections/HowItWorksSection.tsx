import { ClipboardPaste, Cpu, Pencil, ImageIcon } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const steps = [
  {
    number: '01',
    icon: ClipboardPaste,
    title: 'Paste Your Listing',
    body: 'Drop in your ASIN, listing URL, or paste your listing content directly. No Amazon account connection required.',
    gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
    glow: 'rgba(14,165,233,0.25)',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'Get Your AI Audit',
    body: 'Sellio runs a full AI analysis across your title, bullets, keywords, images, and buyer reviews. You get a score for every element.',
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    glow: 'rgba(124,58,237,0.25)',
  },
  {
    number: '03',
    icon: Pencil,
    title: 'Upgrade Copy & Strategy',
    body: 'Review AI-suggested improvements. Accept what you love, customize the rest, and export the upgraded version instantly.',
    gradient: 'linear-gradient(135deg, #059669, #34d399)',
    glow: 'rgba(5,150,105,0.25)',
  },
  {
    number: '04',
    icon: ImageIcon,
    title: 'Generate Premium Visuals',
    body: 'Request your image pack. Sellio generates Amazon-ready visuals based on your product and listing strategy — ready to upload.',
    gradient: 'linear-gradient(135deg, #d97706, #fbbf24)',
    glow: 'rgba(217,119,6,0.25)',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(14,165,233,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-16">
          <div className="section-badge mx-auto w-fit mb-5">How It Works</div>
          <h2
            className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
          >
            From listing to{' '}
            <span className="gradient-text">launch-ready.</span>{' '}
            In minutes.
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
            Four steps from raw listing to fully optimized, visually premium Amazon presence.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <AnimatedSection key={step.number} delay={0.1 * i}>
                <div className="glass-card glass-card-hover rounded-2xl p-6 h-full relative">
                  <div
                    className="absolute top-4 right-4 text-5xl font-black pointer-events-none select-none"
                    style={{
                      color: 'rgba(255,255,255,0.04)',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {step.number}
                  </div>

                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: step.gradient,
                      boxShadow: `0 8px 24px ${step.glow}`,
                    }}
                  >
                    <Icon size={20} color="white" />
                  </div>

                  <div
                    className="text-xs font-black uppercase tracking-[0.2em] mb-2"
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                  >
                    Step {step.number}
                  </div>

                  <h3
                    className="text-base font-bold mb-3"
                    style={{ color: '#f1f5f9', letterSpacing: '-0.01em' }}
                  >
                    {step.title}
                  </h3>

                  <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
                    {step.body}
                  </p>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
