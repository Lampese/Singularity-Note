import type { SurfacePlugin } from "../primaryTypes";

const OPAQUE_TONE_CLASSES = {
  neutral: "bg-surface-sub text-text-secondary border-0",
  accent: "bg-accent text-text-inverse border-0",
  danger: "bg-error text-text-inverse border-0",
} as const;

const TRANSLUCENT_TONE_CLASSES = {
  neutral: "bg-surface/65 text-text backdrop-blur-md border-0",
  accent: "bg-accent/10 text-accent backdrop-blur-md border-0",
  danger: "bg-error/15 text-error backdrop-blur-md border-0",
} as const;

const BACKGROUND_NONE_TONE_CLASSES = {
  neutral: "bg-transparent text-text-secondary border-0 backdrop-blur-0",
  accent: "bg-transparent text-accent border-0 backdrop-blur-0",
  danger: "bg-transparent text-error border-0 backdrop-blur-0",
} as const;

const GLASS_TONE_CLASSES = {
  neutral: "bg-panel/75 text-text backdrop-blur-xl border-0",
  accent: "bg-accent/12 text-accent backdrop-blur-xl border-0",
  danger: "bg-error/12 text-error backdrop-blur-xl border-0",
} as const;

export const surfacePlugins: Record<"translucent" | "opaque" | "glass", SurfacePlugin> = {
  opaque: (spec) => ({
    rootClassName:
      spec.visual.background === "none"
        ? BACKGROUND_NONE_TONE_CLASSES[spec.visual.tone]
        : OPAQUE_TONE_CLASSES[spec.visual.tone],
  }),
  translucent: (spec) => ({
    rootClassName:
      spec.visual.background === "none"
        ? BACKGROUND_NONE_TONE_CLASSES[spec.visual.tone]
        : TRANSLUCENT_TONE_CLASSES[spec.visual.tone],
  }),
  glass: (spec) => ({
    rootClassName:
      spec.visual.background === "none"
        ? BACKGROUND_NONE_TONE_CLASSES[spec.visual.tone]
        : GLASS_TONE_CLASSES[spec.visual.tone],
  }),
};
