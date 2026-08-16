"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/Input";

export interface PillFieldProps extends Omit<InputProps, "children"> {
  leading?: React.ReactNode;
  shellClassName?: string;
}

export function PillField({
  leading,
  className,
  shellClassName,
  ...props
}: PillFieldProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 w-full items-center gap-2",
        shellClassName,
      )}
    >
      {leading ? (
        <span className="shrink-0 text-text-muted">
          {leading}
        </span>
      ) : null}
      <Input
        {...props}
        className={cn(
          "min-h-0 h-auto min-w-0 flex-1 rounded-full border-0 bg-surface/80 px-3 py-1 text-sm leading-none shadow-none focus:ring-0",
          className,
        )}
      />
    </div>
  );
}
