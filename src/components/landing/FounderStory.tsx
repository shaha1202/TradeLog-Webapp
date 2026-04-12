"use client";

import { useLanguage } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/hooks";

export function FounderStory() {
  const { t } = useLanguage();
  const l = t.landing;

  const { ref: headingRef } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const { ref: cardRef } = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });

  return (
    <section id="story" className="bg-surface2 border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div ref={headingRef} className="max-w-md mb-12 mx-auto text-center reveal">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            {l.founderLabel}
          </p>
          <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
            {l.founderH1}
            <br />
            {l.founderH2}
          </h2>
        </div>

        <div
          ref={cardRef}
          className="max-w-2xl mx-auto bg-surface border border-border rounded-2xl p-8 reveal-scale"
        >
          <div className="space-y-4 mb-8">
            <p className="text-sm text-text-2 font-dm-sans leading-relaxed">
              {l.founderP1}
            </p>
            <p className="text-sm text-text-2 font-dm-sans leading-relaxed">
              {l.founderP2}
            </p>
            <p className="text-sm text-text-2 font-dm-sans leading-relaxed">
              {l.founderP3}
            </p>
            <p className="text-sm text-text font-dm-sans leading-relaxed font-medium">
              {l.founderP4}
            </p>
            <p className="text-sm text-text-2 font-dm-sans leading-relaxed">
              {l.founderP5}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-border">
            <div className="w-10 h-10 rounded-full bg-teal-bg border border-teal-br flex items-center justify-center">
              <span className="text-sm font-dm-mono font-medium text-teal">S</span>
            </div>
            <div>
              <div className="text-sm font-medium text-text font-dm-sans">
                {l.founderName}
              </div>
              <div className="text-xs text-text-3 font-dm-sans">
                {l.founderRole}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
