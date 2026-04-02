"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "confirmation_failed") {
      setError("Email tasdiqlash bajarilmadi. Qaytadan urinib ko'ring.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (isSignUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }
      // If session is null, email confirmation is required
      if (data.session === null) {
        setEmailSent(true);
        setLoading(false);
        return;
      }
      // If session exists, email confirmation is disabled — continue to journal
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError(signInError.message); setLoading(false); return; }
    }
    router.push("/journal");
    router.refresh();
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24,
    }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20,
        padding: "40px 44px", width: "100%", maxWidth: 420,
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 36 }}>
          <div style={{ width: 8, height: 8, background: "var(--teal)", borderRadius: "50%" }} />
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 500, color: "var(--text)" }}>
            TradeLog
          </span>
        </div>

        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 300, color: "var(--text)", marginBottom: 6 }}>
          {emailSent ? "Email tasdiqlang" : isSignUp ? "Hisob yaratish" : "Kirish"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 28 }}>
          {emailSent ? "Tasdiqlash havolasini olish uchun emailingizni tekshiring" : isSignUp ? "AI trading jurnalini boshlang" : "AI trading jurnalingizga xush kelibsiz"}
        </p>

        {emailSent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              background: "var(--teal-bg)", border: "1px solid var(--teal-br)", borderRadius: 12,
              padding: "20px 24px", marginBottom: 20,
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 12px", opacity: 0.7 }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text)" }}>
                <strong>{email}</strong> manziliga tasdiqlash havolasini yubordik. Emailingizni tekshiring va havolani bosing.
              </p>
            </div>
            <button
              onClick={() => { setEmailSent(false); setEmail(""); setPassword(""); setError(null); }}
              style={{
                width: "100%", padding: 14, background: "var(--text)", color: "white",
                border: "none", borderRadius: 10, fontFamily: "'DM Sans',sans-serif",
                fontSize: 14, fontWeight: 500, cursor: "pointer", marginTop: 12,
              }}
            >
              Qaytadan kirishga urinish
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@example.com" required
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 11, color: "var(--text-2)", marginBottom: 6 }}>
              Parol
            </label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required minLength={6}
            />
          </div>

          {error && (
            <div style={{
              background: "var(--red-bg)", border: "1px solid var(--red-br)", borderRadius: 8,
              padding: "10px 14px", fontSize: 13, color: "var(--red)", marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: 14, background: "var(--text)", color: "white",
              border: "none", borderRadius: 10, fontFamily: "'DM Sans',sans-serif",
              fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1, transition: "all 0.2s",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{
                  width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white", borderRadius: "50%", display: "inline-block",
                  animation: "spin 0.8s linear infinite",
                }} />
                {isSignUp ? "Yaratilmoqda..." : "Kirilmoqda..."}
              </span>
            ) : isSignUp ? "Hisob yaratish" : "Kirish"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-3)", marginTop: 20 }}>
          {isSignUp ? "Hisobingiz bormi?" : "Hisob yo'qmi?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
          >
            {isSignUp ? "Kirish" : "Ro'yxatdan o'tish"}
          </button>
        </p>
      </div>
    </div>
  );
}
