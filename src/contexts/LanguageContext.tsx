"use client";

import { useState, useEffect, useCallback } from "react";
import { LanguageContext, type Language, type Translations, translations as T } from "@/lib/i18n";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Language | null;
    if (saved && (saved === "en" || saved === "uz" || saved === "ru")) {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem("app_lang", l);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: T[lang] as Translations }}>
      {children}
    </LanguageContext.Provider>
  );
}
