import { NextResponse } from "next/server";

// Profile cache is now React.cache() (per-request deduplication only),
// so there is nothing to invalidate between requests.
// This endpoint is kept as a no-op to avoid breaking SettingsClient.tsx.
export async function POST() {
  return NextResponse.json({ ok: true });
}
