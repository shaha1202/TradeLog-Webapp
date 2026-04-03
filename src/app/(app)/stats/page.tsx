import { createClient } from "@/lib/supabase/server";
import { getUserId, getCachedProfile } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import type { Trade, Profile } from "@/types";
import StatsClient from "./StatsClient";

export default async function StatsPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const [tradesData, profile] = await Promise.all([
    supabase.from("trades").select("*").eq("user_id", userId).order("created_at", { ascending: false }).then(r => r.data),
    getCachedProfile(userId),
  ]);

  return (
    <StatsClient
      trades={(tradesData ?? []) as Trade[]}
      profile={profile as Profile | null}
    />
  );
}
