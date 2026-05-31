import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit, requireApiUser } from "@/lib/api-guards";
import { requireServerEnv } from "@/lib/env";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  ru: "Russian",
  uz: "Uzbek",
};

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "translate", 12);
  if (limited) return limited;

  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const anthropic = new Anthropic({ apiKey: requireServerEnv("ANTHROPIC_API_KEY") });
  try {
    const { texts, lang } = await req.json() as { texts: string[]; lang: string };

    if (!texts || !Array.isArray(texts) || texts.length === 0 || lang === "uz") {
      return NextResponse.json({ translations: texts });
    }
    if (texts.length > 50 || texts.some((text) => text.length > 2000)) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }

    const langName = LANG_NAMES[lang] ?? lang;

    const prompt = `Translate the following JSON array of strings to ${langName}. Keep the same tone and meaning. Return ONLY a valid JSON array of translated strings in the exact same order, no extra text.

${JSON.stringify(texts)}`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text.trim() : "[]";
    const arrMatch = text.match(/\[[\s\S]*\]/);
    if (!arrMatch) return NextResponse.json({ translations: texts });

    const translations = JSON.parse(arrMatch[0]);
    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Translate error:", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
