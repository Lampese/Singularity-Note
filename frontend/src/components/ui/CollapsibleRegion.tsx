"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface CollapsibleRegionProps {
  expanded: boolean;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  unmountOnExit?: boolean;
  genie?: boolean;
  transitionDuration?: string;
}

function GridCollapsible({
  expanded,
  children,
  className,
  innerClassName,
  transitionDuration,
}: {
  expanded: boolean;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  transitionDuration: string;
}) {
  return (
    <div
      className={cn("grid motion-reduce:transition-none", className)}
      style={{
        gridTemplateRows: expanded ? "1fr" : "0fr",
        transitionProperty: "grid-template-rows",
        transitionDuration,
        transitionTimingFunction: "var(--motion-ease-standard)",
      }}
      aria-hidden={!expanded}
      inert={!expanded}
    >
      <div className={cn("min-h-0 overflow-hidden", innerClassName)}>
        {children}
      </div>
    </div>
  );
}

function GenieCollapsible({
  expanded,
  children,
  className,
  innerClassName,
  transitionDuration,
}: {
  expanded: boolean;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  transitionDuration: string;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  const measure = useCallback(() => {
    if (innerRef.current) {
      const nextHeight = innerRef.current.scrollHeight;
      setHeight((currentHeight) =>
        currentHeight === nextHeight ? currentHeight : nextHeight,
      );
    }
  }, []);

  useEffect(() => {
    measure();
    if (!innerRef.current) return;
    const ro = new ResizeObserver(measure);
    ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const dur = transitionDuration;
  const ease = "cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div
      className={cn("overflow-hidden", className)}
      style={{
        height: expanded ? height : 0,
        transitionProperty: "height",
        transitionDuration: dur,
        transitionTimingFunction: ease,
      }}
      aria-hidden={!expanded}
      inert={!expanded ? true : undefined}
    >
      <div
        ref={innerRef}
        className={cn(innerClassName)}
        style={{
          opacity: expanded ? 1 : 0,
          transform: expanded
            ? "none"
            : "scaleY(0.35) scaleX(0.92) translateY(-8px)",
          transformOrigin: "top center",
          transitionProperty: "opacity, transform",
          transitionDuration: dur,
          transitionTimingFunction: ease,
          willChange: "opacity, transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function CollapsibleRegion({
  expanded,
  children,
  className,
  innerClassName,
  unmountOnExit = false,
  genie = false,
  transitionDuration = "var(--motion-duration-medium)",
}: CollapsibleRegionProps) {
  if (!expanded && unmountOnExit) {
    return null;
  }

  if (genie) {
    return (
      <GenieCollapsible
        expanded={expanded}
        className={className}
        innerClassName={innerClassName}
        transitionDuration={transitionDuration}
      >
        {children}
      </GenieCollapsible>
    );
  }

  return (
    <GridCollapsible
      expanded={expanded}
      className={className}
      innerClassName={innerClassName}
      transitionDuration={transitionDuration}
    >
      {children}
    </GridCollapsible>
  );
}
