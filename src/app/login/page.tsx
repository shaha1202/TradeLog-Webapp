"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }
      // Create profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id, email: user.email,
          full_name: "", plan: "free", default_risk: 1, currency: "USD", feedback_enabled: true,
        });
      }
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
          {isSignUp ? "Hisob yaratish" : "Kirish"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 28 }}>
          {isSignUp ? "AI trading jurnalini boshlang" : "AI trading jurnalingizga xush kelibsiz"}
        </p>

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
