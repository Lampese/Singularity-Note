"use client";

import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { DemoStageSize } from "./landingDemoData";

const styles = {
  shell: cva(
    "relative flex h-full flex-col overflow-hidden rounded-[32px] border p-4 shadow-[0_24px_90px_rgba(15,23,42,0.1)] backdrop-blur-sm sm:p-5",
    {
      variants: {
        tone: {
          light:
            "border-[rgba(208,215,222,0.82)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,248,252,0.96))] text-[var(--text-dark)]",
          dark:
            "border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(19,25,32,0.95),rgba(13,18,23,0.96))] text-[var(--text)]",
        },
      },
      defaultVariants: {
        tone: "light",
      },
    },
  ),
  viewport: cva("relative mt-1 overflow-hidden rounded-[26px] border p-3 sm:p-4", {
    variants: {
      tone: {
        light:
          "border-[rgba(208,215,222,0.78)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,248,252,0.92))]",
        dark:
          "border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))]",
      },
      stageSize: {
        medium: "h-[420px] sm:h-[448px] lg:h-[468px]",
        tall: "h-[520px] sm:h-[564px] lg:h-[584px]",
      },
    },
    defaultVariants: {
      tone: "light",
      stageSize: "medium",
    },
  }),
  windowFrame: cva("flex h-full flex-col overflow-hidden rounded-[22px] border shadow-[0_18px_48px_rgba(15,23,42,0.08)]", {
    variants: {
      tone: {
        light: "border-[rgba(208,215,222,0.82)] bg-[rgba(255,255,255,0.94)]",
        dark: "border-[rgba(255,255,255,0.08)] bg-[rgba(19,25,32,0.94)]",
      },
    },
    defaultVariants: {
      tone: "light",
    },
  }),
  windowChrome: cva("flex items-center justify-between border-b px-4 py-3", {
    variants: {
      tone: {
        light: "border-[rgba(208,215,222,0.72)] bg-[rgba(248,250,252,0.88)]",
        dark: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]",
      },
    },
    defaultVariants: {
      tone: "light",
    },
  }),
  windowDots: cva("flex items-center gap-1.5"),
  windowDot: cva("h-2.5 w-2.5 rounded-full", {
    variants: {
      tone: {
        light: "bg-[rgba(148,163,184,0.36)]",
        dark: "bg-[rgba(255,255,255,0.2)]",
      },
    },
    defaultVariants: {
      tone: "light",
    },
  }),
  windowTitle: cva("text-xs font-medium tracking-[0.02em]", {
    variants: {
      tone: {
        light: "text-[var(--text-dark-secondary)]",
        dark: "text-[var(--text-secondary)]",
      },
    },
    defaultVariants: {
      tone: "light",
    },
  }),
  windowBody: cva("min-h-0 flex-1 overflow-hidden p-4", {
    variants: {
      tone: {
        light: "bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.94))]",
        dark: "bg-[linear-gradient(180deg,rgba(19,25,32,0.96),rgba(13,18,23,0.96))]",
      },
    },
    defaultVariants: {
      tone: "light",
    },
  }),
};

export interface FeatureDemoCardProps {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  stageSize?: DemoStageSize;
  viewportClassName?: string;
}

export interface FeatureWindowProps {
  title: string;
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  bodyClassName?: string;
}

export interface DemoSceneStackProps {
  children: ReactNode;
  className?: string;
}

export interface DemoSceneProps {
  active: boolean;
  children: ReactNode;
  className?: string;
}

export function DemoSceneStack({ children, className }: DemoSceneStackProps) {
  return <div className={cn("relative h-full w-full overflow-hidden", className)}>{children}</div>;
}

export function DemoScene({ active, children, className }: DemoSceneProps) {
  return (
    <div
      aria-hidden={!active}
      className={cn(
        "absolute inset-0 transition-opacity [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
        active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FeatureDemoCard({
  children,
  tone = "light",
  className,
  stageSize = "medium",
  viewportClassName,
}: FeatureDemoCardProps) {
  return (
    <article className={cn(styles.shell({ tone }), className)}>
      <div className={cn(styles.viewport({ tone, stageSize }), viewportClassName)}>{children}</div>
    </article>
  );
}

export function FeatureWindow({
  title,
  children,
  tone = "light",
  className,
  bodyClassName,
}: FeatureWindowProps) {
  return (
    <div className={cn(styles.windowFrame({ tone }), className)}>
      <div className={styles.windowChrome({ tone })}>
        <div className={styles.windowDots()}>
          <span className={styles.windowDot({ tone })} />
          <span className={styles.windowDot({ tone })} />
          <span className={styles.windowDot({ tone })} />
        </div>
        <span className={styles.windowTitle({ tone })}>{title}</span>
      </div>
      <div className={cn(styles.windowBody({ tone }), bodyClassName)}>{children}</div>
    </div>
  );
}
