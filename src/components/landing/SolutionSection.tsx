const solutions = [
  {
    label: "01",
    title: "Log a trade in seconds",
    description:
      "Upload your chart screenshot. AI fills in asset, entry, SL, TP, and timeframe instantly. Add a note and you're done.",
    accent: "teal",
  },
  {
    label: "02",
    title: "Structured input, no spreadsheet",
    description:
      "Every trade captures what matters: direction, R:R, session, mood, plan adherence. Always consistent. Always searchable.",
    accent: "purple",
  },
  {
    label: "03",
    title: "Instant stats after every session",
    description:
      "P&L, win rate, average R:R — updated automatically. Know your edge after every session, not at the end of the month.",
    accent: "green",
  },
  {
    label: "04",
    title: "Notes without friction",
    description:
      "Went well, needs improvement. Capture your thinking in two fields. No essays. No overwhelm. Just clarity.",
    accent: "amber",
  },
];

const accentClasses: Record<string, { bg: string; text: string; border: string }> = {
  teal: { bg: "bg-teal-bg", text: "text-teal", border: "border-teal-br" },
  purple: { bg: "bg-purple-bg", text: "text-purple", border: "border-purple-br" },
  green: { bg: "bg-green-bg", text: "text-green", border: "border-green-br" },
  amber: { bg: "bg-amber-bg", text: "text-amber", border: "border-amber-br" },
};

export function SolutionSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-md mb-12">
        <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
          The Solution
        </p>
        <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
          TradeLog removes every reason
          <br />
          not to journal.
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
