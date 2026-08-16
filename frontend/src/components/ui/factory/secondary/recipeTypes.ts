import type { ControlRuntimeContext, ControlSlotSpec, ControlSpec, ResolvedControl } from "../core";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type ControlSpecOverride = DeepPartial<ControlSpec>;

export interface SecondaryRenderProps<RecipeName extends string = string> {
  recipe?: RecipeName;
  specOverride?: ControlSpecOverride;
  runtime?: ControlRuntimeContext;
  slots?: ControlSlotSpec;
  className?: string;
  contentClassName?: string;
  leadingClassName?: string;
  trailingClassName?: string;
  indicatorClassName?: string;
}

export interface SecondaryFactory<RecipeName extends string = string> {
  baseSpec: ControlSpec;
  recipes: Record<RecipeName, ControlSpecOverride>;
  withRecipe: <NextRecipeName extends string>(
    recipeName: NextRecipeName,
    overrides: ControlSpecOverride,
  ) => SecondaryFactory<RecipeName | NextRecipeName>;
  resolveSpec: (props?: SecondaryRenderProps<RecipeName>) => ControlSpec;
  renderProps: (props?: SecondaryRenderProps<RecipeName>) => ResolvedControl;
}
