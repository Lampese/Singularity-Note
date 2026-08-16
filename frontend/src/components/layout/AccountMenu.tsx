"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useRouter } from "next/navigation";
import {
  GearSixIcon,
  SignOutIcon,
  SpinnerGapIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { logout } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { ControlButton } from "@/components/ui/factory/groups/button/components";

export interface AccountMenuProps {
  open: boolean;
  onClose: () => void;
  email: string;
  triggerRef?: RefObject<HTMLElement | null>;
  onOpenAccountInfo: () => void;
  onOpenSettings: () => void;
}

export function AccountMenu({
  open,
  onClose,
  email,
  triggerRef,
  onOpenAccountInfo,
  onOpenSettings,
}: AccountMenuProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const panelOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelUnmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [shouldRenderPanel, setShouldRenderPanel] = useState(open);
  const [panelExpanded, setPanelExpanded] = useState(open);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;
      onClose();
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose, open, triggerRef]);

  useEffect(() => {
    if (panelOpenTimerRef.current) {
      clearTimeout(panelOpenTimerRef.current);
      panelOpenTimerRef.current = null;
    }
    if (panelUnmountTimerRef.current) {
      clearTimeout(panelUnmountTimerRef.current);
      panelUnmountTimerRef.current = null;
    }

    if (open) {
      setShouldRenderPanel(true);
      setPanelExpanded(false);
      panelOpenTimerRef.current = setTimeout(() => {
        setPanelExpanded(true);
        panelOpenTimerRef.current = null;
      }, 16);
      return;
    }

    setPanelExpanded(false);
    panelUnmountTimerRef.current = setTimeout(() => {
      setShouldRenderPanel(false);
      panelUnmountTimerRef.current = null;
    }, 240);

    return () => {
      if (panelOpenTimerRef.current) {
        clearTimeout(panelOpenTimerRef.current);
        panelOpenTimerRef.current = null;
      }
      if (panelUnmountTimerRef.current) {
        clearTimeout(panelUnmountTimerRef.current);
        panelUnmountTimerRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (panelOpenTimerRef.current) {
        clearTimeout(panelOpenTimerRef.current);
        panelOpenTimerRef.current = null;
      }
      if (panelUnmountTimerRef.current) {
        clearTimeout(panelUnmountTimerRef.current);
        panelUnmountTimerRef.current = null;
      }
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      onClose();
      router.push("/");
    } finally {
      setLoggingOut(false);
    }
  };

  if (!shouldRenderPanel) return null;

  const initial = email.split("@")[0]?.[0]?.toUpperCase() || "?";

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute right-0 bottom-full left-0 z-50 mb-1 px-2",
        panelExpanded ? "" : "pointer-events-none",
      )}
    >
      <div
        className={cn(
          "panel-fold panel-fold-up",
          panelExpanded ? "panel-fold-open" : "panel-fold-closed",
        )}
      >
        <div className="panel-fold-inner">
          <div className="frosted-surface-subtle rounded-[26px] p-1.5">
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-text-inverse">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text">{email}</span>
              </div>
            </div>

            <div className="grid gap-1">
              <ControlButton
                type="button"
                variant="menuGhost"
                className="min-h-[44px] w-full justify-start rounded-xl px-3 text-sm font-semibold"
                onClick={onOpenAccountInfo}
              >
                <UserCircleIcon size={16} weight="bold" />
                账户信息
              </ControlButton>
              <ControlButton
                type="button"
                variant="menuGhost"
                className="min-h-[44px] w-full justify-start rounded-xl px-3 text-sm font-semibold"
                data-tour-id="workspace-settings-entry"
                onClick={onOpenSettings}
              >
                <GearSixIcon size={16} weight="bold" />
                设置
              </ControlButton>
              <ControlButton
                type="button"
                variant="menuDangerSubtle"
                className="min-h-[44px] w-full justify-start gap-2 rounded-xl px-3 text-sm font-semibold"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <SpinnerGapIcon size={14} className="animate-spin" />
                ) : (
                  <SignOutIcon size={14} weight="bold" />
                )}
                退出登录
              </ControlButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
