import { useLanguage } from "../contexts/LanguageContext";
import ptTranslations from "../locales/pt.json";
import enTranslations from "../locales/en.json";

type TranslationObject = Record<string, unknown>;

const translations = {
  pt: ptTranslations as TranslationObject,
  en: enTranslations as TranslationObject,
};

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: unknown = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && value !== null && k in value) {
        value = (value as TranslationObject)[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === "string" ? value : key;
  };

  return { t, language };
}
