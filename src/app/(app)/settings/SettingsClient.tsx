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

  // Account form
  const [balance, setBalance] = useState(String(profile?.account_balance ?? ""));
  const [riskPct, setRiskPct] = useState(String(profile?.default_risk ?? 1));
  const [currency, setCurrency] = useState(profile?.currency ?? "USD");
  const [strategy, setStrategy] = useState<string[]>(profile?.strategy ?? []);

  // Profile form
  const [fullName, setFullName] = useState(profile?.full_name ?? "");

  // Toggle states
  const [feedbackEnabled, setFeedbackEnabled] = useState(profile?.feedback_enabled ?? true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [riskWarning, setRiskWarning] = useState(true);

  // Custom lists
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
    }
  }

  async function saveProfile() {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
    if (!error) {
      setProfile((p) => p ? { ...p, full_name: fullName } : p);
      setModal(null);
      showToast("Profil yangilandi");
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
    <div onClick={onToggle} style={{
      width: 40, height: 22, background: on ? "var(--green)" : "var(--surface3)",
      borderRadius: 11, position: "relative", cursor: "pointer", transition: "background 0.2s",
      flexShrink: 0, border: `1px solid ${on ? "var(--green)" : "var(--border)"}`,
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? 20 : 2,
        width: 16, height: 16, background: "white", borderRadius: "50%",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );

  const SetRow = ({ icon, iconBg, iconColor, name, sub, onClick, right }: {
    icon: React.ReactNode; iconBg: string; iconColor: string;
    name: string; sub?: string; onClick?: () => void; right?: React.ReactNode;
  }) => (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px",
      borderBottom: "1px solid var(--border)", cursor: onClick ? "pointer" : "default", transition: "background 0.15s",
    }} className={onClick ? "hover:bg-[var(--surface2)]" : ""}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: iconColor }}>
            {icon}
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 13, color: name.includes("tozalash") || name.includes("Chiqish") ? "var(--red)" : "var(--text)" }}>{name}</div>
          {sub && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
      {right ?? (onClick ? <span style={{ color: "var(--text-3)", fontSize: 16 }}>›</span> : null)}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.5px", color: "var(--text)" }}>
          Sozlamalar
        </h1>
      </div>

      {/* Plan card */}
      <div style={{ background: "var(--teal-bg)", border: "1px solid var(--teal-br)", borderRadius: 12, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 300, color: "var(--text)" }}>
            {profile?.plan === "free" ? "Free tarif" : "Pro tarif"}
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>
            {profile?.plan === "free" ? "AI tahlil · Jurnal · 30 trade/oy" : "Cheksiz trade · Barcha xususiyatlar"}
          </p>
        </div>
        <div style={{ background: "var(--teal)", color: "white", fontSize: 11, fontWeight: 500, padding: "4px 12px", borderRadius: 5, fontFamily: "'DM Mono',monospace" }}>
          Faol
        </div>
      </div>

      {/* Account section */}
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 8, marginTop: 20, padding: "0 2px" }}>
        Hisob
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
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
        <div style={{ borderBottom: "none" }}>
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
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 8, marginTop: 20, padding: "0 2px" }}>
        Sozlash
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
        <SetRow
          icon={<><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
          iconBg="var(--green-bg)" iconColor="var(--green)"
          name="Checklist qoidalari"
          sub="Qoidalarni tahrirlash"
          onClick={() => setModal("checklist")}
        />
        <div style={{ borderBottom: "none" }}>
          <SetRow
            icon={<><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M16.95 7.05l2.12-2.12M4.93 19.07l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>}
            iconBg="var(--purple-bg)" iconColor="var(--purple)"
            name="Confluence taglar"
            sub="Taglarni o'zgartirish"
            onClick={() => setModal("confluence")}
          />
        </div>
      </div>

      {/* AI & Notifications */}
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 8, marginTop: 20, padding: "0 2px" }}>
        AI & Bildirishnomalar
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
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
        <div style={{ borderBottom: "none" }}>
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
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 16, overflow: "hidden", boxShadow: "var(--shadow)" }}>
        <SetRow
          icon={<><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
          iconBg="var(--red-bg)" iconColor="var(--red)"
          name="Ma'lumotlarni tozalash"
          onClick={() => setModal("clear")}
        />
        <div style={{ borderBottom: "none" }}>
          <SetRow
            icon={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
            iconBg="var(--red-bg)" iconColor="var(--red)"
            name="Chiqish"
            onClick={handleLogout}
          />
        </div>
      </div>

      {/* MODALS */}
      {modal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28,
            width: "100%", maxWidth: 440, maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>

            {modal === "account" && (
              <>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 300, marginBottom: 20, color: "var(--text)" }}>Hisob sozlamalari</div>
                {[
                  { label: "Hisob hajmi ($)", value: balance, set: setBalance, placeholder: "10000", step: "100" },
                  { label: "Default risk (%)", value: riskPct, set: setRiskPct, placeholder: "1.0", step: "0.1" },
                ].map(({ label, value, set, placeholder, step }) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 6 }}>{label}</label>
                    <input type="number" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} step={step} />
                  </div>
                ))}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 6 }}>Valyuta</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {["USD", "EUR", "GBP", "UZS"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 8 }}>Strategiya</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {STRATEGIES.map((s) => (
                      <button key={s} type="button" onClick={() => setStrategy((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])} style={{
                        padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
                        border: `1px solid ${strategy.includes(s) ? "var(--teal)" : "var(--border)"}`,
                        background: strategy.includes(s) ? "var(--teal-bg)" : "var(--surface2)",
                        color: strategy.includes(s) ? "var(--teal)" : "var(--text-2)",
                        transition: "all 0.15s",
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
                <button onClick={saveAccount} style={{ width: "100%", padding: 13, background: "var(--text)", color: "white", border: "none", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer", marginTop: 16 }}>Saqlash</button>
                <button onClick={() => setModal(null)} style={{ width: "100%", padding: 11, background: "none", color: "var(--text-2)", border: "none", fontSize: 13, cursor: "pointer", marginTop: 6 }}>Bekor qilish</button>
              </>
            )}

            {modal === "profile" && (
              <>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 300, marginBottom: 20, color: "var(--text)" }}>Profil</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 6 }}>Ism</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="To'liq ism" />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 6 }}>Email</label>
                  <input type="email" value={profile?.email ?? ""} readOnly style={{ opacity: 0.6, cursor: "default" }} />
                </div>
                <button onClick={saveProfile} style={{ width: "100%", padding: 13, background: "var(--text)", color: "white", border: "none", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer", marginTop: 16 }}>Saqlash</button>
                <button onClick={() => setModal(null)} style={{ width: "100%", padding: 11, background: "none", color: "var(--text-2)", border: "none", fontSize: 13, cursor: "pointer", marginTop: 6 }}>Bekor qilish</button>
              </>
            )}

            {modal === "plan" && (
              <>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 300, marginBottom: 20, color: "var(--text)" }}>Tarif tanlash</div>
                {[
                  { name: "Pro Oylik", price: "$9.90/oy", desc: "Cheksiz tradelar", key: "monthly" },
                  { name: "Pro Kvartal", price: "$24/3 oy", desc: "20% tejash · Cheksiz tradelar", key: "quarterly" },
                ].map(({ name, price, desc, key }) => (
                  <div key={key} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px", marginBottom: 10, cursor: "pointer", transition: "border-color 0.15s" }}
                    onClick={() => handleStripeCheckout(
                      key === "monthly"
                        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? ""
                        : process.env.NEXT_PUBLIC_STRIPE_QUARTERLY_PRICE_ID ?? ""
                    )}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: "var(--text)" }}>{name}</div>
                    <div style={{ fontSize: 13, color: "var(--teal)", fontFamily: "'DM Mono',monospace", marginTop: 4 }}>{price}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
                <button onClick={() => setModal(null)} style={{ width: "100%", padding: 11, background: "none", color: "var(--text-2)", border: "none", fontSize: 13, cursor: "pointer", marginTop: 6 }}>Bekor qilish</button>
              </>
            )}

            {modal === "checklist" && (
              <>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 300, marginBottom: 20, color: "var(--text)" }}>Checklist qoidalari</div>
                {checklistItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13, color: "var(--text)" }}>{item}</span>
                    <button onClick={() => setChecklistItems((prev) => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Yangi qoida" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newItem.trim()) { setChecklistItems((p) => [...p, newItem.trim()]); setNewItem(""); } } }} />
                  <button onClick={() => { if (newItem.trim()) { setChecklistItems((p) => [...p, newItem.trim()]); setNewItem(""); } }} style={{ padding: "9px 14px", background: "var(--text)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>+</button>
                </div>
                <button onClick={saveChecklist} style={{ width: "100%", padding: 13, background: "var(--text)", color: "white", border: "none", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer", marginTop: 16 }}>Saqlash</button>
                <button onClick={() => setModal(null)} style={{ width: "100%", padding: 11, background: "none", color: "var(--text-2)", border: "none", fontSize: 13, cursor: "pointer", marginTop: 6 }}>Bekor qilish</button>
              </>
            )}

            {modal === "confluence" && (
              <>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 300, marginBottom: 20, color: "var(--text)" }}>Confluence taglar</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {confluenceTags.map((tag, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, background: "var(--purple-bg)", color: "var(--purple)", border: "1px solid var(--purple-br)", fontSize: 12 }}>
                      {tag}
                      <button onClick={() => setConfluenceTags((p) => p.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Yangi tag" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newItem.trim()) { setConfluenceTags((p) => [...p, newItem.trim()]); setNewItem(""); } } }} />
                  <button onClick={() => { if (newItem.trim()) { setConfluenceTags((p) => [...p, newItem.trim()]); setNewItem(""); } }} style={{ padding: "9px 14px", background: "var(--text)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>+</button>
                </div>
                <button onClick={saveConfluence} style={{ width: "100%", padding: 13, background: "var(--text)", color: "white", border: "none", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer", marginTop: 16 }}>Saqlash</button>
                <button onClick={() => setModal(null)} style={{ width: "100%", padding: 11, background: "none", color: "var(--text-2)", border: "none", fontSize: 13, cursor: "pointer", marginTop: 6 }}>Bekor qilish</button>
              </>
            )}

            {modal === "clear" && (
              <>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 300, marginBottom: 12, color: "var(--text)" }}>Ma&apos;lumotlarni tozalash</div>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 24 }}>
                  Barcha tradelaringiz o&apos;chiriladi. Bu amalni qaytarib bo&apos;lmaydi.
                </p>
                <button onClick={clearAllData} style={{ width: "100%", padding: 13, background: "var(--red)", color: "white", border: "none", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer", marginBottom: 8 }}>
                  Ha, o&apos;chirish
                </button>
                <button onClick={() => setModal(null)} style={{ width: "100%", padding: 11, background: "none", color: "var(--text-2)", border: "none", fontSize: 13, cursor: "pointer" }}>Bekor qilish</button>
              </>
            )}
          </div>
        </div>
      )}

      <Toast message={toast.message} show={toast.show} onHide={() => setToast({ show: false, message: "" })} />
    </div>
  );
}
