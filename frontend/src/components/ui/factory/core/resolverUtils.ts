import type {
  ControlSpec,
  PartialResolvedControl,
  ResolvedControl,
} from "./primaryTypes";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function mergeClassNames(
  baseClassName: string | undefined,
  nextClassName: string | undefined,
): string | undefined {
  const merged = twMerge(clsx(baseClassName, nextClassName));
  return merged.length > 0 ? merged : undefined;
}

export function mergeResolvedControl(
  previous: PartialResolvedControl,
  next: PartialResolvedControl,
): PartialResolvedControl {
  return {
    rootClassName: mergeClassNames(previous.rootClassName, next.rootClassName),
    rootStyle: { ...(previous.rootStyle ?? {}), ...(next.rootStyle ?? {}) },
    contentClassName: mergeClassNames(previous.contentClassName, next.contentClassName),
    contentStyle: { ...(previous.contentStyle ?? {}), ...(next.contentStyle ?? {}) },
    leadingClassName: mergeClassNames(previous.leadingClassName, next.leadingClassName),
    trailingClassName: mergeClassNames(previous.trailingClassName, next.trailingClassName),
    indicatorClassName: mergeClassNames(previous.indicatorClassName, next.indicatorClassName),
  };
}

export function createBaseResolvedControl(spec: ControlSpec): ResolvedControl {
  const slotOverrides = spec.slots ?? {};

  return {
    rootClassName: mergeClassNames(
      "inline-flex items-center justify-center select-none transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
      slotOverrides.rootClassName,
    ) ??
      "inline-flex items-center justify-center select-none transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
    rootStyle: slotOverrides.rootStyle,
    contentClassName: mergeClassNames(
      "inline-flex items-center justify-center whitespace-nowrap",
      slotOverrides.contentClassName,
    ) ?? "inline-flex items-center justify-center whitespace-nowrap",
    contentStyle: slotOverrides.contentStyle,
    leadingClassName: mergeClassNames(
      "inline-flex shrink-0 items-center",
      slotOverrides.leadingClassName,
    ) ?? "inline-flex shrink-0 items-center",
    trailingClassName: mergeClassNames(
      "inline-flex shrink-0 items-center",
      slotOverrides.trailingClassName,
    ) ?? "inline-flex shrink-0 items-center",
    indicatorClassName: mergeClassNames(
      "inline-flex shrink-0 items-center",
      slotOverrides.indicatorClassName,
    ) ?? "inline-flex shrink-0 items-center",
  };
}

export function clampPositiveNumber(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
