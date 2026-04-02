import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const stats = await req.json();

    const prompt = `You are a professional trading coach. Analyze these trading statistics and give 3-4 sentences of specific, actionable advice in Uzbek.

Stats (${stats.days} days):
- Trades: ${stats.total}, Win: ${stats.wins}, Loss: ${stats.losses}
- Win rate: ${stats.winRate}%, Avg R:R: ${stats.avgRR}, Profit factor: ${stats.profitFactor}
- Total P&L: $${stats.totalPnl}
- Top mood: ${stats.topMood ?? "N/A"}
- Assets: ${stats.assetSummary}
- Avg plan adherence: ${stats.avgAdherence}/5

Rules:
- WR < 45%: mention psychology or overtrading
- WR > 45% but RR < 1.5: suggest wider TP
- PF < 1: mention risk management
- All good (WR>55%, RR>2, PF>1.5): praise and encourage
Be specific and practical, no generic advice.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return new NextResponse(text, { headers: { "Content-Type": "text/plain" } });
  } catch (error) {
    console.error("Stats insight error:", error);
    return new NextResponse("Tahlil amalga oshmadi.", { status: 500 });
  }
}
