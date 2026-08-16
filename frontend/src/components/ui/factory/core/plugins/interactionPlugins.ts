import type { InteractionPlugin } from "../primaryTypes";
import { resolveControlState } from "../runtimeState";

function resolveHoverClass(
  surface: "opaque" | "translucent" | "glass",
  tone: "neutral" | "accent" | "danger",
  background: "default" | "none",
): string {
  if (background === "none") {
    if (tone === "accent") return "hover:text-accent";
    if (tone === "danger") return "hover:text-error";
    return "hover:text-text";
  }

  if (surface === "glass") {
    if (tone === "accent") return "hover:bg-accent/20 hover:text-accent";
    if (tone === "danger") return "hover:bg-error/20 hover:text-error";
    return "hover:bg-panel/85 hover:text-text";
  }

  if (surface === "translucent") {
    if (tone === "accent") return "hover:bg-accent/20 hover:text-accent";
    if (tone === "danger") return "hover:bg-error/20 hover:text-error";
    return "hover:bg-surface/72 hover:text-text";
  }

  if (tone === "accent") return "hover:bg-accent-hover";
  if (tone === "danger") return "hover:bg-error/90";
  return "hover:bg-surface-hover hover:text-text";
}

export const interactionPlugins: { base: InteractionPlugin } = {
  base: (spec, runtime) => {
    const resolvedState = resolveControlState(spec, runtime);
    const disabled = runtime.disabled ?? spec.interaction?.disabled ?? false;
    const interactive = runtime.interactive ?? spec.interaction?.interactive ?? true;
    const backgroundMode = spec.visual.background ?? "default";
    const isActiveState = resolvedState === "active";

    return {
      rootClassName: [
        "focus-visible:outline-none",
        spec.interaction?.focusRing === false
          ? ""
          : "focus-visible:ring-2 focus-visible:ring-accent/35",
        "transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
        "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
        disabled
          ? "pointer-events-none opacity-50 cursor-not-allowed"
          : interactive
            ? "cursor-pointer"
            : "cursor-default",
        interactive ? resolveHoverClass(spec.visual.surface, spec.visual.tone, backgroundMode) : "",
        interactive && isActiveState ? "active:scale-[0.98]" : "",
      ]
        .filter(Boolean)
        .join(" "),
    };
  },
};
