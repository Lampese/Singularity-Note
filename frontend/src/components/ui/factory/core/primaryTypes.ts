import type { CSSProperties } from "react";

export type ControlShape = "roundedRect" | "pill" | "round";
export type ControlSurface = "translucent" | "opaque" | "glass";
export type ControlTone = "neutral" | "accent" | "danger";
export type ControlBackgroundMode = "default" | "none";
export type ControlDensity = "compact" | "comfortable" | "touch";
export type ControlState = "default" | "hover" | "active" | "disabled" | "focusVisible";
export type ControlResolvedState = Exclude<ControlState, "default"> | "default";
export type ControlContentKind = "text" | "icon" | "mixed";

export type ControlPadding =
  | { kind: "auto" }
  | { kind: "fixed"; x: number; y: number };

export type ControlSize =
  | { kind: "preset"; density: ControlDensity }
  | { kind: "fixed"; height: number; width?: number };

export type ControlContentSizing =
  | { kind: "auto" }
  | { kind: "fixed"; size: number; gap?: number };

export interface ControlGeometrySpec {
  shape: ControlShape;
  size: ControlSize;
  padding: ControlPadding;
  coreWidth?: number;
  inset?: number;
}

export interface ControlVisualSpec {
  surface: ControlSurface;
  tone: ControlTone;
  background?: ControlBackgroundMode;
}

export interface ControlInteractionSpec {
  state?: ControlState;
  focusRing?: boolean;
  disabled?: boolean;
  interactive?: boolean;
}

export interface ControlContentSpec {
  kind: ControlContentKind;
  sizing: ControlContentSizing;
}

export interface ControlSlotSpec {
  rootClassName?: string;
  rootStyle?: CSSProperties;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  leadingClassName?: string;
  trailingClassName?: string;
  indicatorClassName?: string;
}

export interface ControlSpec {
  geometry: ControlGeometrySpec;
  visual: ControlVisualSpec;
  content: ControlContentSpec;
  interaction?: ControlInteractionSpec;
  slots?: ControlSlotSpec;
}

export interface ControlRuntimeContext {
  state?: ControlState;
  disabled?: boolean;
  pressed?: boolean;
  active?: boolean;
  interactive?: boolean;
  hovered?: boolean;
  focusVisible?: boolean;
  selected?: boolean;
}

export interface ResolvedControl {
  rootClassName: string;
  rootStyle?: CSSProperties;
  contentClassName: string;
  contentStyle?: CSSProperties;
  leadingClassName: string;
  trailingClassName: string;
  indicatorClassName: string;
}

export type PartialResolvedControl = Partial<ResolvedControl>;

export type ShapePlugin = (spec: ControlSpec) => PartialResolvedControl;
export type SurfacePlugin = (spec: ControlSpec) => PartialResolvedControl;
export type InteractionPlugin = (
  spec: ControlSpec,
  runtime: ControlRuntimeContext,
) => PartialResolvedControl;
export type ContentLayoutPlugin = (spec: ControlSpec) => PartialResolvedControl;
export type MotionPlugin = (spec: ControlSpec) => PartialResolvedControl;

export interface PrimaryPluginTable {
  shapePlugins: Record<ControlShape, ShapePlugin>;
  surfacePlugins: Record<ControlSurface, SurfacePlugin>;
  interactionPlugins: {
    base: InteractionPlugin;
  };
  contentLayoutPlugins: Record<ControlContentKind, ContentLayoutPlugin>;
  motionPlugins: {
    base: MotionPlugin;
  };
}

export interface PrimaryFactory {
  resolveControl: (
    spec: ControlSpec,
    runtime?: ControlRuntimeContext,
  ) => ResolvedControl;
  pluginTable: PrimaryPluginTable;
}

export type PrimaryPluginExtension = Partial<{
  shapePlugins: Partial<Record<ControlShape, ShapePlugin>>;
  surfacePlugins: Partial<Record<ControlSurface, SurfacePlugin>>;
  interactionPlugins: Partial<{
    base: InteractionPlugin;
  }>;
  contentLayoutPlugins: Partial<Record<ControlContentKind, ContentLayoutPlugin>>;
  motionPlugins: Partial<{
    base: MotionPlugin;
  }>;
}>;
