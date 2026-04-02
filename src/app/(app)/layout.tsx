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

  const [profileResult, tradesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("trades").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);
  const { data: profile } = profileResult;
  const { data: trades } = tradesResult;

  return (
    <AppShell profile={profile as Profile | null} trades={(trades ?? []) as Trade[]}>
      {children}
    </AppShell>
  );
}
