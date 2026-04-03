import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const stats = await req.json();

    const LANG_NAMES: Record<string, string> = { en: "English", ru: "Russian", uz: "Uzbek" };
    const langName = LANG_NAMES[stats.lang ?? "uz"] ?? "Uzbek";

    const prompt = `You are a professional trading coach. Analyze these trading statistics and respond ONLY with a JSON object.

Stats (${stats.days} days):
- Trades: ${stats.total}, Win: ${stats.wins}, Loss: ${stats.losses}
- Win rate: ${stats.winRate}%, Avg R:R: ${stats.avgRR}, Profit factor: ${stats.profitFactor}
- Total P&L: $${stats.totalPnl}
- Top mood: ${stats.topMood ?? "N/A"}
- Assets: ${stats.assetSummary}
- Avg plan adherence: ${stats.avgAdherence}/5

Respond ONLY with this JSON (all text in ${langName}):
{
  "general": "2-3 sentence overall assessment of the trader's performance",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "insight": "1 specific, actionable key insight for this trader"
}

Rules:
- WR < 45%: focus on psychology/entry quality in improvements
- WR > 45% but RR < 1.5: mention TP widening in improvements
- PF < 1: mention risk management in improvements
- WR > 55% and RR > 2: give strong praise in general
- Be specific, reference their actual numbers`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "parse_failed" }, { status: 500 });
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Stats insight error:", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
