"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { layout } from "@/styles/layout";

export interface WorkspaceSidebarShellProps {
  collapsed: boolean;
  width: number;
  onResizeStart: () => void;
  header: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
  bodyProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function WorkspaceSidebarShell({
  collapsed,
  width,
  onResizeStart,
  header,
  body,
  footer,
  bodyProps,
}: WorkspaceSidebarShellProps) {
  const { className: bodyClassName, ...resolvedBodyProps } = bodyProps ?? {};

  return (
    <aside
      className={layout.overlaySidebar({ collapsed })}
      style={{ width: `${width}px` }}
    >
      <div
        className="absolute right-0 top-0 bottom-0 z-50 w-1 cursor-col-resize bg-transparent transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] hover:bg-accent/50 active:bg-accent motion-reduce:transition-none"
        onMouseDown={(event) => {
          event.preventDefault();
          onResizeStart();
        }}
      />

      <div
        className="flex h-full min-h-0 shrink-0 flex-col"
        style={{ width: `${width}px`, minWidth: `${width}px` }}
      >
        <div className="px-[var(--sidebar-shell-edge-gap-x)]">{header}</div>
        <div
          {...resolvedBodyProps}
          className={cn("px-[var(--sidebar-shell-edge-gap-x)]", bodyClassName)}
        >
          {body}
        </div>
        {footer ? (
          <div className="mt-auto shrink-0 px-[var(--sidebar-shell-edge-gap-x)]">
            {footer}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
