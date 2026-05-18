import { Navbar } from "@/components/shared/navbar";
import { MarketTicker } from "@/components/shared/market-ticker";
import { Footer } from "@/components/shared/footer";
import {
  HeroSection,
  MarketsPreview,
  CardFeatureSection,
  FeaturesSection,
  SocialProofSection,
  CTASection,
} from "@/components/shared/home-sections";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* 
          Fixed Navbar (z-50) occupies 64px (h-16).
          We add a spacer to push content below the fixed header.
          MarketTicker follows, then the sections with their internal padding.
      */}
      <Navbar />
      <div className="h-16 md:h-20" aria-hidden="true" />

      <MarketTicker />
      
      <div className="relative">
        <HeroSection />
        <MarketsPreview />
        <CardFeatureSection />
        <FeaturesSection />
        <SocialProofSection />
        <CTASection />
      </div>

      <Footer />
    </main>
  );
}
