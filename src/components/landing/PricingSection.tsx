import { PricingCard } from "./PricingCard";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-surface2 border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-md mb-12">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
            Start free.
            <br />
            Upgrade when you&apos;re ready.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <PricingCard
            plan="free"
            name="Free"
            price="$0"
            description="Everything you need to start journaling consistently."
            features={[
              "Unlimited trade entries",
              "Daily stats (P&L, win rate, R:R)",
              "Journal history",
              "Trade notes & reflection",
              "Light & dark mode",
            ]}
            cta="Start for free"
          />
          <PricingCard
            plan="pro"
            name="Pro"
            price="$9"
            period="/ month"
            description="For traders who want AI-powered insights and deeper analytics."
            features={[
              "Everything in Free",
              "AI chart analysis",
              "AI trade feedback",
              "Advanced analytics (90 & 365 day)",
              "Profit factor & asset breakdown",
              "Priority support",
            ]}
            cta="Start Pro"
            highlighted
          />
        </div>
      </div>
    </section>
  );
}
