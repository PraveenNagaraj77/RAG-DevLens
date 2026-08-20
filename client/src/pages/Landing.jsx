import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <LandingNavbar />

      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ArchitectureSection />
        <CTASection />
      </main>

      <LandingFooter />
    </div>
  );
}

export default Landing;