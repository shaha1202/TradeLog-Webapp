import { createClient } from "@/lib/supabase/server";
import { getUserId, getCachedProfile } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Trade, Profile } from "@/types";
import { formatPnl, formatDate, formatTime, groupTradesByDate } from "@/lib/utils";

function StatCard({ label, value, sub, colorClass }: { label: string; value: string; sub?: string; colorClass?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 md:p-[18px] shadow-[var(--shadow)]">
      <div className="text-[10px] md:text-[11px] text-text-3 uppercase tracking-[0.08em] mb-2">{label}</div>
      <div className={`text-[18px] md:text-[22px] font-medium font-dm-mono tracking-[-0.5px] ${
        colorClass === "g" ? "text-green" : colorClass === "r" ? "text-red" : "text-text"
      }`}>
        {value}
      </div>
      {sub && <div className="text-[10px] md:text-[11px] text-text-3 mt-1">{sub}</div>}
    </div>
  );
}

function TradeCard({ trade, feedbackEnabled }: { trade: Trade; feedbackEnabled: boolean }) {
  const pnlColor = trade.pnl === null ? "" : trade.pnl > 0 ? "var(--green)" : trade.pnl < 0 ? "var(--red)" : "var(--text-2)";
  const dirColor = trade.direction === "LONG" ? { bg: "var(--green-bg)", color: "var(--green)" } : trade.direction === "SHORT" ? { bg: "var(--red-bg)", color: "var(--red)" } : { bg: "var(--surface2)", color: "var(--text-2)" };
  const resStyle = trade.result === "win"
    ? { bg: "var(--green-bg)", color: "var(--green)" }
    : trade.result === "loss"
    ? { bg: "var(--red-bg)", color: "var(--red)" }
    : { bg: "var(--amber-bg)", color: "var(--amber)" };

  return (
    <Link href={`/journal/${trade.id}`} style={{ textDecoration: "none" }}>
      <div className="bg-surface border border-border rounded-xl p-4 md:p-5 shadow-[var(--shadow)] transition-all duration-150 hover:shadow-[var(--shadow-hover)] hover:border-[var(--border-dark)]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[14px] md:text-[15px] font-medium tracking-[-0.2px] text-text">
            {trade.asset || "—"}
          </span>
          <span className="text-[14px] md:text-[15px] font-medium font-dm-mono" style={{ color: pnlColor }}>
            {trade.pnl !== null ? formatPnl(trade.pnl) : "—"}
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {trade.direction && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md font-dm-mono" style={{ background: dirColor.bg, color: dirColor.color }}>
              {trade.direction}
            </span>
          )}
          {trade.result && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md font-dm-mono" style={{ background: resStyle.bg, color: resStyle.color }}>
              {trade.result === "win" ? "WIN" : trade.result === "loss" ? "LOSS" : "BE"}
            </span>
          )}
          {trade.timeframe && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md font-dm-mono bg-surface2 text-text-2 border border-border">
              {trade.timeframe}
            </span>
          )}
          {trade.rr !== null && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md font-dm-mono bg-surface2 border border-border" style={{ color: trade.rr >= 2 ? "var(--green)" : trade.rr >= 1 ? "var(--amber)" : "var(--red)" }}>
              {trade.rr.toFixed(2)}R
            </span>
          )}
        </div>
        {feedbackEnabled && trade.ai_feedback && (
          <div className="text-[11px] md:text-[12px] text-text-2 leading-[1.55] p-2 md:p-3 bg-teal-bg rounded-lg border-l-2 border-teal mt-2">
            {trade.ai_feedback.slice(0, 120)}{trade.ai_feedback.length > 120 ? "..." : ""}
          </div>
        )}
        <div className="text-[10px] md:text-[11px] text-text-3 font-dm-mono mt-2">
          {formatTime(trade.created_at)}
        </div>
      </div>
    </Link>
  );
}

export default async function JournalPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const [tradesData, profile] = await Promise.all([
    supabase.from("trades").select("*").eq("user_id", userId).order("created_at", { ascending: false }).then(r => r.data),
    getCachedProfile(userId),
  ]);

  const trades = (tradesData ?? []) as Trade[];

  // Today stats
  const today = new Date().toDateString();
  const todayTrades = trades.filter((t) => new Date(t.created_at).toDateString() === today);
  const wins = todayTrades.filter((t) => t.result === "win").length;
  const totalPnl = todayTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winRate = todayTrades.length > 0 ? Math.round((wins / todayTrades.length) * 100) : null;
  const rrTrades = todayTrades.filter((t) => t.rr !== null);
  const avgRR = rrTrades.length > 0 ? rrTrades.reduce((s, t) => s + (t.rr ?? 0), 0) / rrTrades.length : null;

  const grouped = groupTradesByDate(trades);
  const dateKeys = Object.keys(grouped);

  const dateStr = new Date().toLocaleDateString("uz-UZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h1 className="font-fraunces text-[26px] md:text-[32px] font-light leading-[1.1] tracking-[-0.5px] text-text">
            Jurnal
          </h1>
          <p className="text-[12px] md:text-[13px] text-text-3 mt-1.5">{dateStr}</p>
        </div>
        <Link href="/journal/new" className="flex items-center gap-2 px-4 md:px-[18px] py-2.5 md:py-[10px] bg-text text-white border-none rounded-lg font-dm-sans text-[12px] md:text-[13px] font-medium no-underline transition-opacity hover:opacity-90 add-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Yangi trade
        </Link>
      </div>

      {/* Stats grid - responsive: 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-3 mb-6 md:mb-7">
        <StatCard label="Bugungi P&L" value={todayTrades.length > 0 ? formatPnl(totalPnl, profile?.currency) : "—"} colorClass={totalPnl > 0 ? "g" : totalPnl < 0 ? "r" : ""} />
        <StatCard label="Win rate" value={winRate !== null ? `${winRate}%` : "—"} />
        <StatCard label="Tradelar" value={String(todayTrades.length > 0 ? todayTrades.length : "—")} />
        <StatCard label="Avg R:R" value={avgRR !== null ? `${avgRR.toFixed(2)}R` : "—"} />
      </div>

      {/* Trades list */}
      {trades.length === 0 ? (
        <div className="text-center py-16 md:py-20 px-6 md:px-10">
          <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-5 opacity-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="font-fraunces text-[18px] md:text-[20px] font-light text-text mb-2">
            Hali trade yo&apos;q
          </h3>
          <p className="text-[12px] md:text-[13px] text-text-3">
            Birinchi tradeingizni qo&apos;shish uchun yuqoridagi tugmani bosing
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 md:gap-6">
          {dateKeys.map((dateKey) => (
            <div key={dateKey}>
              <div className="text-[10px] md:text-[11px] font-medium text-text-3 uppercase tracking-[0.1em] mb-2.5">
                {dateKey}
              </div>
              <div className="flex flex-col gap-2">
                {(grouped[dateKey] as Trade[]).map((trade) => (
                  <TradeCard key={trade.id} trade={trade} feedbackEnabled={profile?.feedback_enabled ?? true} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
