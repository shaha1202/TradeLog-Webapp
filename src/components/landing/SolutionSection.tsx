"use client";

import { useLanguage } from "@/lib/i18n";

const accentClasses: Record<string, { bg: string; text: string; border: string }> = {
  teal: { bg: "bg-teal-bg", text: "text-teal", border: "border-teal-br" },
  purple: { bg: "bg-purple-bg", text: "text-purple", border: "border-purple-br" },
  green: { bg: "bg-green-bg", text: "text-green", border: "border-green-br" },
  amber: { bg: "bg-amber-bg", text: "text-amber", border: "border-amber-br" },
};

export function SolutionSection() {
  const { t } = useLanguage();
  const l = t.landing;

  const solutions = [
    { label: "01", title: l.solution1Title, description: l.solution1Desc, accent: "teal" },
    { label: "02", title: l.solution2Title, description: l.solution2Desc, accent: "purple" },
    { label: "03", title: l.solution3Title, description: l.solution3Desc, accent: "green" },
    { label: "04", title: l.solution4Title, description: l.solution4Desc, accent: "amber" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-md mb-12 mx-auto text-center">
        <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
          {l.solutionLabel}
        </p>
        <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
          {l.solutionH1}
          <br />
          {l.solutionH2}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {solutions.map((s) => {
          const ac = accentClasses[s.accent];
          return (
            <div
              key={s.label}
              className="bg-surface border border-border rounded-xl p-5 flex gap-4"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ac.bg} border ${ac.border}`}
              >
                <span className={`text-xs font-dm-mono font-medium ${ac.text}`}>
                  {s.label}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text font-dm-sans mb-1.5">
                  {s.title}
                </h3>
                <p className="text-sm text-text-2 font-dm-sans leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
