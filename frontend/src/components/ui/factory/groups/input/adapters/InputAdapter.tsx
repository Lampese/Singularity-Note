import * as React from "react";
import { FactoryInput } from "../components";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <FactoryInput ref={ref} className={className} {...props} />
  ),
);

Input.displayName = "Input";

export { Input };
