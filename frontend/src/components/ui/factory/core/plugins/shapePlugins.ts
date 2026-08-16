import type { CSSProperties } from "react";
import type { ControlSize, ShapePlugin, ControlSpec } from "../primaryTypes";
import { clampPositiveNumber } from "../resolverUtils";

function resolveSizeClass(size: ControlSize): string {
  if (size.kind === "fixed") {
    return "";
  }

  if (size.density === "compact") {
    return "h-[var(--size-control-compact)]";
  }
  if (size.density === "touch") {
    return "h-[var(--size-control-touch)]";
  }
  return "h-[var(--size-control-comfortable)]";
}

function resolveRoundWidthClass(size: ControlSize): string {
  if (size.kind === "fixed") {
    return "";
  }

  if (size.density === "compact") {
    return "w-[var(--size-control-compact)]";
  }
  if (size.density === "touch") {
    return "w-[var(--size-control-touch)]";
  }
  return "w-[var(--size-control-comfortable)]";
}

function resolveFixedStyle(spec: ControlSpec): CSSProperties | undefined {
  if (spec.geometry.size.kind !== "fixed") {
    return undefined;
  }

  const { height, width } = spec.geometry.size;
  const isRound = spec.geometry.shape === "round";
  const resolvedWidth = isRound ? height : width;

  return {
    height: `${height}px`,
    ...(typeof resolvedWidth === "number" ? { width: `${resolvedWidth}px` } : {}),
  };
}

function resolvePillGeometryStyle(spec: ControlSpec): CSSProperties | undefined {
  if (spec.geometry.shape !== "pill") return undefined;
  if (spec.geometry.size.kind !== "fixed") return undefined;

  const rawCoreWidth = spec.geometry.coreWidth;
  if (typeof rawCoreWidth !== "number" || !Number.isFinite(rawCoreWidth) || rawCoreWidth <= 0) {
    return undefined;
  }

  const totalHeight = clampPositiveNumber(spec.geometry.size.height, 40);
  const radius = totalHeight / 2;
  const fallbackInset = spec.geometry.padding.kind === "fixed" ? spec.geometry.padding.y : 0;
  const inset = Math.max(
    0,
    Math.min(
      clampPositiveNumber(spec.geometry.inset ?? fallbackInset, fallbackInset),
      radius - 0.5,
    ),
  );
  const minCoreWidth = inset * 2 + 1;
  const safeCoreWidth = Math.max(clampPositiveNumber(rawCoreWidth, 80), minCoreWidth);

  return {
    width: `${safeCoreWidth + totalHeight}px`,
    height: `${totalHeight}px`,
    borderRadius: `${radius}px`,
    paddingBlock: `${inset}px`,
    paddingInline: `${radius + inset}px`,
  };
}

function resolvePaddingClass(spec: ControlSpec): string {
  const { padding, shape } = spec.geometry;
  if (padding.kind === "fixed") {
    return "";
  }

  if (spec.content.kind === "icon") {
    return "p-0";
  }

  if (shape === "pill") {
    return "px-4";
  }

  if (shape === "round") {
    return "p-0";
  }

  return "px-3";
}

function resolveFixedPaddingStyle(spec: ControlSpec): CSSProperties | undefined {
  if (spec.geometry.padding.kind !== "fixed") {
    return undefined;
  }

  return {
    paddingBlock: `${spec.geometry.padding.y}px`,
    paddingInline: `${spec.geometry.padding.x}px`,
  };
}

export const shapePlugins: Record<ControlSpec["geometry"]["shape"], ShapePlugin> = {
  roundedRect: (spec) => ({
    rootClassName: [
      "rounded-[var(--radius-button)]",
      resolveSizeClass(spec.geometry.size),
      resolvePaddingClass(spec),
    ]
      .filter(Boolean)
      .join(" "),
    rootStyle: {
      ...resolveFixedStyle(spec),
      ...resolveFixedPaddingStyle(spec),
    },
  }),
  pill: (spec) => ({
    rootClassName: [
      "rounded-full",
      resolveSizeClass(spec.geometry.size),
      resolvePaddingClass(spec),
    ]
      .filter(Boolean)
      .join(" "),
    rootStyle: {
      ...resolveFixedStyle(spec),
      ...resolveFixedPaddingStyle(spec),
      ...resolvePillGeometryStyle(spec),
    },
  }),
  round: (spec) => ({
    rootClassName: [
      "rounded-full",
      resolveSizeClass(spec.geometry.size),
      resolveRoundWidthClass(spec.geometry.size),
      resolvePaddingClass(spec),
    ]
      .filter(Boolean)
      .join(" "),
    rootStyle: {
      ...resolveFixedStyle(spec),
      ...resolveFixedPaddingStyle(spec),
    },
  }),
};
