import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="bg-surface border border-border rounded-2xl px-8 py-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-teal-bg border border-teal-br rounded-full px-3 py-1 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-teal" />
          <span className="text-xs font-dm-mono text-teal">
            Free to start. No credit card.
          </span>
        </div>

        <h2 className="font-fraunces font-light text-3xl lg:text-4xl text-text leading-snug mb-4">
          Stop repeating mistakes.
          <br />
          Start journaling in seconds.
        </h2>

        <p className="text-sm text-text-2 font-dm-sans leading-relaxed mb-8 max-w-sm mx-auto">
          Log your first trade today. See your stats instantly. Build the
          discipline that compounds over time.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-teal text-white font-dm-sans font-medium text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Start journaling free
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7H11M11 7L8 4M11 7L8 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-surface2 border border-border text-text font-dm-sans font-medium text-sm px-6 py-2.5 rounded-lg hover:border-border-dark transition-colors"
          >
            View pricing
          </a>
        </div>

        <div className="flex items-center justify-center gap-8 mt-10 pt-8 border-t border-border">
          <div className="text-center">
            <div className="text-xl font-dm-mono font-medium text-text">70%</div>
            <div className="text-xs text-text-3 font-dm-sans">time saved</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-xl font-dm-mono font-medium text-text">
              Instant
            </div>
            <div className="text-xs text-text-3 font-dm-sans">
              stats after every trade
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-xl font-dm-mono font-medium text-text">
              AI
            </div>
            <div className="text-xs text-text-3 font-dm-sans">
              powered insights
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
