import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PricingSection from '../components/sections/PricingSection'
import FinalCtaSection from '../components/sections/FinalCtaSection'

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#030812' }}>
      <Navbar />
      <div className="pt-20">
        <PricingSection />
        <FinalCtaSection />
      </div>
      <Footer />
    </div>
  )
}
