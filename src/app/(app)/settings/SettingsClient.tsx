"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import Toast from "@/components/Toast";
import { useLanguage } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";

type ModalType = "account" | "profile" | "plan" | "checklist" | "confluence" | "clear" | null;

export default function SettingsClient({ profile: initialProfile, userId }: { profile: Profile | null; userId: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const s = t.settings;

  // Use translated default checklist from i18n
  const DEFAULT_CHECKLIST = [...(t.settings?.defaultChecklistItems ?? [
    "HTF trend bilan mos yo'nalish",
    "Kamida 2 ta confluence bor",
    "R:R kamida 1:2",
    "Risk 1–2% dan oshmaydi",
    "SL mantiqiy joyda",
    "Economic calendar tekshirildi",
  ])];

  const DEFAULT_CONFLUENCE = [
    "FVG", "Order Block", "Liquidity Sweep", "Break of Structure",
    "EMA 200", "Support / Resistance", "Session Open", "HTF Trend", "Fibonacci",
  ];

  const [profile, setProfile] = useState(initialProfile);
  const [modal, setModal] = useState<ModalType>(null);
  const [toast, setToast] = useState({ show: false, message: "" });

  const STRATEGIES = ["ICT", "SMC", "Classic", "Algo", "Wyckoff", "Price Action", "Supply & Demand", "VSA"];

  const [balance, setBalance] = useState(String(profile?.account_balance ?? ""));
  const [riskPct, setRiskPct] = useState(String(profile?.default_risk ?? 1));
  const [currency, setCurrency] = useState(profile?.currency ?? "USD");
  const [strategy, setStrategy] = useState<string[]>(profile?.strategy ?? []);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");

  const [feedbackEnabled, setFeedbackEnabled] = useState(profile?.feedback_enabled ?? true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [riskWarning, setRiskWarning] = useState(true);

  const [checklistItems, setChecklistItems] = useState<string[]>(DEFAULT_CHECKLIST);
  const [confluenceTags, setConfluenceTags] = useState<string[]>(DEFAULT_CONFLUENCE);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("custom_checklist");
    const savedConf = localStorage.getItem("custom_confluence");
    if (saved) setChecklistItems(JSON.parse(saved));
    if (savedConf) setConfluenceTags(JSON.parse(savedConf));

    const savedReminder = localStorage.getItem("daily_reminder_enabled");
    const savedTime = localStorage.getItem("daily_reminder_time");
    const savedRisk = localStorage.getItem("risk_warning_enabled");
    if (savedReminder !== null) setDailyReminder(savedReminder === "true");
    if (savedTime) setReminderTime(savedTime);
    if (savedRisk !== null) setRiskWarning(savedRisk === "true");
  }, []);

  useEffect(() => {
    if (!dailyReminder) return;
    const checkAndNotify = () => {
      const now = new Date();
      const [h, m] = reminderTime.split(":").map(Number);
      if (now.getHours() === h && now.getMinutes() === m) {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("TradeLog", {
            body: s.notificationBody,
            icon: "/favicon.ico",
          });
        }
      }
    };
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [dailyReminder, reminderTime]);

  const showToast = (msg: string) => setToast({ show: true, message: msg });

  async function saveAccount() {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({
      account_balance: balance ? parseFloat(balance) : null,
      default_risk: riskPct ? parseFloat(riskPct) : 1,
      currency,
      strategy: strategy.length > 0 ? strategy : null,
    }).eq("id", userId);
    if (!error) {
      setProfile((p) => p ? { ...p, account_balance: parseFloat(balance), default_risk: parseFloat(riskPct), currency, strategy } : p);
      setModal(null);
      showToast(s.toastAccountSaved);
      fetch("/api/profile/revalidate", { method: "POST" });
    }
  }

  async function saveProfile() {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
    if (!error) {
      setProfile((p) => p ? { ...p, full_name: fullName } : p);
      setModal(null);
      showToast(s.toastProfileSaved);
      fetch("/api/profile/revalidate", { method: "POST" });
    }
  }

  async function toggleFeedback() {
    const newVal = !feedbackEnabled;
    setFeedbackEnabled(newVal);
    const supabase = createClient();
    await supabase.from("profiles").update({ feedback_enabled: newVal }).eq("id", userId);
  }

  async function toggleDailyReminder() {
    const newVal = !dailyReminder;
    if (newVal && typeof Notification !== "undefined" && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    setDailyReminder(newVal);
    localStorage.setItem("daily_reminder_enabled", String(newVal));
  }

  function updateReminderTime(time: string) {
    setReminderTime(time);
    localStorage.setItem("daily_reminder_time", time);
  }

  function toggleRiskWarning() {
    const newVal = !riskWarning;
    setRiskWarning(newVal);
    localStorage.setItem("risk_warning_enabled", String(newVal));
  }

  async function clearAllData() {
    const supabase = createClient();
    await supabase.from("trades").delete().eq("user_id", userId);
    setModal(null);
    showToast(s.toastDataCleared);
    router.refresh();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function saveChecklist() {
    localStorage.setItem("custom_checklist", JSON.stringify(checklistItems));
    setModal(null);
    showToast(s.toastChecklistSaved);
  }

  function saveConfluence() {
    localStorage.setItem("custom_confluence", JSON.stringify(confluenceTags));
    setModal(null);
    showToast(s.toastConfluenceSaved);
  }

  async function handleStripeCheckout(priceId: string) {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div onClick={onToggle} className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${
      on ? "bg-green" : "bg-surface3"
    }`}>
      <div className={`absolute top-1 ${on ? "right-1" : "left-1"} w-4 h-4 bg-white rounded-full transition-all shadow-sm`} />
    </div>
  );

  const SetRow = ({ icon, iconBg, iconColor, name, sub, onClick, right }: {
    icon: React.ReactNode; iconBg: string; iconColor: string;
    name: string; sub?: string; onClick?: () => void; right?: React.ReactNode;
  }) => (
    <div onClick={onClick} className={`flex items-center justify-between py-3 md:py-[14px] px-4 md:px-5 border-b border-border last:border-b-0 cursor-pointer transition-colors ${onClick ? "hover:bg-surface2" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: iconColor }}>
            {icon}
          </svg>
        </div>
        <div>
          <div className={`text-[12px] md:text-[13px] ${name === s.clearData || name === s.signOut ? "text-red" : "text-text"}`}>{name}</div>
          {sub && <div className="text-[10px] md:text-[11px] text-text-3 mt-0.5">{sub}</div>}
        </div>
      </div>
      {right ?? (onClick ? <span className="text-text-3 text-[14px] md:text-[16px]">›</span> : null)}
    </div>
  );

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="font-fraunces text-[26px] md:text-[32px] font-light leading-[1.1] tracking-[-0.5px] text-text">
          {s.title}
        </h1>
      </div>

      {/* Plan card */}
      <div className="bg-teal-bg border border-teal-br rounded-xl md:rounded-lg p-4 md:p-5 mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-fraunces text-[15px] md:text-[18px] font-light text-text">
            {profile?.plan === "free" ? s.freePlan : s.proPlan}
          </h3>
          <p className="text-[11px] md:text-[12px] text-text-2 mt-1">
            {profile?.plan === "free" ? s.freeDesc : s.proDesc}
          </p>
        </div>
        <div className="bg-teal text-white text-[10px] md:text-[11px] font-medium py-1 px-2.5 md:px-3 rounded-md font-dm-mono">
          {s.active}
        </div>
      </div>

      {/* Account section */}
      <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-2 mt-4 px-1">{s.sectionAccount}</div>
      <div className="bg-surface border border-border rounded-xl md:rounded-lg mb-4 overflow-hidden shadow-[var(--shadow)]">
        <SetRow
          icon={<rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />}
          iconBg="var(--green-bg)" iconColor="var(--green)"
          name={s.accountSize}
          sub={profile?.account_balance ? `$${profile.account_balance} · ${profile.default_risk}% risk${profile.strategy?.length ? ` · ${profile.strategy.join(", ")}` : ""}` : s.notEntered}
          onClick={() => setModal("account")}
        />
        <SetRow
          icon={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>}
          iconBg="var(--teal-bg)" iconColor="var(--teal)"
          name={s.profile}
          sub={profile?.full_name || t.settings?.traderFallback}
          onClick={() => setModal("profile")}
        />
        <div className="border-b-0">
          <SetRow
            icon={<><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
            iconBg="var(--amber-bg)" iconColor="var(--amber)"
            name={s.plan}
            sub={s.planPrice}
            onClick={() => setModal("plan")}
          />
        </div>
      </div>

      {/* Customize */}
      <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-2 mt-4 px-1">{s.sectionCustomize}</div>
      <div className="bg-surface border border-border rounded-xl md:rounded-lg mb-4 overflow-hidden shadow-[var(--shadow)]">
        <SetRow
          icon={<><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
          iconBg="var(--green-bg)" iconColor="var(--green)"
          name={s.checklist}
          sub={s.checklistSub}
          onClick={() => setModal("checklist")}
        />
        <div className="border-b-0">
          <SetRow
            icon={<><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M16.95 7.05l2.12-2.12M4.93 19.07l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
            iconBg="var(--purple-bg)" iconColor="var(--purple)"
            name={s.confluence}
            sub={s.confluenceSub}
            onClick={() => setModal("confluence")}
          />
        </div>
      </div>

      {/* AI & Notifications */}
      <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-2 mt-4 px-1">{s.sectionAiNotif}</div>
      <div className="bg-surface border border-border rounded-xl md:rounded-lg mb-4 overflow-hidden shadow-[var(--shadow)]">
        <SetRow
          icon={<><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
          iconBg="var(--teal-bg)" iconColor="var(--teal)"
          name={s.aiFeedback}
          sub={s.aiFeedbackSub}
          right={<Toggle on={feedbackEnabled} onToggle={toggleFeedback} />}
        />
        <SetRow
          icon={<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
          iconBg="var(--amber-bg)" iconColor="var(--amber)"
          name={s.dailyReminder}
          sub={dailyReminder ? `${s.reminderEveryDay} ${reminderTime}` : s.reminderOff}
          right={<Toggle on={dailyReminder} onToggle={toggleDailyReminder} />}
        />
        {dailyReminder && (
          <div className="flex items-center justify-between px-4 md:px-5 py-2.5 border-b border-border bg-surface2">
            <span className="text-[11px] text-text-3 font-dm-sans">{s.reminderTime}</span>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => updateReminderTime(e.target.value)}
              className="text-[12px] font-dm-mono text-text bg-transparent border border-border rounded-md px-2 py-1 outline-none focus:border-teal transition-colors"
            />
          </div>
        )}
        <div className="border-b-0">
          <SetRow
            icon={<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
            iconBg="var(--red-bg)" iconColor="var(--red)"
            name={s.riskWarning}
            sub={s.riskWarningSub}
            right={<Toggle on={riskWarning} onToggle={toggleRiskWarning} />}
          />
        </div>
      </div>

      {/* Language */}
      <div className="bg-surface border border-border rounded-xl md:rounded-lg mb-4 overflow-hidden shadow-[var(--shadow)]">
        <div className="flex items-center justify-between py-3 md:py-[14px] px-4 md:px-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--surface3)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-2)" }}>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-[12px] md:text-[13px] text-text">{s.language}</div>
              <div className="text-[10px] md:text-[11px] text-text-3 mt-0.5">{s.languageSub}</div>
            </div>
          </div>
          <LanguageSelector />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-surface border border-border rounded-xl md:rounded-lg mb-4 overflow-hidden shadow-[var(--shadow)]">
        <SetRow
          icon={<><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
          iconBg="var(--red-bg)" iconColor="var(--red)"
          name={s.clearData}
          onClick={() => setModal("clear")}
        />
        <div className="border-b-0">
          <SetRow
            icon={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
            iconBg="var(--red-bg)" iconColor="var(--red)"
            name={s.signOut}
            onClick={handleLogout}
          />
        </div>
      </div>

      {/* MODALS */}
      {modal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-7 w-full max-w-[440px] max-h-[80vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.2)]">

            {modal === "account" && (
              <>
                <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-5 text-text">{s.accountSettings}</div>
                {[
                  { label: s.accountBalance, value: balance, set: setBalance, placeholder: "10000", step: "100" },
                  { label: s.defaultRisk, value: riskPct, set: setRiskPct, placeholder: "1.0", step: "0.1" },
                ].map(({ label, value, set, placeholder, step }) => (
                  <div key={label} className="mb-3.5">
                    <label className="block text-[11px] text-text-2 mb-1.5">{label}</label>
                    <input type="number" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} step={step} />
                  </div>
                ))}
                <div className="mb-3.5">
                  <label className="block text-[11px] text-text-2 mb-1.5">{s.currency}</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {["USD", "EUR", "GBP", "UZS"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="mb-3.5">
                  <label className="block text-[11px] text-text-2 mb-2">{s.strategy}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {STRATEGIES.map((s) => (
                      <button key={s} type="button" onClick={() => setStrategy((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])} className={`py-1.5 md:py-[6px] px-2.5 md:px-3 rounded-lg text-[11px] md:text-[12px] font-medium cursor-pointer transition-all border ${
                        strategy.includes(s)
                          ? "border-teal bg-teal-bg text-teal"
                          : "border-border bg-surface2 text-text-2"
                      }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={saveAccount} className="w-full py-3 bg-text text-bg border-none rounded-lg font-dm-sans text-[13px] md:text-[14px] font-medium cursor-pointer mt-4">{s.save}</button>
                <button onClick={() => setModal(null)} className="w-full py-2.5 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer mt-2">{s.cancel}</button>
              </>
            )}

            {modal === "profile" && (
              <>
                <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-5 text-text">{s.profileTitle}</div>
                <div className="mb-3.5">
                  <label className="block text-[11px] text-text-2 mb-1.5">{s.nameLabel}</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={s.namePlaceholder} />
                </div>
                <div className="mb-3.5">
                  <label className="block text-[11px] text-text-2 mb-1.5">{s.emailLabel}</label>
                  <input type="email" value={profile?.email ?? ""} readOnly className="opacity-60 cursor-default" />
                </div>
                <button onClick={saveProfile} className="w-full py-3 bg-text text-bg border-none rounded-lg font-dm-sans text-[13px] md:text-[14px] font-medium cursor-pointer mt-4">{s.save}</button>
                <button onClick={() => setModal(null)} className="w-full py-2.5 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer mt-2">{s.cancel}</button>
              </>
            )}

            {modal === "plan" && (
              <>
                <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-2 text-text">{s.selectPlan}</div>
                <p className="text-[11px] md:text-[12px] text-text-3 mb-5 font-dm-sans">{s.freeDesc}</p>
                <div
                  className="bg-teal-bg border border-teal-br rounded-lg p-3 md:p-4 mb-2.5 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleStripeCheckout(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? "")}
                >
                  <div className="font-medium text-[13px] md:text-[14px] text-text">{s.proMonthly}</div>
                  <div className="text-[15px] md:text-[16px] text-teal font-dm-mono font-medium mt-1">$14<span className="text-[12px] font-normal">{s.perMonth}</span></div>
                  <div className="text-[11px] md:text-[12px] text-text-3 mt-0.5">{s.proFeaturesDesc}</div>
                </div>
                <button onClick={() => setModal(null)} className="w-full py-2.5 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer mt-2">{s.cancel}</button>
              </>
            )}

            {modal === "checklist" && (
              <>
                <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-5 text-text">{s.checklistTitle}</div>
                {checklistItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-0 border-b border-border">
                    <span className="text-[12px] md:text-[13px] text-text">{item}</span>
                    <button onClick={() => setChecklistItems((prev) => prev.filter((_, idx) => idx !== i))} className="bg-none border-none text-red cursor-pointer text-[14px] md:text-[16px] px-0 py-1">×</button>
                  </div>
                ))}
                <div className="flex gap-2 mt-3.5">
                  <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={s.checklistPlaceholder} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newItem.trim()) { setChecklistItems((p) => [...p, newItem.trim()]); setNewItem(""); } } }} />
                  <button onClick={() => { if (newItem.trim()) { setChecklistItems((p) => [...p, newItem.trim()]); setNewItem(""); } }} className="py-2 md:py-2.5 px-3.5 bg-text text-bg border-none rounded-lg cursor-pointer font-medium text-[12px] md:text-[13px] whitespace-nowrap">{s.add}</button>
                </div>
                <button onClick={saveChecklist} className="w-full py-3 bg-text text-bg border-none rounded-lg font-dm-sans text-[13px] md:text-[14px] font-medium cursor-pointer mt-4">{s.save}</button>
                <button onClick={() => setModal(null)} className="w-full py-2.5 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer mt-2">{s.cancel}</button>
              </>
            )}

            {modal === "confluence" && (
              <>
                <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-5 text-text">{s.confluenceTitle}</div>
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {confluenceTags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 py-1 md:py-[5px] px-2.5 md:px-3 rounded-lg text-[11px] md:text-[12px] bg-purple-bg text-purple border border-purple-br">
                      {tag}
                      <button onClick={() => setConfluenceTags((p) => p.filter((_, idx) => idx !== i))} className="bg-none border-none text-red cursor-pointer text-[12px] md:text-[14px] px-0 leading-[1]">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={s.confluencePlaceholder} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newItem.trim()) { setConfluenceTags((p) => [...p, newItem.trim()]); setNewItem(""); } } }} />
                  <button onClick={() => { if (newItem.trim()) { setConfluenceTags((p) => [...p, newItem.trim()]); setNewItem(""); } }} className="py-2 md:py-2.5 px-3.5 bg-text text-bg border-none rounded-lg cursor-pointer font-medium text-[12px] md:text-[13px] whitespace-nowrap">{s.add}</button>
                </div>
                <button onClick={saveConfluence} className="w-full py-3 bg-text text-bg border-none rounded-lg font-dm-sans text-[13px] md:text-[14px] font-medium cursor-pointer mt-4">{s.save}</button>
                <button onClick={() => setModal(null)} className="w-full py-2.5 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer mt-2">{s.cancel}</button>
              </>
            )}

            {modal === "clear" && (
              <>
                <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-3 text-text">{s.clearTitle}</div>
                <p className="text-[12px] md:text-[13px] text-text-2 leading-[1.6] mb-6">
                  {s.clearDesc}
                </p>
                <button onClick={clearAllData} className="w-full py-3 bg-red text-white border-none rounded-lg font-dm-sans text-[13px] md:text-[14px] font-medium cursor-pointer mb-2">
                  {s.clearConfirm}
                </button>
                <button onClick={() => setModal(null)} className="w-full py-2.5 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer">{s.cancel}</button>
              </>
            )}
          </div>
        </div>
      )}

      <Toast message={toast.message} show={toast.show} onHide={() => setToast({ show: false, message: "" })} />
    </div>
  );
}
