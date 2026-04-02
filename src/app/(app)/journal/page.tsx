import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Trade, Profile } from "@/types";
import { formatPnl, formatDate, formatTime, groupTradesByDate } from "@/lib/utils";

function StatCard({ label, value, sub, colorClass }: { label: string; value: string; sub?: string; colorClass?: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", boxShadow: "var(--shadow)" }}>
      <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, fontFamily: "'DM Mono',monospace", letterSpacing: "-0.5px", color: colorClass === "g" ? "var(--green)" : colorClass === "r" ? "var(--red)" : "var(--text)" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>{sub}</div>}
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
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
        padding: "16px 20px", cursor: "pointer", boxShadow: "var(--shadow)", transition: "all 0.15s",
      }}
        className="hover:shadow-[var(--shadow-hover)] hover:border-[var(--border-dark)]"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.2px", color: "var(--text)" }}>
            {trade.asset || "—"}
          </span>
          <span style={{ fontSize: 15, fontWeight: 500, fontFamily: "'DM Mono',monospace", color: pnlColor }}>
            {trade.pnl !== null ? formatPnl(trade.pnl) : "—"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {trade.direction && (
            <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 5, fontFamily: "'DM Mono',monospace", background: dirColor.bg, color: dirColor.color }}>
              {trade.direction}
            </span>
          )}
          {trade.result && (
            <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 5, fontFamily: "'DM Mono',monospace", background: resStyle.bg, color: resStyle.color }}>
              {trade.result === "win" ? "WIN" : trade.result === "loss" ? "LOSS" : "BE"}
            </span>
          )}
          {trade.timeframe && (
            <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 5, fontFamily: "'DM Mono',monospace", background: "var(--surface2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
              {trade.timeframe}
            </span>
          )}
          {trade.rr !== null && (
            <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 5, fontFamily: "'DM Mono',monospace", background: "var(--surface2)", color: trade.rr >= 2 ? "var(--green)" : trade.rr >= 1 ? "var(--amber)" : "var(--red)", border: "1px solid var(--border)" }}>
              {trade.rr.toFixed(2)}R
            </span>
          )}
        </div>
        {feedbackEnabled && trade.ai_feedback && (
          <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55, padding: "8px 12px", background: "var(--teal-bg)", borderRadius: 6, borderLeft: "2px solid var(--teal)", marginTop: 8 }}>
            {trade.ai_feedback.slice(0, 120)}{trade.ai_feedback.length > 120 ? "..." : ""}
          </div>
        )}
        <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'DM Mono',monospace", marginTop: 8 }}>
          {formatTime(trade.created_at)}
        </div>
      </div>
    </Link>
  );
}

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: tradesData }, { data: profileData }] = await Promise.all([
    supabase.from("trades").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  const trades = (tradesData ?? []) as Trade[];
  const profile = profileData as Profile | null;

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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.5px", color: "var(--text)" }}>
            Jurnal
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 6 }}>{dateStr}</p>
        </div>
        <Link href="/journal/new" style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
          background: "var(--text)", color: "white", border: "none", borderRadius: 8,
          fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
          cursor: "pointer", textDecoration: "none", transition: "opacity 0.2s",
        }}
          className="add-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Yangi trade
        </Link>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
        <StatCard label="Bugungi P&L" value={todayTrades.length > 0 ? formatPnl(totalPnl, profile?.currency) : "—"} colorClass={totalPnl > 0 ? "g" : totalPnl < 0 ? "r" : ""} />
        <StatCard label="Win rate" value={winRate !== null ? `${winRate}%` : "—"} />
        <StatCard label="Tradelar" value={String(todayTrades.length > 0 ? todayTrades.length : "—")} />
        <StatCard label="Avg R:R" value={avgRR !== null ? `${avgRR.toFixed(2)}R` : "—"} />
      </div>

      {/* Trades list */}
      {trades.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 40px" }}>
          <div style={{ width: 48, height: 48, margin: "0 auto 20px", opacity: 0.2 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 300, color: "var(--text)", marginBottom: 8 }}>
            Hali trade yo&apos;q
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Birinchi tradeingizni qo&apos;shish uchun yuqoridagi tugmani bosing
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {dateKeys.map((dateKey) => (
            <div key={dateKey}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                {dateKey}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
