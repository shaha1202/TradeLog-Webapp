const problems = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Journaling feels like extra work",
    description:
      "After hours of charting, the last thing you want is more screen time filling out spreadsheets.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 8C2 4.686 4.686 2 8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 8C14 11.314 11.314 14 8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: "You rely on memory",
    description:
      "Without a journal, every session fades. You can't review what actually worked — only what you think worked.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 13L6 10M6 10L9 13M6 10V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 3L10 6M10 6L7 3M10 6V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "You repeat the same mistakes",
    description:
      "Revenge trading. Breaking your rules. Holding losers too long. Without data, patterns stay invisible.",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-surface2 border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-md mb-12 mx-auto text-center">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            The Problem
          </p>
          <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
            Most traders know they should journal.
            <br />
            Almost none of them do.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="w-8 h-8 rounded-lg bg-red-bg text-red flex items-center justify-center mb-4">
                {p.icon}
              </div>
              <h3 className="text-sm font-medium text-text font-dm-sans mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-text-2 font-dm-sans leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
