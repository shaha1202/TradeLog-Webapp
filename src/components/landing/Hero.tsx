"use client";
import { useEffect, useState } from "react";
import { MockTradeCard } from "./MockTradeCard";
import { MockStatsBlock } from "./MockStatsBlock";
import { useLanguage } from "@/lib/i18n";

const MOCK_TRADES = [
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
];

const MOCK_STATS = { pnl: 286.5, winRate: 67, count: 3, avgRR: 2.27 };

const ease = "cubic-bezier(0.22,1,0.36,1)";

export function Hero() {
  const { t } = useLanguage();
  const l = t.landing;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 md:pt-20 md:pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left: Copy — staggered reveal */}
        <div>
          <div
            className="inline-flex items-center gap-2 bg-teal-bg border border-teal-br rounded-full px-3 py-1 mb-5"
            style={{
              opacity: mounted ? undefined : 0,
              animation: mounted
                ? `revealUpSm 0.4s ${ease} 0ms both`
                : undefined,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-teal animate-shimmer" />
            <span className="text-xs font-dm-mono text-teal">{l.badge}</span>
          </div>

          <h1
            className="font-fraunces font-light text-3xl md:text-4xl lg:text-5xl text-text leading-tight mb-4 md:mb-5"
            style={{
              opacity: mounted ? undefined : 0,
              animation: mounted
                ? `revealUpSm 0.5s ${ease} 80ms both`
                : undefined,
            }}
          >
            {l.headline1}
            <br />
            <span className="text-teal">{l.headline2}</span>
          </h1>

          <p
            className="text-sm md:text-base text-text-2 font-dm-sans leading-relaxed mb-6 md:mb-8 max-w-md"
            style={{
              opacity: mounted ? undefined : 0,
              animation: mounted
                ? `revealUpSm 0.5s ${ease} 160ms both`
                : undefined,
            }}
          >
            {l.sub}
          </p>

          <div
            className="flex items-center gap-3 flex-wrap"
            style={{
              opacity: mounted ? undefined : 0,
              animation: mounted
                ? `revealUpSm 0.5s ${ease} 240ms both`
                : undefined,
            }}
          >
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL}/login`}
              className="inline-flex items-center gap-2 bg-teal text-white font-dm-sans font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all"
            >
              {l.cta1}
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
            </a>
            <a
              href="#preview"
              className="inline-flex items-center gap-2 bg-surface border border-border text-text font-dm-sans font-medium text-sm px-5 py-2.5 rounded-lg hover:border-border-dark active:scale-95 transition-all"
            >
              {l.cta2}
            </a>
          </div>

          <div
            className="flex items-center gap-4 sm:gap-6 mt-6 md:mt-8"
            style={{
              opacity: mounted ? undefined : 0,
              animation: mounted
                ? `revealUpSm 0.5s ${ease} 320ms both`
                : undefined,
            }}
          >
            <div>
              <div className="text-lg md:text-xl font-dm-mono font-medium text-text">
                70%
              </div>
              <div className="text-xs text-text-3 font-dm-sans">{l.stat1}</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <div className="text-lg md:text-xl font-dm-mono font-medium text-text">
                100%
              </div>
              <div className="text-xs text-text-3 font-dm-sans">{l.stat2}</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <div className="text-lg md:text-xl font-dm-mono font-medium text-text">
                AI
              </div>
              <div className="text-xs text-text-3 font-dm-sans">{l.stat3}</div>
            </div>
          </div>
        </div>

        {/* Right: Live UI Preview */}
        <div
          className="relative mt-4 lg:mt-0"
          style={{
            opacity: mounted ? undefined : 0,
            animation: mounted
              ? `scaleIn 0.7s ${ease} 200ms both`
              : undefined,
          }}
        >
          <div className="bg-surface2 border border-border rounded-2xl p-3 sm:p-4 shadow-[var(--shadow)]">
            {/* Mini app chrome */}
            <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-border">
              <div className="w-2 h-2 rounded-full bg-border-dark" />
              <div className="w-2 h-2 rounded-full bg-border-dark" />
              <div className="w-2 h-2 rounded-full bg-border-dark" />
              <span className="ml-2 text-xs text-text-3 font-dm-mono hidden sm:inline">
                tradelog.app/journal
              </span>
            </div>

            {/* Stats block */}
            <div className="mb-3">
              <MockStatsBlock stats={MOCK_STATS} />
            </div>

            {/* Date label */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-dm-sans text-text-3">
                {l.todayLabel}
              </span>
              <span className="text-xs font-dm-mono text-text-3">3 trades</span>
            </div>

            {/* Trade cards — staggered */}
            <div className="flex flex-col gap-2">
              {MOCK_TRADES.map((trade, i) => (
                <div
                  key={i}
                  style={{
                    opacity: mounted ? undefined : 0,
                    animation: mounted
                      ? `revealUpSm 0.4s ${ease} ${300 + i * 120}ms both`
                      : undefined,
                  }}
                >
                  <MockTradeCard trade={trade} />
                </div>
              ))}
            </div>
          </div>

          {/* Floating badge */}
          <div
            className="hidden sm:flex absolute -bottom-4 -left-4 bg-surface border border-border rounded-xl px-3 py-2 shadow-[var(--shadow-hover)] items-center gap-2 animate-float"
            style={{
              opacity: mounted ? undefined : 0,
              animation: mounted
                ? `revealUpSm 0.4s ${ease} 600ms both, float 3s ease-in-out 1000ms infinite`
                : undefined,
            }}
          >
            <div className="w-6 h-6 rounded-md bg-green-bg flex items-center justify-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 6L4.5 8.5L10 3"
                  stroke="var(--green)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-xs font-dm-mono font-medium text-green">
                +$286.50
              </div>
              <div className="text-xs text-text-3 font-dm-sans">
                {l.todayLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
