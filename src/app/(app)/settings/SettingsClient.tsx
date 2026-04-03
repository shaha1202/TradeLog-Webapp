"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import Toast from "@/components/Toast";

const DEFAULT_CHECKLIST = [
  "HTF trend bilan mos yo'nalish",
  "Kamida 2 ta confluence bor",
  "R:R kamida 1:2",
  "Risk 1–2% dan oshmaydi",
  "SL mantiqiy joyda",
  "Economic calendar tekshirildi",
];
const DEFAULT_CONFLUENCE = [
  "FVG", "Order Block", "Liquidity Sweep", "Break of Structure",
  "EMA 200", "Support / Resistance", "Session Open", "HTF Trend", "Fibonacci",
];

type ModalType = "account" | "profile" | "plan" | "checklist" | "confluence" | "clear" | null;

export default function SettingsClient({ profile: initialProfile, userId }: { profile: Profile | null; userId: string }) {
  const router = useRouter();
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
  const [riskWarning, setRiskWarning] = useState(true);

  const [checklistItems, setChecklistItems] = useState<string[]>(DEFAULT_CHECKLIST);
  const [confluenceTags, setConfluenceTags] = useState<string[]>(DEFAULT_CONFLUENCE);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("custom_checklist");
    const savedConf = localStorage.getItem("custom_confluence");
    if (saved) setChecklistItems(JSON.parse(saved));
    if (savedConf) setConfluenceTags(JSON.parse(savedConf));
  }, []);

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
      showToast("Hisob sozlamalari saqlandi");
      fetch("/api/profile/revalidate", { method: "POST" });
    }
  }

  async function saveProfile() {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
    if (!error) {
      setProfile((p) => p ? { ...p, full_name: fullName } : p);
      setModal(null);
      showToast("Profil yangilandi");
      fetch("/api/profile/revalidate", { method: "POST" });
    }
  }

  async function toggleFeedback() {
    const newVal = !feedbackEnabled;
    setFeedbackEnabled(newVal);
    const supabase = createClient();
    await supabase.from("profiles").update({ feedback_enabled: newVal }).eq("id", userId);
  }

  async function clearAllData() {
    const supabase = createClient();
    await supabase.from("trades").delete().eq("user_id", userId);
    setModal(null);
    showToast("Barcha ma'lumotlar tozalandi");
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
    showToast("Checklist saqlandi");
  }

  function saveConfluence() {
    localStorage.setItem("custom_confluence", JSON.stringify(confluenceTags));
    setModal(null);
    showToast("Confluence taglar saqlandi");
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
    <div onClick={onToggle} className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors flex-shrink-0 border ${
      on ? "bg-green border-green" : "bg-surface3 border-border"
    }`}>
      <div className={`absolute top-1 ${on ? "left-5" : "left-1"} w-4 h-4 bg-white rounded-full transition-all shadow-[0_1px_3px_rgba(0,0,0,0.2)]`} />
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
          <div className={`text-[12px] md:text-[13px] ${name.includes("tozalash") || name.includes("Chiqish") ? "text-red" : "text-text"}`}>{name}</div>
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
          Sozlamalar
        </h1>
      </div>

      {/* Plan card */}
      <div className="bg-teal-bg border border-teal-br rounded-xl md:rounded-lg p-4 md:p-5 mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-fraunces text-[15px] md:text-[18px] font-light text-text">
            {profile?.plan === "free" ? "Free tarif" : "Pro tarif"}
          </h3>
          <p className="text-[11px] md:text-[12px] text-text-2 mt-1">
            {profile?.plan === "free" ? "AI tahlil · Jurnal · 30 trade/oy" : "Cheksiz trade · Barcha xususiyatlar"}
          </p>
        </div>
        <div className="bg-teal text-white text-[10px] md:text-[11px] font-medium py-1 px-2.5 md:px-3 rounded-md font-dm-mono">
          Faol
        </div>
      </div>

      {/* Account section */}
      <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-2 mt-4 px-1">Hisob</div>
      <div className="bg-surface border border-border rounded-xl md:rounded-lg mb-4 overflow-hidden shadow-[var(--shadow)]">
        <SetRow
          icon={<rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />}
          iconBg="var(--green-bg)" iconColor="var(--green)"
          name="Hisob hajmi & Risk"
          sub={profile?.account_balance ? `$${profile.account_balance} · ${profile.default_risk}% risk${profile.strategy?.length ? ` · ${profile.strategy.join(", ")}` : ""}` : "Kiritilmagan"}
          onClick={() => setModal("account")}
        />
        <SetRow
          icon={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>}
          iconBg="var(--teal-bg)" iconColor="var(--teal)"
          name="Profil"
          sub={profile?.full_name || "Trader"}
          onClick={() => setModal("profile")}
        />
        <div className="border-b-0">
          <SetRow
            icon={<><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
            iconBg="var(--amber-bg)" iconColor="var(--amber)"
            name="Tarif"
            sub="$9.9/oy yoki $24/3 oy"
            onClick={() => setModal("plan")}
          />
        </div>
      </div>

      {/* Customize */}
      <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-2 mt-4 px-1">Sozlash</div>
      <div className="bg-surface border border-border rounded-xl md:rounded-lg mb-4 overflow-hidden shadow-[var(--shadow)]">
        <SetRow
          icon={<><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
          iconBg="var(--green-bg)" iconColor="var(--green)"
          name="Checklist qoidalari"
          sub="Qoidalarni tahrirlash"
          onClick={() => setModal("checklist")}
        />
        <div className="border-b-0">
          <SetRow
            icon={<><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M16.95 7.05l2.12-2.12M4.93 19.07l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
            iconBg="var(--purple-bg)" iconColor="var(--purple)"
            name="Confluence taglar"
            sub="Taglarni o'zgartirish"
            onClick={() => setModal("confluence")}
          />
        </div>
      </div>

      {/* AI & Notifications */}
      <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-2 mt-4 px-1">AI & Bildirishnomalar</div>
      <div className="bg-surface border border-border rounded-xl md:rounded-lg mb-4 overflow-hidden shadow-[var(--shadow)]">
        <SetRow
          icon={<><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
          iconBg="var(--teal-bg)" iconColor="var(--teal)"
          name="AI Feedback"
          sub="Har trade uchun tavsiya"
          right={<Toggle on={feedbackEnabled} onToggle={toggleFeedback} />}
        />
        <SetRow
          icon={<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
          iconBg="var(--amber-bg)" iconColor="var(--amber)"
          name="Kundalik eslatma"
          sub="Har kuni 09:00"
          right={<Toggle on={dailyReminder} onToggle={() => setDailyReminder(!dailyReminder)} />}
        />
        <div className="border-b-0">
          <SetRow
            icon={<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
            iconBg="var(--red-bg)" iconColor="var(--red)"
            name="Risk ogohlantirish"
            sub="Default riskdan oshsa xabar ber"
            right={<Toggle on={riskWarning} onToggle={() => setRiskWarning(!riskWarning)} />}
          />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-surface border border-border rounded-xl md:rounded-lg mb-4 overflow-hidden shadow-[var(--shadow)]">
        <SetRow
          icon={<><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
          iconBg="var(--red-bg)" iconColor="var(--red)"
          name="Ma'lumotlarni tozalash"
          onClick={() => setModal("clear")}
        />
        <div className="border-b-0">
          <SetRow
            icon={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
            iconBg="var(--red-bg)" iconColor="var(--red)"
            name="Chiqish"
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
                <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-5 text-text">Hisob sozlamalari</div>
                {[
                  { label: "Hisob hajmi ($)", value: balance, set: setBalance, placeholder: "10000", step: "100" },
                  { label: "Default risk (%)", value: riskPct, set: setRiskPct, placeholder: "1.0", step: "0.1" },
                ].map(({ label, value, set, placeholder, step }) => (
                  <div key={label} className="mb-3.5">
                    <label className="block text-[11px] text-text-2 mb-1.5">{label}</label>
                    <input type="number" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} step={step} />
                  </div>
                ))}
                <div className="mb-3.5">
                  <label className="block text-[11px] text-text-2 mb-1.5">Valyuta</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {["USD", "EUR", "GBP", "UZS"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="mb-3.5">
                  <label className="block text-[11px] text-text-2 mb-2">Strategiya</label>
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
                <button onClick={saveAccount} className="w-full py-3 bg-text text-white border-none rounded-lg font-dm-sans text-[13px] md:text-[14px] font-medium cursor-pointer mt-4">Saqlash</button>
                <button onClick={() => setModal(null)} className="w-full py-2.5 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer mt-2">Bekor qilish</button>
              </>
            )}

            {modal === "profile" && (
              <>
                <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-5 text-text">Profil</div>
                <div className="mb-3.5">
                  <label className="block text-[11px] text-text-2 mb-1.5">Ism</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="To'liq ism" />
                </div>
                <div className="mb-3.5">
                  <label className="block text-[11px] text-text-2 mb-1.5">Email</label>
                  <input type="email" value={profile?.email ?? ""} readOnly className="opacity-60 cursor-default" />
                </div>
                <button onClick={saveProfile} className="w-full py-3 bg-text text-white border-none rounded-lg font-dm-sans text-[13px] md:text-[14px] font-medium cursor-pointer mt-4">Saqlash</button>
                <button onClick={() => setModal(null)} className="w-full py-2.5 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer mt-2">Bekor qilish</button>
              </>
            )}

            {modal === "plan" && (
              <>
                <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-5 text-text">Tarif tanlash</div>
                {[
                  { name: "Pro Oylik", price: "$9.9/oy", desc: "Cheksiz tradelar", key: "monthly" },
                  { name: "Pro Kvartal", price: "$24/3 oy", desc: "20% tejash · Cheksiz tradelar", key: "quarterly" },
                ].map(({ name, price, desc, key }) => (
                  <div key={key} className="bg-surface2 border border-border rounded-lg p-3 md:p-4 mb-2.5 cursor-pointer transition-colors" onClick={() => handleStripeCheckout(
                    key === "monthly"
                      ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? ""
                      : process.env.NEXT_PUBLIC_STRIPE_QUARTERLY_PRICE_ID ?? ""
                  )}>
                    <div className="font-medium text-[13px] md:text-[14px] text-text">{name}</div>
                    <div className="text-[12px] md:text-[13px] text-teal font-dm-mono mt-1">{price}</div>
                    <div className="text-[11px] md:text-[12px] text-text-3 mt-0.5">{desc}</div>
                  </div>
                ))}
                <button onClick={() => setModal(null)} className="w-full py-2.5 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer mt-2">Bekor qilish</button>
              </>
            )}

            {modal === "checklist" && (
              <>
                <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-5 text-text">Checklist qoidalari</div>
                {checklistItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-0 border-b border-border">
                    <span className="text-[12px] md:text-[13px] text-text">{item}</span>
                    <button onClick={() => setChecklistItems((prev) => prev.filter((_, idx) => idx !== i))} className="bg-none border-none text-red cursor-pointer text-[14px] md:text-[16px] px-0 py-1">×</button>
                  </div>
                ))}
                <div className="flex gap-2 mt-3.5">
                  <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Yangi qoida" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newItem.trim()) { setChecklistItems((p) => [...p, newItem.trim()]); setNewItem(""); } } }} />
                  <button onClick={() => { if (newItem.trim()) { setChecklistItems((p) => [...p, newItem.trim()]); setNewItem(""); } }} className="py-2 md:py-2.5 px-3.5 bg-text text-white border-none rounded-lg cursor-pointer font-medium text-[12px] md:text-[13px] whitespace-nowrap">+</button>
                </div>
                <button onClick={saveChecklist} className="w-full py-3 bg-text text-white border-none rounded-lg font-dm-sans text-[13px] md:text-[14px] font-medium cursor-pointer mt-4">Saqlash</button>
                <button onClick={() => setModal(null)} className="w-full py-2.5 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer mt-2">Bekor qilish</button>
              </>
            )}

            {modal === "confluence" && (
              <>
                <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-5 text-text">Confluence taglar</div>
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {confluenceTags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 py-1 md:py-[5px] px-2.5 md:px-3 rounded-lg text-[11px] md:text-[12px] bg-purple-bg text-purple border border-purple-br">
                      {tag}
                      <button onClick={() => setConfluenceTags((p) => p.filter((_, idx) => idx !== i))} className="bg-none border-none text-red cursor-pointer text-[12px] md:text-[14px] px-0 leading-[1]">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Yangi tag" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newItem.trim()) { setConfluenceTags((p) => [...p, newItem.trim()]); setNewItem(""); } } }} />
                  <button onClick={() => { if (newItem.trim()) { setConfluenceTags((p) => [...p, newItem.trim()]); setNewItem(""); } }} className="py-2 md:py-2.5 px-3.5 bg-text text-white border-none rounded-lg cursor-pointer font-medium text-[12px] md:text-[13px] whitespace-nowrap">+</button>
                </div>
                <button onClick={saveConfluence} className="w-full py-3 bg-text text-white border-none rounded-lg font-dm-sans text-[13px] md:text-[14px] font-medium cursor-pointer mt-4">Saqlash</button>
                <button onClick={() => setModal(null)} className="w-full py-2.5 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer mt-2">Bekor qilish</button>
              </>
            )}

            {modal === "clear" && (
              <>
                <div className="font-fraunces text-[17px] md:text-[20px] font-light mb-3 text-text">Ma'lumotlarni tozalash</div>
                <p className="text-[12px] md:text-[13px] text-text-2 leading-[1.6] mb-6">
                  Barcha tradelaringiz o'chiriladi. Bu amalni qaytarib bo'lmaydi.
                </p>
                <button onClick={clearAllData} className="w-full py-3 bg-red text-white border-none rounded-lg font-dm-sans text-[13px] md:text-[14px] font-medium cursor-pointer mb-2">
                  Ha, o'chirish
                </button>
                <button onClick={() => setModal(null)} className="w-full py-2.5 bg-none text-text-2 border-none text-[12px] md:text-[13px] cursor-pointer">Bekor qilish</button>
              </>
            )}
          </div>
        </div>
      )}

      <Toast message={toast.message} show={toast.show} onHide={() => setToast({ show: false, message: "" })} />
    </div>
  );
}
