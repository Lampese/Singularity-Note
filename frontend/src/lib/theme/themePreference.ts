import {
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_PREFERENCE_MODE,
  THEME_STORAGE_KEY,
  isThemePreferenceMode,
  type ThemeMode,
  type ThemePreferenceMode,
} from "@/lib/theme/themeConfig";

function getSystemThemeMode(): ThemeMode {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return DEFAULT_THEME_MODE;
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function isWorkspaceThemeRoute(pathname?: string | null): boolean {
  return typeof pathname === "string" &&
    (pathname === "/workspaces" || pathname.startsWith("/workspaces/"));
}

function applyThemePreference(preference: ThemePreferenceMode): ThemeMode {
  if (typeof window === "undefined") {
    return preference === "auto" ? DEFAULT_THEME_MODE : preference;
  }

  const effectiveTheme = preference === "auto" ? getSystemThemeMode() : preference;
  window.document.documentElement.setAttribute("data-theme", effectiveTheme);
  window.document.documentElement.setAttribute("data-theme-preference", preference);
  return effectiveTheme;
}

export function getThemePreferenceMode(): ThemePreferenceMode {
  if (typeof window === "undefined") {
    return DEFAULT_THEME_PREFERENCE_MODE;
  }

  try {
    const nextKeyValue = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreferenceMode(nextKeyValue)) {
      return nextKeyValue;
    }
    return DEFAULT_THEME_PREFERENCE_MODE;
  } catch {
    return DEFAULT_THEME_PREFERENCE_MODE;
  }
}

export function getEffectiveThemePreferenceMode(pathname?: string | null): ThemePreferenceMode {
  if (!isWorkspaceThemeRoute(pathname)) {
    return "auto";
  }
  return getThemePreferenceMode();
}

export function getThemeMode(): ThemeMode {
  const preference = getThemePreferenceMode();
  return preference === "auto" ? getSystemThemeMode() : preference;
}

export function syncThemeForPath(pathname?: string | null): ThemePreferenceMode {
  const preference = getEffectiveThemePreferenceMode(pathname);
  applyThemePreference(preference);
  return preference;
}

export function setThemeMode(mode: ThemePreferenceMode): ThemeMode {
  if (typeof window === "undefined") {
    return mode === "auto" ? DEFAULT_THEME_MODE : mode;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  return applyThemePreference(mode);
}

export function toggleThemeMode(): ThemePreferenceMode {
  const cycle: ThemePreferenceMode[] = ["light", "dark", "auto"];
  const currentMode = getThemePreferenceMode();
  const currentIndex = cycle.indexOf(currentMode);
  const nextMode = cycle[(currentIndex + 1) % cycle.length];
  setThemeMode(nextMode);
  return nextMode;
}

export function syncSystemThemeWhenAuto(pathname?: string | null): void {
  if (getEffectiveThemePreferenceMode(pathname) !== "auto") {
    return;
  }
  applyThemePreference("auto");
}
