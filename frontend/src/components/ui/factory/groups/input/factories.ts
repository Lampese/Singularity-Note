import { DEFAULT_CONTROL_SPEC, fieldPrimaryFactory, passivePrimaryFactory } from "../../core";
import type { ControlSpecOverride } from "../../secondary";
import { createSecondaryFactory } from "../../secondary";
import { INPUT_RECIPES } from "./recipes";

const INPUT_BASE_SPEC = {
  ...DEFAULT_CONTROL_SPEC,
  geometry: {
    ...DEFAULT_CONTROL_SPEC.geometry,
    shape: "roundedRect",
    size: { kind: "fixed", height: 40 },
    padding: { kind: "fixed", x: 12, y: 8 },
  },
  content: {
    kind: "text",
    sizing: { kind: "auto" },
  },
  slots: {
    rootClassName: "rounded-[var(--radius-control)] justify-start",
    contentClassName: "w-full justify-start",
  },
} as const;

export const TEXTAREA_SIZE_OVERRIDE: ControlSpecOverride = {
  geometry: {
    shape: "roundedRect",
    size: { kind: "fixed", height: 80 },
    padding: { kind: "fixed", x: 12, y: 8 },
  },
  slots: {
    rootClassName: "items-start",
    contentClassName: "w-full justify-start",
  },
};

export const inputFactory = createSecondaryFactory(INPUT_BASE_SPEC, {
  primaryFactory: fieldPrimaryFactory,
  recipes: INPUT_RECIPES,
});

export const textareaFactory = createSecondaryFactory(
  {
    ...INPUT_BASE_SPEC,
    geometry: {
      ...INPUT_BASE_SPEC.geometry,
      size: { kind: "fixed", height: 80 },
    },
  },
  {
    primaryFactory: fieldPrimaryFactory,
    recipes: INPUT_RECIPES,
  },
);

export const fieldShellFactory = createSecondaryFactory(
  {
    ...DEFAULT_CONTROL_SPEC,
    geometry: {
      ...DEFAULT_CONTROL_SPEC.geometry,
      shape: "roundedRect",
      size: { kind: "preset", density: "comfortable" },
      padding: { kind: "fixed", x: 0, y: 0 },
    },
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    interaction: {
      focusRing: false,
      disabled: false,
    },
    slots: {
      rootClassName: "w-full cursor-default rounded-[var(--radius-container-inner)] bg-transparent p-0",
    },
  },
  {
    primaryFactory: passivePrimaryFactory,
    recipes: {
      default: {
        slots: {
          rootClassName: "w-full",
        },
      },
    },
  },
);
