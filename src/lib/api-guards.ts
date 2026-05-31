import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCachedProfile, getUserId } from "@/lib/supabase/auth";
import { isProPlan } from "@/lib/plans";
import type { Profile } from "@/types";

const RATE_LIMIT_WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

export async function requireApiUser() {
  const userId = await getUserId();
  if (!userId) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }

  const profile = await getCachedProfile(userId);
  if (!profile) {
    return { error: NextResponse.json({ error: "profile_not_found" }, { status: 403 }) };
  }

  return { userId, profile: profile as Profile };
}

export async function requireProApiUser() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth;
  if (!isProPlan(auth.profile)) {
    return { error: NextResponse.json({ error: "pro_required" }, { status: 403 }) };
  }
  return auth;
}

export function rateLimit(req: NextRequest, key: string, limit: number) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip") || "unknown";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  if (bucket.count >= limit) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  bucket.count += 1;
  return null;
}

export async function getTradeCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("trades")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}
