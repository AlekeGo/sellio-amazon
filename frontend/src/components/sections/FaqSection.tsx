import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from '../ui/AnimatedSection'

const faqs = [
  {
    q: 'What does Sellio analyze?',
    a: 'Sellio performs a full AI audit across your title, bullet points, description, backend keywords, main image, A+ content strategy, and buyer review signals. Each element receives an individual score with specific, actionable improvement recommendations.',
  },
  {
    q: 'Does Sellio generate real product images?',
    a: "Yes. Sellio's Image Studio generates Amazon-ready product visuals including main images, benefit infographics, comparison slides, how-it-works visuals, and lifestyle concepts. Image generation is available on all paid plans.",
  },
  {
    q: 'Is there a free audit?',
    a: 'Yes. Every new Sellio account includes one free limited audit. The free audit gives you a listing score and top-level insights. Full AI copy recommendations, keyword reports, review analysis, and image generation require a paid plan.',
  },
  {
    q: 'Who is Sellio for?',
    a: 'Sellio is built for Amazon sellers who want to improve listing performance — including private label sellers, FBA brands, growing consumer goods companies, and agencies managing multiple Amazon accounts. If you sell on Amazon and care about conversion rates, Sellio is for you.',
  },
]

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <AnimatedSection delay={0.06 * index}>
      <div
        className="rounded-xl overflow-hidden transition-all duration-200"
        style={{
          background: '#ffffff',
          border: open ? '1px solid rgba(83,58,253,0.22)' : '1px solid #E2E8F0',
          boxShadow: open ? '0 2px 16px rgba(83,58,253,0.07)' : '0 1px 4px rgba(15,23,42,0.04)',
        }}
      >
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-4 p-5 text-left"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dp-ink)' }}
        >
          <span className="text-base font-semibold leading-snug">{q}</span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
            style={{
              background: open ? 'rgba(83,58,253,0.1)' : '#F1F5F9',
              border: open ? '1px solid rgba(83,58,253,0.25)' : '1px solid #E2E8F0',
            }}
          >
            {open
              ? <Minus size={13} style={{ color: 'var(--dp-primary)' }} />
              : <Plus size={13} style={{ color: 'var(--dp-ink-muted)' }} />
            }
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <p
                className="px-5 pb-6 text-sm leading-relaxed"
                style={{ color: 'var(--dp-ink-muted)' }}
              >
                {a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedSection>
  )
}

export default function FaqSection() {
  return (
    <section className="relative overflow-hidden" style={{ padding: '3.5rem 0 5rem' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 60% 40% at 80% 50%, rgba(83,58,253,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-8">
          <h2
            className="font-black tracking-tight"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', letterSpacing: '-0.03em' }}
          >
            FAQ
          </h2>
        </AnimatedSection>

        <div className="max-w-2xl mx-auto space-y-2.5">
          {faqs.map((faq, i) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
