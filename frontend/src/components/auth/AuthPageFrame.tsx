"use client";

import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { ThemeModeSwitch } from "@/components/ui/ThemeModeSwitch";
import { ControlButton } from "@/components/ui/factory/groups/button/components";
import { cn } from "@/lib/utils";

interface AuthPageFrameProps {
  title: string;
  description: string;
  eyebrow?: string;
  sideTitle?: string;
  sideDescription?: string;
  backLabel?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
}

export function AuthPageFrame({
  title,
  description,
  eyebrow = "Singularity Note",
  sideTitle = "为学习而生的工作台",
  sideDescription = "把资料、提问、证据、解释和复习任务留在同一个学习系统里，体验连续、清晰、可追溯。",
  backLabel,
  onBack,
  children,
  footer,
  contentClassName,
}: AuthPageFrameProps) {
  return (
    <main className="min-h-screen bg-bg px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col overflow-hidden rounded-[32px] border border-border/60 bg-[color:color-mix(in_srgb,var(--color-bg)_92%,transparent)] shadow-[var(--shadow-lg)] sm:min-h-[calc(100vh-3rem)] lg:flex-row">
        <aside className="relative flex min-h-[240px] flex-col justify-between overflow-hidden border-b border-border/50 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-accent-muted)_88%,transparent),transparent_42%),linear-gradient(180deg,color-mix(in_srgb,var(--color-surface)_88%,transparent),color-mix(in_srgb,var(--color-panel)_92%,transparent))] px-6 py-6 lg:min-h-full lg:w-[42%] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-7 w-auto text-text" />
              <div className="min-w-0">
                <p className="type-caption uppercase tracking-[0.22em] text-text-muted">
                  {eyebrow}
                </p>
              </div>
            </div>
            <ThemeModeSwitch placement="inline" />
          </div>

          <div className="mt-8 max-w-[26rem] space-y-4 lg:mt-auto lg:pb-2">
            <h2 className="type-hero-title max-w-[12ch] text-text">
              {sideTitle}
            </h2>
            <p className="type-body-secondary max-w-[34ch] text-text-secondary">
              {sideDescription}
            </p>
          </div>
        </aside>

        <section className="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg)_94%,transparent),color-mix(in_srgb,var(--color-panel)_90%,transparent))] px-4 py-6 sm:px-6 lg:px-8">
          <div
            className={cn(
              "frosted-surface-prominent auth-animate-in w-full max-w-xl rounded-[28px] px-5 py-5 sm:px-7 sm:py-7",
              contentClassName,
            )}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="type-caption uppercase tracking-[0.22em] text-text-muted">
                  {eyebrow}
                </p>
                <h1 className="type-page-title text-text">{title}</h1>
                <p className="type-body-secondary max-w-[40ch] text-text-secondary">
                  {description}
                </p>
              </div>
              {onBack ? (
                <ControlButton
                  type="button"
                  variant="menuGhost"
                  size="sm"
                  className="shrink-0"
                  leading={<ArrowLeftIcon size={14} weight="bold" />}
                  onClick={onBack}
                >
                  {backLabel ?? "返回"}
                </ControlButton>
              ) : null}
            </div>

            {children}

            {footer ? (
              <div className="mt-6 border-t border-border/50 pt-4">{footer}</div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
