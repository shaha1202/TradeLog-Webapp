import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 3V9L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: "Fast trade logging",
    description:
      "Drop a screenshot. AI reads your chart and fills the trade details automatically. You just confirm and move on.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 11L7.5 8.5L9.5 10.5L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Daily performance stats",
    description:
      "See today's P&L, win rate, and R:R in the sidebar. No calculation needed. Always up to date after every trade.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 5H15M3 9H11M3 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Clean journal history",
    description:
      "All trades in one place, grouped by date. Filter, scroll, and review past sessions without friction.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 14L5.5 7.5L9 12L11.5 9L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 4H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Simple analytics",
    description:
      "P&L chart, profit factor, best and worst trades, and asset breakdown — across 7, 30, 90, or 365 days.",
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
    title: "Trade notes & reflection",
    description:
      "Two simple fields: what went well, what to improve. Capture the insight before it fades.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-surface2 border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-md mb-12 mx-auto text-center">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard
              key={i}
              icon={f.icon}
              title={f.title}
              description={f.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
