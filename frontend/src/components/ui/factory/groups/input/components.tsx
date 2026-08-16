"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldShellFactory, inputFactory, textareaFactory, TEXTAREA_SIZE_OVERRIDE } from "./factories";

export type FactoryInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  recipe?: "default";
};

export const FactoryInput = React.forwardRef<HTMLInputElement, FactoryInputProps>(
  ({ className, disabled, recipe = "default", ...props }, ref) => {
    const resolved = inputFactory.renderProps({
      recipe,
      runtime: { disabled },
      className,
    });

    return (
      <input
        ref={ref}
        className={cn("text-left [direction:ltr] [unicode-bidi:plaintext]", resolved.rootClassName)}
        style={resolved.rootStyle}
        disabled={disabled}
        dir="ltr"
        {...props}
      />
    );
  },
);

FactoryInput.displayName = "FactoryInput";

export type FactorySelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  recipe?: "default";
};

export const FactorySelect = React.forwardRef<HTMLSelectElement, FactorySelectProps>(
  ({ className, disabled, recipe = "default", ...props }, ref) => {
    const resolved = inputFactory.renderProps({
      recipe,
      runtime: { disabled },
      className: cn(
        "cursor-default transition-none motion-reduce:transition-none",
        className,
      ),
    });

    return (
      <select
        ref={ref}
        className={resolved.rootClassName}
        style={resolved.rootStyle}
        disabled={disabled}
        {...props}
      />
    );
  },
);

FactorySelect.displayName = "FactorySelect";

export type FactoryTextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    recipe?: "default";
  };

export const FactoryTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FactoryTextareaProps
>(({ className, disabled, recipe = "default", ...props }, ref) => {
  const resolved = textareaFactory.renderProps({
    recipe,
    runtime: { disabled },
    className,
    specOverride: TEXTAREA_SIZE_OVERRIDE,
  });

  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[80px] text-left [direction:ltr] [unicode-bidi:plaintext]",
        resolved.rootClassName,
      )}
      style={resolved.rootStyle}
      disabled={disabled}
      dir="ltr"
      {...props}
    />
  );
});

FactoryTextarea.displayName = "FactoryTextarea";

export interface FieldShellProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  children: React.ReactNode;
}

export function FieldShell({
  label,
  description,
  error,
  className,
  labelClassName,
  descriptionClassName,
  errorClassName,
  children,
}: FieldShellProps) {
  const resolved = fieldShellFactory.renderProps({ className });

  return (
    <div className={resolved.rootClassName} style={resolved.rootStyle}>
      {label ? (
        <label className={cn("mb-1.5 block text-sm font-medium text-text", labelClassName)}>
          {label}
        </label>
      ) : null}
      {children}
      {description ? (
        <p className={cn("mt-1.5 text-xs text-text-secondary", descriptionClassName)}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p className={cn("mt-1.5 text-xs text-error", errorClassName)}>{error}</p>
      ) : null}
    </div>
  );
}
