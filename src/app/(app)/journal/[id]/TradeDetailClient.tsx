"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Trade, Profile } from "@/types";
import { formatPnl, formatDate, formatTime } from "@/lib/utils";
import Toast from "@/components/Toast";

export default function TradeDetailClient({ trade, profile }: { trade: Trade; profile: Profile | null }) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const pnlColor = trade.pnl === null ? "var(--text)" : trade.pnl > 0 ? "var(--green)" : trade.pnl < 0 ? "var(--red)" : "var(--text-2)";
  const dirStyle = trade.direction === "LONG"
    ? { bg: "var(--green-bg)", color: "var(--green)" }
    : trade.direction === "SHORT"
    ? { bg: "var(--red-bg)", color: "var(--red)" }
    : { bg: "var(--surface2)", color: "var(--text-2)" };
  const resStyle = trade.result === "win"
    ? { bg: "var(--green-bg)", color: "var(--green)", label: "WIN" }
    : trade.result === "loss"
    ? { bg: "var(--red-bg)", color: "var(--red)", label: "LOSS" }
    : { bg: "var(--amber-bg)", color: "var(--amber)", label: "BE" };

  async function deleteTrade() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("trades").delete().eq("id", trade.id);
    setDeleting(false);
    setShowDeleteModal(false);
    router.push("/journal");
    router.refresh();
  }

  const Pill = ({ children, style }: { children: React.ReactNode; style: React.CSSProperties }) => (
    <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 5, fontFamily: "'DM Mono',monospace", letterSpacing: "0.03em", ...style }}>
      {children}
    </span>
  );

  return (
    <div>
      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={() => router.push("/journal")} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
          background: "var(--surface2)", color: "var(--text-2)", border: "1px solid var(--border)",
          borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Orqaga
        </button>
        <button onClick={() => router.push(`/journal/${trade.id}/edit`)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
          background: "var(--surface2)", color: "var(--text-2)", border: "1px solid var(--border)",
          borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tahrirlash
        </button>
        <button onClick={() => setShowDeleteModal(true)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
          background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-br)",
          borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          O&apos;chirish
        </button>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 300, letterSpacing: "-0.5px", color: "var(--text)" }}>
            {trade.asset || "—"}
          </div>
          <div style={{ display: "flex", gap: 7, marginTop: 8 }}>
            {trade.direction && <Pill style={{ background: dirStyle.bg, color: dirStyle.color }}>{trade.direction}</Pill>}
            {trade.result && <Pill style={{ background: resStyle.bg, color: resStyle.color }}>{resStyle.label}</Pill>}
            {trade.timeframe && <Pill style={{ background: "var(--surface2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>{trade.timeframe}</Pill>}
            {trade.session && <Pill style={{ background: "var(--surface2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>{trade.session}</Pill>}
            {trade.rr !== null && <Pill style={{ background: "var(--surface2)", color: trade.rr >= 2 ? "var(--green)" : trade.rr >= 1 ? "var(--amber)" : "var(--red)", border: "1px solid var(--border)" }}>{trade.rr.toFixed(2)}R</Pill>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 24, fontWeight: 500, fontFamily: "'DM Mono',monospace", color: pnlColor }}>
            {trade.pnl !== null ? formatPnl(trade.pnl, profile?.currency) : "—"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4, fontFamily: "'DM Mono',monospace" }}>
            {formatDate(trade.created_at)} · {formatTime(trade.created_at)}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* AI Analysis */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            AI tahlili
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--teal-bg)", color: "var(--teal)", fontSize: 10, fontFamily: "'DM Mono',monospace", padding: "3px 8px", borderRadius: 4, border: "1px solid var(--teal-br)" }}>
              <span style={{ width: 5, height: 5, background: "var(--teal)", borderRadius: "50%", animation: "pulse 1.5s infinite", display: "inline-block" }} />
              Chuqur tahlil
            </span>
          </div>
          <div style={{ background: "var(--teal-bg)", border: "1px solid var(--teal-br)", borderLeft: "3px solid var(--teal)", borderRadius: "0 8px 8px 0", padding: "12px 14px", fontSize: 13, lineHeight: 1.7, color: "var(--text)", marginBottom: 12 }}>
            {trade.ai_narrative || "—"}
          </div>
          {profile?.feedback_enabled && trade.ai_feedback && (
            <div style={{ background: "var(--amber-bg)", border: "1px solid var(--amber-br)", borderLeft: "3px solid var(--amber)", borderRadius: "0 8px 8px 0", padding: "12px 14px", fontSize: 13, lineHeight: 1.7, color: "var(--text)" }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                AI Feedback
              </div>
              {trade.ai_feedback}
            </div>
          )}
        </div>

        {/* Trade info */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 16 }}>
            Trade ma&apos;lumotlari
          </div>
          {[
            { label: "Entry", value: trade.entry ?? "—" },
            { label: "Stop Loss", value: trade.sl ?? "—" },
            { label: "Take Profit", value: trade.tp ?? "—" },
            { label: "Lot size", value: trade.lot_size ?? "—" },
            { label: "Risk %", value: trade.risk_percent ? `${trade.risk_percent}%` : "—" },
            { label: "Risk $", value: trade.risk_dollar ? `$${trade.risk_dollar}` : "—" },
            { label: "HTF Trend", value: trade.htf_trend ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>{label}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{String(value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Psychology & Confluence */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", boxShadow: "var(--shadow)", marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 16 }}>
          Psixologiya &amp; Confluence
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            {trade.mood && trade.mood.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>Kayfiyat</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {trade.mood.map((m) => (
                    <span key={m} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, background: "var(--amber-bg)", color: "var(--amber)", border: "1px solid var(--amber-br)" }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {trade.plan_adherence !== null && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>Rejaga amal qilish</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} style={{ fontSize: 18, color: n <= (trade.plan_adherence ?? 0) ? "#f59e0b" : "var(--border-dark)" }}>★</span>
                  ))}
                </div>
              </div>
            )}
            {trade.went_well && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Yaxshi qilganim</div>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{trade.went_well}</p>
              </div>
            )}
            {trade.improve && (
              <div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Yaxshilash kerak</div>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{trade.improve}</p>
              </div>
            )}
          </div>
          <div>
            {trade.confluence && trade.confluence.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>Confluence</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {trade.confluence.map((c) => (
                    <span key={c} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, background: "var(--purple-bg)", color: "var(--purple)", border: "1px solid var(--purple-br)" }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {trade.checklist && (
              <div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>Checklist</div>
                {Object.entries(trade.checklist).map(([key, val]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      background: val ? "var(--green)" : "var(--surface2)",
                      border: `1px solid ${val ? "var(--green)" : "var(--border-dark)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {val && <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-2)" }}>{key}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28,
            width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 300, marginBottom: 12, color: "var(--text)" }}>
              Tradeni o&apos;chirish
            </div>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 24 }}>
              <strong>{trade.asset}</strong> tradeni o&apos;chirmoqchimisiz? Bu amalni qaytarib bo&apos;lmaydi.
            </p>
            <button onClick={deleteTrade} disabled={deleting} style={{
              width: "100%", padding: 13, background: "var(--red)", color: "white", border: "none",
              borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500,
              cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1, marginBottom: 8,
            }}>
              {deleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
            </button>
            <button onClick={() => setShowDeleteModal(false)} style={{
              width: "100%", padding: 11, background: "none", color: "var(--text-2)", border: "none",
              fontSize: 13, cursor: "pointer",
            }}>
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      <Toast message={toast.message} show={toast.show} onHide={() => setToast({ show: false, message: "" })} />
    </div>
  );
}
