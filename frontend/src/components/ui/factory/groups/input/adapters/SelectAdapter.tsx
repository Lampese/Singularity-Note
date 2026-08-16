import * as React from "react";
import { FactorySelect } from "../components";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <FactorySelect ref={ref} className={className} {...props} />
  ),
);

Select.displayName = "Select";

export { Select };
