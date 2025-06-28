export type Language = "pt" | "en";

export interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
}

export type TranslationKey = string;

export interface TranslationFunction {
  (key: TranslationKey): string;
}
