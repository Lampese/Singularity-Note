import * as React from "react";
import { cn } from "@/lib/utils";
import {
  BUTTON_SIZE_OVERRIDES,
  buttonFactory,
  normalizeButtonRecipe,
} from "../factories";
import { ControlButton, type ControlButtonVariant } from "../components";

type LegacyButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type LegacyButtonSize = "default" | "sm" | "lg" | "icon";

export type ButtonVariantProps = {
  variant?: LegacyButtonVariant;
  size?: LegacyButtonSize;
};

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: ButtonVariantProps & { className?: string } = {}): string {
  const resolved = buttonFactory.renderProps({
    recipe: normalizeButtonRecipe(variant),
    specOverride: BUTTON_SIZE_OVERRIDES[size],
  });
  return cn(resolved.rootClassName, className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...rest }, ref) => (
    <ControlButton
      ref={ref}
      className={className}
      variant={(variant ?? "default") as ControlButtonVariant}
      size={size ?? "default"}
      {...rest}
    />
  ),
);

Button.displayName = "Button";

export { Button };
