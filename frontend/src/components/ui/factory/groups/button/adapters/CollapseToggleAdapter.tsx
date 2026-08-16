"use client";

import {
  FactoryCollapseToggle,
  type CollapseDirectionConfig,
} from "../components";

export type { CollapseDirectionConfig };

export interface CollapseToggleProps {
  expanded: boolean;
  direction?: CollapseDirectionConfig;
  iconSize?: number;
  hintSize?: number | string;
  variant?: "plain" | "hint" | "control";
  className?: string;
  iconClassName?: string;
}

export function CollapseToggle(props: CollapseToggleProps) {
  return <FactoryCollapseToggle {...props} />;
}
