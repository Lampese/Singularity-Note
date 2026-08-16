import type { InteractionPlugin, PrimaryFactory } from "./primaryTypes";
import {
  createPrimaryFactory,
  defaultPluginTable,
  extendPrimaryFactory,
} from "./primaryFactory";
import { resolveControlState } from "./runtimeState";

function resolveDisabledClass(disabled: boolean): string {
  return disabled
    ? "pointer-events-none opacity-50 cursor-not-allowed"
    : "";
}

function resolveFocusRingClass(enabled: boolean): string {
  return enabled ? "focus-visible:outline-none focus-visible:ring-2" : "focus-visible:outline-none";
}

const fieldInteractionPlugin: InteractionPlugin = (spec, runtime) => {
  const disabled = resolveControlState(spec, runtime) === "disabled";

  return {
    rootClassName: [
      resolveFocusRingClass(spec.interaction?.focusRing !== false),
      spec.interaction?.focusRing === false
        ? ""
        : "focus-visible:ring-accent-muted focus-visible:ring-offset-2",
      "transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
      "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
      resolveDisabledClass(disabled),
      disabled ? "" : "cursor-text",
    ]
      .filter(Boolean)
      .join(" "),
  };
};

const listRowInteractionPlugin: InteractionPlugin = (spec, runtime) => {
  const disabled = resolveControlState(spec, runtime) === "disabled";
  const interactive = runtime.interactive ?? spec.interaction?.interactive ?? true;

  return {
    rootClassName: [
      resolveFocusRingClass(spec.interaction?.focusRing !== false),
      spec.interaction?.focusRing === false
        ? ""
        : "focus-visible:ring-accent/30",
      "transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
      "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
      resolveDisabledClass(disabled),
      disabled
        ? ""
        : interactive
          ? "cursor-pointer hover:bg-surface-hover/70 hover:text-text"
          : "cursor-default",
    ]
      .filter(Boolean)
      .join(" "),
  };
};

const passiveInteractionPlugin: InteractionPlugin = (spec, runtime) => {
  const disabled = resolveControlState(spec, runtime) === "disabled";

  return {
    rootClassName: [
      resolveFocusRingClass(spec.interaction?.focusRing !== false),
      spec.interaction?.focusRing === false
        ? ""
        : "focus-visible:ring-accent/25",
      "transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
      "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
      resolveDisabledClass(disabled),
      disabled ? "" : "cursor-default",
    ]
      .filter(Boolean)
      .join(" "),
  };
};

export const actionPrimaryFactory: PrimaryFactory = createPrimaryFactory(defaultPluginTable);

export const fieldPrimaryFactory: PrimaryFactory = extendPrimaryFactory(
  actionPrimaryFactory,
  {
    interactionPlugins: {
      base: fieldInteractionPlugin,
    },
  },
);

export const listRowPrimaryFactory: PrimaryFactory = extendPrimaryFactory(
  actionPrimaryFactory,
  {
    interactionPlugins: {
      base: listRowInteractionPlugin,
    },
  },
);

export const passivePrimaryFactory: PrimaryFactory = extendPrimaryFactory(
  actionPrimaryFactory,
  {
    interactionPlugins: {
      base: passiveInteractionPlugin,
    },
  },
);
