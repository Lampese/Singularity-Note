import type { ControlSpecOverride } from "../../secondary";

export const OVERLAY_RECIPES = {
  dialogShell: {
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    slots: {
      rootClassName:
        "frosted-surface-prominent flex w-full max-w-md cursor-default flex-col items-stretch rounded-[28px] p-6 ring-0 outline-none",
    },
  },
  popoverTrigger: {
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    slots: {
      rootClassName: "rounded-[var(--radius-button)]",
    },
  },
  confirmPattern: {},
  infoPattern: {},
} satisfies Record<string, ControlSpecOverride>;

export type OverlayRecipeName = keyof typeof OVERLAY_RECIPES;
