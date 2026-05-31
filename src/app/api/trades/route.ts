import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FREE_TRADE_LIMIT, isProPlan } from "@/lib/plans";
import { getTradeCount, requireApiUser } from "@/lib/api-guards";

type TradePayload = {
  asset?: string | null;
  pnl?: number | null;
  [key: string]: unknown;
};

export async function POST(req: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const payload = await req.json() as TradePayload;
  if (!payload.asset) {
    return NextResponse.json({ error: "asset_required" }, { status: 400 });
  }

  const currentTradeCount = await getTradeCount(auth.userId);
  if (!isProPlan(auth.profile) && currentTradeCount >= FREE_TRADE_LIMIT) {
    return NextResponse.json({ error: "free_trade_limit_reached" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trades")
    .insert({ ...payload, user_id: auth.userId })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const pnl = typeof payload.pnl === "number" ? payload.pnl : null;
  if (auth.profile.account_balance && pnl && pnl !== 0) {
    await supabase
      .from("profiles")
      .update({ account_balance: auth.profile.account_balance + pnl })
      .eq("id", auth.userId);
  }

  return NextResponse.json({ ok: true, tradeId: data?.id });
}
