"use client";

import { useState, useEffect, useMemo } from "react";
import type { Trade, Profile } from "@/types";
import { formatPnl } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

function filterByDays(trades: Trade[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return trades.filter((t) => new Date(t.created_at) >= cutoff);
}

function calcStats(trades: Trade[]) {
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;
  const rrTrades = trades.filter((t) => t.rr !== null);
  const avgRR = rrTrades.length > 0 ? rrTrades.reduce((s, t) => s + (t.rr ?? 0), 0) / rrTrades.length : 0;
  const grossProfit = trades.filter((t) => (t.pnl ?? 0) > 0).reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossLoss = Math.abs(trades.filter((t) => (t.pnl ?? 0) < 0).reduce((s, t) => s + (t.pnl ?? 0), 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  const allMoods = trades.flatMap((t) => t.mood ?? []);
  const moodCounts = allMoods.reduce((acc, m) => ({ ...acc, [m]: (acc[m] ?? 0) + 1 }), {} as Record<string, number>);
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const avgAdherence = trades.filter((t) => t.plan_adherence !== null).reduce((s, t) => s + (t.plan_adherence ?? 0), 0) / (trades.filter((t) => t.plan_adherence !== null).length || 1);

  const byAsset: Record<string, { count: number; wins: number; pnl: number }> = {};
  trades.forEach((t) => {
    const a = t.asset ?? "Other";
    if (!byAsset[a]) byAsset[a] = { count: 0, wins: 0, pnl: 0 };
    byAsset[a].count++;
    if (t.result === "win") byAsset[a].wins++;
    byAsset[a].pnl += t.pnl ?? 0;
  });

  const sorted = [...trades].sort((a, b) => (b.pnl ?? 0) - (a.pnl ?? 0));
  const best = sorted[0] ?? null;
  const worst = sorted[sorted.length - 1] ?? null;

  return { wins, losses, totalPnl, winRate, avgRR, profitFactor, topMood, avgAdherence, byAsset, best, worst };
}

export default function StatsClient({ trades, profile }: { trades: Trade[]; profile: Profile | null }) {
  const { t } = useLanguage();
  const st = t.stats;
  const [period, setPeriod] = useState(7);
  const [aiInsight, setAiInsight] = useState<{ general: string; strengths: string[]; improvements: string[]; insight: string } | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightLoaded, setInsightLoaded] = useState(false);

  const filtered = useMemo(() => filterByDays(trades, period), [trades, period]);
  const stats = useMemo(() => calcStats(filtered), [filtered]);

  const periodLabel = period === 7 ? st.thisWeek : period === 30 ? st.thisMonth : period === 90 ? st.last3Mo : st.thisYear;

  useEffect(() => {
    setAiInsight(null);
    setInsightLoaded(false);
  }, [period]);

  function fetchAiInsight() {
    if (filtered.length === 0 || loadingInsight) return;
    setLoadingInsight(true);

    const assetSummary = Object.entries(stats.byAsset)
      .map(([a, d]) => `${a}: ${d.count} trades, ${Math.round((d.wins / d.count) * 100)}% WR`)
      .join(", ");

    fetch("/api/stats-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        days: period,
        total: filtered.length,
        wins: stats.wins,
        losses: stats.losses,
        winRate: stats.winRate,
        avgRR: stats.avgRR.toFixed(2),
        profitFactor: isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "∞",
        totalPnl: stats.totalPnl.toFixed(2),
        topMood: stats.topMood,
        assetSummary,
        avgAdherence: stats.avgAdherence.toFixed(1),
      }),
    })
      .then((r) => r.json())
      .then((data) => { setAiInsight(data); setInsightLoaded(true); })
      .catch(() => { setInsightLoaded(true); })
      .finally(() => setLoadingInsight(false));
  }

  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    filtered.forEach((t) => {
      const d = new Date(t.created_at).toLocaleDateString("uz-UZ");
      days[d] = (days[d] ?? 0) + (t.pnl ?? 0);
    });
    const entries = Object.entries(days).slice(-28);
    const max = Math.max(...entries.map(([, v]) => Math.abs(v)), 1);
    return entries.map(([date, pnl]) => ({ date, pnl, height: Math.max(4, (Math.abs(pnl) / max) * 100) }));
  }, [filtered]);

  return (
    <div>
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h1 className="font-fraunces text-[26px] md:text-[32px] font-light leading-[1.1] tracking-[-0.5px] text-text">
            {st.title}
          </h1>
          <p className="text-[12px] md:text-[13px] text-text-3 mt-1.5">{periodLabel}</p>
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1.5 md:gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { label: st.week, days: 7 },
          { label: st.month, days: 30 },
          { label: st.threeMonths, days: 90 },
          { label: st.year, days: 365 },
        ].map(({ label, days }) => (
          <button key={days} onClick={() => setPeriod(days)} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[11px] md:text-[12px] font-medium cursor-pointer transition-all whitespace-nowrap ${
            period === days
              ? "bg-text text-bg border-text"
              : "bg-surface text-text-2 border-border"
          } border`}>
            {label}
          </button>
        ))}
      </div>

      {/* AI Insight */}
      <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 lg:p-5 mb-5 shadow-[var(--shadow)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-teal-bg border border-teal-br rounded-lg md:rounded-[9px] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-[12px] md:text-[13px] font-medium text-text">AI Coach</div>
              <div className="text-[10px] md:text-[11px] text-text-3 mt-0.5">{st.aiInsight}</div>
            </div>
          </div>
          {!insightLoaded && filtered.length > 0 && (
            <button
              onClick={fetchAiInsight}
              disabled={loadingInsight}
              className={`flex items-center gap-1.5 md:gap-2 px-3.5 md:px-4 py-2 md:py-2.5 rounded-lg font-dm-sans text-[11px] md:text-[12px] font-medium cursor-pointer transition-all border-none disabled:not-allowed ${
                loadingInsight
                  ? "bg-surface2 text-text-2 opacity-70"
                  : "bg-teal text-white"
              }`}>
              {loadingInsight ? (
                <>
                  <span className="w-3 h-3 md:w-3.5 md:h-3.5 border-2 border-border border-t-teal rounded-full inline-block animate-spin-custom" />
                  {st.analyzing}
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {st.getInsight}
                </>
              )}
            </button>
          )}
          {insightLoaded && (
            <button
              onClick={() => { setAiInsight(null); setInsightLoaded(false); }}
              className="px-2.5 md:px-3 py-1.5 md:py-2 bg-surface2 text-text-3 border border-border rounded-lg text-[10px] md:text-[11px] cursor-pointer">
              ↺
            </button>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="text-[12px] md:text-[13px] text-text-3 mt-3">{st.noTrades}</div>
        ) : insightLoaded && aiInsight ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-2.5 mt-1">
            {/* General */}
            <div className="col-span-1 md:col-span-2 bg-teal-bg border border-teal-br rounded-xl md:rounded-lg p-3 md:p-4">
              <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-teal mb-2">
                Umumiy baho
              </div>
              <p className="text-[12px] md:text-[13px] leading-[1.7] text-text m-0">{aiInsight.general}</p>
            </div>
            {/* Strengths */}
            <div className="bg-green-bg border border-green-br rounded-lg p-3 md:p-4">
              <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-green mb-2 flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                To&apos;g&apos;ri qilganlar
              </div>
              <ul className="m-0 p-0 list-none">
                {aiInsight.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 items-start text-[11px] md:text-[12px] text-text leading-[1.6] mb-1 md:mb-1.5 last:mb-0">
                    <span className="text-green flex-shrink-0 mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            {/* Improvements */}
            <div className="bg-amber-bg border border-amber-br rounded-lg p-3 md:p-4">
              <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-amber mb-2 flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Yaxshilash kerak
              </div>
              <ul className="m-0 p-0 list-none">
                {aiInsight.improvements.map((s, i) => (
                  <li key={i} className="flex gap-2 items-start text-[11px] md:text-[12px] text-text leading-[1.6] mb-1 md:mb-1.5 last:mb-0">
                    <span className="text-amber flex-shrink-0 mt-0.5">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            {/* Key Insight */}
            <div className="col-span-1 md:col-span-2 bg-surface2 border border-border rounded-lg p-3 md:p-4 flex gap-3 items-start">
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" stroke="var(--text-2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-3 mb-1">Asosiy Insight</div>
                <p className="text-[12px] md:text-[13px] leading-[1.6] text-text m-0">{aiInsight.insight}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* P&L Chart */}
      <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 mb-5 shadow-[var(--shadow)]">
        <div className="flex justify-between items-center mb-1">
          <div className="text-[11px] md:text-[12px] text-text-3">P&amp;L dinamikasi</div>
          <div className="text-[16px] md:text-[18px] font-medium font-dm-mono" style={{ color: stats.totalPnl >= 0 ? "var(--green)" : "var(--red)" }}>
            {formatPnl(stats.totalPnl, profile?.currency)}
          </div>
        </div>
        <div className="flex items-end gap-1 h-20 md:h-24 mx-2 md:mx-4">
          {chartData.length === 0 ? (
            <div className="text-[12px] md:text-[13px] text-text-3 mx-auto">Ma&apos;lumot yo&apos;q</div>
          ) : (
            chartData.map(({ date, pnl, height }) => (
              <div key={date} title={`${date}: ${formatPnl(pnl)}`} className="flex-1 min-h-[4px] rounded-t-sm opacity-80 cursor-default transition-opacity" style={{ height: `${height}%`, background: pnl >= 0 ? "var(--green)" : "var(--red)" }} />
            ))
          )}
        </div>
        <div className="flex justify-between text-[9px] md:text-[10px] text-text-3 font-dm-mono">
          <span>1</span><span>7</span><span>14</span><span>21</span><span>28</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-3 mb-6">
        {[
          { label: "Win rate", value: `${stats.winRate}%`, sub: `${stats.wins}W / ${stats.losses}L`, color: stats.winRate >= 50 ? "g" : stats.winRate >= 40 ? "" : "r" },
          { label: "Avg R:R", value: `${stats.avgRR.toFixed(2)}R`, color: stats.avgRR >= 2 ? "g" : stats.avgRR >= 1 ? "" : "r" },
          { label: "Profit factor", value: isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "∞", color: stats.profitFactor >= 1.5 ? "g" : stats.profitFactor >= 1 ? "" : "r" },
          { label: "Jami trade", value: String(filtered.length), color: "" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-3 md:p-4 shadow-[var(--shadow)]">
            <div className="text-[10px] md:text-[11px] text-text-3 uppercase tracking-[0.08em] mb-2">{label}</div>
            <div className={`text-[16px] md:text-[22px] font-medium font-dm-mono tracking-[-0.5px] ${
              color === "g" ? "text-green" : color === "r" ? "text-red" : "text-text"
            }`}>
              {value}
            </div>
            {sub && <div className="text-[10px] md:text-[11px] text-text-3 mt-1">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Best/Worst + Asset breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 shadow-[var(--shadow)]">
          <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-4">
            Eng yaxshi / yomon
          </div>
          {[
            { label: "Best trade", trade: stats.best, color: "var(--green)" },
            { label: "Worst trade", trade: stats.worst, color: "var(--red)" },
          ].map(({ label, trade: t, color }) => (
            <div key={label} className="bg-surface2 rounded-lg p-3 md:p-3.5 mb-2.5 last:mb-0">
              <div className="text-[10px] uppercase tracking-[0.1em] mb-1.5" style={{ color }}>{label}</div>
              <div className="text-[13px] md:text-[15px] font-medium text-text">{t?.asset ?? "—"}</div>
              <div className="text-[13px] md:text-[14px] font-medium font-dm-mono mt-0.5" style={{ color }}>
                {t?.pnl !== undefined ? formatPnl(t.pnl ?? null, profile?.currency) : "—"}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 shadow-[var(--shadow)]">
          <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-4">
            Asset breakdown
          </div>
          {Object.keys(stats.byAsset).length === 0 ? (
            <div className="text-text-3 text-[12px] md:text-[13px]">Ma&apos;lumot yo&apos;q</div>
          ) : (
            Object.entries(stats.byAsset)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([asset, data]) => (
                <div key={asset} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <div className="text-[12px] md:text-[13px] font-medium text-text">{asset}</div>
                    <div className="text-[10px] md:text-[11px] text-text-3 mt-0.5">
                      {data.count} trade · {Math.round((data.wins / data.count) * 100)}% WR
                    </div>
                  </div>
                  <div className="font-dm-mono text-[12px] md:text-[13px] font-medium" style={{ color: data.pnl >= 0 ? "var(--green)" : "var(--red)" }}>
                    {formatPnl(data.pnl, profile?.currency)}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
