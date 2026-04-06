import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getCachedProfile } from "@/lib/supabase/auth";
import AppShell from "@/components/AppShell";
import type { Trade, Profile } from "@/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  // Only fetch profile and today's trades for sidebar (faster)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const supabase = await createClient();
  const [profile, todayTradesResult, totalCountResult] = await Promise.all([
    getCachedProfile(user.id),
    supabase.from("trades")
      .select("id,pnl,result,rr,created_at")
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString()),
    supabase.from("trades")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);
  const { data: todayTrades } = todayTradesResult;
  const totalTradeCount = totalCountResult.count ?? 0;

  return (
    <AppShell profile={profile as Profile | null} trades={(todayTrades ?? []) as Trade[]} totalTradeCount={totalTradeCount}>
      {children}
    </AppShell>
  );
}
