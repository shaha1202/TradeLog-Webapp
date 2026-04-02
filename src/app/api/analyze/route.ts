import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const { image, mimeType, balance, risk } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const prompt = `Analyze this TradingView chart screenshot.

IMPORTANT: TradingView position markers = TWO vertical rectangles.
Top rectangle = Stop Loss, bottom = Take Profit, boundary = Entry.
Identify by POSITION not color.
SHORT: Entry top, SL above, TP below. LONG: opposite.
Supply/Demand zones are wide horizontal labeled boxes — different from position markers.

Account: Balance=$${balance ?? "unknown"}, Risk=${risk ?? 1}%

Respond ONLY in JSON:
{
  "asset": "pair name",
  "timeframe": "tf",
  "session": "session or null",
  "direction": "LONG or SHORT or null",
  "entry": number_or_null,
  "sl": number_or_null,
  "tp": number_or_null,
  "trend": "HTF trend description",
  "narrative": "3-4 sentences in Uzbek: chart structure, key zones, setup description",
  "feedback": "2-3 sentences in Uzbek: setup strengths, weaknesses, recommendation (or null if disabled)"
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: (mimeType || "image/png") as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
                data: image,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
