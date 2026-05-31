import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, requireProApiUser } from "@/lib/api-guards";
import { requireServerEnv } from "@/lib/env";
import type { Trade } from "@/types";

const LANG_NAMES: Record<string, string> = { en: "English", ru: "Russian", uz: "Uzbek" };

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "weekly-review", 4);
  if (limited) return limited;

  const auth = await requireProApiUser();
  if ("error" in auth) return auth.error;

  const { lang } = await req.json().catch(() => ({ lang: "uz" })) as { lang?: string };
  const langName = LANG_NAMES[lang ?? "uz"] ?? "Uzbek";
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const supabase = await createClient();
  const { data } = await supabase
    .from("trades")
    .select("asset,session,direction,result,pnl,rr,mood,mistake_tags,rule_checklist,plan_adherence,created_at")
    .eq("user_id", auth.userId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  const trades = (data ?? []) as Trade[];
  if (trades.length === 0) {
    return NextResponse.json({ error: "no_trades" }, { status: 400 });
  }

  const totalPnl = trades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0);
  const losses = trades.filter((trade) => (trade.pnl ?? 0) < 0);
  const mistakes = trades.flatMap((trade) => trade.mistake_tags ?? []);
  const brokenRules = trades.flatMap((trade) =>
    Object.entries(trade.rule_checklist ?? {})
      .filter(([, checked]) => !checked)
      .map(([rule]) => rule)
  );

  const prompt = `You are a trading performance coach. Create a weekly review in ${langName}.

Stats:
- Trades: ${trades.length}
- Total P&L: ${totalPnl.toFixed(2)}
- Loss trades: ${losses.length}
- Mistakes: ${mistakes.join(", ") || "none tagged"}
- Broken rules: ${brokenRules.join(", ") || "none"}
- Trades JSON: ${JSON.stringify(trades.slice(0, 30))}

Return ONLY JSON:
{
  "summary": "2 short sentences",
  "mainLeak": "biggest leak from tags/rules/session/asset/direction",
  "action": "one concrete action for next week",
  "focus": ["focus item 1", "focus item 2"]
}`;

  const anthropic = new Anthropic({ apiKey: requireServerEnv("ANTHROPIC_API_KEY") });
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "parse_failed" }, { status: 500 });
  }

  return NextResponse.json(JSON.parse(jsonMatch[0]));
}
