import type { ControlSpecOverride } from "../../secondary";

export const INPUT_RECIPE_NAMES = ["default", "glass"] as const;

export type InputRecipeName = (typeof INPUT_RECIPE_NAMES)[number];

export const INPUT_RECIPES: Record<InputRecipeName, ControlSpecOverride> = {
  glass: {
    visual: {
      surface: "glass",
      tone: "neutral",
    },
    interaction: {
      focusRing: false,
    },
    slots: {
      rootClassName:
        "w-full rounded-[18px] h-12 bg-white/4 border border-white/8 text-text " +
        "placeholder:text-text/45 backdrop-blur-none cursor-text " +
        "focus-visible:outline-none focus-visible:border-accent/55 " +
        "focus-visible:ring-2 focus-visible:ring-accent/14 focus-visible:ring-offset-0 " +
        "focus-visible:bg-white/6 hover:bg-white/5",
      contentClassName: "w-full",
    },
  },
  default: {
    visual: {
      surface: "opaque",
      tone: "neutral",
    },
    interaction: {
      focusRing: false,
    },
    slots: {
      rootClassName:
        "w-full border border-border bg-panel text-sm text-text ring-offset-bg file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted focus-visible:ring-offset-2 focus:border-accent cursor-text hover:bg-panel hover:text-text",
      contentClassName: "w-full",
    },
  },
};
