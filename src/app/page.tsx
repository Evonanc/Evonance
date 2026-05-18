import { Navbar } from "@/components/shared/navbar";
import { MarketTicker } from "@/components/shared/market-ticker";
import { Footer } from "@/components/shared/footer";
import {
  HeroSection,
  MarketsPreview,
  CardFeatureSection,
  FeaturesSection,
  HowItWorksSection,
  TrustBar,
  SocialProofSection,
  CTASection,
} from "@/components/shared/home-sections";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background page-fade">
      <Navbar />
      <div className="h-16 md:h-20" aria-hidden="true" />
      <MarketTicker />
      <div className="relative">
        <HeroSection />
        <TrustBar />
        <MarketsPreview />
        <HowItWorksSection />
        <CardFeatureSection />
        <FeaturesSection />
        <SocialProofSection />
        <CTASection />
      </div>
      <Footer />
    </main>
  );
}
