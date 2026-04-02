"use client";

import Sidebar from "./Sidebar";
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
    return {
      pnl: count > 0 ? pnl : null,
      winRate,
      count,
      avgRR,
    };
  }, [trades]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        minHeight: "100vh",
      }}
      className="app"
    >
      <Sidebar profile={profile} stats={todayStats} />
      <main
        style={{
          padding: "40px 48px",
          maxWidth: 960,
        }}
        className="main-content"
      >
        {children}
      </main>
    </div>
  );
}
