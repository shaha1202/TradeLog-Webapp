"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Trade, Profile } from "@/types";
import { formatPnl, formatDate, formatTime } from "@/lib/utils";
import Toast from "@/components/Toast";
import { useLanguage } from "@/lib/i18n";

export default function TradeDetailClient({ trade, profile }: { trade: Trade; profile: Profile | null }) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const d = t.tradeDetail;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [translatedNarrative, setTranslatedNarrative] = useState<string | null>(null);
  const [translatedFeedback, setTranslatedFeedback] = useState<string | null>(null);
  const translateCacheRef = useRef<Record<string, { narrative?: string; feedback?: string }>>({});

  useEffect(() => {
    if (lang === "uz") { setTranslatedNarrative(null); setTranslatedFeedback(null); return; }
    const cached = translateCacheRef.current[lang];
    if (cached) { setTranslatedNarrative(cached.narrative ?? null); setTranslatedFeedback(cached.feedback ?? null); return; }

    const texts: string[] = [];
    if (trade.ai_narrative) texts.push(trade.ai_narrative);
    if (trade.ai_feedback) texts.push(trade.ai_feedback);
    if (texts.length === 0) return;

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, lang }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.translations) {
          let i = 0;
          const entry: { narrative?: string; feedback?: string } = {};
          if (trade.ai_narrative) entry.narrative = data.translations[i++];
          if (trade.ai_feedback) entry.feedback = data.translations[i++];
          translateCacheRef.current[lang] = entry;
          setTranslatedNarrative(entry.narrative ?? null);
          setTranslatedFeedback(entry.feedback ?? null);
        }
      })
      .catch(() => {});
  }, [lang, trade.ai_narrative, trade.ai_feedback]);

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
    <span className="text-[10px] font-medium py-0.5 px-2 md:py-[2px] md:px-[8px] rounded-md font-dm-mono tracking-[0.03em]" style={style}>
      {children}
    </span>
  );

  return (
    <div>
      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-2.5 mb-5 md:mb-6">
        <button onClick={() => router.push("/journal")} className="flex items-center gap-1.5 px-3 md:px-[14px] py-2 md:py-[8px] bg-surface2 text-text-2 border border-border rounded-lg font-dm-sans text-[12px] md:text-[13px] cursor-pointer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {d.back}
        </button>
        <button onClick={() => router.push(`/journal/${trade.id}/edit`)} className="flex items-center gap-1.5 px-3 md:px-[14px] py-2 md:py-[8px] bg-surface2 text-text-2 border border-border rounded-lg font-dm-sans text-[12px] md:text-[13px] cursor-pointer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {d.edit}
        </button>
        <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-1.5 px-3 md:px-[14px] py-2 md:py-[8px] bg-red-bg text-red border border-red-br rounded-lg font-dm-sans text-[12px] md:text-[13px] cursor-pointer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {d.delete}
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-5 md:mb-7">
        <div>
          <div className="font-fraunces text-[22px] md:text-[28px] font-light tracking-[-0.5px] text-text">
            {trade.asset || "—"}
          </div>
          <div className="flex gap-1.5 md:gap-2 mt-2">
            {trade.direction && <Pill style={{ background: dirStyle.bg, color: dirStyle.color }}>{trade.direction}</Pill>}
            {trade.result && <Pill style={{ background: resStyle.bg, color: resStyle.color }}>{resStyle.label}</Pill>}
            {trade.timeframe && <Pill style={{ background: "var(--surface2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>{trade.timeframe}</Pill>}
            {trade.session && <Pill style={{ background: "var(--surface2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>{trade.session}</Pill>}
            {trade.rr !== null && <Pill style={{ background: "var(--surface2)", color: trade.rr >= 2 ? "var(--green)" : trade.rr >= 1 ? "var(--amber)" : "var(--red)", border: "1px solid var(--border)" }}>{trade.rr.toFixed(2)}R</Pill>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[20px] md:text-[24px] font-medium font-dm-mono" style={{ color: pnlColor }}>
            {trade.pnl !== null ? formatPnl(trade.pnl, profile?.currency) : "—"}
          </div>
          <div className="text-[11px] md:text-[12px] text-text-3 mt-1 font-dm-mono">
            {formatDate(trade.created_at)} · {formatTime(trade.created_at)}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* AI Analysis */}
        <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 shadow-[var(--shadow)]">
          <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-4 flex items-center gap-2">
            {d.aiAnalysis}
            <span className="inline-flex items-center gap-1.5 bg-teal-bg text-teal text-[10px] font-dm-mono py-0.5 px-2 rounded-md border border-teal-br">
              <span className="w-1.5 h-1.5 bg-teal rounded-full inline-block animate-pulse" />
              {d.deepAnalysis}
            </span>
          </div>
          <div className="bg-teal-bg border border-teal-br border-l-[3px] border-teal rounded-r-lg py-2 md:py-3 px-3 md:px-4 text-[12px] md:text-[13px] leading-[1.7] text-text mb-3">
            {translatedNarrative ?? trade.ai_narrative ?? "—"}
          </div>
          {trade.ai_feedback && (
            <div className="relative">
              <div className={`bg-amber-bg border border-amber-br border-l-[3px] border-amber rounded-r-lg py-2 md:py-3 px-3 md:px-4 text-[12px] md:text-[13px] leading-[1.7] text-text ${
                profile?.plan === "free" ? "blur-sm select-none pointer-events-none" : ""
              } ${!profile?.feedback_enabled && profile?.plan !== "free" ? "hidden" : ""}`}>
                <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-amber mb-1.5 flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  AI Feedback
                </div>
                {translatedFeedback ?? trade.ai_feedback}
              </div>
              {profile?.plan === "free" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="text-[10px] bg-teal text-white px-2 py-0.5 rounded-full font-dm-mono font-medium">Pro</span>
                  <Link href="/settings" className="text-[11px] text-text-2 font-dm-sans hover:text-text transition-colors">
                    Pro&apos;ga o&apos;tish →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trade info */}
        <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 shadow-[var(--shadow)]">
          <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-4">
            {d.tradeInfo}
          </div>
          {[
            { label: "Entry", value: trade.entry ?? "—" },
            { label: "Stop Loss", value: trade.sl ?? "—" },
            { label: "Take Profit", value: trade.tp ?? "—" },
            { label: "Lot size", value: trade.lot_size ?? "—" },
            { label: "Risk %", value: trade.risk_percent ? `${trade.risk_percent}%` : "—" },
            { label: "Risk $", value: trade.risk_dollar ? `$${trade.risk_dollar}` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="text-[11px] md:text-[12px] text-text-2">{label}</span>
              <span className="font-dm-mono text-[11px] md:text-[12px] font-medium text-text">{String(value)}</span>
            </div>
          ))}
          {trade.htf_trend && (
            <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="text-[11px] md:text-[12px] text-text-2">HTF Trend</span>
              <span className="text-[11px] font-medium py-0.5 md:py-[3px] px-2 md:px-2.5 rounded-md font-dm-mono tracking-[0.04em]" style={{
                background: /bull/i.test(trade.htf_trend) ? "var(--green-bg)" : /bear/i.test(trade.htf_trend) ? "var(--red-bg)" : "var(--amber-bg)",
                color: /bull/i.test(trade.htf_trend) ? "var(--green)" : /bear/i.test(trade.htf_trend) ? "var(--red)" : "var(--amber)",
                border: `1px solid ${/bull/i.test(trade.htf_trend) ? "var(--green-br,var(--green))" : /bear/i.test(trade.htf_trend) ? "var(--red-br,var(--red))" : "var(--amber-br,var(--amber))"}`,
              }}>
                {trade.htf_trend}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Psychology & Confluence */}
      <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 shadow-[var(--shadow)] mb-4">
        <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-4">
          {d.psychConfluence}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            {trade.mood && trade.mood.length > 0 && (
              <div className="mb-3">
                <div className="text-[11px] text-text-3 mb-1.5">{d.mood}</div>
                <div className="flex flex-wrap gap-1.5">
                  {trade.mood.map((m) => (
                    <span key={m} className="py-1 md:py-[5px] px-2.5 md:px-3 rounded-lg text-[11px] md:text-[12px] bg-amber-bg text-amber border border-amber-br">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {trade.plan_adherence !== null && (
              <div className="mb-3">
                <div className="text-[11px] text-text-3 mb-1.5">{d.planScore}</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="text-[16px] md:text-[18px]" style={{ color: n <= (trade.plan_adherence ?? 0) ? "#f59e0b" : "var(--border-dark)" }}>★</span>
                  ))}
                </div>
              </div>
            )}
            {trade.went_well && (
              <div className="mb-3">
                <div className="text-[11px] text-text-3 mb-1">{d.wentWell}</div>
                <p className="text-[12px] md:text-[13px] text-text leading-[1.6]">{trade.went_well}</p>
              </div>
            )}
            {trade.improve && (
              <div>
                <div className="text-[11px] text-text-3 mb-1">{d.improve}</div>
                <p className="text-[12px] md:text-[13px] text-text leading-[1.6]">{trade.improve}</p>
              </div>
            )}
          </div>
          <div>
            {trade.confluence && trade.confluence.length > 0 && (
              <div className="mb-3">
                <div className="text-[11px] text-text-3 mb-1.5">Confluence</div>
                <div className="flex flex-wrap gap-1.5">
                  {trade.confluence.map((c) => (
                    <span key={c} className="py-1 md:py-[5px] px-2.5 md:px-3 rounded-lg text-[11px] md:text-[12px] bg-purple-bg text-purple border border-purple-br">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {trade.checklist && Object.keys(trade.checklist).length > 0 && (
              <div>
                <div className="text-[11px] text-text-3 mb-2">Checklist</div>
                {Object.entries(trade.checklist).map(([key, val]) => {
                  const isNumericKey = /^\d+$/.test(key);
                  if (isNumericKey) return null;
                  return (
                    <div key={key} className="flex items-center gap-2 mb-1.5">
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-md flex-shrink-0" style={{
                        background: val ? "var(--green)" : "var(--surface2)",
                        border: `1px solid ${val ? "var(--green)" : "var(--border-dark)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {val && <svg width="7" height="7" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <span className={`text-[11px] md:text-[12px] ${val ? "text-text" : "text-text-3"}`} style={{ textDecoration: val ? "none" : "line-through" }}>{key}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6">
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-7 w-full max-w-[440px] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-3 text-text">
              {d.deleteTitle}
            </div>
            <p className="text-[12px] md:text-[13px] text-text-2 leading-[1.6] mb-6">
              <strong>{trade.asset}</strong> {d.deleteConfirmText}
            </p>
            <button onClick={deleteTrade} disabled={deleting} className="w-full py-3 md:py-3 bg-red text-white border-none rounded-lg font-dm-sans text-[13px] md:text-[14px] font-medium cursor-pointer disabled:not-allowed disabled:opacity-60 mb-2" style={{ opacity: deleting ? 0.6 : 1 }}>
              {deleting ? d.deleting : d.deleteConfirm}
            </button>
            <button onClick={() => setShowDeleteModal(false)} className="w-full py-2.5 md:py-3 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer">
              {d.cancel}
            </button>
          </div>
        </div>
      )}

      <Toast message={toast.message} show={toast.show} onHide={() => setToast({ show: false, message: "" })} />
    </div>
  );
}
