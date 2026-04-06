"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { AIAnalysisResult, Profile } from "@/types";
import Toast from "@/components/Toast";
import { useLanguage } from "@/lib/i18n";

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
  const { t, lang } = useLanguage();
  const nt = t.newTrade;
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
        const draft = sessionStorage.getItem(DRAFT_KEY);
        const hasDraft = draft && JSON.parse(draft).asset;
        if (!hasDraft) {
          setRiskPercent(String(p.default_risk ?? 1));
          if (p.account_balance && p.default_risk) {
            setRiskDollar(((p.account_balance * p.default_risk) / 100).toFixed(2));
          }
        }
        const saved = localStorage.getItem("custom_checklist");
        const savedConf = localStorage.getItem("custom_confluence");
        if (saved) setChecklistItems(JSON.parse(saved));
        if (savedConf) setConfluenceTags(JSON.parse(savedConf));
      }
      setTradeCount(count ?? 0);
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    checklistItems.forEach((item) => { initial[item] = true; });
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
          lang,
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
      } else {
        setToast({ show: true, message: nt.analyzeError });
      }
    } catch (err) {
      console.error("AI analysis failed:", err);
      setToast({ show: true, message: nt.analyzeError });
    } finally {
      setScanning(false);
      setFormVisible(true);
    }
  }, [profile, lang]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  async function saveTrade() {
    if (!asset) { setToast({ show: true, message: nt.assetRequired }); return; }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    if (profile?.plan === "free" && tradeCount >= 3) {
      setToast({ show: true, message: nt.freeLimitReached });
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
      setToast({ show: true, message: nt.saveError + error.message });
    } else {
      if (profile?.account_balance && pnl) {
        const pnlVal = parseFloat(pnl);
        if (!isNaN(pnlVal) && pnlVal !== 0) {
          const supabase2 = createClient();
          await supabase2.from("profiles").update({
            account_balance: profile.account_balance + pnlVal,
          }).eq("id", user.id);
        }
      }
      sessionStorage.removeItem(DRAFT_KEY);
      router.push("/journal");
      router.refresh();
    }
  }

  const rrColor = rr === null ? "var(--text-2)" : rr >= 2 ? "var(--green)" : rr >= 1 ? "var(--amber)" : "var(--red)";
  const isLimitReached = profile?.plan === "free" && tradeCount >= 3;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h1 className="font-fraunces text-[24px] md:text-[32px] font-light leading-[1.1] tracking-[-0.5px] text-text">
            {nt.title}
          </h1>
          <p className="text-[12px] md:text-[13px] text-text-3 mt-1.5">
            {nt.subtitle}
          </p>
        </div>
        <div className="font-dm-mono text-[11px] md:text-[12px] text-text-3">
          #{tradeCount + 1} · {today}
        </div>
      </div>

      {/* Limit banner */}
      {isLimitReached && (
        <div className="bg-amber-bg border border-amber-br rounded-xl p-4 mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-amber font-dm-sans leading-snug">
            {nt.freeLimitReached}
          </p>
          <Link
            href="/settings"
            className="shrink-0 text-xs bg-teal text-white px-3 py-1.5 rounded-lg font-dm-sans font-medium whitespace-nowrap"
          >
            {t.settings.selectPlan}
          </Link>
        </div>
      )}

      {/* Upload zone */}
      <div
        onClick={() => !imagePreview && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-[1.5px] ${imagePreview ? "solid" : "dashed"} ${isDragging ? "border-teal" : imagePreview ? "border-border" : "border-border-dark"} rounded-2xl ${imagePreview ? "p-0" : "py-12 md:py-16 px-4 md:px-8"} text-center cursor-${imagePreview ? "default" : "pointer"} transition-all ${isDragging ? "bg-teal-bg" : "bg-surface"} relative overflow-hidden mb-4`}
      >
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Chart" className="w-full rounded-xl" />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-[rgba(26,24,20,0.7)] flex flex-col items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity rounded-xl cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white text-[12px] font-dm-mono tracking-[0.05em]">
                {nt.changeImage}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="w-11 h-11 md:w-13 md:h-13 bg-surface2 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-[14px] md:text-[15px] font-medium mb-1.5 text-text">
              {nt.uploadTitle}
            </div>
            <div className="text-[12px] md:text-[13px] text-text-3">
              {nt.uploadSub}
            </div>
          </>
        )}
        <input
          ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {/* Scanning */}
      {scanning && (
        <div className="py-8 md:py-8 px-5 md:px-7 text-center">
          <div className="text-[12px] md:text-[13px] text-text-2 mb-1">{nt.scanning}</div>
          <div className="w-full h-3 bg-surface2 rounded-md overflow-hidden my-4">
            <div className="h-full bg-teal rounded-md w-[35%] animate-scan" />
          </div>
          <div className="font-dm-mono text-[11px] md:text-[12px] text-text-2 animate-blink">
            {nt.scanningDetail}
          </div>
        </div>
      )}

      {/* Form */}
      {formVisible && (
        <div className="animate-fadeIn">
          {/* Section 1 — Trade Info */}
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 lg:p-[24px_28px] mb-4 shadow-[var(--shadow)]">
            <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-3 mb-4 md:mb-5 flex items-center gap-2">
              <div className="w-5 h-5 bg-surface2 rounded-full flex items-center justify-center text-[10px] text-text-2 font-dm-mono">1</div>
              {nt.section1}
              <div className="flex items-center gap-1.5 bg-teal-bg text-teal text-[10px] font-dm-mono px-2 py-0.5 rounded-md border border-teal-br">
                <div className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse" />
                {nt.aiFilled}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-[14px] mb-3.5 md:mb-[14px]">
              <div className={`flex flex-col gap-1.5 md:gap-2 ${aiFields.has("asset") ? "ai-filled" : ""}`}>
                <label className="text-[11px] text-text-2">Asset / Pair</label>
                <input type="text" value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="XAUUSD" className={aiFields.has("asset") ? "ai-auto" : ""} />
              </div>
              <div className={`flex flex-col gap-1.5 md:gap-2 ${aiFields.has("timeframe") ? "ai-filled" : ""}`}>
                <label className="text-[11px] text-text-2">Timeframe</label>
                <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className={aiFields.has("timeframe") ? "ai-auto" : ""}>
                  <option value="">—</option>
                  {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className={`flex flex-col gap-1.5 md:gap-2 ${aiFields.has("session") ? "ai-filled" : ""}`}>
                <label className="text-[11px] text-text-2">Session</label>
                <select value={session} onChange={(e) => setSession(e.target.value)} className={aiFields.has("session") ? "ai-auto" : ""}>
                  <option value="">—</option>
                  {SESSIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <label className="text-[11px] text-text-2">{nt.direction}</label>
                <div className="flex gap-2">
                  {(["LONG", "SHORT"] as const).map((d) => (
                    <button key={d} onClick={() => setDirection(direction === d ? null : d)} className={`flex-1 py-2 md:py-[9px] px-3 md:px-3 rounded-lg font-dm-mono text-[11px] md:text-[12px] font-medium cursor-pointer transition-all border ${
                      direction === d
                        ? d === "LONG"
                          ? "border-green-br bg-green-bg text-green"
                          : "border-red-br bg-red-bg text-red"
                        : "border-border bg-surface2 text-text-2"
                    }`}>
                      {d === "LONG" ? "▲ Long" : "▼ Short"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-[14px]">
              {[
                { id: "entry", label: "Entry", value: entry, set: setEntry },
                { id: "sl", label: "Stop Loss", value: sl, set: setSl },
                { id: "tp", label: "Take Profit", value: tp, set: setTp },
              ].map(({ id, label, value, set }) => (
                <div key={id} className={`flex flex-col gap-1.5 md:gap-2 ${aiFields.has(id) ? "ai-filled" : ""}`}>
                  <label className="text-[11px] text-text-2">{label}</label>
                  <input type="number" value={value} onChange={(e) => set(e.target.value)} placeholder="0.000" step="0.001" className={aiFields.has(id) ? "ai-auto" : ""} />
                </div>
              ))}
              <div className="flex flex-col gap-1.5 md:gap-2">
                <label className="text-[11px] text-text-2">R : R</label>
                <div className="bg-surface2 rounded-lg py-2 md:py-[9px] px-3 md:px-3 font-dm-mono text-[13px] md:text-[14px] font-medium border border-border min-h-[34px] md:min-h-[37px] flex items-center" style={{ color: rrColor }}>
                  {rr !== null ? `${rr}R` : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Risk & Result */}
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 lg:p-[24px_28px] mb-4 shadow-[var(--shadow)]">
            <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-3 mb-4 md:mb-5 flex items-center gap-2">
              <div className="w-5 h-5 bg-surface2 rounded-full flex items-center justify-center text-[10px] text-text-2 font-dm-mono">2</div>
              {nt.section2}
              <div className="flex items-center gap-1.5 bg-teal-bg text-teal text-[10px] font-dm-mono px-2 py-0.5 rounded-md border border-teal-br">
                <div className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse" />
                {nt.fromSettings}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-[14px] mb-3.5 md:mb-[14px]">
              {[
                { label: "Lot size", value: lotSize, set: setLotSize, placeholder: "0.01", step: "0.01", readonly: false },
                { label: "Risk ($)", value: riskDollar, set: setRiskDollar, placeholder: "0.00", step: "0.01", readonly: true },
                { label: "Risk (%)", value: riskPercent, set: setRiskPercent, placeholder: "1.0", step: "0.1", readonly: false },
                { label: "P&L ($)", value: pnl, set: setPnl, placeholder: "0.00", step: "0.01", readonly: false },
              ].map(({ label, value, set, placeholder, step, readonly }) => (
                <div key={label} className="flex flex-col gap-1.5 md:gap-2">
                  <label className="text-[11px] text-text-2">{label}</label>
                  <input type="number" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} step={step} readOnly={readonly} style={readonly ? { opacity: 0.6, cursor: "default" } : {}} />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5 md:gap-2">
              <label className="text-[11px] text-text-2">{nt.result}</label>
              <div className="flex gap-2">
                {([
                  { key: "win", label: "✓ Win", on: { bg: "var(--green-bg)", border: "var(--green-br)", color: "var(--green)" } },
                  { key: "loss", label: "✗ Loss", on: { bg: "var(--red-bg)", border: "var(--red-br)", color: "var(--red)" } },
                  { key: "be", label: "~ BE", on: { bg: "var(--amber-bg)", border: "var(--amber-br)", color: "var(--amber)" } },
                ] as const).map(({ key, label, on }) => (
                  <button key={key} onClick={() => setResult(result === key ? null : key)} className={`flex-1 py-2 md:py-[9px] rounded-lg text-[11px] md:text-[12px] font-medium cursor-pointer transition-all font-dm-mono border ${
                    result === key
                      ? `border-[${on.border}] bg-[${on.bg}] text-[${on.color}]`
                      : "border-border bg-surface2 text-text-2"
                  }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3 — AI Analysis */}
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 lg:p-[24px_28px] mb-4 shadow-[var(--shadow)]">
            <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-3 mb-4 md:mb-5 flex items-center gap-2">
              <div className="w-5 h-5 bg-surface2 rounded-full flex items-center justify-center text-[10px] text-text-2 font-dm-mono">3</div>
              {nt.section3}
              <div className="flex items-center gap-1.5 bg-teal-bg text-teal text-[10px] font-dm-mono px-2 py-0.5 rounded-md border border-teal-br">
                <div className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse" />
                {nt.deepAnalysis}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-[14px] mb-3.5 md:mb-[14px]">
              <div className={`flex flex-col gap-1.5 md:gap-2 ${aiFields.has("htfTrend") ? "ai-filled" : ""}`}>
                <label className="text-[11px] text-text-2">HTF Trend</label>
                <input type="text" value={htfTrend} onChange={(e) => setHtfTrend(e.target.value)} placeholder="Bearish · H4" className={aiFields.has("htfTrend") ? "ai-auto" : ""} />
              </div>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <label className="text-[11px] text-text-2">{nt.chartAnalysis}</label>
                <div className="bg-teal-bg border border-teal-br border-l-[3px] border-teal rounded-r-lg py-2 md:py-3 px-3 md:px-4 text-[12px] md:text-[13px] leading-[1.7] text-text min-h-[52px] md:min-h-[56px]">
                  {narrative || "—"}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 md:gap-2 mb-3.5 md:mb-[14px]">
              <label className="text-[11px] text-text-2">{nt.confluence}</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {confluenceTags.map((tag) => (
                  <button key={tag} onClick={() => setSelectedConfluence((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} className={`py-1 md:py-[5px] px-3 md:px-3 rounded-lg text-[11px] md:text-[12px] cursor-pointer transition-all select-none border ${
                    selectedConfluence.includes(tag)
                      ? "border-purple-br bg-purple-bg text-purple"
                      : "border-border bg-surface2 text-text-2"
                  }`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            {profile?.feedback_enabled && feedback && (
              <div className="bg-amber-bg border border-amber-br border-l-[3px] border-amber rounded-r-lg py-2 md:py-3 px-3 md:px-4 text-[12px] md:text-[13px] leading-[1.7] text-text mt-3">
                <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-amber mb-1.5 flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  AI Feedback
                </div>
                {feedback}
              </div>
            )}
          </div>

          {/* Section 4 & 5 — Checklist & Psychology */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Checklist */}
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-[24px_28px] shadow-[var(--shadow)]">
              <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-3 mb-4 md:mb-5 flex items-center gap-2">
                <div className="w-5 h-5 bg-surface2 rounded-full flex items-center justify-center text-[10px] text-text-2 font-dm-mono">4</div>
                {nt.section4}
              </div>
              <div className="flex flex-col gap-2.5">
                {checklistItems.map((item) => (
                  <div key={item} onClick={() => setChecklist((prev) => ({ ...prev, [item]: !prev[item] }))} className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div className={`w-4.5 h-4.5 md:w-[18px] md:h-[18px] rounded-md border transition-all flex items-center justify-center ${
                      checklist[item] ? "border-green bg-green" : "border-border-dark bg-surface2"
                    }`}>
                      {checklist[item] && (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[12px] md:text-[13px] text-text">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Psychology */}
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-[24px_28px] shadow-[var(--shadow)]">
              <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-3 mb-4 md:mb-5 flex items-center gap-2">
                <div className="w-5 h-5 bg-surface2 rounded-full flex items-center justify-center text-[10px] text-text-2 font-dm-mono">5</div>
                {nt.section5}
              </div>
              <div className="flex flex-col gap-1.5 md:gap-2 mb-3.5 md:mb-[14px]">
                <label className="text-[11px] text-text-2">{nt.mood}</label>
                <div className="flex flex-wrap gap-1.5">
                  {MOODS.map((mood) => (
                    <button key={mood} onClick={() => setMoods((prev) => prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood])} className={`py-1 md:py-[5px] px-3 md:px-3 rounded-lg text-[11px] md:text-[12px] cursor-pointer transition-all select-none border ${
                      moods.includes(mood)
                        ? "border-amber-br bg-amber-bg text-amber"
                        : "border-border bg-surface2 text-text-2"
                    }`}>
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:gap-2 mb-3.5 md:mb-[14px]">
                <label className="text-[11px] text-text-2">{nt.planScore}</label>
                <div className="flex gap-1 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} onClick={() => setStars(stars === n ? 0 : n)} className="text-[18px] md:text-[20px] transition-colors cursor-pointer" style={{ color: n <= stars ? "#f59e0b" : "var(--border-dark)" }}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:gap-2 mb-3.5 md:mb-[14px]">
                <label className="text-[11px] text-text-2">{nt.wentWell}</label>
                <textarea value={wentWell} onChange={(e) => setWentWell(e.target.value)} placeholder={nt.wentWellPlaceholder} className="h-14 md:min-h-[72px]" />
              </div>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <label className="text-[11px] text-text-2">{nt.improve}</label>
                <textarea value={improve} onChange={(e) => setImprove(e.target.value)} placeholder={nt.improvePlaceholder} className="h-14 md:min-h-[72px]" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mb-12">
            <button onClick={() => router.push("/journal")} className="px-3.5 md:px-3.5 py-2 md:py-2 bg-surface2 text-text-2 border border-border rounded-lg font-dm-sans text-[12px] md:text-[13px] cursor-pointer">
              {nt.cancel}
            </button>
            <button
              onClick={saveTrade}
              disabled={saving || isLimitReached}
              title={isLimitReached ? nt.freeLimitReached : undefined}
              className="px-5 md:px-8 py-2.5 md:py-3.5 bg-text text-bg border-none rounded-lg font-dm-sans text-[13px] md:text-[14px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ opacity: saving || isLimitReached ? 0.5 : 1 }}
            >
              {saving ? nt.saving : nt.save}
            </button>
          </div>
        </div>
      )}

      <Toast message={toast.message} show={toast.show} onHide={() => setToast({ show: false, message: "" })} />
    </div>
  );
}
