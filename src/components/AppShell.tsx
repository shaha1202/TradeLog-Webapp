"use client";

import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import type { Profile, Trade } from "@/types";
import { useMemo } from "react";

export default function AppShell({
  profile,
  trades,
  children,
}: {
  profile: Profile | null;
  trades: Trade[];
  children: React.ReactNode;
}) {
  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayTrades = trades.filter(
      (t) => new Date(t.created_at).toDateString() === today
    );
    const wins = todayTrades.filter((t) => t.result === "win").length;
    const pnl = todayTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const count = todayTrades.length;
    const winRate = count > 0 ? Math.round((wins / count) * 100) : null;
    const rrTrades = todayTrades.filter((t) => t.rr !== null);
    const avgRR =
      rrTrades.length > 0
        ? rrTrades.reduce((s, t) => s + (t.rr ?? 0), 0) / rrTrades.length
        : null;
    return { pnl: count > 0 ? pnl : null, winRate, count, avgRR };
  }, [trades]);

  return (
    <div className="min-h-screen">
      {/* Desktop layout with sidebar */}
      <div className="hidden md:grid md:grid-cols-[260px_1fr] min-h-screen">
        <Sidebar profile={profile} stats={todayStats} />
        <main className="px-6 md:px-8 lg:px-12 py-6 md:py-10 w-full max-w-[960px]">
          {children}
        </main>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden min-h-screen pb-20">
        <main className="px-4 py-6 w-full">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
