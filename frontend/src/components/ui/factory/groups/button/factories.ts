import {
  DEFAULT_CONTROL_SPEC,
  DEFAULT_ICON_CONTROL_SPEC,
  DEFAULT_PILL_CONTROL_SPEC,
  actionPrimaryFactory,
} from "../../core";
import type { ControlSpecOverride } from "../../secondary";
import { createSecondaryFactory } from "../../secondary";
import { BUTTON_RECIPES, type ButtonRecipeName } from "./recipes";

export type ButtonSize = "default" | "sm" | "lg" | "icon";
export type ExtendedButtonSize =
  | ButtonSize
  | "xs"
  | "iconXs"
  | "iconSm"
  | "iconMd"
  | "iconLg";

const BASE_BUTTON_SPEC = {
  ...DEFAULT_CONTROL_SPEC,
  interaction: {
    ...DEFAULT_CONTROL_SPEC.interaction,
    focusRing: true,
  },
  slots: {
    rootClassName:
      "whitespace-nowrap rounded-[var(--radius-button)] text-sm font-medium transition-all [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
    contentClassName: "inline-flex items-center justify-center gap-2 whitespace-nowrap",
  },
} as const;

export const BUTTON_SIZE_OVERRIDES: Record<ExtendedButtonSize, ControlSpecOverride> = {
  xs: {
    geometry: {
      shape: "roundedRect",
      size: { kind: "fixed", height: 28 },
      padding: { kind: "fixed", x: 10, y: 4 },
    },
    content: {
      kind: "text",
      sizing: { kind: "auto" },
    },
    slots: {
      rootClassName: "text-xs",
    },
  },
  default: {
    geometry: {
      shape: "roundedRect",
      size: { kind: "fixed", height: 36 },
      padding: { kind: "fixed", x: 16, y: 8 },
    },
    content: {
      kind: "text",
      sizing: { kind: "auto" },
    },
  },
  sm: {
    geometry: {
      shape: "roundedRect",
      size: { kind: "fixed", height: 32 },
      padding: { kind: "fixed", x: 12, y: 6 },
    },
    content: {
      kind: "text",
      sizing: { kind: "auto" },
    },
    slots: {
      rootClassName: "text-xs",
    },
  },
  lg: {
    geometry: {
      shape: "roundedRect",
      size: { kind: "fixed", height: 40 },
      padding: { kind: "fixed", x: 32, y: 8 },
    },
    content: {
      kind: "text",
      sizing: { kind: "auto" },
    },
  },
  icon: {
    geometry: {
      shape: "round",
      size: { kind: "fixed", height: 36, width: 36 },
      padding: { kind: "fixed", x: 0, y: 0 },
    },
    content: {
      kind: "icon",
      sizing: { kind: "auto" },
    },
  },
  iconXs: {
    geometry: {
      shape: "round",
      size: { kind: "fixed", height: 16, width: 16 },
      padding: { kind: "fixed", x: 0, y: 0 },
    },
    content: {
      kind: "icon",
      sizing: { kind: "auto" },
    },
  },
  iconSm: {
    geometry: {
      shape: "round",
      size: { kind: "fixed", height: 24, width: 24 },
      padding: { kind: "fixed", x: 0, y: 0 },
    },
    content: {
      kind: "icon",
      sizing: { kind: "auto" },
    },
  },
  iconMd: {
    geometry: {
      shape: "round",
      size: { kind: "fixed", height: 32, width: 32 },
      padding: { kind: "fixed", x: 0, y: 0 },
    },
    content: {
      kind: "icon",
      sizing: { kind: "auto" },
    },
  },
  iconLg: {
    geometry: {
      shape: "round",
      size: { kind: "fixed", height: 40, width: 40 },
      padding: { kind: "fixed", x: 0, y: 0 },
    },
    content: {
      kind: "icon",
      sizing: { kind: "auto" },
    },
  },
};

export const buttonFactory = createSecondaryFactory(BASE_BUTTON_SPEC, {
  primaryFactory: actionPrimaryFactory,
  recipes: BUTTON_RECIPES,
});

export const iconButtonFactory = createSecondaryFactory(
  {
    ...DEFAULT_ICON_CONTROL_SPEC,
    interaction: {
      ...DEFAULT_ICON_CONTROL_SPEC.interaction,
      focusRing: true,
    },
    slots: {
      rootClassName:
        "rounded-full text-sm font-medium transition-all [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
      contentClassName: "inline-flex items-center justify-center",
    },
  },
  {
    primaryFactory: actionPrimaryFactory,
    recipes: BUTTON_RECIPES,
  },
);

export const toggleButtonFactory = createSecondaryFactory(
  {
    ...BASE_BUTTON_SPEC,
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
  },
  {
    primaryFactory: actionPrimaryFactory,
    recipes: BUTTON_RECIPES,
  },
);

export const pillButtonFactory = createSecondaryFactory(
  {
    ...DEFAULT_PILL_CONTROL_SPEC,
    interaction: {
      ...DEFAULT_PILL_CONTROL_SPEC.interaction,
      focusRing: true,
    },
    slots: {
      rootClassName:
        "relative inline-flex shrink-0 select-none items-stretch text-sm font-medium transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
      contentClassName: "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    },
  },
  {
    primaryFactory: actionPrimaryFactory,
    recipes: BUTTON_RECIPES,
  },
);

export function normalizeButtonRecipe(variant?: string): ButtonRecipeName {
  if (!variant) return "default";
  if (variant in BUTTON_RECIPES) {
    return variant as ButtonRecipeName;
  }
  return "default";
}
