import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type { Trade, Profile } from "@/types";
import TradeDetailClient from "./TradeDetailClient";

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: trade }, { data: profile }] = await Promise.all([
    supabase.from("trades").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  if (!trade) notFound();

  return <TradeDetailClient trade={trade as Trade} profile={profile as Profile | null} />;
}
