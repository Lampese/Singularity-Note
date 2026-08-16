import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { toCssBackgroundImage } from "@/lib/utils/gradient";
import { DEFAULT_LANGUAGE } from "@/lib/i18n/language";
import { KaTeXCopyTexBridge } from "@/components/math/KaTeXCopyTexBridge";
import {
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_PREFERENCE_MODE,
  THEME_STORAGE_KEY,
  loadFontConfig,
  loadThemeConfig,
  resolveThemeVars,
  resolveTypographyVars,
} from "@/lib/theme/themeConfig";


const SYSTEM_CJK_FONT_STACK = [
  '"Noto Sans SC"',
  '"Noto Sans CJK SC"',
  '"Source Han Sans SC"',
  '"PingFang SC"',
  '"Hiragino Sans GB"',
  '"Microsoft YaHei"',
  "sans-serif",
].join(", ");

// Note: base background color comes from the `bg-bg` Tailwind class on <body>.
// Do NOT add a `{ kind: "color" }` layer here — color values are invalid as
// background-image layers and would invalidate the entire declaration.
const ROOT_BACKGROUND_IMAGE = toCssBackgroundImage([
  {
    kind: "radial",
    shape: "circle",
    center: { xPercent: 10, yPercent: 20 },
    stops: [
      { color: "var(--color-accent-muted)", positionPercent: 0 },
      { color: "transparent", positionPercent: 30 },
    ],
  },
  {
    kind: "radial",
    shape: "circle",
    center: { xPercent: 90, yPercent: 10 },
    stops: [
      { color: "var(--color-accent-muted)", positionPercent: 0 },
      { color: "transparent", positionPercent: 30 },
    ],
  },
]);

export const metadata: Metadata = {
  title: "Singularity Note — 更懂你的学习伙伴",
  description: "阅读你给出的任何资料，陪你用科学方法学习，并为你生成你需要的答案",
};

function toCssVarBlock(selector: string, vars: Record<string, string>): string {
  const body = Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themes = loadThemeConfig();
  const font = loadFontConfig();

  const darkThemeVars = resolveThemeVars(themes.dark);
  const lightThemeVars = resolveThemeVars(themes.light);
  const typographyVars = resolveTypographyVars(font);
  const layoutContractVars = {
    "--radius-chat-composer": "var(--radius-surface-1)",
    "--inset-chat-composer-padding": "var(--space-4)",
    "--inset-chat-composer-toolbar": "var(--space-2)",
    "--gap-chat-composer-content": "var(--space-2)",
    "--size-chat-composer-frame-max-height": "256px",
    "--size-chat-composer-toolbar-height": "var(--size-control-comfortable)",
    "--size-chat-composer-shell-border-width": "1px",
    "--size-chat-composer-toolbar-divider-width": "1px",
    "--size-chat-composer-textarea-min-height": "32px",
    "--size-chat-composer-textarea-max-height":
      "calc(var(--size-chat-composer-frame-max-height) - (var(--inset-chat-composer-padding) * 2) - var(--gap-chat-composer-content) - var(--size-chat-composer-toolbar-height) - var(--size-chat-composer-toolbar-divider-width) - (var(--size-chat-composer-shell-border-width) * 2))",
    "--size-chat-composer-frame-min-height":
      "calc((var(--inset-chat-composer-padding) * 2) + var(--size-chat-composer-textarea-min-height) + var(--gap-chat-composer-content) + var(--size-chat-composer-toolbar-height) + var(--size-chat-composer-toolbar-divider-width) + (var(--size-chat-composer-shell-border-width) * 2))",
    "--size-chat-composer-attachment-max-width": "192px",
    "--workspace-chat-composer-bottom-offset": "var(--space-6)",
    "--workspace-chat-scroll-jump-gap": "var(--space-2)",
    "--workspace-chat-composer-current-height": "var(--size-chat-composer-frame-min-height)",
    "--workspace-chat-jump-button-offset-bottom":
      "calc(var(--workspace-chat-composer-bottom-offset) + var(--workspace-chat-composer-current-height) + var(--workspace-chat-scroll-jump-gap))",
    "--workspace-chat-stream-bottom-padding":
      "calc(var(--workspace-chat-composer-bottom-offset) + var(--size-chat-composer-frame-max-height) + var(--space-6))",
  } as const;

  const runtimeCss = [
    toCssVarBlock(":root", {
      ...darkThemeVars,
      ...typographyVars.root_vars,
      ...layoutContractVars,
      "--font-sans-latin": "var(--font-geist-sans)",
      "--font-sans-cjk": SYSTEM_CJK_FONT_STACK,
      "--font-mono": "var(--font-geist-mono)",
      "--theme-mode": DEFAULT_THEME_MODE,
      "--color-interaction-theme-switch-handle-dark": themes.dark.interaction.theme_switch_handle,
      "--color-interaction-theme-switch-handle-light": themes.light.interaction.theme_switch_handle,
    }),
    toCssVarBlock(':root[data-theme="dark"]', {
      ...darkThemeVars,
      "--theme-mode": "dark",
      "color-scheme": "dark",
    }),
    toCssVarBlock('[data-theme="dark"]', {
      ...darkThemeVars,
    }),
    toCssVarBlock(':root[data-theme="light"]', {
      ...lightThemeVars,
      "--theme-mode": "light",
      "color-scheme": "light",
    }),
    `@media (max-width: 768px) {\n${toCssVarBlock(":root", typographyVars.mobile_vars)}\n}`,
  ].join("\n");

  const themeBootScript = `(() => {
    try {
      const pathname = window.location.pathname || "/";
      const raw = window.localStorage.getItem("${THEME_STORAGE_KEY}");
      const storedPreference = raw === "light" || raw === "dark" || raw === "auto"
        ? raw
        : "${DEFAULT_THEME_PREFERENCE_MODE}";
      const preference = (pathname === "/workspaces" || pathname.startsWith("/workspaces/"))
        ? storedPreference
        : "auto";
      const mode = preference === "auto"
        ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
        : preference;
      window.localStorage.setItem("${THEME_STORAGE_KEY}", storedPreference);
      document.documentElement.setAttribute("data-theme-preference", preference);
      document.documentElement.setAttribute("data-theme", mode);
    } catch {
      const pathname = window.location.pathname || "/";
      const fallbackPreference = (pathname === "/workspaces" || pathname.startsWith("/workspaces/"))
        ? "${DEFAULT_THEME_PREFERENCE_MODE}"
        : "auto";
      const fallbackMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "${DEFAULT_THEME_MODE}";
      document.documentElement.setAttribute("data-theme-preference", fallbackPreference);
      document.documentElement.setAttribute("data-theme", fallbackMode);
    }
  })();`;

  return (
    <html
      lang={DEFAULT_LANGUAGE}
      dir="ltr"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      data-theme={DEFAULT_THEME_MODE}
      data-theme-preference={DEFAULT_THEME_PREFERENCE_MODE}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <style dangerouslySetInnerHTML={{ __html: runtimeCss }} />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased text-text bg-bg min-h-screen selection:bg-accent/30"
        style={{
          fontFamily: "var(--font-role-body)",
          backgroundImage: ROOT_BACKGROUND_IMAGE,
        }}
      >
        <KaTeXCopyTexBridge />
        {children}
      </body>
    </html>
  );
}
