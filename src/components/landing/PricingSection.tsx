"use client";

import { PricingCard } from "./PricingCard";
import { useLanguage } from "@/lib/i18n";

export function PricingSection() {
  const { t } = useLanguage();
  const l = t.landing;

  return (
    <section id="pricing" className="bg-surface2 border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-md mb-12 mx-auto text-center">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            {t.landing.pricing}
          </p>
          <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
            {l.pricingH1}
            <br />
            {l.pricingH2}
          </h2>
          <p className="text-sm text-text-2 font-dm-sans mt-3 leading-relaxed">
            {l.pricingSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <PricingCard
            plan="free"
            name="Free"
            price={l.freePrice}
            description={l.freeCardDesc}
            features={[l.freeFeature1, l.freeFeature2, l.freeFeature3]}
            cta={l.freeCta}
            popular={l.popular}
          />
          <PricingCard
            plan="pro"
            name="Pro"
            price="$14"
            period={t.settings.perMonth}
            description={l.proCardDesc}
            features={[
              l.proFeature1,
              l.proFeature2,
              l.proFeature3,
              l.proFeature4,
              l.proFeature5,
              l.proFeature6,
            ]}
            cta={l.proCta}
            highlighted
            popular={l.popular}
          />
        </div>
      </div>
    </section>
  );
}
