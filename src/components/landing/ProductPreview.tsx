"use client";

import { MockTradeCard } from "./MockTradeCard";
import { MockStatsBlock } from "./MockStatsBlock";
import { formatPnl } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { useScrollReveal, useCountUp } from "@/lib/hooks";

const WEEK_TRADES = [
  { asset: "EUR/USD", direction: "LONG" as const, result: "win" as const, pnl: 124.5, rr: 2.5, timeframe: "H4", session: "London" },
  { asset: "GBP/JPY", direction: "SHORT" as const, result: "loss" as const, pnl: -48.0, rr: 1.2, timeframe: "M15", session: "NY" },
  { asset: "XAU/USD", direction: "LONG" as const, result: "win" as const, pnl: 210.0, rr: 3.1, timeframe: "H1", session: "London" },
  { asset: "USD/JPY", direction: "SHORT" as const, result: "win" as const, pnl: 88.0, rr: 2.2, timeframe: "H4", session: "Tokyo" },
  { asset: "GBP/USD", direction: "LONG" as const, result: "be" as const, pnl: 0, rr: 1.0, timeframe: "H1", session: "London" },
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
  const { t } = useLanguage();
  const l = t.landing;

  // Heading
  const { ref: headingRef } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  // Journal panel
  const { ref: journalRef } = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });

  // Trade cards grid
  const { ref: tradesRef } = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });

  // Chart bars
  const { ref: chartRef } = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  // Stat cards + win rate bar
  const { ref: statsRef, visible: statsVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  // Sidebar stat count-ups
  const profitFactor = useCountUp({ target: 2.14, decimals: 2, duration: 1000 });
  const avgRR = useCountUp({ target: 2.0, decimals: 2, suffix: "R", duration: 900 });
  const bestTrade = useCountUp({ target: 210, decimals: 2, prefix: "+$", duration: 1100 });

  return (
    <section id="preview" className="max-w-6xl mx-auto px-6 py-20">
      <div ref={headingRef} className="max-w-md mb-12 mx-auto text-center reveal">
        <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
          {l.productLabel}
        </p>
        <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
          {l.productH1}
          <br />
          {l.productH2}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journal list — 2 cols */}
        <div
          ref={journalRef}
          className="lg:col-span-2 bg-surface border border-border rounded-2xl overflow-hidden reveal-scale"
        >
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-text font-dm-sans">
              {l.productJournal}
            </span>
            <span className="text-xs text-text-3 font-dm-mono">
              {WEEK_TRADES.length} {l.productTradesWeek}
            </span>
          </div>

          <div className="p-4">
            <MockStatsBlock stats={WEEK_STATS} />
          </div>

          <div className="px-4 pb-4 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs text-text-3 font-dm-sans">
                {l.productThisWeek}
              </span>
            </div>
            {/* Staggered trade cards */}
            <div ref={tradesRef} className="flex flex-col gap-2 reveal-grid">
              {WEEK_TRADES.map((trade, i) => (
                <div
                  key={i}
                  className="reveal-sm"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <MockTradeCard trade={trade} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats sidebar — 1 col */}
        <div className="flex flex-col gap-4">
          {/* P&L chart */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="text-xs text-text-3 font-dm-sans mb-1">
              {l.productDailyPnl}
            </div>
            <div className="text-lg font-dm-mono font-medium text-green mb-4">
              {formatPnl(WEEK_STATS.pnl)}
            </div>

            {/* Chart bars — animated on scroll */}
            <div
              ref={chartRef}
              className="flex items-end gap-2 h-20 reveal-chart"
            >
              {DAILY_BARS.map((bar, i) => {
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
                      className={`w-full rounded-sm bar-animate ${
                        isNeutral
                          ? "bg-border-dark"
                          : isPos
                          ? "bg-green-bg border border-green-br"
                          : "bg-red-bg border border-red-br"
                      }`}
                      style={
                        {
                          height: `${height}px`,
                          "--bar-delay": `${i * 80}ms`,
                          transformOrigin: "bottom",
                        } as React.CSSProperties
                      }
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
          <div
            ref={statsRef}
            className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-3 font-dm-sans">
                {l.productWinRate}
              </span>
              <span className="text-sm font-dm-mono font-medium text-text">
                60%
              </span>
            </div>
            {/* Win rate bar — animates width when in view */}
            <div className="w-full h-1.5 bg-surface2 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full"
                style={{
                  width: statsVisible ? "60%" : "0%",
                  transition: "width 0.9s cubic-bezier(0.22,1,0.36,1) 300ms",
                }}
              />
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-xs text-text-3 font-dm-sans">
                {l.productProfitFactor}
              </span>
              <span
                ref={profitFactor.ref as React.RefObject<HTMLSpanElement>}
                className="text-sm font-dm-mono font-medium text-green"
              >
                {profitFactor.display}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-3 font-dm-sans">
                {l.productAvgRR}
              </span>
              <span
                ref={avgRR.ref as React.RefObject<HTMLSpanElement>}
                className="text-sm font-dm-mono font-medium text-text"
              >
                {avgRR.display}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-3 font-dm-sans">
                {l.productBestTrade}
              </span>
              <span
                ref={bestTrade.ref as React.RefObject<HTMLSpanElement>}
                className="text-sm font-dm-mono font-medium text-green"
              >
                {bestTrade.display}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
