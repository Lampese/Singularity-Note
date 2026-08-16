import type { ControlSpecOverride } from "../../secondary";

export const BUTTON_RECIPE_NAMES = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
  "quiet",
  "dangerGhost",
  "dangerOutline",
  "toolbar",
  "toolbarActive",
  "floating",
  "menuPrimary",
  "menuProminent",
  "menuGhost",
  "menuDanger",
  "menuDangerSubtle",
  "textAction",
  "unstyled",
  "glassGhost",
  "panelOutline",
] as const;

export type ButtonRecipeName = (typeof BUTTON_RECIPE_NAMES)[number];

export const BUTTON_RECIPES: Record<ButtonRecipeName, ControlSpecOverride> = {
  default: {
    visual: {
      surface: "opaque",
      tone: "accent",
    },
    slots: {
      rootClassName: "shadow-none",
    },
  },
  destructive: {
    visual: {
      surface: "opaque",
      tone: "danger",
    },
    slots: {
      rootClassName: "shadow-none",
    },
  },
  outline: {
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    slots: {
      rootClassName:
        "bg-transparent backdrop-blur-0 border border-border text-text hover:bg-surface-sub hover:text-accent",
    },
  },
  secondary: {
    visual: {
      surface: "opaque",
      tone: "neutral",
    },
    slots: {
      rootClassName: "bg-surface-sub text-text-secondary hover:bg-surface-sub/80 hover:text-text",
    },
  },
  ghost: {
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    slots: {
      rootClassName: "bg-transparent backdrop-blur-0 text-text-secondary hover:bg-accent-muted hover:text-accent",
    },
  },
  link: {
    visual: {
      surface: "translucent",
      tone: "accent",
    },
    slots: {
      rootClassName:
        "h-auto bg-transparent backdrop-blur-0 border-0 px-0 py-0 text-accent hover:underline underline-offset-4",
    },
  },
  quiet: {
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    slots: {
      rootClassName:
        "bg-transparent backdrop-blur-0 border-0 text-text-secondary hover:text-text hover:bg-surface-sub/70",
    },
  },
  dangerGhost: {
    visual: {
      surface: "translucent",
      tone: "danger",
    },
    slots: {
      rootClassName:
        "bg-transparent backdrop-blur-0 border-0 text-text-muted hover:text-error hover:bg-error/10",
    },
  },
  dangerOutline: {
    visual: {
      surface: "translucent",
      tone: "danger",
    },
    slots: {
      rootClassName:
        "bg-transparent backdrop-blur-0 border border-error/40 text-error hover:bg-error/10 hover:text-error",
    },
  },
  toolbar: {
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    slots: {
      rootClassName:
        "bg-transparent backdrop-blur-0 border-0 text-text-secondary hover:bg-surface hover:text-text",
    },
  },
  toolbarActive: {
    visual: {
      surface: "translucent",
      tone: "accent",
    },
    slots: {
      rootClassName:
        "bg-accent-muted text-accent border-0 hover:bg-accent-muted/85 hover:text-accent",
    },
  },
  floating: {
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    slots: {
      rootClassName:
        "bg-surface/72 text-text border-0 backdrop-blur-md hover:bg-surface/80 hover:text-text",
    },
  },
  menuPrimary: {
    visual: {
      surface: "opaque",
      tone: "accent",
    },
    slots: {
      rootClassName:
        "bg-accent text-text-inverse border-0 hover:bg-accent-hover",
    },
  },
  menuProminent: {
    visual: {
      surface: "opaque",
      tone: "accent",
    },
    slots: {
      rootClassName:
        "bg-info text-text-inverse border-0 shadow-none hover:bg-info/90 active:bg-info/85",
    },
  },
  menuGhost: {
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    slots: {
      rootClassName:
        "bg-transparent border border-border text-text-secondary hover:bg-panel hover:text-text",
    },
  },
  menuDanger: {
    visual: {
      surface: "opaque",
      tone: "danger",
    },
    slots: {
      rootClassName:
        "bg-error text-text-inverse border-0 hover:opacity-90",
    },
  },
  menuDangerSubtle: {
    visual: {
      surface: "opaque",
      tone: "danger",
    },
    slots: {
      rootClassName:
        "border shadow-none text-error bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface-sub))] border-[color:color-mix(in_srgb,var(--color-error)_12%,transparent)] hover:!bg-[color:color-mix(in_srgb,var(--color-error)_16%,var(--color-surface))] hover:!text-[color:color-mix(in_srgb,var(--color-error)_90%,black)] active:!bg-[color:color-mix(in_srgb,var(--color-error)_20%,var(--color-surface))] disabled:border-transparent disabled:bg-[color:color-mix(in_srgb,var(--color-error)_6%,var(--color-surface-sub))] disabled:text-error/60",
    },
  },
  textAction: {
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    slots: {
      rootClassName:
        "h-auto border-0 bg-transparent px-0 py-0 text-text-secondary hover:bg-transparent hover:text-text",
    },
  },
  unstyled: {
    visual: {
      surface: "translucent",
      tone: "neutral",
    },
    slots: {
      rootClassName:
        "border-0 bg-transparent text-inherit hover:bg-transparent hover:text-inherit",
    },
  },
  glassGhost: {
    visual: {
      surface: "glass",
      tone: "neutral",
    },
    slots: {
      rootClassName:
        "bg-white/5 border-0 text-white backdrop-blur-none hover:bg-white/9 font-semibold",
    },
  },
  panelOutline: {
    visual: {
      surface: "opaque",
      tone: "neutral",
    },
    slots: {
      rootClassName:
        "bg-panel border border-border text-text backdrop-blur-none hover:bg-surface-sub font-semibold",
    },
  },
};
