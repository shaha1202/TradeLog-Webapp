"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { formatPnl, getInitials } from "@/lib/utils";
import type { Profile } from "@/types";
import NavItem from "./ui/NavItem";
import StatItem from "./ui/StatItem";
import UserCard from "./ui/UserCard";
import { useLanguage } from "@/lib/i18n";

interface SidebarStats {
  pnl: number | null;
  winRate: number | null;
  count: number;
  avgRR: number | null;
}

export default function Sidebar({
  profile,
  stats,
  totalTradeCount,
}: {
  profile: Profile | null;
  stats: SidebarStats;
  totalTradeCount: number;
}) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { t } = useLanguage();

  const navItems = [
    {
      id: "journal",
      href: "/journal",
      label: t.nav.journal,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 4h12M2 8h8M2 12h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "new",
      href: "/journal/new",
      label: t.nav.newTrade,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 5v6M5 8h6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "stats",
      href: "/stats",
      label: t.nav.stats,
      badge: profile?.plan === "free" ? "Pro" : undefined,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 13V8l3 3 3-4 5 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "settings",
      href: "/settings",
      label: t.nav.settings,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path
            d="M6.5 1.5H9.5L10 3.5C10.4 3.7 10.8 3.9 11.1 4.2L13 3.5L14.5 6L13 7.2C13 7.5 13 7.7 13 8C13 8.3 13 8.5 13 8.8L14.5 10L13 12.5L11.1 11.8C10.8 12.1 10.4 12.3 10 12.5L9.5 14.5H6.5L6 12.5C5.6 12.3 5.2 12.1 4.9 11.8L3 12.5L1.5 10L3 8.8C3 8.5 3 8.3 3 8C3 7.7 3 7.5 3 7.2L1.5 6L3 3.5L4.9 4.2C5.2 3.9 5.6 3.7 6 3.5L6.5 1.5Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === "/journal")
      return (
        pathname === "/journal" ||
        (pathname.startsWith("/journal/") &&
          !pathname.startsWith("/journal/new"))
      );
    return pathname.startsWith(href);
  };

  const pnlColor =
    stats.pnl === null
      ? ("" as const)
      : stats.pnl >= 0
      ? ("g" as const)
      : ("r" as const);

  return (
    <aside className="hidden md:flex flex-col bg-surface border-r border-border px-5 py-7 sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center justify-between mb-8">
        <span className="font-fraunces text-xl font-medium text-text flex items-center gap-2">
          <span className="w-2 h-2 bg-teal rounded-full inline-block" />
          TradeLog
        </span>

        <button
          onClick={toggle}
          title={t.nav.theme}
          className="w-8 h-8 rounded-lg border border-border bg-surface2 flex items-center justify-center text-text-2 cursor-pointer transition-all duration-200 hover:bg-surface3"
        >
          {theme === "dark" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Nav section label */}
      <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-2 px-1">
        {t.nav.menu}
      </p>

      {/* Nav */}
      <nav className="flex flex-col">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href)}
            isDark={theme === "dark"}
            badge={item.badge}
          />
        ))}
      </nav>

      {/* Today stats */}
      <div className="mt-7 pt-5 border-t border-border">
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-3 mb-3 px-1">
          {t.nav.today}
        </p>
        <StatItem
          label="P&L"
          value={
            stats.pnl !== null
              ? formatPnl(stats.pnl, profile?.currency)
              : "—"
          }
          color={pnlColor}
        />
        <StatItem
          label={t.journal.winRate}
          value={stats.winRate !== null ? `${stats.winRate}%` : "—"}
        />
        <StatItem label={t.journal.trades} value={String(stats.count)} />
        <StatItem
          label={t.journal.avgRR}
          value={
            stats.avgRR !== null ? `${stats.avgRR.toFixed(2)}R` : "—"
          }
        />
      </div>

      {/* Free plan trade counter */}
      {profile?.plan === "free" && (
        <div className="mb-3 px-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-dm-mono text-text-3">
              {t.newTrade.freeTradesUsed.replace("{count}", String(Math.min(totalTradeCount, 3)))}
            </span>
          </div>
          <div className="h-1 bg-surface2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${totalTradeCount >= 3 ? "bg-amber" : "bg-teal"}`}
              style={{ width: `${Math.min((totalTradeCount / 3) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* User */}
      <div className="mt-auto pt-5 border-t border-border">
        <UserCard
          initials={getInitials(profile?.full_name ?? null)}
          name={profile?.full_name || t.settings?.traderFallback}
          plan={profile?.plan === "free" ? t.settings.freePlan : t.settings.proPlan}
        />
      </div>
    </aside>
  );
}
