"use client";

import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import {
  TourProvider,
  useTour,
  type PopoverContentProps,
  type StepType,
} from "@reactour/tour";
import { ControlButton } from "@/components/ui/factory/groups/button/components";
import { cn } from "@/lib/utils";
import type { WorkspaceTourStep } from "@/hooks/useWorkspaceTour";

const WORKSPACE_TOUR_OVERLAY_COLOR = "rgba(0, 0, 0, 0.58)";
const WORKSPACE_TOUR_SPOTLIGHT_PADDING = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 16;

function getTargetElement(selector: WorkspaceTourStep["selector"]): HTMLElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  const element = document.querySelector(selector);
  return element instanceof HTMLElement ? element : null;
}

function resolveSpotlightRadius(selector: WorkspaceTourStep["selector"]): number {
  const element = getTargetElement(selector);
  if (!element) {
    return DEFAULT_SPOTLIGHT_RADIUS;
  }

  const borderRadius = window.getComputedStyle(element).borderRadius;
  const parsedRadius = Number.parseFloat(borderRadius);
  return Number.isFinite(parsedRadius) ? parsedRadius : DEFAULT_SPOTLIGHT_RADIUS;
}

function resolveMaskPadding(step: WorkspaceTourStep): number {
  return typeof step.maskPadding === "number" ? step.maskPadding : WORKSPACE_TOUR_SPOTLIGHT_PADDING;
}

function resolveMaskAreaRadius(
  step: WorkspaceTourStep,
  width: number | undefined,
  height: number | undefined,
): number {
  const maxAllowedRadius = Math.min((width ?? 0) / 2, (height ?? 0) / 2);
  const paddedHeightRadius = (height ?? 0) / 2;

  if (!Number.isFinite(maxAllowedRadius) || maxAllowedRadius <= 0) {
    return step.shape === "pill"
      ? paddedHeightRadius || DEFAULT_SPOTLIGHT_RADIUS
      : resolveSpotlightRadius(step.selector) + resolveMaskPadding(step);
  }

  if (step.shape === "pill") {
    return maxAllowedRadius;
  }

  const elementRadius = resolveSpotlightRadius(step.selector);
  const paddedRadius = elementRadius + resolveMaskPadding(step);
  return Math.min(paddedRadius, maxAllowedRadius);
}

function renderStepContent(content: StepType["content"], props: PopoverContentProps): ReactNode {
  if (typeof content === "function") {
    return content(props) ?? null;
  }

  return content;
}

function createWorkspaceTourContent(onClose: () => void) {
  function WorkspaceTourContent(props: PopoverContentProps) {
    const isLastStep = props.currentStep === props.steps.length - 1;
    const step = props.steps[props.currentStep];

    const handleClose = () => {
      props.setIsOpen(false);
      onClose();
    };

    const handleNext = () => {
      if (isLastStep) {
        handleClose();
        return;
      }

      props.setCurrentStep((value) => value + 1);
    };

    return (
      <div
        className={cn(
          "frosted-surface-prominent w-[min(24rem,calc(100vw-2rem))] rounded-[28px] px-5 py-5 text-text ring-0 outline-none",
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="type-caption text-text-muted">
              步骤 {props.currentStep + 1} / {props.steps.length}
            </p>
          </div>
        </div>

        <div className="text-sm leading-6 text-text-secondary">
          {renderStepContent(step.content, props)}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <ControlButton
            type="button"
            variant="unstyled"
            className="rounded-2xl px-4 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
            onClick={handleClose}
          >
            跳过引导
          </ControlButton>

          <div className="flex items-center gap-2">
            {props.currentStep > 0 && (
              <ControlButton
                type="button"
                variant="unstyled"
                className="rounded-2xl bg-surface-sub px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface hover:text-text"
                onClick={() => props.setCurrentStep((value) => Math.max(0, value - 1))}
              >
                上一步
              </ControlButton>
            )}
            <ControlButton
              type="button"
              variant="unstyled"
              className="rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-hover"
              onClick={handleNext}
            >
              {isLastStep ? "完成" : "下一步"}
            </ControlButton>
          </div>
        </div>
      </div>
    );
  }

  WorkspaceTourContent.displayName = "WorkspaceTourContent";

  return WorkspaceTourContent;
}

function WorkspaceTourController({ run }: { run: boolean }) {
  const { setIsOpen } = useTour();

  useEffect(() => {
    setIsOpen(run);
  }, [run, setIsOpen]);

  return null;
}

export interface WorkspaceTourProps {
  children: ReactNode;
  sessionKey: number;
  run: boolean;
  steps: WorkspaceTourStep[];
  prefersReducedMotion: boolean;
  onClose: () => void;
}

export function WorkspaceTour({
  children,
  sessionKey,
  run,
  steps,
  prefersReducedMotion,
  onClose,
}: WorkspaceTourProps) {
  const tourSteps = useMemo<StepType[]>(() => (
    steps.map((step) => ({
      selector: step.selector,
      position: step.position,
      padding: {
        mask: resolveMaskPadding(step),
        popover: WORKSPACE_TOUR_SPOTLIGHT_PADDING,
      },
      content: (
        <>
          <h3 className="mt-1 text-sm font-semibold text-text">{step.title}</h3>
          <div className="mt-2">{step.content}</div>
        </>
      ),
      styles: {
        maskArea: (base, state) => ({
          ...base,
          rx: resolveMaskAreaRadius(step, state?.width, state?.height),
          transition: "none",
        }),
      },
    }))
  ), [steps]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const ContentComponent = useMemo(() => createWorkspaceTourContent(handleClose), [handleClose]);

  return (
    <TourProvider
      key={sessionKey}
      steps={tourSteps}
      startAt={0}
      ContentComponent={ContentComponent}
      showCloseButton={false}
      showBadge={false}
      showDots={false}
      showNavigation={false}
      showPrevNextButtons={false}
      disableKeyboardNavigation
      onClickMask={() => {}}
      padding={{ popover: WORKSPACE_TOUR_SPOTLIGHT_PADDING }}
      styles={{
        maskWrapper: (base) => ({
          ...base,
          color: WORKSPACE_TOUR_OVERLAY_COLOR,
        }),
        maskArea: (base) => ({
          ...base,
          transition: "none",
        }),
        popover: (base) => ({
          ...base,
          backgroundColor: "transparent",
          boxShadow: "none",
          color: "inherit",
          maxWidth: "min(24rem, calc(100vw - 2rem))",
          padding: 0,
          transition: prefersReducedMotion ? "none" : "transform 140ms ease-out",
        }),
      }}
    >
      <WorkspaceTourController run={run} />
      {children}
    </TourProvider>
  );
}
