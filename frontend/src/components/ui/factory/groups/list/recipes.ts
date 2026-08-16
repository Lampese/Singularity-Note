import type { ControlSpecOverride } from "../../secondary";

export const LIST_ROW_RECIPES = {
  default: {
    interaction: {
      focusRing: false,
      disabled: false,
    },
    slots: {
      rootClassName: "group flex items-center gap-[var(--sidebar-slot-min-gap-x)] rounded-[var(--radius-control)]",
    },
  },
} satisfies Record<string, ControlSpecOverride>;

export type ListRowRecipeName = keyof typeof LIST_ROW_RECIPES;
