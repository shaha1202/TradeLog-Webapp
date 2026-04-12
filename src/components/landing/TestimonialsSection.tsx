"use client";

import { TestimonialCard } from "./TestimonialCard";
import { useLanguage } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/hooks";

export function TestimonialsSection() {
  const { t } = useLanguage();
  const l = t.landing;

  const { ref: headingRef } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const { ref: gridRef } = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });

  const testimonials = [
    { quote: l.t1Quote, name: l.t1Name, role: l.t1Role, initials: "MT" },
    { quote: l.t2Quote, name: l.t2Name, role: l.t2Role, initials: "PK" },
    { quote: l.t3Quote, name: l.t3Name, role: l.t3Role, initials: "DR" },
    { quote: l.t4Quote, name: l.t4Name, role: l.t4Role, initials: "AO" },
  ];

  const delays = [0, 100, 150, 250];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div ref={headingRef} className="max-w-md mb-12 mx-auto text-center reveal">
        <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
          {l.testimonialsLabel}
        </p>
        <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
          {l.testimonialsH1}
          <br />
          {l.testimonialsH2}
        </h2>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 reveal-grid">
        {testimonials.map((item, i) => (
          <div
            key={i}
            className="reveal-sm"
            style={{ animationDelay: `${delays[i]}ms` }}
          >
            <TestimonialCard
              quote={item.quote}
              name={item.name}
              role={item.role}
              initials={item.initials}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
