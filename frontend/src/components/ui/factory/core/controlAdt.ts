import type {
  ControlSpec,
  ControlDensity,
  ControlShape,
  ControlTone,
  ControlSurface,
  ControlBackgroundMode,
} from "./primaryTypes";

export const CONTROL_DENSITY_HEIGHT: Record<ControlDensity, string> = {
  compact: "var(--size-control-compact)",
  comfortable: "var(--size-control-comfortable)",
  touch: "var(--size-control-touch)",
};

export const CONTROL_SHAPES: ControlShape[] = ["roundedRect", "pill", "round"];
export const CONTROL_SURFACES: ControlSurface[] = ["translucent", "opaque", "glass"];
export const CONTROL_TONES: ControlTone[] = ["neutral", "accent", "danger"];
export const CONTROL_BACKGROUND_MODES: ControlBackgroundMode[] = ["default", "none"];

export const DEFAULT_CONTROL_SPEC: ControlSpec = {
  geometry: {
    shape: "roundedRect",
    size: { kind: "preset", density: "comfortable" },
    padding: { kind: "auto" },
  },
  visual: {
    surface: "opaque",
    tone: "neutral",
    background: "default",
  },
  content: {
    kind: "text",
    sizing: { kind: "auto" },
  },
  interaction: {
    state: "default",
    focusRing: true,
    disabled: false,
    interactive: true,
  },
};

export const DEFAULT_ICON_CONTROL_SPEC: ControlSpec = {
  ...DEFAULT_CONTROL_SPEC,
  geometry: {
    ...DEFAULT_CONTROL_SPEC.geometry,
    shape: "round",
  },
  content: {
    kind: "icon",
    sizing: { kind: "auto" },
  },
};

export const DEFAULT_PILL_CONTROL_SPEC: ControlSpec = {
  ...DEFAULT_CONTROL_SPEC,
  geometry: {
    ...DEFAULT_CONTROL_SPEC.geometry,
    shape: "pill",
  },
};
