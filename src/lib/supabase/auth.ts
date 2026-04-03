import { cache } from "react";
import { headers } from "next/headers";
import { createClient } from "./server";
import type { Profile } from "@/types";

/**
 * React.cache() deduplicates getUser() within a single render tree.
 * Layout + page in the same request share this result — only 1 network call.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

/**
 * Fetch profile for userId. React.cache() deduplicates within the same request
 * so layout + page both calling this only results in 1 DB query.
 */
export const getCachedProfile = cache(async (userId: string): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data as Profile | null;
});

/**
 * Fast userId lookup: reads x-user-id header set by middleware.
 * Falls back to getAuthUser() (React.cache hit if already called this render).
 */
export async function getUserId(): Promise<string | null> {
  try {
    const h = await headers();
    const id = h.get("x-user-id");
    if (id) return id;
  } catch {
    // headers() can throw outside of request context
  }
  const user = await getAuthUser();
  return user?.id ?? null;
}
