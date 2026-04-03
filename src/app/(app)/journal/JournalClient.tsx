"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import type { Trade, Profile } from "@/types";
import { formatPnl, formatTime } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

function groupByDate(trades: Trade[], today: string, yesterday: string, lang: string) {
  const groups: Record<string, Trade[]> = {};
  trades.forEach((t) => {
    const d = new Date(t.created_at);
    const now = new Date();
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    let key: string;
    if (d.toDateString() === now.toDateString()) key = today;
    else if (d.toDateString() === yest.toDateString()) key = yesterday;
    else {
      const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ";
      key = d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  return groups;
}

function StatCard({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 md:p-[18px] shadow-[var(--shadow)]">
      <div className="text-[10px] md:text-[11px] text-text-3 uppercase tracking-[0.08em] mb-2">{label}</div>
      <div className={`text-[18px] md:text-[22px] font-medium font-dm-mono tracking-[-0.5px] ${
        colorClass === "g" ? "text-green" : colorClass === "r" ? "text-red" : "text-text"
      }`}>{value}</div>
    </div>
  );
}

function TradeCard({ trade, feedbackEnabled, translatedFeedback }: { trade: Trade; feedbackEnabled: boolean; translatedFeedback?: string }) {
  const pnlColor = trade.pnl === null ? "" : trade.pnl > 0 ? "var(--green)" : trade.pnl < 0 ? "var(--red)" : "var(--text-2)";
  const dirColor = trade.direction === "LONG" ? { bg: "var(--green-bg)", color: "var(--green)" } : trade.direction === "SHORT" ? { bg: "var(--red-bg)", color: "var(--red)" } : { bg: "var(--surface2)", color: "var(--text-2)" };
  const resStyle = trade.result === "win" ? { bg: "var(--green-bg)", color: "var(--green)" } : trade.result === "loss" ? { bg: "var(--red-bg)", color: "var(--red)" } : { bg: "var(--amber-bg)", color: "var(--amber)" };

  return (
    <Link href={`/journal/${trade.id}`} style={{ textDecoration: "none" }}>
      <div className="bg-surface border border-border rounded-xl p-4 md:p-5 shadow-[var(--shadow)] transition-all duration-150 hover:shadow-[var(--shadow-hover)] hover:border-[var(--border-dark)]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[14px] md:text-[15px] font-medium tracking-[-0.2px] text-text">{trade.asset || "—"}</span>
          <span className="text-[14px] md:text-[15px] font-medium font-dm-mono" style={{ color: pnlColor }}>
            {trade.pnl !== null ? formatPnl(trade.pnl) : "—"}
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {trade.direction && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md font-dm-mono" style={{ background: dirColor.bg, color: dirColor.color }}>{trade.direction}</span>
          )}
          {trade.result && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md font-dm-mono" style={{ background: resStyle.bg, color: resStyle.color }}>
              {trade.result === "win" ? "WIN" : trade.result === "loss" ? "LOSS" : "BE"}
            </span>
          )}
          {trade.timeframe && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md font-dm-mono bg-surface2 text-text-2 border border-border">{trade.timeframe}</span>
          )}
          {trade.rr !== null && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md font-dm-mono bg-surface2 border border-border" style={{ color: trade.rr >= 2 ? "var(--green)" : trade.rr >= 1 ? "var(--amber)" : "var(--red)" }}>
              {trade.rr.toFixed(2)}R
            </span>
          )}
        </div>
        {feedbackEnabled && trade.ai_feedback && (
          <div className="text-[11px] md:text-[12px] text-text-2 leading-[1.55] p-2 md:p-3 bg-teal-bg rounded-lg border-l-2 border-teal mt-2">
            {(() => { const txt = translatedFeedback ?? trade.ai_feedback; return txt.slice(0, 120) + (txt.length > 120 ? "..." : ""); })()}
          </div>
        )}
        <div className="text-[10px] md:text-[11px] text-text-3 font-dm-mono mt-2">{formatTime(trade.created_at)}</div>
      </div>
    </Link>
  );
}

interface Props {
  trades: Trade[];
  profile: Profile | null;
  todayStats: { totalPnl: number; winRate: number | null; avgRR: number | null; count: number };
}

export default function JournalClient({ trades, profile, todayStats }: Props) {
  const { t, lang } = useLanguage();
  const j = t.journal;
  const [translatedFeedbacks, setTranslatedFeedbacks] = useState<Record<string, string>>({});
  const translateCacheRef = useRef<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (lang === "uz") { setTranslatedFeedbacks({}); return; }
    const cached = translateCacheRef.current[lang];
    if (cached) { setTranslatedFeedbacks(cached); return; }

    const withFeedback = trades.filter((tr) => tr.ai_feedback);
    if (withFeedback.length === 0) return;

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: withFeedback.map((tr) => tr.ai_feedback!), lang }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.translations) {
          const map: Record<string, string> = {};
          withFeedback.forEach((tr, i) => { map[tr.id] = data.translations[i]; });
          translateCacheRef.current[lang] = map;
          setTranslatedFeedbacks(map);
        }
      })
      .catch(() => {});
  }, [lang, trades]);

  const dateStr = new Date().toLocaleDateString(
    lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  const grouped = useMemo(
    () => groupByDate(trades, j.today, j.yesterday, lang),
    [trades, j.today, j.yesterday, lang]
  );
  const dateKeys = Object.keys(grouped);

  return (
    <div>
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h1 className="font-fraunces text-[26px] md:text-[32px] font-light leading-[1.1] tracking-[-0.5px] text-text">
            {j.title}
          </h1>
          <p className="text-[12px] md:text-[13px] text-text-3 mt-1.5">{dateStr}</p>
        </div>
        <Link href="/journal/new" className="flex items-center gap-2 px-4 md:px-[18px] py-2.5 md:py-[10px] bg-text text-bg border-none rounded-lg font-dm-sans text-[12px] md:text-[13px] font-medium no-underline transition-opacity hover:opacity-90 add-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {j.newTrade}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-3 mb-6 md:mb-7">
        <StatCard label={j.todayPnl} value={todayStats.count > 0 ? formatPnl(todayStats.totalPnl, profile?.currency) : "—"} colorClass={todayStats.totalPnl > 0 ? "g" : todayStats.totalPnl < 0 ? "r" : ""} />
        <StatCard label={j.winRate} value={todayStats.winRate !== null ? `${todayStats.winRate}%` : "—"} />
        <StatCard label={j.trades} value={String(todayStats.count > 0 ? todayStats.count : "—")} />
        <StatCard label={j.avgRR} value={todayStats.avgRR !== null ? `${todayStats.avgRR.toFixed(2)}R` : "—"} />
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-16 md:py-20 px-6 md:px-10">
          <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-5 opacity-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="font-fraunces text-[18px] md:text-[20px] font-light text-text mb-2">{j.noTrades}</h3>
          <p className="text-[12px] md:text-[13px] text-text-3">{j.noTradesSub}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 md:gap-6">
          {dateKeys.map((dateKey) => (
            <div key={dateKey}>
              <div className="text-[10px] md:text-[11px] font-medium text-text-3 uppercase tracking-[0.1em] mb-2.5">{dateKey}</div>
              <div className="flex flex-col gap-2">
                {(grouped[dateKey] as Trade[]).map((trade) => (
                  <TradeCard key={trade.id} trade={trade} feedbackEnabled={profile?.feedback_enabled ?? true} translatedFeedback={translatedFeedbacks[trade.id]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
