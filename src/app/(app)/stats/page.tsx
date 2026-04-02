import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Trade, Profile } from "@/types";
import StatsClient from "./StatsClient";

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: tradesData }, { data: profileData }] = await Promise.all([
    supabase.from("trades").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  return (
    <StatsClient
      trades={(tradesData ?? []) as Trade[]}
      profile={profileData as Profile | null}
    />
  );
}
