import { createClient } from "@/lib/supabase/server";
import { getUserId, getCachedProfile } from "@/lib/supabase/auth";
import { redirect, notFound } from "next/navigation";
import type { Trade, Profile } from "@/types";
import TradeDetailClient from "./TradeDetailClient";

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const [{ data: trade }, profile] = await Promise.all([
    supabase.from("trades").select("*").eq("id", id).eq("user_id", userId).single(),
    getCachedProfile(userId),
  ]);

  if (!trade) notFound();

  return <TradeDetailClient trade={trade as Trade} profile={profile as Profile | null} />;
}
