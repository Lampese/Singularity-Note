import {
  DEFAULT_LANGUAGE,
  resolveLanguage,
  type Language,
} from "@/lib/i18n/language";

export type LocaleTag = Language;

export const DEFAULT_LOCALE: LocaleTag = DEFAULT_LANGUAGE;

export function localeFromLanguage(language: Language): LocaleTag {
  return language;
}

export function resolveLocale(
  ...candidates: Array<string | null | undefined>
): LocaleTag {
  return localeFromLanguage(resolveLanguage(...candidates));
}

export function resolveUiLanguage(): Language {
  if (typeof document === "undefined") return DEFAULT_LANGUAGE;
  const browserLang = typeof navigator !== "undefined" ? navigator.language : undefined;
  return resolveLanguage(document.documentElement.lang, browserLang);
}

export function resolveUiLocale(): LocaleTag {
  return localeFromLanguage(resolveUiLanguage());
}

