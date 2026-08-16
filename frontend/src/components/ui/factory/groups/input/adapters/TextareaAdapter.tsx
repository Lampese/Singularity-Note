import * as React from "react";
import { FactoryTextarea } from "../components";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <FactoryTextarea ref={ref} className={className} {...props} />
  ),
);

Textarea.displayName = "Textarea";

export { Textarea };
