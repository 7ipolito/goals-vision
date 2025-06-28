"use client";

import { useLanguage } from "../../../contexts/LanguageContext";
import { LanguageConfig } from "../../../types/language";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages: LanguageConfig[] = [
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "en", name: "English", flag: "🇺🇸" },
  ];

  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
      <div className="flex gap-1 md:gap-2 bg-white/10 backdrop-blur-md rounded-lg p-1.5 md:p-2 border border-white/20">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-md transition-all duration-200 ${
              language === lang.code
                ? "bg-white/20 text-white shadow-lg"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-base md:text-lg">{lang.flag}</span>
            <span className="text-xs md:text-sm font-medium hidden sm:block">
              {lang.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
