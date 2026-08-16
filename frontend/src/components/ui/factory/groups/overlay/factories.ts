import {
  DEFAULT_CONTROL_SPEC,
  actionPrimaryFactory,
  passivePrimaryFactory,
} from "../../core";
import { createSecondaryFactory } from "../../secondary";
import { OVERLAY_RECIPES } from "./recipes";

export const dialogShellFactory = createSecondaryFactory(
  {
    ...DEFAULT_CONTROL_SPEC,
    geometry: {
      ...DEFAULT_CONTROL_SPEC.geometry,
      shape: "roundedRect",
      size: { kind: "preset", density: "comfortable" },
      padding: { kind: "fixed", x: 24, y: 24 },
    },
    visual: {
      surface: "opaque",
      tone: "neutral",
    },
    interaction: {
      ...DEFAULT_CONTROL_SPEC.interaction,
      focusRing: false,
    },
    slots: {
      rootClassName:
        "flex w-full max-w-md cursor-default flex-col items-stretch rounded-[28px] bg-surface p-6",
    },
  },
  {
    primaryFactory: passivePrimaryFactory,
    recipes: {
      dialogShell: OVERLAY_RECIPES.dialogShell,
    },
  },
);

export const confirmDialogFactory = createSecondaryFactory(
  {
    ...DEFAULT_CONTROL_SPEC,
    interaction: {
      ...DEFAULT_CONTROL_SPEC.interaction,
      focusRing: false,
    },
  },
  {
    primaryFactory: passivePrimaryFactory,
    recipes: {
      confirmPattern: OVERLAY_RECIPES.confirmPattern,
    },
  },
);

export const popoverTriggerFactory = createSecondaryFactory(
  {
    ...DEFAULT_CONTROL_SPEC,
    geometry: {
      ...DEFAULT_CONTROL_SPEC.geometry,
      shape: "roundedRect",
      size: { kind: "fixed", height: 36 },
      padding: { kind: "fixed", x: 12, y: 6 },
    },
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    slots: {
      rootClassName: "rounded-[var(--radius-button)]",
    },
  },
  {
    primaryFactory: actionPrimaryFactory,
    recipes: {
      popoverTrigger: OVERLAY_RECIPES.popoverTrigger,
    },
  },
);
