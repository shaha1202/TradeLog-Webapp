import { getUserId, getCachedProfile } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import type { Profile } from "@/types";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const profile = await getCachedProfile(userId);

  return <SettingsClient profile={profile as Profile | null} userId={userId} />;
}
