"use client";

import { useState, useEffect, useMemo } from "react";
import type { Trade, Profile } from "@/types";
import { formatPnl } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import {
  filterByDays,
  calcStats,
  calcBalanceCurve,
  calcDailyPnl,
  calcSessionPerformance,
  calcDirectionPerformance,
  calcTimeframePerformance,
  calcConfluencePerformance,
  calcChecklistPerformance,
  calcAssetPerformance,
} from "./StatsCalculations";
import { BalanceCurveChart, DailyPnlChart, ConfluenceChart, ChecklistPieChart } from "./StatsCharts";

export default function StatsClient({ trades, profile }: { trades: Trade[]; profile: Profile | null }) {
  const { t, lang } = useLanguage();
  const st = t.stats;
  const [period, setPeriod] = useState(7);
  const [aiInsight, setAiInsight] = useState<{
    general: string;
    strengths: string[];
    improvements: string[];
    insight: string;
  } | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightLoaded, setInsightLoaded] = useState(false);

  const filtered = useMemo(() => filterByDays(trades, period), [trades, period]);
  const stats = useMemo(() => calcStats(filtered), [filtered]);
  const balanceCurve = useMemo(() => calcBalanceCurve(filtered), [filtered]);
  const dailyPnl = useMemo(() => calcDailyPnl(filtered), [filtered]);
  const sessionPerf = useMemo(() => calcSessionPerformance(filtered), [filtered]);
  const directionPerf = useMemo(() => calcDirectionPerformance(filtered), [filtered]);
  const timeframePerf = useMemo(() => calcTimeframePerformance(filtered), [filtered]);
  const confluencePerf = useMemo(() => calcConfluencePerformance(filtered), [filtered]);
  const checklistPerf = useMemo(() => calcChecklistPerformance(filtered), [filtered]);
  const assetPerf = useMemo(() => calcAssetPerformance(filtered), [filtered]);

  const periodLabel = period === 7 ? st.thisWeek : period === 30 ? st.thisMonth : period === 90 ? st.last3Mo : st.thisYear;
  const currency = profile?.currency;

  useEffect(() => {
    setAiInsight(null);
    setInsightLoaded(false);
  }, [period, lang]);

  function fetchAiInsight() {
    if (filtered.length === 0 || loadingInsight) return;
    setLoadingInsight(true);

    const assetSummary = Object.entries(
      filtered.reduce((acc, t) => {
        const a = t.asset ?? "Other";
        if (!acc[a]) acc[a] = { count: 0, wins: 0 };
        acc[a].count++;
        if (t.result === "win") acc[a].wins++;
        return acc;
      }, {} as Record<string, { count: number; wins: number }>)
    )
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
        lang,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setAiInsight(data);
        setInsightLoaded(true);
      })
      .catch(() => {
        setInsightLoaded(true);
      })
      .finally(() => setLoadingInsight(false));
  }

  return (
    <div>
      {/* Header */}
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
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[11px] md:text-[12px] font-medium cursor-pointer transition-all whitespace-nowrap border ${
              period === days ? "bg-text text-bg border-text" : "bg-surface text-text-2 border-border"
            }`}
          >
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
                loadingInsight ? "bg-surface2 text-text-2 opacity-70" : "bg-teal text-white"
              }`}
            >
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
              onClick={() => {
                setAiInsight(null);
                setInsightLoaded(false);
              }}
              className="px-2.5 md:px-3 py-1.5 md:py-2 bg-surface2 text-text-3 border border-border rounded-lg text-[10px] md:text-[11px] cursor-pointer"
            >
              ↺
            </button>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="text-[12px] md:text-[13px] text-text-3 mt-3">{st.noTrades}</div>
        ) : insightLoaded && aiInsight ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-1">
            <div className="col-span-1 md:col-span-2 bg-teal-bg border border-teal-br rounded-xl md:rounded-lg p-3 md:p-4">
              <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-teal mb-2">Umumiy baho</div>
              <p className="text-[12px] md:text-[13px] leading-[1.7] text-text m-0">{aiInsight.general}</p>
            </div>
            <div className="bg-green-bg border border-green-br rounded-lg p-3 md:p-4">
              <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-green mb-2 flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
            <div className="bg-amber-bg border border-amber-br rounded-lg p-3 md:p-4">
              <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-amber mb-2 flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
            <div className="col-span-1 md:col-span-2 bg-surface2 border border-border rounded-lg p-3 md:p-4 flex gap-3 items-start">
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" stroke="var(--text-2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-text-3 mb-1">Asosiy Insight</div>
                <p className="text-[12px] md:text-[13px] leading-[1.6] text-text m-0">{aiInsight.insight}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="text-text-3 text-[13px] md:text-[14px] text-center py-12">{st.noTrades}</div>
      ) : (
        <>
          {/* Balance Curve */}
          <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 mb-5 shadow-[var(--shadow)]">
            <div className="flex justify-between items-center mb-3">
              <div className="text-[11px] md:text-[12px] text-text-3">{st.balanceCurve}</div>
              <div className="text-[16px] md:text-[18px] font-medium font-dm-mono" style={{ color: stats.totalPnl >= 0 ? "var(--green)" : "var(--red)" }}>
                {formatPnl(stats.totalPnl, currency)}
              </div>
            </div>
            {balanceCurve.length > 0 ? (
              <BalanceCurveChart data={balanceCurve} />
            ) : (
              <div className="text-[12px] text-text-3 py-8 text-center">{st.noData}</div>
            )}
          </div>

          {/* Daily P&L */}
          <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 mb-5 shadow-[var(--shadow)]">
            <div className="flex justify-between items-center mb-3">
              <div className="text-[11px] md:text-[12px] text-text-3">{st.dailyPnl}</div>
            </div>
            {dailyPnl.length > 0 ? (
              <DailyPnlChart data={dailyPnl} />
            ) : (
              <div className="text-[12px] text-text-3 py-8 text-center">{st.noData}</div>
            )}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[
              { label: st.winRate, value: `${stats.winRate}%`, sub: `${stats.wins}W / ${stats.losses}L`, color: stats.winRate >= 50 ? "g" : stats.winRate >= 40 ? "" : "r" },
              { label: st.avgRR, value: `${stats.avgRR.toFixed(2)}R`, color: stats.avgRR >= 2 ? "g" : stats.avgRR >= 1 ? "" : "r" },
              { label: st.profitFactor, value: isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "∞", color: stats.profitFactor >= 1.5 ? "g" : stats.profitFactor >= 1 ? "" : "r" },
              { label: st.trades, value: String(filtered.length), color: "" },
              { label: st.grossProfit, value: formatPnl(stats.grossProfit, currency), color: "g" },
              { label: st.grossLoss, value: formatPnl(-stats.grossLoss, currency), color: "r" },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-surface border border-border rounded-xl p-3 md:p-4 shadow-[var(--shadow)]">
                <div className="text-[10px] md:text-[11px] text-text-3 uppercase tracking-[0.08em] mb-2">{label}</div>
                <div className={`text-[14px] md:text-[20px] font-medium font-dm-mono tracking-[-0.5px] ${color === "g" ? "text-green" : color === "r" ? "text-red" : "text-text"}`}>
                  {value}
                </div>
                {sub && <div className="text-[10px] md:text-[11px] text-text-3 mt-1">{sub}</div>}
              </div>
            ))}
          </div>

          {/* Best / Worst + Session */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 shadow-[var(--shadow)]">
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-4">Eng yaxshi / yomon</div>
              {[
                { label: st.bestTrade, trade: stats.best, color: "var(--green)" },
                { label: st.worstTrade, trade: stats.worst, color: "var(--red)" },
              ].map(({ label, trade: t, color }) => (
                <div key={label} className="bg-surface2 rounded-lg p-3 md:p-3.5 mb-2.5 last:mb-0">
                  <div className="text-[10px] uppercase tracking-[0.1em] mb-1.5" style={{ color }}>{label}</div>
                  <div className="text-[13px] md:text-[15px] font-medium text-text">{t?.asset ?? "—"}</div>
                  <div className="text-[13px] md:text-[14px] font-medium font-dm-mono mt-0.5" style={{ color }}>
                    {t?.pnl !== undefined ? formatPnl(t.pnl ?? null, currency) : "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Session Performance */}
            <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 shadow-[var(--shadow)]">
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-4">{st.bySession}</div>
              {sessionPerf.length === 0 ? (
                <div className="text-text-3 text-[12px]">{st.noData}</div>
              ) : (
                <div className="space-y-2">
                  {sessionPerf.map((s) => (
                    <div key={s.session} className="bg-surface2 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-[12px] md:text-[13px] font-medium text-text">{s.session}</div>
                        <div className="text-[10px] md:text-[11px] text-text-3 mt-0.5">
                          {s.count} {st.tradeCount} · {s.wins}W
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-dm-mono text-[12px] md:text-[13px] font-medium" style={{ color: s.pnl >= 0 ? "var(--green)" : "var(--red)" }}>
                          {formatPnl(s.pnl, currency)}
                        </div>
                        <div className="text-[10px] font-dm-mono" style={{ color: s.winRate >= 50 ? "var(--green)" : "var(--red)" }}>
                          {s.winRate}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Direction LONG vs SHORT */}
          {directionPerf.some((d) => d.count > 0) && (
            <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 mb-5 shadow-[var(--shadow)]">
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-4">{st.direction}</div>
              <div className="grid grid-cols-2 gap-3">
                {directionPerf.map((d) => (
                  <div key={d.direction} className="bg-surface2 rounded-lg p-3 md:p-4">
                    <div className="text-[11px] md:text-[12px] font-medium text-text mb-2">{d.direction}</div>
                    {d.count === 0 ? (
                      <div className="text-[11px] text-text-3">—</div>
                    ) : (
                      <>
                        <div className="font-dm-mono text-[18px] md:text-[22px] font-medium" style={{ color: d.winRate >= 50 ? "var(--green)" : "var(--red)" }}>
                          {d.winRate}%
                        </div>
                        <div className="text-[10px] text-text-3 mt-1">{d.count} {st.tradeCount} · {d.wins}W</div>
                        <div className="font-dm-mono text-[11px] mt-1" style={{ color: d.pnl >= 0 ? "var(--green)" : "var(--red)" }}>
                          {formatPnl(d.pnl, currency)}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeframe Performance */}
          {timeframePerf.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 mb-5 shadow-[var(--shadow)]">
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-4">{st.byTimeframe}</div>
              <div className="space-y-0">
                {timeframePerf.map((tf) => (
                  <div key={tf.timeframe} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <div className="text-[12px] md:text-[13px] font-medium text-text font-dm-mono">{tf.timeframe}</div>
                      <div className="text-[10px] md:text-[11px] text-text-3 mt-0.5">{tf.count} {st.tradeCount} · {tf.wins}W</div>
                    </div>
                    <div className="text-right">
                      <div className="font-dm-mono text-[12px] md:text-[13px] font-medium" style={{ color: tf.pnl >= 0 ? "var(--green)" : "var(--red)" }}>
                        {formatPnl(tf.pnl, currency)}
                      </div>
                      <div className="text-[10px] font-dm-mono" style={{ color: tf.winRate >= 50 ? "var(--green)" : "var(--red)" }}>
                        {tf.winRate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Asset Breakdown */}
          {assetPerf.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 mb-5 shadow-[var(--shadow)]">
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-4">{st.byAsset}</div>
              <div className="space-y-0">
                {assetPerf.map((a) => (
                  <div key={a.asset} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <div className="text-[12px] md:text-[13px] font-medium text-text">{a.asset}</div>
                      <div className="text-[10px] md:text-[11px] text-text-3 mt-0.5">{a.count} {st.tradeCount} · {a.wins}W</div>
                    </div>
                    <div className="text-right">
                      <div className="font-dm-mono text-[12px] md:text-[13px] font-medium" style={{ color: a.pnl >= 0 ? "var(--green)" : "var(--red)" }}>
                        {formatPnl(a.pnl, currency)}
                      </div>
                      <div className="text-[10px] font-dm-mono" style={{ color: a.winRate >= 50 ? "var(--green)" : "var(--red)" }}>
                        {a.winRate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confluence Performance */}
          {confluencePerf.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 mb-5 shadow-[var(--shadow)]">
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-2">{st.confluencePerf}</div>
              <p className="text-[11px] text-text-3 mb-4">{st.confluencePerfSub}</p>
              <ConfluenceChart data={confluencePerf} />
              <div className="mt-4 space-y-0">
                {confluencePerf.map((c) => (
                  <div key={c.tag} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <div className="text-[12px] md:text-[13px] font-medium text-text">{c.tag}</div>
                    <div className="flex items-center gap-4">
                      <div className="text-[11px] text-text-3">{c.count} {st.tradeCount}</div>
                      <div className="font-dm-mono text-[12px] font-medium" style={{ color: c.winRate >= 55 ? "var(--green)" : c.winRate >= 40 ? "var(--teal)" : "var(--red)" }}>
                        {c.winRate}%
                      </div>
                      <div className="font-dm-mono text-[12px]" style={{ color: c.pnl >= 0 ? "var(--green)" : "var(--red)" }}>
                        {formatPnl(c.pnl, currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checklist Impact */}
          {checklistPerf.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 mb-5 shadow-[var(--shadow)]">
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-2">{st.checklistImpact}</div>
              <p className="text-[11px] text-text-3 mb-4">{st.checklistImpactSub}</p>
              <ChecklistPieChart
                data={checklistPerf}
                labels={{ checked: st.checked, unchecked: st.unchecked, tradeCount: st.tradeCount }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
