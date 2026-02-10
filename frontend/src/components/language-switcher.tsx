"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

type Language = "en" | "fr";

export function LanguageSwitcher({ isCollapsed }: { isCollapsed?: boolean }) {
  const [lang, setLang] = useState<Language>("en");

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("praxia-lang") as Language;
    if (saved) {
      setLang(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const toggleLanguage = () => {
    const newLang: Language = lang === "en" ? "fr" : "en";
    setLang(newLang);
    localStorage.setItem("praxia-lang", newLang);
    document.documentElement.lang = newLang;
    // Reload page to apply new language (simple approach)
    window.location.reload();
  };

  if (isCollapsed) {
    return (
      <button
        onClick={toggleLanguage}
        className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent transition-colors group relative"
        title={lang === "en" ? "Switch to French" : "Passer en Anglais"}
      >
        <Globe className="w-4 h-4" />
        <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 border shadow-md">
          {lang.toUpperCase()}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-accent transition-colors w-full"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{lang === "en" ? "English" : "Français"}</span>
      <span className="ml-auto text-muted-foreground">{lang.toUpperCase()}</span>
    </button>
  );
}
