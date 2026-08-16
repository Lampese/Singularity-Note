export type GradientStop = {
  color: string;
  positionPercent: number;
};

export type RadialGradientConfig = {
  kind: "radial";
  shape?: "circle" | "ellipse";
  center?: {
    xPercent: number;
    yPercent: number;
  };
  stops: readonly GradientStop[];
  repeating?: boolean;
};

export type LinearGradientConfig = {
  kind: "linear";
  angleDeg?: number;
  stops: readonly GradientStop[];
  repeating?: boolean;
};

export type GradientConfig = RadialGradientConfig | LinearGradientConfig;
export type SolidColorLayer = {
  kind: "color";
  value: string;
};
export type BackgroundLayer = GradientConfig | SolidColorLayer;

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function formatStops(stops: readonly GradientStop[]): string {
  return stops
    .map((stop) => `${stop.color} ${clampPercent(stop.positionPercent)}%`)
    .join(", ");
}

export function toCssGradient(config: GradientConfig): string {
  const fn = config.repeating
    ? config.kind === "radial"
      ? "repeating-radial-gradient"
      : "repeating-linear-gradient"
    : config.kind === "radial"
      ? "radial-gradient"
      : "linear-gradient";

  const stops = formatStops(config.stops);

  if (config.kind === "linear") {
    const angle = config.angleDeg ?? 180;
    return `${fn}(${angle}deg, ${stops})`;
  }

  const shape = config.shape ?? "circle";
  const center = config.center
    ? ` at ${clampPercent(config.center.xPercent)}% ${clampPercent(config.center.yPercent)}%`
    : "";
  return `${fn}(${shape}${center}, ${stops})`;
}

export function toCssBackgroundImage(layers: readonly BackgroundLayer[]): string {
  return layers
    .map((layer) => (layer.kind === "color" ? layer.value : toCssGradient(layer)))
    .join(", ");
}

export type ThreeColorGradient = {
  first: string;
  second: string;
  third: string;
};

export type OrbGradientAnchor = {
  xPercent: number;
  yPercent: number;
};

export function toThreeColorOrbGradient(
  colors: ThreeColorGradient,
  anchor: OrbGradientAnchor,
): RadialGradientConfig {
  return {
    kind: "radial",
    shape: "circle",
    center: anchor,
    stops: [
      { color: colors.first, positionPercent: 0 },
      { color: colors.second, positionPercent: 50 },
      { color: colors.third, positionPercent: 100 },
    ],
  };
}

export function toThreeColorOrbGradientCss(
  colors: ThreeColorGradient,
  anchor: OrbGradientAnchor,
): string {
  return toCssGradient(toThreeColorOrbGradient(colors, anchor));
}
