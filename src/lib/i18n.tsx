"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import en from "@/locales/en.json";
import th from "@/locales/th.json";
import zh from "@/locales/zh.json";

export type Locale = "th" | "en" | "zh";

const LOCALES_DATA: Record<Locale, typeof th> = { th, en: en as typeof th, zh: zh as typeof th };

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  tr: (key: string) => string;
};

function lookup(obj: Record<string, unknown>, key: string): string {
  const parts = key.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else return key;
  }
  return typeof cur === "string" ? cur : key;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "th",
  setLocale: () => {},
  tr: (key) => lookup(th as unknown as Record<string, unknown>, key),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("th");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("u-locale") as Locale | null;
      if (saved && (saved === "th" || saved === "en" || saved === "zh")) setLocaleState(saved);
    } catch {}
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("u-locale", l); } catch {}
    document.documentElement.lang = l === "zh" ? "zh-CN" : l;
  }, []);

  const tr = useCallback((key: string) => lookup(LOCALES_DATA[locale] as unknown as Record<string, unknown>, key), [locale]);

  return <I18nContext.Provider value={{ locale, setLocale, tr }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useLocale(): typeof th {
  const { locale } = useContext(I18nContext);
  return LOCALES_DATA[locale];
}

export const LOCALE_LABELS: Record<Locale, string> = { th: "ไทย", en: "English", zh: "中文" };
