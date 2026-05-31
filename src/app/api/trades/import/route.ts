import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FREE_TRADE_LIMIT, isProPlan } from "@/lib/plans";
import { getTradeCount, requireApiUser } from "@/lib/api-guards";

type ImportTradePayload = {
  asset: string | null;
  direction: "LONG" | "SHORT" | null;
  entry: number | null;
  sl: number | null;
  tp: number | null;
  rr: number | null;
  lot_size: number | null;
  pnl: number | null;
  result: "win" | "loss" | "be" | null;
  created_at: string;
};

export async function POST(req: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const { trades } = await req.json() as { trades?: ImportTradePayload[] };
  if (!Array.isArray(trades) || trades.length === 0) {
    return NextResponse.json({ error: "no_trades" }, { status: 400 });
  }

  const currentTradeCount = await getTradeCount(auth.userId);
  const allowedTrades = isProPlan(auth.profile)
    ? trades
    : trades.slice(0, Math.max(0, FREE_TRADE_LIMIT - currentTradeCount));

  if (allowedTrades.length === 0) {
    return NextResponse.json({ error: "free_trade_limit_reached", imported: 0 }, { status: 403 });
  }

  const supabase = await createClient();
  let imported = 0;
  for (let i = 0; i < allowedTrades.length; i += 50) {
    const batch = allowedTrades.slice(i, i + 50).map((trade) => ({
      ...trade,
      user_id: auth.userId,
    }));
    const { error } = await supabase.from("trades").insert(batch);
    if (error) {
      return NextResponse.json({ error: error.message, imported }, { status: 400 });
    }
    imported += batch.length;
  }

  return NextResponse.json({ ok: true, imported });
}
