"use client";

import { useLanguage, LANG_LABELS, type Language } from "@/lib/i18n";

const LANGS: Language[] = ["en", "uz", "ru"];

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`flex items-center gap-1 ${compact ? "" : "bg-surface2 border border-border rounded-lg p-0.5"}`}>
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2 py-1 rounded-md text-[11px] font-medium font-dm-mono transition-colors cursor-pointer border-none ${
            lang === l
              ? "bg-text text-bg"
              : "text-text-3 hover:text-text-2 bg-transparent"
          }`}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
