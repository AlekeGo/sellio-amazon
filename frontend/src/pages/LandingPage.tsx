import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/sections/HeroSection'
import ProblemSection from '../components/sections/ProblemSection'
import SolutionSection from '../components/sections/SolutionSection'
import AnalysisSection from '../components/sections/AnalysisSection'
import AuditDemoSection from '../components/sections/AuditDemoSection'
import ImageStudioSection from '../components/sections/ImageStudioSection'
import HowItWorksSection from '../components/sections/HowItWorksSection'
import PricingSection from '../components/sections/PricingSection'
import FaqSection from '../components/sections/FaqSection'
import FinalCtaSection from '../components/sections/FinalCtaSection'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <AnalysisSection />
      <AuditDemoSection />
      <ImageStudioSection />
      <HowItWorksSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
      <Footer />
    </div>
  )
}
