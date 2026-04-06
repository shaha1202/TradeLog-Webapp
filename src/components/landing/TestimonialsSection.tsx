"use client";

import { TestimonialCard } from "./TestimonialCard";
import { useLanguage } from "@/lib/i18n";

export function TestimonialsSection() {
  const { t } = useLanguage();
  const l = t.landing;

  const testimonials = [
    { quote: l.t1Quote, name: l.t1Name, role: l.t1Role, initials: "MT" },
    { quote: l.t2Quote, name: l.t2Name, role: l.t2Role, initials: "PK" },
    { quote: l.t3Quote, name: l.t3Name, role: l.t3Role, initials: "DR" },
    { quote: l.t4Quote, name: l.t4Name, role: l.t4Role, initials: "AO" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-md mb-12 mx-auto text-center">
        <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
          {l.testimonialsLabel}
        </p>
        <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
          {l.testimonialsH1}
          <br />
          {l.testimonialsH2}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {testimonials.map((item, i) => (
          <TestimonialCard
            key={i}
            quote={item.quote}
            name={item.name}
            role={item.role}
            initials={item.initials}
          />
        ))}
      </div>
    </section>
  );
}
