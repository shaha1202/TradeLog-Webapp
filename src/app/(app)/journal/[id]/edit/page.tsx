"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Trade, Profile } from "@/types";
import Toast from "@/components/Toast";
import { useLanguage } from "@/lib/i18n";

const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"];
const SESSIONS = ["Asian", "London", "New York", "London + NY"];
const DEFAULT_CONFLUENCE = [
  "FVG", "Order Block", "Liquidity Sweep", "Break of Structure",
  "EMA 200", "Support / Resistance", "Session Open", "HTF Trend", "Fibonacci",
];

export default function EditTradePage() {
  const router = useRouter();
  const params = useParams();
  const tradeId = params.id as string;

  // Use translated arrays from i18n - technical terms stay hardcoded
  const { t } = useLanguage();
  const nt = t.newTrade;
  const d = t.tradeDetail;
  const MOODS = t.common?.moods ?? ["Ishonchli", "Sabr bilan", "Xotirjam", "Shoshqaloq", "FOMO", "Stress", "Zavqli"];
  const DEFAULT_CHECKLIST = t.settings?.defaultChecklistItems ?? [
    "HTF trend bilan mos yo'nalish",
    "Kamida 2 ta confluence bor",
    "R:R kamida 1:2",
    "Risk 1–2% dan oshmaydi",
    "SL mantiqiy joyda",
    "Economic calendar tekshirildi",
  ];
  const MISTAKE_TAGS = nt.defaultMistakeTags ?? ["FOMO", "Early exit", "Moved SL", "No plan", "Revenge trade"];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [riskWarningEnabled, setRiskWarningEnabled] = useState(true);
  const [saveWarningAcknowledged, setSaveWarningAcknowledged] = useState(false);

  // Form fields
  const [asset, setAsset] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [session, setSession] = useState("");
  const [direction, setDirection] = useState<"LONG" | "SHORT" | null>(null);
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [rr, setRr] = useState<number | null>(null);
  const [lotSize, setLotSize] = useState("");
  const [riskPercent, setRiskPercent] = useState("");
  const [riskDollar, setRiskDollar] = useState("");
  const [pnl, setPnl] = useState("");
  const [result, setResult] = useState<"win" | "loss" | "be" | null>(null);
  const [htfTrend, setHtfTrend] = useState("");
  const [narrative, setNarrative] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedConfluence, setSelectedConfluence] = useState<string[]>([]);
  const [confluenceTags, setConfluenceTags] = useState<string[]>(DEFAULT_CONFLUENCE);
  const [tradingRules, setTradingRules] = useState<string[]>([]);
  const [ruleChecklist, setRuleChecklist] = useState<Record<string, boolean>>({});
  const [moods, setMoods] = useState<string[]>([]);
  const [mistakeTags, setMistakeTags] = useState<string[]>([]);
  const [stars, setStars] = useState(0);
  const [wentWell, setWentWell] = useState("");
  const [improve, setImprove] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [{ data: trade }, { data: p }] = await Promise.all([
        supabase.from("trades").select("*").eq("id", tradeId).eq("user_id", user.id).single(),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);

      if (!trade) { router.push("/journal"); return; }
      if (p) setProfile(p as Profile);

      const t = trade as Trade;
      setAsset(t.asset ?? "");
      setTimeframe(t.timeframe ?? "");
      setSession(t.session ?? "");
      setDirection(t.direction ?? null);
      setEntry(t.entry != null ? String(t.entry) : "");
      setSl(t.sl != null ? String(t.sl) : "");
      setTp(t.tp != null ? String(t.tp) : "");
      setRr(t.rr ?? null);
      setLotSize(t.lot_size != null ? String(t.lot_size) : "");
      setRiskPercent(t.risk_percent != null ? String(t.risk_percent) : "");
      setRiskDollar(t.risk_dollar != null ? String(t.risk_dollar) : "");
      setPnl(t.pnl != null ? String(t.pnl) : "");
      setResult(t.result ?? null);
      setHtfTrend(t.htf_trend ?? "");
      setNarrative(t.ai_narrative ?? "");
      setFeedback(t.ai_feedback ?? "");
      setSelectedConfluence(t.confluence ?? []);
      setRuleChecklist(t.rule_checklist ?? {});
      setMoods(t.mood ?? []);
      setMistakeTags(t.mistake_tags ?? []);
      setStars(t.plan_adherence ?? 0);
      setWentWell(t.went_well ?? "");
      setImprove(t.improve ?? "");

      const savedConf = localStorage.getItem("custom_confluence");
      const savedRiskWarning = localStorage.getItem("risk_warning_enabled");
      if (savedConf) setConfluenceTags(JSON.parse(savedConf));
      if (savedRiskWarning !== null) setRiskWarningEnabled(savedRiskWarning === "true");
      const savedRules = localStorage.getItem("custom_trading_rules");
      setTradingRules((p as Profile | null)?.trading_rules ?? (savedRules ? JSON.parse(savedRules) : []));

      setLoading(false);
    };
    load();
  }, [tradeId, router]);

  const calcRR = useCallback(() => {
    const e = parseFloat(entry), s = parseFloat(sl), t = parseFloat(tp);
    if (!isNaN(e) && !isNaN(s) && !isNaN(t) && e !== s) {
      setRr(parseFloat((Math.abs(t - e) / Math.abs(e - s)).toFixed(2)));
    } else { setRr(null); }
  }, [entry, sl, tp]);

  useEffect(() => { calcRR(); }, [calcRR]);

  useEffect(() => {
    setSaveWarningAcknowledged(false);
  }, [riskPercent, result, mistakeTags, ruleChecklist]);

  async function saveEdit() {
    if (!asset) { setToast({ show: true, message: nt.assetRequired }); return; }
    const warnings: string[] = [];
    const riskValue = parseFloat(riskPercent);
    if (riskWarningEnabled && profile?.default_risk && !isNaN(riskValue) && riskValue > profile.default_risk) {
      warnings.push(nt.riskWarningMessage);
    }
    if (result === "loss" && mistakeTags.length === 0) {
      warnings.push(nt.lossMistakeReminder);
    }
    if (Object.values(ruleChecklist).some((checked) => checked === false)) {
      warnings.push(nt.brokenRuleReminder);
    }
    if (warnings.length > 0 && !saveWarningAcknowledged) {
      setSaveWarningAcknowledged(true);
      setToast({ show: true, message: `${nt.disciplineWarningPrefix} ${warnings.join("; ")}. ${nt.saveAgainHint}` });
      return;
    }
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase.from("trades").update({
      asset: asset || null,
      timeframe: timeframe || null,
      session: session || null,
      direction: direction || null,
      entry: entry ? parseFloat(entry) : null,
      sl: sl ? parseFloat(sl) : null,
      tp: tp ? parseFloat(tp) : null,
      rr: rr ?? null,
      lot_size: lotSize ? parseFloat(lotSize) : null,
      risk_percent: riskPercent ? parseFloat(riskPercent) : null,
      risk_dollar: riskDollar ? parseFloat(riskDollar) : null,
      pnl: pnl ? parseFloat(pnl) : null,
      result: result || null,
      htf_trend: htfTrend || null,
      confluence: selectedConfluence.length > 0 ? selectedConfluence : null,
      ai_narrative: narrative || null,
      ai_feedback: feedback || null,
      rule_checklist: Object.keys(ruleChecklist).length > 0 ? ruleChecklist : null,
      mood: moods.length > 0 ? moods : null,
      mistake_tags: mistakeTags.length > 0 ? mistakeTags : null,
      plan_adherence: stars || null,
      went_well: wentWell || null,
      improve: improve || null,
    }).eq("id", tradeId);

    setSaving(false);
    if (error) {
      setToast({ show: true, message: nt.saveError + error.message });
    } else {
      router.push(`/journal/${tradeId}`);
      router.refresh();
    }
  }

  const rrColor = rr === null ? "var(--text-2)" : rr >= 2 ? "var(--green)" : rr >= 1 ? "var(--amber)" : "var(--red)";

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: "2.5px solid var(--border)", borderTopColor: "var(--teal)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>{nt.scanning}</p>
        </div>
      </div>
    );
  }

  const InputRow = ({ label, value, set, type = "text", placeholder = "" }: { label: string; value: string; set: (v: string) => void; type?: string; placeholder?: string }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} step={type === "number" ? "any" : undefined} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={() => router.push(`/journal/${tradeId}`)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
          background: "var(--surface2)", color: "var(--text-2)", border: "1px solid var(--border)",
          borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {d.back}
        </button>
      </div>

      <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 300, letterSpacing: "-0.5px", color: "var(--text)", marginBottom: 6 }}>
        {d.edit}
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 28 }}>{asset || "Trade"}</p>

      {/* Trade Info */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", marginBottom: 16, boxShadow: "var(--shadow)" }}>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 16 }}>{nt.section1}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <InputRow label={nt.asset} value={asset} set={setAsset} placeholder="XAUUSD" />
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 5 }}>{nt.timeframe}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {TIMEFRAMES.map((tf) => (
                <button key={tf} onClick={() => setTimeframe(timeframe === tf ? "" : tf)} style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer",
                  border: `1px solid ${timeframe === tf ? "var(--teal)" : "var(--border)"}`,
                  background: timeframe === tf ? "var(--teal-bg)" : "var(--surface2)",
                  color: timeframe === tf ? "var(--teal)" : "var(--text-2)",
                  fontFamily: "'DM Mono',monospace",
                }}>{tf}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 5 }}>{nt.session}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {SESSIONS.map((s) => (
                <button key={s} onClick={() => setSession(session === s ? "" : s)} style={{
                  padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer",
                  border: `1px solid ${session === s ? "var(--teal)" : "var(--border)"}`,
                  background: session === s ? "var(--teal-bg)" : "var(--surface2)",
                  color: session === s ? "var(--teal)" : "var(--text-2)",
                }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 5 }}>{nt.direction}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["LONG", "SHORT"] as const).map((d) => (
                <button key={d} onClick={() => setDirection(direction === d ? null : d)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${direction === d ? (d === "LONG" ? "var(--green)" : "var(--red)") : "var(--border)"}`,
                  background: direction === d ? (d === "LONG" ? "var(--green-bg)" : "var(--red-bg)") : "var(--surface2)",
                  color: direction === d ? (d === "LONG" ? "var(--green)" : "var(--red)") : "var(--text-2)",
                  fontFamily: "'DM Mono',monospace",
                }}>{d}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, marginTop: 4 }}>
          <InputRow label={nt.entry} value={entry} set={setEntry} type="number" />
          <InputRow label={nt.stopLoss} value={sl} set={setSl} type="number" />
          <InputRow label={nt.takeProfit} value={tp} set={setTp} type="number" />
          <div style={{ marginBottom: 12, textAlign: "center", minWidth: 60 }}>
            <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 5 }}>{nt.rrLabel}</label>
            <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: rrColor, paddingTop: 6 }}>
              {rr !== null ? `${rr}R` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Risk & Result */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", marginBottom: 16, boxShadow: "var(--shadow)" }}>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 16 }}>{nt.section2}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <InputRow label={nt.lotSize} value={lotSize} set={setLotSize} type="number" />
          <InputRow label={nt.riskPercent} value={riskPercent} set={setRiskPercent} type="number" />
          <InputRow label={nt.riskDollar} value={riskDollar} set={setRiskDollar} type="number" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputRow label={nt.pnlLabel} value={pnl} set={setPnl} type="number" />
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 5 }}>{nt.result}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {([
                { value: "win" as const, label: "Win", color: "var(--green)", bg: "var(--green-bg)" },
                { value: "loss" as const, label: "Loss", color: "var(--red)", bg: "var(--red-bg)" },
                { value: "be" as const, label: "BE", color: "var(--amber)", bg: "var(--amber-bg)" },
              ]).map((r) => (
                <button key={r.value} onClick={() => setResult(result === r.value ? null : r.value)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${result === r.value ? r.color : "var(--border)"}`,
                  background: result === r.value ? r.bg : "var(--surface2)",
                  color: result === r.value ? r.color : "var(--text-2)",
                  fontFamily: "'DM Mono',monospace",
                }}>{r.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confluence */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", marginBottom: 16, boxShadow: "var(--shadow)" }}>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>{nt.confluence}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {confluenceTags.map((tag) => (
            <button key={tag} onClick={() => setSelectedConfluence((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag])} style={{
              padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer",
              border: `1px solid ${selectedConfluence.includes(tag) ? "var(--purple)" : "var(--border)"}`,
              background: selectedConfluence.includes(tag) ? "var(--purple-bg)" : "var(--surface2)",
              color: selectedConfluence.includes(tag) ? "var(--purple)" : "var(--text-2)",
            }}>{tag}</button>
          ))}
        </div>
      </div>

      {/* Psychology */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", marginBottom: 16, boxShadow: "var(--shadow)" }}>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>{nt.section5}</div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 6 }}>{nt.mood}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {MOODS.map((m) => (
              <button key={m} onClick={() => setMoods((p) => p.includes(m) ? p.filter((x) => x !== m) : [...p, m])} style={{
                padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                border: `1px solid ${moods.includes(m) ? "var(--amber)" : "var(--border)"}`,
                background: moods.includes(m) ? "var(--amber-bg)" : "var(--surface2)",
                color: moods.includes(m) ? "var(--amber)" : "var(--text-2)",
              }}>{m}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 6 }}>{nt.mistakeTags}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {MISTAKE_TAGS.map((tag) => (
              <button key={tag} onClick={() => setMistakeTags((p) => p.includes(tag) ? p.filter((x) => x !== tag) : [...p, tag])} style={{
                padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                border: `1px solid ${mistakeTags.includes(tag) ? "var(--red)" : "var(--border)"}`,
                background: mistakeTags.includes(tag) ? "var(--red-bg)" : "var(--surface2)",
                color: mistakeTags.includes(tag) ? "var(--red)" : "var(--text-2)",
              }}>{tag}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 6 }}>{nt.tradingRules}</label>
          {tradingRules.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>{d.noRules}</p>
          ) : tradingRules.map((rule) => (
            <div key={rule} onClick={() => setRuleChecklist((p) => ({ ...p, [rule]: !p[rule] }))} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 6 }}>
              <div style={{
                width: 16, height: 16, borderRadius: 5,
                background: ruleChecklist[rule] ? "var(--green)" : "var(--surface2)",
                border: `1px solid ${ruleChecklist[rule] ? "var(--green)" : "var(--border-dark)"}`,
              }} />
              <span style={{ fontSize: 12, color: "var(--text)" }}>{rule}</span>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 6 }}>{nt.planScore}</label>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setStars(stars === n ? 0 : n)} style={{
                fontSize: 22, background: "none", border: "none", cursor: "pointer", padding: "0 2px",
                color: n <= stars ? "#f59e0b" : "var(--border-dark)", transition: "color 0.1s",
              }}>★</button>
            ))}
          </div>
        </div>
        <InputRow label={nt.wentWell} value={wentWell} set={setWentWell} placeholder={nt.wentWellPlaceholder} />
        <InputRow label={nt.improve} value={improve} set={setImprove} placeholder={nt.improvePlaceholder} />
      </div>

      {/* Notes */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", marginBottom: 16, boxShadow: "var(--shadow)" }}>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>{nt.section3}</div>
        <InputRow label={nt.htfTrend} value={htfTrend} set={setHtfTrend} placeholder="HTF" />
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 5 }}>{nt.chartAnalysis}</label>
          <textarea value={narrative} onChange={(e) => setNarrative(e.target.value)} rows={3} placeholder="Trade setup haqida..." style={{ width: "100%", resize: "vertical" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 5 }}>{nt.aiFeedback}</label>
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder="AI tavsiyalari..." style={{ width: "100%", resize: "vertical" }} />
        </div>
      </div>

      {/* Save */}
      <button onClick={saveEdit} disabled={saving} style={{
        width: "100%", padding: 16, background: "var(--text)", color: "white",
        border: "none", borderRadius: 12, fontFamily: "'DM Sans',sans-serif",
        fontSize: 15, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer",
        opacity: saving ? 0.6 : 1, transition: "all 0.2s", marginBottom: 16,
      }}>
        {saving ? nt.saving : t.settings.save}
      </button>

      <Toast message={toast.message} show={toast.show} onHide={() => setToast({ show: false, message: "" })} />
    </div>
  );
}
