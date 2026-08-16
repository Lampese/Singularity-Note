import {
  createPrimaryFactory,
  type ControlContentSizing,
  type ControlDensity,
  type ControlPadding,
  type ControlSize,
  type ControlSpec,
  defaultPluginTable,
  mergeClassNames,
  type PrimaryFactory,
} from "../core";
import { mergeResolvedControl } from "../core/resolverUtils";
import type {
  ControlSpecOverride,
  DeepPartial,
  SecondaryFactory,
  SecondaryRenderProps,
} from "./recipeTypes";

interface SecondaryFactoryOptions<RecipeName extends string> {
  primaryFactory?: PrimaryFactory;
  recipes?: Record<RecipeName, ControlSpecOverride>;
}

function resolveRecipeSpec<RecipeName extends string>(
  recipes: Record<RecipeName, ControlSpecOverride>,
  recipe: string | undefined,
): ControlSpecOverride | undefined {
  if (!recipe) return undefined;

  if (Object.prototype.hasOwnProperty.call(recipes, recipe)) {
    return (recipes as Record<string, ControlSpecOverride>)[recipe];
  }

  if (process.env.NODE_ENV !== "production") {
    // Guard dynamic values during migration while keeping runtime compatible.
    console.warn(`[factory] unknown recipe "${recipe}", fallback to base spec`);
  }

  return undefined;
}

function mergeControlSize(
  base: ControlSize,
  override?: DeepPartial<ControlSize>,
): ControlSize {
  if (!override) return base;
  const normalized = override as {
    kind?: ControlSize["kind"];
    height?: number;
    width?: number;
    density?: ControlDensity;
  };

  const targetKind = normalized.kind ?? base.kind;
  if (targetKind === "fixed") {
    return {
      kind: "fixed",
      height: normalized.height ?? (base.kind === "fixed" ? base.height : 40),
      width: normalized.width ?? (base.kind === "fixed" ? base.width : undefined),
    };
  }

  return {
    kind: "preset",
    density:
      normalized.density ??
      (base.kind === "preset" ? base.density : "comfortable"),
  };
}

function mergeControlPadding(
  base: ControlPadding,
  override?: DeepPartial<ControlPadding>,
): ControlPadding {
  if (!override) return base;
  const normalized = override as {
    kind?: ControlPadding["kind"];
    x?: number;
    y?: number;
  };

  const targetKind = normalized.kind ?? base.kind;
  if (targetKind === "fixed") {
    return {
      kind: "fixed",
      x: normalized.x ?? (base.kind === "fixed" ? base.x : 0),
      y: normalized.y ?? (base.kind === "fixed" ? base.y : 0),
    };
  }

  return { kind: "auto" };
}

function mergeContentSizing(
  base: ControlContentSizing,
  override?: DeepPartial<ControlContentSizing>,
): ControlContentSizing {
  if (!override) return base;
  const normalized = override as {
    kind?: ControlContentSizing["kind"];
    size?: number;
    gap?: number;
  };

  const targetKind = normalized.kind ?? base.kind;
  if (targetKind === "fixed") {
    return {
      kind: "fixed",
      size: normalized.size ?? (base.kind === "fixed" ? base.size : 16),
      gap: normalized.gap ?? (base.kind === "fixed" ? base.gap : undefined),
    };
  }

  return { kind: "auto" };
}

function mergeControlSpec(
  base: ControlSpec,
  override?: ControlSpecOverride,
): ControlSpec {
  if (!override) return base;

  return {
    geometry: {
      ...base.geometry,
      ...override.geometry,
      size: mergeControlSize(base.geometry.size, override.geometry?.size),
      padding: mergeControlPadding(
        base.geometry.padding,
        override.geometry?.padding,
      ),
    },
    visual: {
      ...base.visual,
      ...override.visual,
    },
    content: {
      ...base.content,
      ...override.content,
      sizing: mergeContentSizing(base.content.sizing, override.content?.sizing),
    },
    interaction: {
      ...base.interaction,
      ...override.interaction,
    },
    slots: {
      ...base.slots,
      ...override.slots,
    },
  };
}

function mergeSlotClassName(
  resolvedClassName: string,
  overrideClassName: string | undefined,
): string {
  return (
    mergeClassNames(resolvedClassName, overrideClassName) ?? resolvedClassName
  );
}

function resolveFinal(
  baseSpec: ControlSpec,
  props: SecondaryRenderProps<string> | undefined,
  recipes: Record<string, ControlSpecOverride>,
  primaryFactory: PrimaryFactory,
) {
  const recipeSpec = resolveRecipeSpec(recipes, props?.recipe);
  const mergedSpec = mergeControlSpec(
    mergeControlSpec(baseSpec, recipeSpec),
    props?.specOverride,
  );

  const resolved = primaryFactory.resolveControl(mergedSpec, props?.runtime);
  const withSlots = mergeResolvedControl(resolved, {
    rootClassName: props?.className,
    contentClassName: props?.contentClassName,
    leadingClassName: props?.leadingClassName,
    trailingClassName: props?.trailingClassName,
    indicatorClassName: props?.indicatorClassName,
    rootStyle: props?.slots?.rootStyle,
    contentStyle: props?.slots?.contentStyle,
  });

  return {
    ...resolved,
    rootClassName: mergeSlotClassName(
      withSlots.rootClassName ?? resolved.rootClassName,
      props?.slots?.rootClassName,
    ),
    contentClassName: mergeSlotClassName(
      withSlots.contentClassName ?? resolved.contentClassName,
      props?.slots?.contentClassName,
    ),
    leadingClassName: mergeSlotClassName(
      withSlots.leadingClassName ?? resolved.leadingClassName,
      props?.slots?.leadingClassName,
    ),
    trailingClassName: mergeSlotClassName(
      withSlots.trailingClassName ?? resolved.trailingClassName,
      props?.slots?.trailingClassName,
    ),
    indicatorClassName: mergeSlotClassName(
      withSlots.indicatorClassName ?? resolved.indicatorClassName,
      props?.slots?.indicatorClassName,
    ),
    rootStyle: { ...(resolved.rootStyle ?? {}), ...(props?.slots?.rootStyle ?? {}) },
    contentStyle: {
      ...(resolved.contentStyle ?? {}),
      ...(props?.slots?.contentStyle ?? {}),
    },
  };
}

export function createSecondaryFactory<RecipeName extends string = string>(
  baseSpec: ControlSpec,
  options?: SecondaryFactoryOptions<RecipeName>,
): SecondaryFactory<RecipeName> {
  const primaryFactory =
    options?.primaryFactory ?? createPrimaryFactory(defaultPluginTable);
  const recipes = (options?.recipes ?? {}) as Record<
    RecipeName,
    ControlSpecOverride
  >;

  const api: SecondaryFactory<RecipeName> = {
    baseSpec,
    recipes,
    withRecipe: <NextRecipeName extends string>(
      recipeName: NextRecipeName,
      overrides: ControlSpecOverride,
    ) =>
      createSecondaryFactory(baseSpec, {
        primaryFactory,
        recipes: {
          ...recipes,
          [recipeName]: overrides,
        } as Record<RecipeName | NextRecipeName, ControlSpecOverride>,
      }),
    resolveSpec: (props) => {
      const recipeSpec = resolveRecipeSpec(
        recipes as Record<string, ControlSpecOverride>,
        props?.recipe,
      );
      return mergeControlSpec(
        mergeControlSpec(baseSpec, recipeSpec),
        props?.specOverride,
      );
    },
    renderProps: (props) =>
      resolveFinal(
        baseSpec,
        props as SecondaryRenderProps<string> | undefined,
        recipes as Record<string, ControlSpecOverride>,
        primaryFactory,
      ),
  };

  return api;
}
