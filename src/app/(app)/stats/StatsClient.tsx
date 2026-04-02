"use client";

import { useState, useEffect, useMemo } from "react";
import type { Trade, Profile } from "@/types";
import { formatPnl } from "@/lib/utils";

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
  const [period, setPeriod] = useState(7);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightLoaded, setInsightLoaded] = useState(false);

  const filtered = useMemo(() => filterByDays(trades, period), [trades, period]);
  const stats = useMemo(() => calcStats(filtered), [filtered]);

  const periodLabel = period === 7 ? "Bu hafta" : period === 30 ? "Bu oy" : period === 90 ? "So'nggi 3 oy" : "Bu yil";

  useEffect(() => {
    if (filtered.length === 0) { setAiInsight(null); setInsightLoaded(false); return; }
    setAiInsight(null);
    setInsightLoaded(false);
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
      .then((r) => r.text())
      .then((text) => { setAiInsight(text); setInsightLoaded(true); })
      .catch(() => { setAiInsight("Tahlil amalga oshmadi."); setInsightLoaded(true); })
      .finally(() => setLoadingInsight(false));
  }, [period, filtered.length]);

  // P&L bar chart data (last N days)
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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.5px", color: "var(--text)" }}>
            Statistika
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 6 }}>{periodLabel}</p>
        </div>
      </div>

      {/* Period tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[
          { label: "Hafta", days: 7 },
          { label: "Oy", days: 30 },
          { label: "3 oy", days: 90 },
          { label: "Yil", days: 365 },
        ].map(({ label, days }) => (
          <button key={days} onClick={() => setPeriod(days)} style={{
            padding: "7px 16px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
            border: `1px solid ${period === days ? "var(--text)" : "var(--border)"}`,
            background: period === days ? "var(--text)" : "var(--surface)",
            color: period === days ? "white" : "var(--text-2)",
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* AI Insight */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, boxShadow: "var(--shadow)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, background: "var(--teal-bg)", border: "1px solid var(--teal-br)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 16v-4M12 8h.01" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>AI Tavsiya</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Statistikangizga asoslangan coaching</div>
          </div>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-2)" }}>
          {loadingInsight ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 16, height: 16, border: "2px solid var(--border)", borderTopColor: "var(--teal)", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
              Tahlil qilinmoqda...
            </span>
          ) : filtered.length === 0 ? (
            "Bu davrda tradelar yo'q."
          ) : insightLoaded ? (
            aiInsight
          ) : (
            "Tavsiya yuklanmoqda..."
          )}
        </div>
      </div>

      {/* P&L Chart */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "var(--shadow)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>P&amp;L dinamikasi</div>
          <div style={{ fontSize: 18, fontWeight: 500, fontFamily: "'DM Mono',monospace", color: stats.totalPnl >= 0 ? "var(--green)" : "var(--red)" }}>
            {formatPnl(stats.totalPnl, profile?.currency)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, margin: "16px 0 8px" }}>
          {chartData.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-3)", margin: "auto" }}>Ma&apos;lumot yo&apos;q</div>
          ) : (
            chartData.map(({ date, pnl, height }) => (
              <div key={date} title={`${date}: ${formatPnl(pnl)}`} style={{
                flex: 1, height: `${height}px`, borderRadius: "2px 2px 0 0", minHeight: 4,
                background: pnl >= 0 ? "var(--green)" : "var(--red)",
                opacity: 0.8, cursor: "default", transition: "opacity 0.15s",
              }} />
            ))
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-3)", fontFamily: "'DM Mono',monospace" }}>
          <span>1</span><span>7</span><span>14</span><span>21</span><span>28</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Win rate", value: `${stats.winRate}%`, sub: `${stats.wins}W / ${stats.losses}L`, color: stats.winRate >= 50 ? "g" : stats.winRate >= 40 ? "" : "r" },
          { label: "Avg R:R", value: `${stats.avgRR.toFixed(2)}R`, color: stats.avgRR >= 2 ? "g" : stats.avgRR >= 1 ? "" : "r" },
          { label: "Profit factor", value: isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "∞", color: stats.profitFactor >= 1.5 ? "g" : stats.profitFactor >= 1 ? "" : "r" },
          { label: "Jami trade", value: String(filtered.length), color: "" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", boxShadow: "var(--shadow)" }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, fontFamily: "'DM Mono',monospace", letterSpacing: "-0.5px", color: color === "g" ? "var(--green)" : color === "r" ? "var(--red)" : "var(--text)" }}>
              {value}
            </div>
            {sub && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Best/Worst + Asset breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 16 }}>
            Eng yaxshi / yomon
          </div>
          {[
            { label: "Best trade", trade: stats.best, color: "var(--green)" },
            { label: "Worst trade", trade: stats.worst, color: "var(--red)" },
          ].map(({ label, trade: t, color }) => (
            <div key={label} style={{ background: "var(--surface2)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 10, color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)" }}>{t?.asset ?? "—"}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color, fontFamily: "'DM Mono',monospace", marginTop: 2 }}>
                {t?.pnl !== undefined ? formatPnl(t.pnl ?? null, profile?.currency) : "—"}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 16 }}>
            Asset breakdown
          </div>
          {Object.keys(stats.byAsset).length === 0 ? (
            <div style={{ color: "var(--text-3)", fontSize: 13 }}>Ma&apos;lumot yo&apos;q</div>
          ) : (
            Object.entries(stats.byAsset)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([asset, data]) => (
                <div key={asset} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{asset}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                      {data.count} trade · {Math.round((data.wins / data.count) * 100)}% WR
                    </div>
                  </div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 500, color: data.pnl >= 0 ? "var(--green)" : "var(--red)" }}>
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
