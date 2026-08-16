import {
  DEFAULT_LANGUAGE,
  type Language,
} from "@/lib/i18n/language";
import {
  localeFromLanguage,
  type LocaleTag,
} from "@/lib/i18n/locale";

type DateFormatOptions = {
  language?: Language;
  locale?: LocaleTag;
};

type RelativeDateOptions = DateFormatOptions & {
  now?: Date;
};

function resolveLocaleFromOptions(options: DateFormatOptions): LocaleTag {
  if (options.locale) return options.locale;
  return localeFromLanguage(options.language ?? DEFAULT_LANGUAGE);
}

export function formatRelativeDateFromUnixSeconds(
  timestampSeconds: number,
  options: RelativeDateOptions = {},
): string {
  const date = new Date(timestampSeconds * 1000);
  const now = options.now ?? new Date();
  const diff = now.getTime() - date.getTime();
  const absDiff = Math.abs(diff);
  const minutes = Math.floor(absDiff / (1000 * 60));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const locale = resolveLocaleFromOptions(options);

  if (locale === "zh-CN") {
    if (diff < 60 * 1000) return "刚刚";
    if (diff < 60 * 60 * 1000) return `${minutes} 分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${hours} 小时前`;
    if (days === 0) return "今天";
    if (days === 1) return "昨天";
    if (days < 7) return `${days} 天前`;
    if (days < 30) return `${Math.floor(days / 7)} 周前`;
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  }

  if (diff < 60 * 1000) return "just now";
  if (diff < 60 * 60 * 1000) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (diff < 24 * 60 * 60 * 1000) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

export function formatRelativeTimeFromUnixSeconds(
  timestampSeconds: number,
  options: RelativeDateOptions = {},
): string {
  const date = new Date(timestampSeconds * 1000);
  const now = options.now ?? new Date();
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  const minutes = Math.round(absDiff / (1000 * 60));
  const hours = Math.round(absDiff / (1000 * 60 * 60));
  const days = Math.round(absDiff / (1000 * 60 * 60 * 24));
  const locale = resolveLocaleFromOptions(options);
  const isFuture = diff > 0;

  if (locale === "zh-CN") {
    if (absDiff < 60 * 1000) {
      return isFuture ? "马上" : "刚刚";
    }
    if (absDiff < 60 * 60 * 1000) {
      return isFuture ? `${minutes} 分钟后` : `${minutes} 分钟前`;
    }
    if (absDiff < 24 * 60 * 60 * 1000) {
      return isFuture ? `${hours} 小时后` : `${hours} 小时前`;
    }
    return isFuture ? `${days} 天后` : `${days} 天前`;
  }

  if (absDiff < 60 * 1000) {
    return isFuture ? "soon" : "just now";
  }
  if (absDiff < 60 * 60 * 1000) {
    return isFuture
      ? `in ${minutes} minute${minutes === 1 ? "" : "s"}`
      : `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (absDiff < 24 * 60 * 60 * 1000) {
    return isFuture
      ? `in ${hours} hour${hours === 1 ? "" : "s"}`
      : `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  return isFuture
    ? `in ${days} day${days === 1 ? "" : "s"}`
    : `${days} day${days === 1 ? "" : "s"} ago`;
}

export function formatMonthDayFromUnixSeconds(
  timestampSeconds: number,
  options: DateFormatOptions = {},
): string {
  const locale = resolveLocaleFromOptions(options);
  return new Date(timestampSeconds * 1000).toLocaleDateString(locale, {
    month: "numeric",
    day: "numeric",
  });
}

export function formatDateTimeFromUnixSeconds(
  timestampSeconds: number,
  options: DateFormatOptions = {},
): string {
  const locale = resolveLocaleFromOptions(options);
  return new Date(timestampSeconds * 1000).toLocaleString(locale);
}
