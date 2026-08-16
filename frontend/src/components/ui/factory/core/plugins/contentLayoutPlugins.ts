import type { ContentLayoutPlugin } from "../primaryTypes";

export const contentLayoutPlugins: Record<"text" | "icon" | "mixed", ContentLayoutPlugin> = {
  text: () => ({
    contentClassName: "gap-2",
  }),
  icon: (spec) => ({
    contentClassName: "gap-0",
    contentStyle:
      spec.content.sizing.kind === "fixed"
        ? {
            width: `${spec.content.sizing.size}px`,
            height: `${spec.content.sizing.size}px`,
          }
        : undefined,
  }),
  mixed: (spec) => ({
    contentClassName: "gap-1.5",
    contentStyle:
      spec.content.sizing.kind === "fixed"
        ? {
            fontSize: `${spec.content.sizing.size}px`,
          }
        : undefined,
  }),
};
