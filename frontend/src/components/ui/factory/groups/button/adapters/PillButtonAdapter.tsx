import * as React from "react";
import {
  ControlPillButton,
  resolvePillButtonGeometry,
  type PillButtonGeometry,
  type PillButtonGeometryInput,
} from "../components";

export type PillButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive";

export interface PillButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: React.ReactNode;
  variant?: PillButtonVariant;
  height?: number;
  coreWidth?: number;
  inset?: number;
  contentClassName?: string;
}

const PillButton = React.forwardRef<HTMLButtonElement, PillButtonProps>(
  (
    {
      className,
      contentClassName,
      variant,
      height,
      coreWidth,
      inset,
      children,
      ...props
    },
    ref,
  ) => (
    <ControlPillButton
      ref={ref}
      className={className}
      contentClassName={contentClassName}
      variant={variant ?? "default"}
      height={height}
      coreWidth={coreWidth}
      inset={inset}
      {...props}
    >
      {children}
    </ControlPillButton>
  ),
);

PillButton.displayName = "PillButton";

export {
  PillButton,
  resolvePillButtonGeometry,
  type PillButtonGeometry,
  type PillButtonGeometryInput,
};
