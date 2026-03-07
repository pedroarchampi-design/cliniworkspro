import { useState, useEffect, useCallback } from "react";
import type { Lang } from "@/lib/i18n";

const STORAGE_KEY = "deltascan_lang";

function detectInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && (["pt", "en", "es"] as Lang[]).includes(stored)) return stored;
  } catch {}
  try {
    const nav = navigator.language?.toLowerCase() ?? "";
    if (nav.startsWith("pt")) return "pt";
    if (nav.startsWith("es")) return "es";
  } catch {}
  return "pt";
}

let _currentLang: Lang = detectInitialLang();
const _listeners = new Set<() => void>();

function notifyAll() {
  _listeners.forEach(fn => fn());
}

export function setGlobalLang(lang: Lang) {
  if (_currentLang === lang) return;
  _currentLang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  notifyAll();
}

export function getGlobalLang(): Lang {
  return _currentLang;
}

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>(_currentLang);

  useEffect(() => {
    const listener = () => setLangState(_currentLang);
    _listeners.add(listener);
    listener();
    return () => { _listeners.delete(listener); };
  }, []);

  const setLang = useCallback((l: Lang) => setGlobalLang(l), []);

  return { lang, setLang };
}
