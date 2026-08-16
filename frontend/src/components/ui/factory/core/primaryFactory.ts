import type {
  ControlRuntimeContext,
  ControlSpec,
  PrimaryFactory,
  PrimaryPluginExtension,
  PrimaryPluginTable,
  ResolvedControl,
} from "./primaryTypes";
import { createBaseResolvedControl, mergeResolvedControl } from "./resolverUtils";
import { shapePlugins } from "./plugins/shapePlugins";
import { surfacePlugins } from "./plugins/surfacePlugins";
import { interactionPlugins } from "./plugins/interactionPlugins";
import { contentLayoutPlugins } from "./plugins/contentLayoutPlugins";
import { motionPlugins } from "./plugins/motionPlugins";

export const defaultPluginTable: PrimaryPluginTable = {
  shapePlugins,
  surfacePlugins,
  interactionPlugins,
  contentLayoutPlugins,
  motionPlugins,
};

function finalizeResolved(
  base: ResolvedControl,
  merged: Partial<ResolvedControl>,
): ResolvedControl {
  return {
    rootClassName: merged.rootClassName ?? base.rootClassName,
    rootStyle: merged.rootStyle ?? base.rootStyle,
    contentClassName: merged.contentClassName ?? base.contentClassName,
    contentStyle: merged.contentStyle ?? base.contentStyle,
    leadingClassName: merged.leadingClassName ?? base.leadingClassName,
    trailingClassName: merged.trailingClassName ?? base.trailingClassName,
    indicatorClassName: merged.indicatorClassName ?? base.indicatorClassName,
  };
}

function resolveWithTable(
  spec: ControlSpec,
  runtime: ControlRuntimeContext,
  pluginTable: PrimaryPluginTable,
): ResolvedControl {
  const base = createBaseResolvedControl(spec);

  let merged = mergeResolvedControl(base, pluginTable.shapePlugins[spec.geometry.shape](spec));
  merged = mergeResolvedControl(merged, pluginTable.surfacePlugins[spec.visual.surface](spec));
  merged = mergeResolvedControl(merged, pluginTable.interactionPlugins.base(spec, runtime));
  merged = mergeResolvedControl(merged, pluginTable.contentLayoutPlugins[spec.content.kind](spec));
  merged = mergeResolvedControl(merged, pluginTable.motionPlugins.base(spec));

  return finalizeResolved(base, merged);
}

export function createPrimaryFactory(pluginTable: PrimaryPluginTable): PrimaryFactory {
  return {
    pluginTable,
    resolveControl: (spec: ControlSpec, runtime?: ControlRuntimeContext) =>
      resolveWithTable(spec, runtime ?? {}, pluginTable),
  };
}

export function extendPrimaryFactory(
  base: PrimaryFactory,
  extensionPlugins: PrimaryPluginExtension,
): PrimaryFactory {
  const mergedTable: PrimaryPluginTable = {
    shapePlugins: {
      ...base.pluginTable.shapePlugins,
      ...extensionPlugins.shapePlugins,
    },
    surfacePlugins: {
      ...base.pluginTable.surfacePlugins,
      ...extensionPlugins.surfacePlugins,
    },
    interactionPlugins: {
      ...base.pluginTable.interactionPlugins,
      ...extensionPlugins.interactionPlugins,
    },
    contentLayoutPlugins: {
      ...base.pluginTable.contentLayoutPlugins,
      ...extensionPlugins.contentLayoutPlugins,
    },
    motionPlugins: {
      ...base.pluginTable.motionPlugins,
      ...extensionPlugins.motionPlugins,
    },
  };

  return createPrimaryFactory(mergedTable);
}

const defaultPrimaryFactory = createPrimaryFactory(defaultPluginTable);

export function resolveControl(
  spec: ControlSpec,
  runtimeCtx: ControlRuntimeContext = {},
): ResolvedControl {
  return defaultPrimaryFactory.resolveControl(spec, runtimeCtx);
}

export { defaultPrimaryFactory };
