"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { formatPnl, getInitials } from "@/lib/utils";
import type { Profile } from "@/types";

interface SidebarStats {
  pnl: number | null;
  winRate: number | null;
  count: number;
  avgRR: number | null;
}

export default function Sidebar({
  profile,
  stats,
}: {
  profile: Profile | null;
  stats: SidebarStats;
}) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const navItems = [
    {
      id: "journal",
      href: "/journal",
      label: "Jurnal",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0 opacity-60" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "new",
      href: "/journal/new",
      label: "Yangi trade",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0 opacity-60" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "stats",
      href: "/stats",
      label: "Statistika",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0 opacity-60" viewBox="0 0 16 16" fill="none">
          <path d="M2 13V8l3 3 3-4 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "settings",
      href: "/settings",
      label: "Sozlamalar",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0 opacity-60" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === "/journal") return pathname === "/journal" || pathname.startsWith("/journal/") && !pathname.startsWith("/journal/new");
    return pathname.startsWith(href);
  };

  const pnlColor = stats.pnl === null ? "" : stats.pnl >= 0 ? "g" : "r";

  return (
    <aside
      style={{
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        padding: "28px 20px",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
      className="hidden md:flex"
    >
      {/* Logo */}
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 500, color: "var(--text)", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, background: "var(--teal)", borderRadius: "50%" }} />
          TradeLog
        </div>
        <button
          onClick={toggle}
          title="Mavzu"
          style={{
            width: 30, height: 30, borderRadius: 7, border: "1px solid var(--border)",
            background: "var(--surface2)", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", color: "var(--text-2)",
            transition: "all 0.2s",
          }}
        >
          {theme === "dark" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Nav */}
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 8, padding: "0 4px" }}>
        Menu
      </div>
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 8, fontSize: 13,
              color: active ? (theme === "dark" ? "var(--text)" : "#fff") : "var(--text-2)",
              cursor: "pointer", transition: "all 0.15s", marginBottom: 2,
              border: active && theme === "dark" ? "1px solid var(--border-dark)" : "1px solid transparent",
              background: active
                ? theme === "dark" ? "var(--surface3)" : "var(--text)"
                : "transparent",
              textDecoration: "none",
            }}
          >
            <span style={{ opacity: active ? 1 : undefined, filter: active && theme === "light" ? "invert(1)" : undefined }}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}

      {/* Today stats */}
      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12, padding: "0 4px" }}>
          Bugun
        </div>
        {[
          { label: "P&L", value: stats.pnl !== null ? formatPnl(stats.pnl, profile?.currency) : "—", color: pnlColor },
          { label: "Win rate", value: stats.winRate !== null ? `${stats.winRate}%` : "—", color: "" },
          { label: "Tradelar", value: String(stats.count), color: "" },
          { label: "Avg R:R", value: stats.avgRR !== null ? `${stats.avgRR.toFixed(2)}R` : "—", color: "" },
        ].map((s) => (
          <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 4px" }}>
            <span style={{ fontSize: 12, color: "var(--text-2)" }}>{s.label}</span>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500,
              color: s.color === "g" ? "var(--green)" : s.color === "r" ? "var(--red)" : "var(--text)",
            }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* User */}
      <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--border)" }}>
        <Link href="/settings" style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
          borderRadius: 8, cursor: "pointer", transition: "background 0.15s", textDecoration: "none",
        }}
          className="hover:bg-[var(--surface2)]"
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "var(--teal-bg)",
            border: "1px solid var(--teal-br)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 13, fontWeight: 600, color: "var(--teal)",
            flexShrink: 0, fontFamily: "'DM Mono', monospace",
          }}>
            {getInitials(profile?.full_name ?? null)}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
              {profile?.full_name || "Trader"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
              {profile?.plan === "free" ? "Free plan" : "Pro plan"}
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
