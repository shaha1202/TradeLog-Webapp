"use client";

import { FeatureCard } from "./FeatureCard";
import { useLanguage } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/hooks";

export function FeaturesSection() {
  const { t } = useLanguage();
  const l = t.landing;

  const { ref: headingRef } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const { ref: gridRef } = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });

  const features = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 3V9L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
      title: l.feature1Title,
      description: l.feature1Desc,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 11L7.5 8.5L9.5 10.5L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: l.feature2Title,
      description: l.feature2Desc,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 5H15M3 9H11M3 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      title: l.feature3Title,
      description: l.feature3Desc,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 14L5.5 7.5L9 12L11.5 9L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 4H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      title: l.feature4Title,
      description: l.feature4Desc,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6.5 9C6.5 9 7.5 11 9 11C10.5 11 11.5 9 11.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="7" cy="7" r="0.75" fill="currentColor"/>
          <circle cx="11" cy="7" r="0.75" fill="currentColor"/>
        </svg>
      ),
      title: l.feature5Title,
      description: l.feature5Desc,
    },
  ];

  // Stagger delays: row 1 (0,100,200ms), row 2 (50,150ms)
  const delays = [0, 100, 200, 50, 150];

  return (
    <section id="features" className="bg-surface2 border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div ref={headingRef} className="max-w-md mb-12 mx-auto text-center reveal">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            {l.featuresLabel}
          </p>
          <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
            {l.featuresH1}
            <br />
            {l.featuresH2}
          </h2>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 reveal-grid">
          {features.map((f, i) => (
            <div
              key={i}
              className="reveal-sm"
              style={{ animationDelay: `${delays[i]}ms` }}
            >
              <FeatureCard
                icon={f.icon}
                title={f.title}
                description={f.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
