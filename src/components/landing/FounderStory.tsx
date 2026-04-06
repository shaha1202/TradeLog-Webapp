export function FounderStory() {
  return (
    <section id="story" className="bg-surface2 border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-md mb-12 mx-auto text-center">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            Why TradeLog exists
          </p>
          <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
            Built by a trader
            <br />
            who stopped journaling.
          </h2>
        </div>

        <div className="max-w-2xl mx-auto bg-surface border border-border rounded-2xl p-8">
          <div className="space-y-4 mb-8">
            <p className="text-sm text-text-2 font-dm-sans leading-relaxed">
              I&apos;ve been trading for a while, but like most traders — I didn&apos;t
              journal consistently.
            </p>
            <p className="text-sm text-text-2 font-dm-sans leading-relaxed">
              Not because I didn&apos;t know it was important.
              <br />
              But because it was slow, repetitive, and honestly boring.
            </p>
            <p className="text-sm text-text-2 font-dm-sans leading-relaxed">
              Every time I tried, it felt like extra work after hours of
              charting. So I stopped.
            </p>
            <p className="text-sm text-text font-dm-sans leading-relaxed font-medium">
              And I kept repeating the same mistakes.
            </p>
            <p className="text-sm text-text-2 font-dm-sans leading-relaxed">
              That&apos;s why I built TradeLog. A simple way to log trades in
              seconds, see your performance clearly, and actually stick to
              journaling — without friction.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-border">
            <div className="w-10 h-10 rounded-full bg-teal-bg border border-teal-br flex items-center justify-center">
              <span className="text-sm font-dm-mono font-medium text-teal">
                S
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-text font-dm-sans">
                Shakhzod
              </div>
              <div className="text-xs text-text-3 font-dm-sans">
                Founder · Trader
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
