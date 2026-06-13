import React, { createContext, useContext, useState } from 'react';
import { translations, type Language, type Translations } from './i18n';

const LANG_KEY = 'kuhanje_lang';

interface LangContextValue {
  lang: Language | null;
  setLang: (l: Language) => void;
  t: Translations;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language | null>(() => {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'hr' || stored === 'en') return stored;
    return null;
  });

  const setLang = (l: Language) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
  };

  const t = translations[lang ?? 'hr'];

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
