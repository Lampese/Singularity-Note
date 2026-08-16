"use client";

import * as React from "react";
import { CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  BUTTON_SIZE_OVERRIDES,
  buttonFactory,
  iconButtonFactory,
  normalizeButtonRecipe,
  toggleButtonFactory,
  type ExtendedButtonSize,
} from "./factories";

export type ControlButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "quiet"
  | "dangerGhost"
  | "dangerOutline"
  | "toolbar"
  | "toolbarActive"
  | "floating"
  | "menuPrimary"
  | "menuProminent"
  | "menuGhost"
  | "menuDanger"
  | "menuDangerSubtle"
  | "textAction"
  | "unstyled";

type RuntimeStateKey = "default" | "active" | "pressed" | "disabled";
type RuntimeStateMap<T> = Partial<Record<RuntimeStateKey, T>>;

type RuntimeStateInput = {
  active?: boolean;
  pressed?: boolean;
  disabled?: boolean;
};

function resolveRuntimeStateValue<T>(
  fallback: T,
  stateMap: RuntimeStateMap<T> | undefined,
  runtime: RuntimeStateInput,
): T {
  if (!stateMap) return fallback;
  if (runtime.disabled && stateMap.disabled) return stateMap.disabled;
  if (runtime.pressed && stateMap.pressed) return stateMap.pressed;
  if (runtime.active && stateMap.active) return stateMap.active;
  return stateMap.default ?? fallback;
}

export interface ControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ControlButtonVariant;
  size?: ExtendedButtonSize;
  active?: boolean;
  variantByState?: RuntimeStateMap<ControlButtonVariant>;
  sizeByState?: RuntimeStateMap<ExtendedButtonSize>;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

function resolveButtonContentKind(
  size: ExtendedButtonSize,
  leading: React.ReactNode,
  trailing: React.ReactNode,
): "text" | "icon" | "mixed" {
  if (
    size === "icon" ||
    size === "iconXs" ||
    size === "iconSm" ||
    size === "iconMd" ||
    size === "iconLg"
  ) {
    return "icon";
  }
  if (leading || trailing) return "mixed";
  return "text";
}

const GEOMETRY_FREE_BUTTON_VARIANTS = new Set<ControlButtonVariant>([
  "textAction",
  "link",
  "unstyled",
]);

function resolveTextualSizeClass(size: ExtendedButtonSize): string | undefined {
  if (size === "xs" || size === "sm") return "text-xs";
  return undefined;
}

export const ControlButton = React.forwardRef<HTMLButtonElement, ControlButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      active = false,
      variantByState,
      sizeByState,
      leading,
      trailing,
      children,
      disabled,
      style,
      type,
      ...rest
    },
    ref,
  ) => {
    const resolvedVariant = resolveRuntimeStateValue(
      variant,
      variantByState,
      { disabled, active },
    );
    const resolvedSize = resolveRuntimeStateValue(
      size,
      sizeByState,
      { disabled, active },
    );
    const geometryFree = GEOMETRY_FREE_BUTTON_VARIANTS.has(resolvedVariant);
    const normalizedClassName = geometryFree
      ? cn("h-auto px-0 py-0", resolveTextualSizeClass(resolvedSize), className)
      : className;
    const sizeOverride = BUTTON_SIZE_OVERRIDES[resolvedSize];
    const contentOverride = {
      ...sizeOverride.content,
      kind: resolveButtonContentKind(resolvedSize, leading, trailing),
    };

    const resolved = buttonFactory.renderProps({
      recipe: normalizeButtonRecipe(resolvedVariant),
      runtime: { disabled, active },
      className: normalizedClassName,
      specOverride: geometryFree ? { content: contentOverride } : { ...sizeOverride, content: contentOverride },
    });

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={resolved.rootClassName}
        style={{ ...(resolved.rootStyle ?? {}), ...(style ?? {}) }}
        disabled={disabled}
        {...rest}
      >
        <span className={resolved.contentClassName} style={resolved.contentStyle}>
          {leading ? <span className={resolved.leadingClassName}>{leading}</span> : null}
          {children}
          {trailing ? <span className={resolved.trailingClassName}>{trailing}</span> : null}
        </span>
      </button>
    );
  },
);

ControlButton.displayName = "ControlButton";

export interface ControlIconButtonProps
  extends Omit<
    ControlButtonProps,
    "leading" | "trailing" | "size" | "sizeByState"
  > {
  icon: React.ReactNode;
  size?: Extract<ExtendedButtonSize, "icon" | "iconXs" | "iconSm" | "iconMd" | "iconLg">;
  sizeByState?: RuntimeStateMap<
    Extract<ExtendedButtonSize, "icon" | "iconXs" | "iconSm" | "iconMd" | "iconLg">
  >;
}

export const ControlIconButton = React.forwardRef<
  HTMLButtonElement,
  ControlIconButtonProps
>(
  (
    {
      className,
      variant = "toolbar",
      variantByState,
      active = false,
      icon,
      children,
      disabled,
      size = "icon",
      sizeByState,
      style,
      type,
      ...rest
    },
    ref,
  ) => {
  const resolvedVariant = resolveRuntimeStateValue(
    variant,
    variantByState,
    { disabled, active },
  );
  const resolvedSize = resolveRuntimeStateValue(
    size,
    sizeByState,
    { disabled, active },
  );

  const resolved = iconButtonFactory.renderProps({
    recipe: normalizeButtonRecipe(resolvedVariant),
    runtime: { disabled, active },
    className,
    specOverride: BUTTON_SIZE_OVERRIDES[resolvedSize],
  });

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={resolved.rootClassName}
      style={{ ...(resolved.rootStyle ?? {}), ...(style ?? {}) }}
      disabled={disabled}
      {...rest}
    >
      <span className={resolved.contentClassName} style={resolved.contentStyle}>
        {icon}
        {children}
      </span>
    </button>
  );
  },
);

ControlIconButton.displayName = "ControlIconButton";

export interface ControlToggleButtonProps
  extends Omit<ControlButtonProps, "variant"> {
  pressed?: boolean;
  variant?: ControlButtonVariant;
  size?: ExtendedButtonSize;
}

export const ControlToggleButton = React.forwardRef<
  HTMLButtonElement,
  ControlToggleButtonProps
>(
  (
    {
      className,
      variant = "ghost",
      variantByState,
      pressed = false,
      active = false,
      disabled,
      size = "default",
      sizeByState,
      style,
      children,
      type,
      ...rest
    },
    ref,
  ) => {
  const resolvedVariant = resolveRuntimeStateValue(
    variant,
    variantByState,
    { disabled, pressed, active: active || pressed },
  );
  const resolvedSize = resolveRuntimeStateValue(
    size,
    sizeByState,
    { disabled, pressed, active: active || pressed },
  );

  const resolved = toggleButtonFactory.renderProps({
    recipe: normalizeButtonRecipe(resolvedVariant),
    runtime: { disabled, pressed, active: active || pressed },
    className,
    specOverride: {
      ...BUTTON_SIZE_OVERRIDES[resolvedSize],
      content: {
        ...BUTTON_SIZE_OVERRIDES[resolvedSize].content,
        kind: resolveButtonContentKind(resolvedSize, undefined, undefined),
      },
    },
  });

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={resolved.rootClassName}
      style={{ ...(resolved.rootStyle ?? {}), ...(style ?? {}) }}
      aria-pressed={pressed}
      disabled={disabled}
      {...rest}
    >
      <span className={resolved.contentClassName} style={resolved.contentStyle}>
        {children}
      </span>
    </button>
  );
  },
);

ControlToggleButton.displayName = "ControlToggleButton";

export interface ControlSurfaceButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: React.ReactNode;
  variant?: ControlButtonVariant;
  active?: boolean;
  variantByState?: RuntimeStateMap<ControlButtonVariant>;
}

export const ControlSurfaceButton = React.forwardRef<
  HTMLButtonElement,
  ControlSurfaceButtonProps
>(
  (
    {
      className,
      variant = "outline",
      active = false,
      variantByState,
      disabled,
      style,
      children,
      type,
      ...rest
    },
    ref,
  ) => {
  const resolvedVariant = resolveRuntimeStateValue(
    variant,
    variantByState,
    { disabled, active },
  );

  const resolved = buttonFactory.renderProps({
    recipe: normalizeButtonRecipe(resolvedVariant),
    runtime: { disabled, active },
    className: cn("h-auto px-0 py-0", className),
    specOverride: {
      geometry: {
        shape: "roundedRect",
        size: { kind: "preset", density: "comfortable" },
        padding: { kind: "auto" },
      },
      content: {
        kind: "mixed",
        sizing: { kind: "auto" },
      },
      slots: {
        rootClassName:
          "w-full justify-start text-left rounded-[var(--radius-container)]",
      },
    },
  });

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={resolved.rootClassName}
      style={{ ...(resolved.rootStyle ?? {}), ...(style ?? {}) }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
  },
);

ControlSurfaceButton.displayName = "ControlSurfaceButton";

export type PillButtonGeometryInput = {
  height: number;
  coreWidth: number;
  inset: number;
};

export type PillButtonGeometry = {
  totalWidth: number;
  totalHeight: number;
  radius: number;
  contentWidth: number;
  contentHeight: number;
  contentInsetTop: number;
  contentInsetBottom: number;
  contentInsetLeft: number;
  contentInsetRight: number;
};

function sanitizePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function resolvePillButtonGeometry({
  height,
  coreWidth,
  inset,
}: PillButtonGeometryInput): PillButtonGeometry {
  const totalHeight = sanitizePositive(height, 40);
  const radius = totalHeight / 2;
  const safeInset = Math.max(0, Math.min(inset, radius - 0.5));
  const minCoreWidth = safeInset * 2 + 1;
  const safeCoreWidth = Math.max(sanitizePositive(coreWidth, 80), minCoreWidth);
  const totalWidth = safeCoreWidth + totalHeight;
  const contentInsetLeft = radius + safeInset;
  const contentInsetRight = radius + safeInset;
  const contentInsetTop = safeInset;
  const contentInsetBottom = safeInset;
  const contentWidth = Math.max(1, safeCoreWidth - safeInset * 2);
  const contentHeight = Math.max(1, totalHeight - safeInset * 2);

  return {
    totalWidth,
    totalHeight,
    radius,
    contentWidth,
    contentHeight,
    contentInsetTop,
    contentInsetBottom,
    contentInsetLeft,
    contentInsetRight,
  };
}

export interface ControlPillButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "destructive";
  height?: number;
  coreWidth?: number;
  inset?: number;
  contentClassName?: string;
}

export const ControlPillButton = React.forwardRef<
  HTMLButtonElement,
  ControlPillButtonProps
>(
  (
    {
      className,
      contentClassName,
      variant = "default",
      height = 40,
      coreWidth,
      inset = 8,
      children,
      style,
      disabled,
      type,
      ...props
    },
    ref,
  ) => {
    const safeHeight = sanitizePositive(height, 40);
    const radius = safeHeight / 2;
    const safeInset = Math.max(0, Math.min(inset, radius - 0.5));
    const hasFixedCoreWidth =
      typeof coreWidth === "number" && Number.isFinite(coreWidth) && coreWidth > 0;
    const g = hasFixedCoreWidth
      ? resolvePillButtonGeometry({
          height: safeHeight,
          coreWidth,
          inset: safeInset,
        })
      : null;

    const resolved = buttonFactory.renderProps({
      recipe: normalizeButtonRecipe(variant),
      runtime: { disabled },
      specOverride: {
        geometry: {
          shape: "pill",
          size: { kind: "fixed", height: safeHeight },
          coreWidth: hasFixedCoreWidth ? coreWidth : undefined,
          inset: safeInset,
          padding: {
            kind: "fixed",
            x: hasFixedCoreWidth ? 0 : radius + safeInset,
            y: safeInset,
          },
        },
        content: {
          kind: "mixed",
          sizing: { kind: "auto" },
        },
      },
      className,
    });

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(
          resolved.rootClassName,
          !hasFixedCoreWidth && "items-center justify-center gap-2 whitespace-nowrap",
        )}
        style={{
          ...resolved.rootStyle,
          ...style,
        }}
        disabled={disabled}
        {...props}
      >
        {hasFixedCoreWidth ? (
          <span
            className={cn(
              "absolute flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap",
              resolved.contentClassName,
              contentClassName,
            )}
            style={{
              top: `${g?.contentInsetTop}px`,
              bottom: `${g?.contentInsetBottom}px`,
              left: `${g?.contentInsetLeft}px`,
              right: `${g?.contentInsetRight}px`,
            }}
          >
            {children}
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap",
              resolved.contentClassName,
              contentClassName,
            )}
            style={resolved.contentStyle}
          >
            {children}
          </span>
        )}
      </button>
    );
  },
);

ControlPillButton.displayName = "ControlPillButton";

export type CollapseArrowDirection = "up" | "down" | "left" | "right";

export type CollapseDirectionConfig =
  | {
      kind: "vertical";
      collapsed: "up" | "down";
      expanded: "up" | "down";
    }
  | {
      kind: "horizontal";
      collapsed: "left" | "right";
      expanded: "left" | "right";
    }
  | {
      kind: "free";
      collapsed: CollapseArrowDirection;
      expanded: CollapseArrowDirection;
    };

const DEFAULT_COLLAPSE_DIRECTION: CollapseDirectionConfig = {
  kind: "vertical",
  collapsed: "up",
  expanded: "down",
};

const COLLAPSE_DIRECTION_ROTATION_DEGREES: Record<CollapseArrowDirection, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
};

function normalizeDegrees(deg: number): number {
  const normalized = deg % 360;
  return normalized >= 0 ? normalized : normalized + 360;
}

function shortestRotationDelta(fromDeg: number, toDeg: number): number {
  const forward = normalizeDegrees(toDeg - fromDeg);
  if (forward > 180) return forward - 360;
  return forward;
}

function resolveRotationDegrees(
  expanded: boolean,
  direction: CollapseDirectionConfig,
): number {
  const collapsedDeg = COLLAPSE_DIRECTION_ROTATION_DEGREES[direction.collapsed];
  const expandedTargetDeg = COLLAPSE_DIRECTION_ROTATION_DEGREES[direction.expanded];
  if (!expanded) return collapsedDeg;
  return collapsedDeg + shortestRotationDelta(collapsedDeg, expandedTargetDeg);
}

function resolveCollapseContainer(
  variant: "plain" | "hint" | "control",
  hintSize: number | string,
  className?: string,
): { className: string; style?: React.CSSProperties } {
  if (variant === "plain") {
    return {
      className: cn("inline-flex shrink-0 items-center justify-center text-text-muted/80", className),
    };
  }

  const resolved = iconButtonFactory.renderProps({
    recipe: "secondary",
    specOverride: {
      geometry: {
        shape: "round",
        size: {
          kind: "fixed",
          height: typeof hintSize === "number" ? hintSize : 20,
          width: typeof hintSize === "number" ? hintSize : 20,
        },
        padding: { kind: "fixed", x: 0, y: 0 },
      },
      slots: {
        rootClassName:
          variant === "control"
            ? "bg-surface-sub/75 text-text-muted hover:bg-surface-hover hover:text-text group-hover:bg-surface-hover group-hover:text-text"
            : "bg-surface-sub/50 text-text-muted group-hover:bg-surface-hover group-hover:text-text",
      },
    },
    className,
  });

  const style =
    typeof hintSize === "number"
      ? ({ width: `${hintSize}px`, height: `${hintSize}px` } as React.CSSProperties)
      : ({ width: hintSize, height: hintSize } as React.CSSProperties);

  return {
    className: cn("pointer-events-none", resolved.rootClassName),
    style,
  };
}

export interface FactoryCollapseToggleProps {
  expanded: boolean;
  direction?: CollapseDirectionConfig;
  iconSize?: number;
  hintSize?: number | string;
  variant?: "plain" | "hint" | "control";
  animated?: boolean;
  className?: string;
  iconClassName?: string;
}

export function FactoryCollapseToggle({
  expanded,
  direction = DEFAULT_COLLAPSE_DIRECTION,
  iconSize = 14,
  hintSize = 20,
  variant = "plain",
  animated = true,
  className,
  iconClassName,
}: FactoryCollapseToggleProps) {
  const rotationDeg = resolveRotationDegrees(expanded, direction);
  const container = resolveCollapseContainer(variant, hintSize, className);
  const iconClasses = cn(
    animated && "transition-transform [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
    iconClassName,
  );

  return (
    <span
      className={container.className}
      style={container.style}
      aria-hidden="true"
    >
      <CaretRightIcon
        size={iconSize}
        className={iconClasses}
        style={{ transform: `rotate(${rotationDeg}deg)` }}
      />
    </span>
  );
}
