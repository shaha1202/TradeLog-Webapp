import { MockTradeCard } from "./MockTradeCard";
import { MockStatsBlock } from "./MockStatsBlock";
import { formatPnl } from "@/lib/utils";

const WEEK_TRADES = [
  {
    asset: "EUR/USD",
    direction: "LONG" as const,
    result: "win" as const,
    pnl: 124.5,
    rr: 2.5,
    timeframe: "H4",
    session: "London",
  },
  {
    asset: "GBP/JPY",
    direction: "SHORT" as const,
    result: "loss" as const,
    pnl: -48.0,
    rr: 1.2,
    timeframe: "M15",
    session: "NY",
  },
  {
    asset: "XAU/USD",
    direction: "LONG" as const,
    result: "win" as const,
    pnl: 210.0,
    rr: 3.1,
    timeframe: "H1",
    session: "London",
  },
  {
    asset: "USD/JPY",
    direction: "SHORT" as const,
    result: "win" as const,
    pnl: 88.0,
    rr: 2.2,
    timeframe: "H4",
    session: "Tokyo",
  },
  {
    asset: "GBP/USD",
    direction: "LONG" as const,
    result: "be" as const,
    pnl: 0,
    rr: 1.0,
    timeframe: "H1",
    session: "London",
  },
];

const WEEK_STATS = { pnl: 374.5, winRate: 60, count: 5, avgRR: 2.0 };

const DAILY_BARS = [
  { label: "Mon", pnl: 124.5 },
  { label: "Tue", pnl: -48.0 },
  { label: "Wed", pnl: 210.0 },
  { label: "Thu", pnl: 88.0 },
  { label: "Fri", pnl: 0 },
];

const maxAbs = Math.max(...DAILY_BARS.map((b) => Math.abs(b.pnl)), 1);

export function ProductPreview() {
  return (
    <section id="preview" className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-md mb-12">
        <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
          Product
        </p>
        <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
          Your trading performance,
          <br />
          always in view.
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journal list — 2 cols */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-text font-dm-sans">
              Journal
            </span>
            <span className="text-xs text-text-3 font-dm-mono">
              {WEEK_TRADES.length} trades this week
            </span>
          </div>

          <div className="p-4">
            <MockStatsBlock stats={WEEK_STATS} />
          </div>

          <div className="px-4 pb-4 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs text-text-3 font-dm-sans">
                This week
              </span>
            </div>
            {WEEK_TRADES.map((trade, i) => (
              <MockTradeCard key={i} trade={trade} />
            ))}
          </div>
        </div>

        {/* Stats sidebar — 1 col */}
        <div className="flex flex-col gap-4">
          {/* P&L chart */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="text-xs text-text-3 font-dm-sans mb-1">
              Daily P&L
            </div>
            <div className="text-lg font-dm-mono font-medium text-green mb-4">
              {formatPnl(WEEK_STATS.pnl)}
            </div>

            <div className="flex items-end gap-2 h-20">
              {DAILY_BARS.map((bar) => {
                const pct = Math.abs(bar.pnl) / maxAbs;
                const height = Math.max(pct * 80, 4);
                const isPos = bar.pnl > 0;
                const isNeutral = bar.pnl === 0;
                return (
                  <div
                    key={bar.label}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <div
                      className={`w-full rounded-sm ${
                        isNeutral
                          ? "bg-border-dark"
                          : isPos
                          ? "bg-green-bg border border-green-br"
                          : "bg-red-bg border border-red-br"
                      }`}
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-xs text-text-3 font-dm-mono">
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stat cards */}
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-3 font-dm-sans">
                Win rate
              </span>
              <span className="text-sm font-dm-mono font-medium text-text">
                60%
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface2 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full"
                style={{ width: "60%" }}
              />
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-xs text-text-3 font-dm-sans">
                Profit factor
              </span>
              <span className="text-sm font-dm-mono font-medium text-green">
                2.14
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-3 font-dm-sans">
                Avg R:R
              </span>
              <span className="text-sm font-dm-mono font-medium text-text">
                2.00R
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-3 font-dm-sans">
                Best trade
              </span>
              <span className="text-sm font-dm-mono font-medium text-green">
                +$210.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
