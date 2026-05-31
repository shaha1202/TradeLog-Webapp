import { NextRequest, NextResponse } from "next/server";
import Whop from "@whop/sdk";
import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv, requireServerEnv } from "@/lib/env";

function getSupabaseAdmin() {
  const { url } = getPublicSupabaseEnv();
  return createClient(
    url,
    requireServerEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

export async function POST(req: NextRequest) {
  const whop = new Whop({ apiKey: requireServerEnv("WHOP_API_KEY") });
  const body = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let event;
  try {
    event = whop.webhooks.unwrap(body, {
      headers,
      key: requireServerEnv("WHOP_WEBHOOK_SECRET"),
    });
  } catch {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (
    event.type === "membership.activated" ||
    event.type === "membership.cancel_at_period_end_changed"
  ) {
    const membership = event.data;

    // Try to get email from metadata first, then from Whop API
    const userId = membership.metadata?.userId as string | undefined;
    const expiresAt = membership.renewal_period_end
      ? new Date(Number(membership.renewal_period_end) * 1000).toISOString()
      : null;

    if (userId) {
      // Direct match by Supabase user ID from metadata
      await supabase
        .from("profiles")
        .update({ plan: "pro_monthly", plan_expires_at: expiresAt })
        .eq("id", userId);
    } else {
      // Fallback: retrieve full membership from Whop API to get user email
      try {
        const fullMembership = await whop.memberships.retrieve(membership.id);
        const userEmail = (fullMembership as { user?: { email?: string } })?.user?.email as string | undefined;

        if (userEmail) {
          await supabase
            .from("profiles")
            .update({ plan: "pro_monthly", plan_expires_at: expiresAt })
            .eq("email", userEmail);
        }
      } catch (err) {
        console.error("Failed to retrieve membership from Whop:", err);
      }
    }
  }

  if (event.type === "membership.deactivated") {
    const membership = event.data;
    const userId = membership.metadata?.userId as string | undefined;

    if (userId) {
      await supabase
        .from("profiles")
        .update({ plan: "free", plan_expires_at: null })
        .eq("id", userId);
    } else {
      try {
        const fullMembership = await whop.memberships.retrieve(membership.id);
        const userEmail = (fullMembership as { user?: { email?: string } })?.user?.email as string | undefined;

        if (userEmail) {
          await supabase
            .from("profiles")
            .update({ plan: "free", plan_expires_at: null })
            .eq("email", userEmail);
        }
      } catch (err) {
        console.error("Failed to retrieve membership from Whop:", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
