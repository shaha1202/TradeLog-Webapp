"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AIAnalysisResult, Profile } from "@/types";
import Toast from "@/components/Toast";

const DEFAULT_CONFLUENCE = [
  "FVG", "Order Block", "Liquidity Sweep", "Break of Structure",
  "EMA 200", "Support / Resistance", "Session Open", "HTF Trend", "Fibonacci",
];

const DEFAULT_CHECKLIST = [
  "HTF trend bilan mos yo'nalish",
  "Kamida 2 ta confluence bor",
  "R:R kamida 1:2",
  "Risk 1–2% dan oshmaydi",
  "SL mantiqiy joyda",
  "Economic calendar tekshirildi",
];

const MOODS = ["Ishonchli", "Sabr bilan", "Xotirjam", "Shoshqaloq", "FOMO", "Stress", "Zavqli"];
const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"];
const SESSIONS = ["Asian", "London", "New York", "London + NY"];

export default function NewTradePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [today, setToday] = useState("");

  // Upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

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
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [checklistItems, setChecklistItems] = useState<string[]>(DEFAULT_CHECKLIST);
  const [moods, setMoods] = useState<string[]>([]);
  const [stars, setStars] = useState(0);
  const [wentWell, setWentWell] = useState("");
  const [improve, setImprove] = useState("");
  const [aiFields, setAiFields] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [tradeCount, setTradeCount] = useState(0);

  // Session draft key
  const DRAFT_KEY = "trade_draft_session";

  useEffect(() => {
    setToday(new Date().toLocaleDateString("uz-UZ"));
  }, []);

  // Restore session draft on mount
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem(DRAFT_KEY);
      if (draft) {
        const d = JSON.parse(draft);
        if (d.asset) setAsset(d.asset);
        if (d.timeframe) setTimeframe(d.timeframe);
        if (d.session) setSession(d.session);
        if (d.direction) setDirection(d.direction);
        if (d.entry) setEntry(d.entry);
        if (d.sl) setSl(d.sl);
        if (d.tp) setTp(d.tp);
        if (d.lotSize) setLotSize(d.lotSize);
        if (d.pnl) setPnl(d.pnl);
        if (d.result) setResult(d.result);
        if (d.htfTrend) setHtfTrend(d.htfTrend);
        if (d.narrative) setNarrative(d.narrative);
        if (d.feedback) setFeedback(d.feedback);
        if (d.selectedConfluence) setSelectedConfluence(d.selectedConfluence);
        if (d.moods) setMoods(d.moods);
        if (d.stars) setStars(d.stars);
        if (d.wentWell) setWentWell(d.wentWell);
        if (d.improve) setImprove(d.improve);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: p }, { count }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("trades").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (p) {
        setProfile(p as Profile);
        // Only set risk defaults if no session draft exists
        const draft = sessionStorage.getItem(DRAFT_KEY);
        const hasDraft = draft && JSON.parse(draft).asset;
        if (!hasDraft) {
          setRiskPercent(String(p.default_risk ?? 1));
          if (p.account_balance && p.default_risk) {
            setRiskDollar(((p.account_balance * p.default_risk) / 100).toFixed(2));
          }
        }
        // Load custom checklist/confluence from settings
        const saved = localStorage.getItem("custom_checklist");
        const savedConf = localStorage.getItem("custom_confluence");
        if (saved) setChecklistItems(JSON.parse(saved));
        if (savedConf) setConfluenceTags(JSON.parse(savedConf));
      }
      setTradeCount(count ?? 0);
    };
    loadProfile();
  }, []);

  // Init checklist
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    checklistItems.forEach((item, i) => { initial[i] = i < 5; });
    setChecklist(initial);
  }, [checklistItems]);

  const calcRR = useCallback(() => {
    const e = parseFloat(entry), s = parseFloat(sl), t = parseFloat(tp);
    if (!isNaN(e) && !isNaN(s) && !isNaN(t) && e !== s) {
      const risk = Math.abs(e - s);
      const reward = Math.abs(t - e);
      setRr(parseFloat((reward / risk).toFixed(2)));
    } else {
      setRr(null);
    }
  }, [entry, sl, tp]);

  useEffect(() => { calcRR(); }, [calcRR]);

  const calcRiskDollar = useCallback(() => {
    if (profile?.account_balance && riskPercent) {
      const pct = parseFloat(riskPercent);
      if (!isNaN(pct)) {
        setRiskDollar(((profile.account_balance * pct) / 100).toFixed(2));
      }
    }
  }, [profile, riskPercent]);

  useEffect(() => { calcRiskDollar(); }, [calcRiskDollar]);

  // Auto-calculate P&L from result + riskDollar + rr
  useEffect(() => {
    const rd = parseFloat(riskDollar);
    if (isNaN(rd) || rd <= 0) return;
    if (result === "win" && rr !== null) {
      setPnl((rd * rr).toFixed(2));
    } else if (result === "loss") {
      setPnl((-rd).toFixed(2));
    } else if (result === "be") {
      setPnl("0");
    }
  }, [result, riskDollar, rr]);

  // Persist form to sessionStorage (survives navigation within session)
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        asset, timeframe, session, direction, entry, sl, tp,
        lotSize, pnl, result, htfTrend, narrative, feedback,
        selectedConfluence, moods, stars, wentWell, improve,
      }));
    } catch { /* ignore */ }
  }, [asset, timeframe, session, direction, entry, sl, tp, lotSize, pnl, result, htfTrend, narrative, feedback, selectedConfluence, moods, stars, wentWell, improve]);

  const handleFile = useCallback(async (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Start AI analysis
    setScanning(true);
    setFormVisible(false);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const r2 = new FileReader();
        r2.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result.split(",")[1]);
        };
        r2.readAsDataURL(file);
      });

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType: file.type,
          balance: profile?.account_balance,
          risk: profile?.default_risk,
        }),
      });

      if (res.ok) {
        const data: AIAnalysisResult = await res.json();
        const newAiFields = new Set<string>();
        if (data.asset) { setAsset(data.asset); newAiFields.add("asset"); }
        if (data.timeframe) { setTimeframe(data.timeframe); newAiFields.add("timeframe"); }
        if (data.session) { setSession(data.session); newAiFields.add("session"); }
        if (data.direction) { setDirection(data.direction); newAiFields.add("direction"); }
        if (data.entry) { setEntry(String(data.entry)); newAiFields.add("entry"); }
        if (data.sl) { setSl(String(data.sl)); newAiFields.add("sl"); }
        if (data.tp) { setTp(String(data.tp)); newAiFields.add("tp"); }
        if (data.trend) { setHtfTrend(data.trend); newAiFields.add("htfTrend"); }
        if (data.narrative) { setNarrative(data.narrative); newAiFields.add("narrative"); }
        if (data.feedback) { setFeedback(data.feedback); newAiFields.add("feedback"); }
        setAiFields(newAiFields);
      }
    } catch (err) {
      console.error("AI analysis failed:", err);
    } finally {
      setScanning(false);
      setFormVisible(true);
    }
  }, [profile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  async function saveTrade() {
    if (!asset) { setToast({ show: true, message: "Asset nomini kiriting" }); return; }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Check free plan limit
    if (profile?.plan === "free" && tradeCount >= 30) {
      setToast({ show: true, message: "Free tarif: 30 ta trade limiti. Pro-ga o'ting!" });
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("trades").insert({
      user_id: user.id,
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
      checklist: checklist,
      mood: moods.length > 0 ? moods : null,
      plan_adherence: stars || null,
      went_well: wentWell || null,
      improve: improve || null,
    });

    setSaving(false);
    if (error) {
      setToast({ show: true, message: "Xato yuz berdi: " + error.message });
    } else {
      // Auto-update account balance with trade P&L
      if (profile?.account_balance && pnl) {
        const pnlVal = parseFloat(pnl);
        if (!isNaN(pnlVal) && pnlVal !== 0) {
          const supabase2 = createClient();
          await supabase2.from("profiles").update({
            account_balance: profile.account_balance + pnlVal,
          }).eq("id", user.id);
        }
      }
      // Clear session draft
      sessionStorage.removeItem(DRAFT_KEY);
      window.location.href = "/journal";
    }
  }

  const rrColor = rr === null ? "var(--text-2)" : rr >= 2 ? "var(--green)" : rr >= 1 ? "var(--amber)" : "var(--red)";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.5px", color: "var(--text)" }}>
            Yangi trade<br />qo&apos;shish
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 6 }}>
            Screenshot yuklang — AI qolganini o&apos;zi to&apos;ldiradi
          </p>
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--text-3)" }}>
          #{tradeCount + 1} · {today}
        </div>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => !imagePreview && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `1.5px ${imagePreview ? "solid" : "dashed"} ${isDragging ? "var(--teal)" : imagePreview ? "var(--border)" : "var(--border-dark)"}`,
          borderRadius: 16, padding: imagePreview ? 0 : "64px 32px",
          textAlign: "center", cursor: imagePreview ? "default" : "pointer",
          transition: "all 0.2s", background: isDragging ? "var(--teal-bg)" : "var(--surface)",
          position: "relative", overflow: "hidden", marginBottom: 16,
        }}
      >
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Chart" style={{ width: "100%", borderRadius: 14, display: "block" }} />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "absolute", inset: 0, background: "rgba(26,24,20,0.7)",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 8, opacity: 0, transition: "opacity 0.2s",
                borderRadius: 14, cursor: "pointer",
              }}
              className="hover:opacity-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ color: "white", fontSize: 13, fontFamily: "'DM Mono',monospace", letterSpacing: "0.05em" }}>
                Rasmni almashtirish
              </span>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 52, height: 52, background: "var(--surface2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>
              Entry screenshotni yuklang
            </div>
            <div style={{ fontSize: 13, color: "var(--text-3)" }}>
              TradingView, MT4, MT5 — PNG yoki JPG
            </div>
          </>
        )}
        <input
          ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {/* Scanning */}
      {scanning && (
        <div style={{ padding: "32px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4 }}>AI chart ni o&apos;qiyabdi...</div>
          <div style={{ width: "100%", height: 3, background: "var(--surface2)", borderRadius: 2, overflow: "hidden", margin: "16px 0 12px" }}>
            <div style={{ height: "100%", background: "var(--teal)", borderRadius: 2, width: "35%", animation: "scan 1.8s ease-in-out infinite" }} />
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--text-2)", animation: "blink 1.2s ease-in-out infinite" }}>
            Asset va narxlarni aniqlamoqda
          </div>
        </div>
      )}

      {/* Form */}
      {formVisible && (
        <div style={{ animation: "fadeIn 0.35s ease" }}>
          {/* Section 1 — Trade Info */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", marginBottom: 16, boxShadow: "var(--shadow)" }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, background: "var(--surface2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--text-2)", fontFamily: "'DM Mono',monospace" }}>1</div>
              Trade ma&apos;lumotlari
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--teal-bg)", color: "var(--teal)", fontSize: 10, fontFamily: "'DM Mono',monospace", padding: "3px 8px", borderRadius: 4, border: "1px solid var(--teal-br)" }}>
                <div style={{ width: 5, height: 5, background: "var(--teal)", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                AI to&apos;ldirdi
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div className={aiFields.has("asset") ? "ai-filled" : ""} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, color: "var(--text-2)" }}>Asset / Pair</label>
                <input type="text" value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="XAUUSD" className={aiFields.has("asset") ? "ai-auto" : ""} />
              </div>
              <div className={aiFields.has("timeframe") ? "ai-filled" : ""} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, color: "var(--text-2)" }}>Timeframe</label>
                <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className={aiFields.has("timeframe") ? "ai-auto" : ""}>
                  <option value="">—</option>
                  {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className={aiFields.has("session") ? "ai-filled" : ""} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, color: "var(--text-2)" }}>Session</label>
                <select value={session} onChange={(e) => setSession(e.target.value)} className={aiFields.has("session") ? "ai-auto" : ""}>
                  <option value="">—</option>
                  {SESSIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, color: "var(--text-2)" }}>Yo&apos;nalish</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["LONG", "SHORT"] as const).map((d) => (
                    <button key={d} onClick={() => setDirection(direction === d ? null : d)} style={{
                      flex: 1, padding: "9px 12px", borderRadius: 8, fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                      border: `1px solid ${direction === d ? (d === "LONG" ? "var(--green-br)" : "var(--red-br)") : "var(--border)"}`,
                      background: direction === d ? (d === "LONG" ? "var(--green-bg)" : "var(--red-bg)") : "var(--surface2)",
                      color: direction === d ? (d === "LONG" ? "var(--green)" : "var(--red)") : "var(--text-2)",
                    }}>
                      {d === "LONG" ? "▲ Long" : "▼ Short"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
              {[
                { id: "entry", label: "Entry", value: entry, set: setEntry },
                { id: "sl", label: "Stop Loss", value: sl, set: setSl },
                { id: "tp", label: "Take Profit", value: tp, set: setTp },
              ].map(({ id, label, value, set }) => (
                <div key={id} className={aiFields.has(id) ? "ai-filled" : ""} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, color: "var(--text-2)" }}>{label}</label>
                  <input type="number" value={value} onChange={(e) => set(e.target.value)} placeholder="0.000" step="0.001" className={aiFields.has(id) ? "ai-auto" : ""} />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, color: "var(--text-2)" }}>R : R</label>
                <div style={{
                  background: "var(--surface2)", borderRadius: 8, padding: "9px 12px", fontFamily: "'DM Mono',monospace",
                  fontSize: 14, fontWeight: 500, color: rrColor, border: "1px solid var(--border)", minHeight: 37, display: "flex", alignItems: "center",
                }}>
                  {rr !== null ? `${rr}R` : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Risk & Result */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", marginBottom: 16, boxShadow: "var(--shadow)" }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, background: "var(--surface2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--text-2)", fontFamily: "'DM Mono',monospace" }}>2</div>
              Risk &amp; Natija
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--teal-bg)", color: "var(--teal)", fontSize: 10, fontFamily: "'DM Mono',monospace", padding: "3px 8px", borderRadius: 4, border: "1px solid var(--teal-br)" }}>
                <div style={{ width: 5, height: 5, background: "var(--teal)", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                Hisob sozlamalaridan
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
              {[
                { label: "Lot size", value: lotSize, set: setLotSize, placeholder: "0.01", step: "0.01", readonly: false },
                { label: "Risk ($)", value: riskDollar, set: setRiskDollar, placeholder: "0.00", step: "0.01", readonly: true },
                { label: "Risk (%)", value: riskPercent, set: setRiskPercent, placeholder: "1.0", step: "0.1", readonly: false },
                { label: "P&L ($)", value: pnl, set: setPnl, placeholder: "0.00", step: "0.01", readonly: false },
              ].map(({ label, value, set, placeholder, step, readonly }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, color: "var(--text-2)" }}>{label}</label>
                  <input type="number" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} step={step} readOnly={readonly} style={readonly ? { opacity: 0.6, cursor: "default" } : {}} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, color: "var(--text-2)" }}>Natija</label>
              <div style={{ display: "flex", gap: 8 }}>
                {([
                  { key: "win", label: "✓ Win", on: { bg: "var(--green-bg)", border: "var(--green-br)", color: "var(--green)" } },
                  { key: "loss", label: "✗ Loss", on: { bg: "var(--red-bg)", border: "var(--red-br)", color: "var(--red)" } },
                  { key: "be", label: "~ BE", on: { bg: "var(--amber-bg)", border: "var(--amber-br)", color: "var(--amber)" } },
                ] as const).map(({ key, label, on }) => (
                  <button key={key} onClick={() => setResult(result === key ? null : key)} style={{
                    flex: 1, padding: 9, borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Mono',monospace",
                    border: `1px solid ${result === key ? on.border : "var(--border)"}`,
                    background: result === key ? on.bg : "var(--surface2)",
                    color: result === key ? on.color : "var(--text-2)",
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3 — AI Analysis */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", marginBottom: 16, boxShadow: "var(--shadow)" }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, background: "var(--surface2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--text-2)", fontFamily: "'DM Mono',monospace" }}>3</div>
              AI tahlili
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--teal-bg)", color: "var(--teal)", fontSize: 10, fontFamily: "'DM Mono',monospace", padding: "3px 8px", borderRadius: 4, border: "1px solid var(--teal-br)" }}>
                <div style={{ width: 5, height: 5, background: "var(--teal)", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                Chuqur tahlil
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, color: "var(--text-2)" }}>HTF Trend</label>
                <input type="text" value={htfTrend} onChange={(e) => setHtfTrend(e.target.value)} placeholder="Bearish · H4" className={aiFields.has("htfTrend") ? "ai-auto" : ""} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, color: "var(--text-2)" }}>Chart tahlili</label>
                <div style={{
                  background: "var(--teal-bg)", border: "1px solid var(--teal-br)", borderLeft: "3px solid var(--teal)",
                  borderRadius: "0 8px 8px 0", padding: "12px 14px", fontSize: 13, lineHeight: 1.7,
                  color: "var(--text)", minHeight: 56,
                }}>
                  {narrative || "—"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: "var(--text-2)" }}>Confluence</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {confluenceTags.map((tag) => (
                  <button key={tag} onClick={() => setSelectedConfluence((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", transition: "all 0.15s", userSelect: "none",
                    border: `1px solid ${selectedConfluence.includes(tag) ? "var(--purple-br)" : "var(--border)"}`,
                    background: selectedConfluence.includes(tag) ? "var(--purple-bg)" : "var(--surface2)",
                    color: selectedConfluence.includes(tag) ? "var(--purple)" : "var(--text-2)",
                  }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            {profile?.feedback_enabled && feedback && (
              <div style={{ background: "var(--amber-bg)", border: "1px solid var(--amber-br)", borderLeft: "3px solid var(--amber)", borderRadius: "0 8px 8px 0", padding: "12px 14px", fontSize: 13, lineHeight: 1.7, color: "var(--text)", marginTop: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  AI Feedback
                </div>
                {feedback}
              </div>
            )}
          </div>

          {/* Section 4 & 5 — Checklist & Psychology */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Checklist */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", boxShadow: "var(--shadow)" }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, height: 20, background: "var(--surface2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--text-2)", fontFamily: "'DM Mono',monospace" }}>4</div>
                Pre-trade checklist
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {checklistItems.map((item, i) => (
                  <div key={i} onClick={() => setChecklist((prev) => ({ ...prev, [i]: !prev[i] }))} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5,
                      border: `1px solid ${checklist[i] ? "var(--green)" : "var(--border-dark)"}`,
                      background: checklist[i] ? "var(--green)" : "var(--surface2)",
                      flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                    }}>
                      {checklist[i] && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 13, color: "var(--text)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Psychology */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", boxShadow: "var(--shadow)" }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, height: 20, background: "var(--surface2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--text-2)", fontFamily: "'DM Mono',monospace" }}>5</div>
                Psixologiya
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "var(--text-2)" }}>Kayfiyat</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {MOODS.map((mood) => (
                    <button key={mood} onClick={() => setMoods((prev) => prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood])} style={{
                      padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", transition: "all 0.15s", userSelect: "none",
                      border: `1px solid ${moods.includes(mood) ? "var(--amber-br)" : "var(--border)"}`,
                      background: moods.includes(mood) ? "var(--amber-bg)" : "var(--surface2)",
                      color: moods.includes(mood) ? "var(--amber)" : "var(--text-2)",
                    }}>
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "var(--text-2)" }}>Rejaga amal qilish</label>
                <div style={{ display: "flex", gap: 4, cursor: "pointer" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} onClick={() => setStars(stars === n ? 0 : n)} style={{ fontSize: 20, color: n <= stars ? "#f59e0b" : "var(--border-dark)", transition: "color 0.1s", cursor: "pointer" }}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "var(--text-2)" }}>Yaxshi qilganim</label>
                <textarea value={wentWell} onChange={(e) => setWentWell(e.target.value)} placeholder="Nima to'g'ri ketdi?" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, color: "var(--text-2)" }}>Yaxshilash kerak</label>
                <textarea value={improve} onChange={(e) => setImprove(e.target.value)} placeholder="Nima o'zgartirish kerak?" />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 48 }}>
            <button onClick={() => router.push("/journal")} style={{
              padding: "8px 14px", background: "var(--surface2)", color: "var(--text-2)", border: "1px solid var(--border)",
              borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer",
            }}>
              Bekor qilish
            </button>
            <button onClick={saveTrade} disabled={saving} style={{
              padding: "14px 32px", background: "var(--text)", color: "white", border: "none", borderRadius: 10,
              fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1, transition: "all 0.2s",
            }}>
              {saving ? "Saqlanmoqda..." : "Jurnalga saqlash →"}
            </button>
          </div>
        </div>
      )}

      <Toast message={toast.message} show={toast.show} onHide={() => setToast({ show: false, message: "" })} />
    </div>
  );
}
