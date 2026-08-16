import {
  DEFAULT_CONTROL_SPEC,
  DEFAULT_ICON_CONTROL_SPEC,
  actionPrimaryFactory,
  listRowPrimaryFactory,
} from "../../core";
import { createSecondaryFactory } from "../../secondary";
import { LIST_ROW_RECIPES } from "./recipes";

export const listRowFactory = createSecondaryFactory(
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
      background: "none",
    },
    interaction: {
      ...DEFAULT_CONTROL_SPEC.interaction,
      focusRing: false,
    },
    slots: {
      rootClassName: "group flex items-center gap-[var(--sidebar-slot-min-gap-x)] bg-transparent p-0",
      contentClassName: "w-full justify-start",
    },
  },
  {
    primaryFactory: listRowPrimaryFactory,
    recipes: LIST_ROW_RECIPES,
  },
);

export const listActionFactory = createSecondaryFactory(
  {
    ...DEFAULT_ICON_CONTROL_SPEC,
    geometry: {
      ...DEFAULT_ICON_CONTROL_SPEC.geometry,
      shape: "round",
      size: { kind: "fixed", height: 24, width: 24 },
      padding: { kind: "fixed", x: 0, y: 0 },
    },
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    interaction: {
      ...DEFAULT_ICON_CONTROL_SPEC.interaction,
      focusRing: false,
    },
    slots: {
      rootClassName:
        "rounded-full !border-0 !bg-transparent !backdrop-blur-none shadow-none text-text-muted hover:!bg-transparent active:!bg-transparent focus-visible:!bg-transparent hover:text-text",
    },
  },
  {
    primaryFactory: actionPrimaryFactory,
    recipes: {
      default: {},
    },
  },
);
