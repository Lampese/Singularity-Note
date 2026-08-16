"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { InfoIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ControlButton, ControlIconButton } from "../button/components";
import { dialogShellFactory, popoverTriggerFactory } from "./factories";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

type DialogShellProps = {
  open: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  panelContent?: React.ReactNode;
  onClose: () => void;
  overlayClassName?: string;
  panelClassName?: string;
  panelStyle?: React.CSSProperties;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  hideCloseButton?: boolean;
  placement?: "center" | "right";
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );

  return candidates.filter((el) => {
    if (el.hasAttribute("disabled")) return false;
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.tabIndex < 0) return false;
    return true;
  });
}

export function DialogShell({
  open,
  title,
  description,
  icon,
  children,
  panelContent,
  onClose,
  overlayClassName,
  panelClassName,
  panelStyle,
  closeOnBackdrop = true,
  closeOnEsc = true,
  hideCloseButton = false,
  placement = "center",
}: DialogShellProps) {
  const DIALOG_CLOSE_BUTTON_GAP_PX = 16;
  const DIALOG_CORNER_RADIUS_PX = 28;
  const [mounted, setMounted] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(open);
  const [panelVisible, setPanelVisible] = React.useState(false);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const panelEnterTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelUnmountTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const DIALOG_ANIMATION_MS = 240;
  const isRightPlacement = placement === "right";
  useBodyScrollLock(open);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (panelEnterTimerRef.current) {
      clearTimeout(panelEnterTimerRef.current);
      panelEnterTimerRef.current = null;
    }
    if (panelUnmountTimerRef.current) {
      clearTimeout(panelUnmountTimerRef.current);
      panelUnmountTimerRef.current = null;
    }

    if (open) {
      setShouldRender(true);
      setPanelVisible(false);
      panelEnterTimerRef.current = setTimeout(() => {
        setPanelVisible(true);
        panelEnterTimerRef.current = null;
      }, 16);
      return;
    }

    setPanelVisible(false);
    panelUnmountTimerRef.current = setTimeout(() => {
      setShouldRender(false);
      panelUnmountTimerRef.current = null;
    }, DIALOG_ANIMATION_MS);

    return () => {
      if (panelEnterTimerRef.current) {
        clearTimeout(panelEnterTimerRef.current);
        panelEnterTimerRef.current = null;
      }
      if (panelUnmountTimerRef.current) {
        clearTimeout(panelUnmountTimerRef.current);
        panelUnmountTimerRef.current = null;
      }
    };
  }, [open]);

  React.useEffect(() => {
    return () => {
      if (panelEnterTimerRef.current) {
        clearTimeout(panelEnterTimerRef.current);
        panelEnterTimerRef.current = null;
      }
      if (panelUnmountTimerRef.current) {
        clearTimeout(panelUnmountTimerRef.current);
        panelUnmountTimerRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEsc) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusables = getFocusableElements(panel);
      if (focusables.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (event.shiftKey) {
        if (!active || !panel.contains(active) || active === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (!active || !panel.contains(active) || active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeOnEsc, onClose, open]);

  React.useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const raf = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = getFocusableElements(panel);
      const target = focusables[0] ?? panel;
      target.focus();
    });

    return () => {
      window.cancelAnimationFrame(raf);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  if (!mounted || !shouldRender) return null;

  const panelResolved = dialogShellFactory.renderProps({ recipe: "dialogShell" });
  const panelLayoutClass = isRightPlacement
    ? "relative h-auto shrink-0 flex w-full max-w-md max-h-[calc(100dvh-2rem)] cursor-default flex-col items-stretch overflow-hidden pointer-events-auto ml-auto mr-0 my-0"
    : "relative h-auto shrink-0 flex w-full max-w-md max-h-[calc(100dvh-2rem)] cursor-default flex-col items-stretch overflow-hidden pointer-events-auto mx-auto my-auto";
  const usesCustomPanelContent = panelContent !== undefined;
  const panelMotionClass = isRightPlacement
    ? panelVisible
      ? "opacity-100 translate-x-0"
      : "opacity-0 translate-x-6"
    : panelVisible
      ? "opacity-100 translate-y-0 scale-100"
      : "opacity-0 translate-y-2 scale-[0.95]";

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-300 overflow-y-auto overscroll-contain bg-[color:color-mix(in_srgb,var(--color-context-overlay)_82%,transparent)] px-4 py-4 backdrop-blur-[14px] transition-all [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
        overlayClassName,
        panelVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        closeOnBackdrop ? "cursor-pointer" : "cursor-default",
      )}
      style={{
        paddingTop: "max(1rem, calc(env(safe-area-inset-top) + 0.75rem))",
        paddingBottom: "max(1rem, calc(env(safe-area-inset-bottom) + 0.75rem))",
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && closeOnBackdrop) {
          onClose();
        }
      }}
    >
      <div className="pointer-events-none flex min-h-full flex-col">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={usesCustomPanelContent ? title : undefined}
          aria-labelledby={usesCustomPanelContent ? undefined : titleId}
          aria-describedby={
            usesCustomPanelContent || !description ? undefined : descriptionId
          }
          tabIndex={-1}
          className={cn(
            panelClassName
              ? cn(panelResolved.rootClassName, panelLayoutClass, panelClassName)
              : cn(panelResolved.rootClassName, panelLayoutClass),
            "transform-gpu transition-[opacity,transform] [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
            panelMotionClass,
          )}
          style={{
            ...(panelResolved.rootStyle ?? {}),
            ...(panelStyle ?? {}),
            borderRadius: `${DIALOG_CORNER_RADIUS_PX}px`,
          }}
        >
          {!hideCloseButton ? (
            <ControlIconButton
              type="button"
              variant="toolbar"
              size="iconLg"
              icon={<XIcon size={18} weight="bold" />}
              onClick={onClose}
              aria-label="关闭"
              className="absolute z-20 h-11 w-11 rounded-full bg-transparent p-0 text-text-muted transition-colors [transition-duration:var(--motion-duration-fast)] [transition-timing-function:var(--motion-ease-standard)] hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 motion-reduce:transition-none"
              style={{
                right: `${DIALOG_CLOSE_BUTTON_GAP_PX}px`,
                top: `${DIALOG_CLOSE_BUTTON_GAP_PX}px`,
              }}
            />
          ) : null}
          {usesCustomPanelContent ? (
            <>{panelContent}</>
          ) : (
            <div className="min-h-0 overflow-y-auto overscroll-contain pr-1">
              <div className="min-w-0 pr-9">
                <div className={cn("min-w-0 flex items-center", icon ? "gap-3" : "")}>
                  {icon ? <span className="shrink-0 leading-none">{icon}</span> : null}
                  <h2 id={titleId} className="text-3xl font-semibold leading-tight text-text">
                    {title}
                  </h2>
                </div>
                {description ? (
                  <p
                    id={descriptionId}
                    className={cn(
                      "mt-2 text-lg leading-relaxed text-text-secondary",
                      icon ? "pl-11" : "",
                    )}
                  >
                    {description}
                  </p>
                ) : null}
              </div>
              <div className="mt-5">{children}</div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

type ConfirmPatternProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmPattern({
  open,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmPatternProps) {
  return (
    <DialogShell
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      icon={<WarningCircleIcon size={32} className="text-warning shrink-0" weight="fill" />}
    >
      <div className="flex flex-wrap justify-end gap-3">
        <ControlButton
          type="button"
          variant="unstyled"
          onClick={onCancel}
          disabled={loading}
          className="min-h-[44px] min-w-[108px] rounded-2xl bg-surface-sub px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface hover:text-text disabled:opacity-50"
        >
          {cancelText}
        </ControlButton>
        <ControlButton
          type="button"
          variant="unstyled"
          onClick={onConfirm}
          disabled={loading}
          className="min-h-[44px] min-w-[120px] rounded-2xl bg-error px-4 text-sm font-semibold text-text-inverse transition-colors hover:bg-error/90 disabled:opacity-50"
        >
          {loading ? "处理中..." : confirmText}
        </ControlButton>
      </div>
    </DialogShell>
  );
}

type InfoPatternProps = {
  open: boolean;
  title: string;
  description?: string;
  details?: string;
  closeText?: string;
  actionText?: string;
  onClose: () => void;
  onAction?: () => void;
};

export function InfoPattern({
  open,
  title,
  description,
  details,
  closeText = "关闭",
  actionText = "继续",
  onClose,
  onAction,
}: InfoPatternProps) {
  return (
    <DialogShell
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      icon={<InfoIcon size={20} className="text-accent shrink-0" weight="fill" />}
    >
      {details ? (
        <div className="mb-4 rounded-[18px] bg-panel/75 px-4 py-3 text-sm text-text-secondary">
          {details}
        </div>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2">
        <ControlButton
          type="button"
          variant="menuGhost"
          size="sm"
          onClick={onClose}
          className="min-w-24"
        >
          {closeText}
        </ControlButton>
        {onAction ? (
          <ControlButton
            type="button"
            variant="menuPrimary"
            size="sm"
            onClick={onAction}
            className="min-w-28"
          >
            {actionText}
          </ControlButton>
        ) : null}
      </div>
    </DialogShell>
  );
}

export type PopoverTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  PopoverTriggerProps
>(({ className, children, disabled, ...props }, ref) => {
  const resolved = popoverTriggerFactory.renderProps({
    recipe: "popoverTrigger",
    runtime: { disabled },
    className,
  });

  return (
    <button
      ref={ref}
      type="button"
      className={resolved.rootClassName}
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

PopoverTrigger.displayName = "PopoverTrigger";
