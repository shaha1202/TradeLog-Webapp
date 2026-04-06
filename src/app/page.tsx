import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "TradeLog — AI-Powered Trading Journal for Forex, Crypto & Stocks",
  description:
    "Track every trade, analyze patterns, and improve your trading performance with AI-powered insights. Free trading journal built for forex, crypto, and stock traders.",
  alternates: {
    canonical: "https://gettradelog.com",
  },
};
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { FounderStory } from "@/components/landing/FounderStory";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <ProductPreview />
        <FounderStory />
        <TestimonialsSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
