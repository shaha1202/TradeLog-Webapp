import { createClient } from "@/lib/supabase/server";
import { getUserId, getCachedProfile } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import type { Trade, Profile } from "@/types";
import { formatPnl } from "@/lib/utils";
import JournalClient from "./JournalClient";

export default async function JournalPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const [tradesData, profile] = await Promise.all([
    supabase.from("trades").select("*").eq("user_id", userId).order("created_at", { ascending: false }).then(r => r.data),
    getCachedProfile(userId),
  ]);

  const trades = (tradesData ?? []) as Trade[];

  const today = new Date().toDateString();
  const todayTrades = trades.filter((t) => new Date(t.created_at).toDateString() === today);
  const wins = todayTrades.filter((t) => t.result === "win").length;
  const totalPnl = todayTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winRate = todayTrades.length > 0 ? Math.round((wins / todayTrades.length) * 100) : null;
  const rrTrades = todayTrades.filter((t) => t.rr !== null);
  const avgRR = rrTrades.length > 0 ? rrTrades.reduce((s, t) => s + (t.rr ?? 0), 0) / rrTrades.length : null;

  return (
    <JournalClient
      trades={trades}
      profile={profile as Profile | null}
      todayStats={{ totalPnl, winRate, avgRR, count: todayTrades.length }}
    />
  );
}
