"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MoonIcon, SunIcon, TextAUnderlineIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ControlIconButton } from "@/components/ui/factory/groups/button/components";
import {
  DEFAULT_THEME_PREFERENCE_MODE,
  type ThemePreferenceMode,
} from "@/lib/theme/themeConfig";
import {
  isWorkspaceThemeRoute,
  setThemeMode,
  syncThemeForPath,
  syncSystemThemeWhenAuto,
} from "@/lib/theme/themePreference";

interface ThemeModeSwitchProps {
  className?: string;
  placement?: "fixed" | "inline";
  hidden?: boolean;
  showModeLabel?: boolean;
  containerClassName?: string;
  labelClassName?: string;
}

const MODE_CYCLE: ThemePreferenceMode[] = ["light", "dark", "auto"];

const MODE_LABEL: Record<ThemePreferenceMode, string> = {
  light: "亮色",
  dark: "暗色",
  auto: "跟随系统",
};

const MODE_ICON_COLOR: Record<ThemePreferenceMode, string> = {
  light: "var(--color-interaction-theme-switch-handle-light)",
  dark: "var(--color-interaction-theme-switch-handle-dark)",
  auto: "var(--color-interaction-theme-switch-auto)",
};

function getNextMode(mode: ThemePreferenceMode): ThemePreferenceMode {
  const index = MODE_CYCLE.indexOf(mode);
  return MODE_CYCLE[(index + 1) % MODE_CYCLE.length];
}

export function ThemeModeSwitch({
  className,
  placement = "fixed",
  hidden = false,
  showModeLabel = false,
  containerClassName,
  labelClassName,
}: ThemeModeSwitchProps) {
  const [mode, setModeState] = useState<ThemePreferenceMode>(DEFAULT_THEME_PREFERENCE_MODE);
  const pathname = usePathname();

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      const nextMode = syncThemeForPath(pathname);
      setModeState(nextMode);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [pathname]);

  useEffect(() => {
    if (mode !== "auto" || typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => {
      syncSystemThemeWhenAuto(pathname);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [mode, pathname]);

  const targetMode = getNextMode(mode);
  const currentColor = MODE_ICON_COLOR[mode];

  const onToggle = () => {
    setThemeMode(targetMode);
    setModeState(targetMode);
  };

  const iconNode = mode === "light"
    ? <SunIcon size={15} weight="fill" aria-hidden />
    : mode === "dark"
      ? <MoonIcon size={15} weight="fill" aria-hidden />
      : <TextAUnderlineIcon size={15} weight="bold" aria-hidden />;

  const controlSize = placement === "fixed" ? "iconLg" : "iconMd";

  const button = (
    <ControlIconButton
      type="button"
      variant="floating"
      size={controlSize}
      icon={iconNode}
      aria-live="polite"
      aria-label={`当前${MODE_LABEL[mode]}主题，点击切换到${MODE_LABEL[targetMode]}主题`}
      onClick={onToggle}
      className={cn("pointer-events-auto border-0", className)}
      style={{
        color: currentColor,
        backgroundColor: `color-mix(in srgb, ${currentColor} 12%, transparent)`,
      }}
    >
      <span className="sr-only">
        当前{MODE_LABEL[mode]}主题，点击切换到{MODE_LABEL[targetMode]}主题
      </span>
    </ControlIconButton>
  );

  if (placement === "inline") {
    if (!showModeLabel) {
      return button;
    }

    return (
      <div className={cn("inline-flex items-center gap-2", containerClassName)}>
        {button}
        <span className={cn("text-sm font-medium text-text", labelClassName)}>
          {MODE_LABEL[mode]}
        </span>
      </div>
    );
  }

  if (!isWorkspaceThemeRoute(pathname) || hidden) {
    return null;
  }

  return (
    <div className="fixed top-[var(--workspace-topbar-control-offset-y)] right-[var(--workspace-topbar-inset-x)] z-[30] pointer-events-none">
      {button}
    </div>
  );
}
