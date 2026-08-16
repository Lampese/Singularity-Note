"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { listActionFactory, listRowFactory } from "./factories";

export interface FactoryListRowProps {
  leading?: React.ReactNode;
  label: React.ReactNode;
  meta?: React.ReactNode;
  trailingAction?: React.ReactNode;
  trailingSlotWidthPx?: number;
  leadingInsetPx?: number;
  metaInsetPx?: number;
  trailingInsetPx?: number;
  className?: string;
  labelClassName?: string;
  onClick?: () => void;
  onDoubleClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** @deprecated Native browser tooltip is disallowed by product guideline. */
  title?: string;
}

const DEFAULT_SLOT_INSET_PX = 8;

function toInsetStyle(insetPx: number): React.CSSProperties {
  const safe = Number.isFinite(insetPx) && insetPx >= 0 ? insetPx : DEFAULT_SLOT_INSET_PX;
  return {
    paddingInlineStart: `${safe}px`,
    paddingInlineEnd: `${safe}px`,
  };
}

export function FactoryListRow({
  leading,
  label,
  meta,
  trailingAction,
  trailingSlotWidthPx,
  leadingInsetPx = DEFAULT_SLOT_INSET_PX,
  metaInsetPx = DEFAULT_SLOT_INSET_PX,
  trailingInsetPx = DEFAULT_SLOT_INSET_PX,
  className,
  labelClassName,
  onClick,
  onDoubleClick,
  title,
}: FactoryListRowProps) {
  void title;
  const pointerInteractive = Boolean(onClick || onDoubleClick);
  const keyboardInteractive = Boolean(onClick);
  const resolved = listRowFactory.renderProps({
    recipe: "default",
    runtime: { disabled: false, interactive: pointerInteractive },
    className,
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!keyboardInteractive) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onClick?.();
  };

  const resolvedTrailingSlotWidthPx = typeof trailingSlotWidthPx === "number" && Number.isFinite(trailingSlotWidthPx) && trailingSlotWidthPx > 0
    ? trailingSlotWidthPx
    : null;
  const trailingSlotStyle = trailingAction && resolvedTrailingSlotWidthPx !== null
    ? {
        width: `${resolvedTrailingSlotWidthPx}px`,
        minWidth: `${resolvedTrailingSlotWidthPx}px`,
      } satisfies React.CSSProperties
    : undefined;

  return (
    <div
      className={cn(
        resolved.rootClassName,
        keyboardInteractive && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
      )}
      style={resolved.rootStyle}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      role={keyboardInteractive ? "button" : undefined}
      tabIndex={keyboardInteractive ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {leading ? (
        <span className="shrink-0 inline-flex items-center" style={toInsetStyle(leadingInsetPx)}>
          {leading}
        </span>
      ) : null}
      <div className={cn("flex-1 min-w-0 truncate text-sm", labelClassName)}>{label}</div>
      {meta || trailingAction ? (
        <span
          className="relative inline-flex min-w-0 shrink items-center justify-end"
          style={trailingSlotStyle}
        >
          {meta ? (
            <span
              className={cn(
                "inline-flex min-w-0 max-w-full items-center justify-end truncate",
                trailingAction && "transition-opacity group-hover:opacity-0 group-focus-within:opacity-0",
              )}
              style={toInsetStyle(metaInsetPx)}
            >
              {meta}
            </span>
          ) : null}
          {trailingAction ? (
            <span
              className={cn(
                "inline-flex min-w-0 items-center justify-end transition-opacity",
                meta
                  ? "pointer-events-none absolute inset-y-0 right-0 opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                  : "shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
              )}
              style={toInsetStyle(trailingInsetPx)}
            >
              {trailingAction}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

export type FactoryListActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const FactoryListAction = React.forwardRef<
  HTMLButtonElement,
  FactoryListActionProps
>(({ className, disabled, children, type, ...props }, ref) => {
  const resolved = listActionFactory.renderProps({
    recipe: "default",
    runtime: { disabled },
  });

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn("appearance-none border-0 shadow-none", resolved.rootClassName, className)}
      style={resolved.rootStyle}
      disabled={disabled}
      {...props}
    >
      <span className={resolved.contentClassName} style={resolved.contentStyle}>
        {children}
      </span>
    </button>
  );
});

FactoryListAction.displayName = "FactoryListAction";

export const ListActionButton = FactoryListAction;
