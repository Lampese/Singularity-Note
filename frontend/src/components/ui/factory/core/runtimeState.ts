import type {
  ControlResolvedState,
  ControlRuntimeContext,
  ControlSpec,
  ControlState,
} from "./primaryTypes";

function isDefinedState(state: string): state is ControlState {
  return (
    state === "default" ||
    state === "hover" ||
    state === "active" ||
    state === "disabled" ||
    state === "focusVisible"
  );
}

export function resolveControlState(
  spec: ControlSpec,
  runtime: ControlRuntimeContext,
): ControlResolvedState {
  if (runtime.disabled ?? spec.interaction?.disabled ?? false) {
    return "disabled";
  }

  if (runtime.state && isDefinedState(runtime.state) && runtime.state !== "default") {
    return runtime.state;
  }

  if (runtime.pressed || runtime.active) {
    return "active";
  }

  if (runtime.hovered) {
    return "hover";
  }

  if (runtime.focusVisible) {
    return "focusVisible";
  }

  const fallback = spec.interaction?.state;
  if (fallback && isDefinedState(fallback) && fallback !== "default") {
    return fallback;
  }

  return "default";
}
