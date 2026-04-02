import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import type { Trade, Profile } from "@/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only fetch profile and today's trades for sidebar (faster)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [profileResult, todayTradesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("trades")
      .select("id,pnl,result,rr,created_at")
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString()),
  ]);
  const { data: profile } = profileResult;
  const { data: todayTrades } = todayTradesResult;

  return (
    <AppShell profile={profile as Profile | null} trades={(todayTrades ?? []) as Trade[]}>
      {children}
    </AppShell>
  );
}
