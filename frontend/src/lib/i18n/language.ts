export const LANGUAGE_VALUES = ["zh-CN", "en-US"] as const;
export type Language = (typeof LANGUAGE_VALUES)[number];

export const DEFAULT_LANGUAGE: Language = "zh-CN";

export function normalizeLanguage(value: string | null | undefined): Language | undefined {
    if (!value) return undefined;
    const normalized = value.trim().toLowerCase();
    if (normalized.startsWith("zh")) return "zh-CN";
    if (normalized.startsWith("en")) return "en-US";
    return undefined;
}

export function resolveLanguage(...candidates: Array<string | null | undefined>): Language {
    for (const candidate of candidates) {
        const lang = normalizeLanguage(candidate);
        if (lang) return lang;
    }
    return DEFAULT_LANGUAGE;
}
