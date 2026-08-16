/**
 * Homepage (landing page) design token config.
 *
 * The source of truth is `frontend/homepage.json` — a fixed dark palette that
 * is intentionally independent of the app-wide light/dark theme system.
 *
 * Call `resolveHomepageVars()` once (module-level cache) and spread the result
 * into the `.page` div's `style` prop in `LandingPage.tsx`.  All CSS var names
 * use the `--hp-` prefix to avoid collisions with app-global `--color-*` vars.
 *
 * Font family stacks are defined here (not in homepage.json) following the same
 * convention as themeConfig.ts — family stacks belong in TS config, not JSON,
 * because they contain var() references and ordering logic.
 */

import { z } from "zod";
import homepageRaw from "../../../homepage.json";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const homepageSchema = z.object({
  surface: z.object({
    page: z.string().min(1),
    bg: z.string().min(1),
    bg_elevated: z.string().min(1),
    elevated: z.string().min(1),
    hover: z.string().min(1),
    dark: z.string().min(1),
    dark_elevated: z.string().min(1),
    dark_section: z.string().min(1),
    dark_feature: z.string().min(1),
    device: z.string().min(1),
    light: z.string().min(1),
    light_bg: z.string().min(1),
    light_panel: z.string().min(1),
    light_hover: z.string().min(1),
    light_active: z.string().min(1),
  }),
  content: z.object({
    primary: z.string().min(1),
    secondary: z.string().min(1),
    muted: z.string().min(1),
    secondary_alpha: z.string().min(1),
    on_light: z.string().min(1),
    on_light_secondary: z.string().min(1),
  }),
  accent: z.object({
    default: z.string().min(1),
    strong: z.string().min(1),
    focus_border: z.string().min(1),
    focus_ring: z.string().min(1),
  }),
  status: z.object({
    danger: z.string().min(1),
    danger_soft: z.string().min(1),
    success_soft: z.string().min(1),
    success_text: z.string().min(1),
    error_text: z.string().min(1),
  }),
  border: z.object({
    subtle: z.string().min(1),
    default: z.string().min(1),
    light: z.string().min(1),
    danger: z.string().min(1),
    success: z.string().min(1),
  }),
  glass: z.object({
    header_bg: z.string().min(1),
    header_border: z.string().min(1),
    overlay_bg: z.string().min(1),
    card_bg: z.string().min(1),
    input_bg: z.string().min(1),
    screen_header: z.string().min(1),
    screen_pill: z.string().min(1),
  }),
  effect: z.object({
    shadow_soft: z.string().min(1),
  }),
  layout: z.object({
    content_width: z.string().min(1),
    auth_width: z.string().min(1),
  }),
  radius: z.object({
    xl: z.string().min(1),
    lg: z.string().min(1),
    md: z.string().min(1),
    sm: z.string().min(1),
    auth_card: z.string().min(1),
  }),
  motion: z.object({
    fast: z.string().min(1),
    base: z.string().min(1),
    slow: z.string().min(1),
  }),
});

export type HomepageTokens = z.infer<typeof homepageSchema>;

// ---------------------------------------------------------------------------
// Font family stacks (open-source replacements for Apple system fonts)
//
// SF Pro Display / SF Pro Text → Geist Sans  (Vercel's geometric humanist,
//   visually near-identical to SF Pro; SIL OFL licensed; loaded in layout.tsx
//   via the `geist` package and exposed as var(--font-geist-sans))
// PingFang SC / Hiragino Sans GB → Noto Sans SC / system CJK stack
//   (layout.tsx exposes SYSTEM_CJK_FONT_STACK via var(--font-sans-cjk);
//   Noto Sans SC is listed first so users with it installed get the
//   open-source variant; the OS system CJK fallbacks are legal system-font
//   references, not embedded/redistributed copies)
//
// -apple-system / BlinkMacSystemFont are OS-specific selectors that resolve to
// SF Pro on Apple devices and are therefore omitted here entirely.
// "Segoe UI" is kept as a neutral Windows fallback with no licensing issues.
// ---------------------------------------------------------------------------

const HP_FONT_FAMILY = [
  "var(--font-sans-latin)", // Geist Sans (layout.tsx → var(--font-geist-sans))
  '"Geist"', // explicit name fallback
  "var(--font-sans-cjk)", // Noto Sans SC → system CJK stack (layout.tsx)
  '"Segoe UI"', // neutral Windows / cross-platform fallback
  "sans-serif",
].join(", ");

// ---------------------------------------------------------------------------
// Loader (validates once at module initialisation)
// ---------------------------------------------------------------------------

function loadHomepageConfig(): HomepageTokens {
  const parsed = homepageSchema.safeParse(homepageRaw);
  if (parsed.success) {
    return parsed.data;
  }

  const issueSummary = parsed.error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "<root>";
      return `${path}: ${issue.message}`;
    })
    .join("; ");

  throw new Error(`[homepage_config] Invalid homepage.json. ${issueSummary}`);
}

// ---------------------------------------------------------------------------
// Resolver — maps tokens to CSS custom property names
//
// Convention: all vars prefixed with --hp- (homepage) to prevent conflicts
// with app-global --color-* variables.  The names map 1-to-1 with what
// LandingPage.module.css consumes via var(--hp-*).
// ---------------------------------------------------------------------------

export function resolveHomepageVars(
  tokens: HomepageTokens,
): Record<string, string> {
  const t = tokens;
  return {
    // ── Canonical --hp-* vars (new, namespaced) ─────────────────────────────
    // Use these in any new CSS rules; the CSS module references them for
    // scattered hardcoded values that didn't previously have a variable.

    // surface
    "--hp-surface-page": t.surface.page,
    "--hp-bg": t.surface.bg,
    "--hp-bg-elevated": t.surface.bg_elevated,
    "--hp-surface": t.surface.elevated,
    "--hp-surface-hover": t.surface.hover,
    "--hp-panel-dark": t.surface.dark,
    "--hp-panel-dark-elevated": t.surface.dark_elevated,
    "--hp-panel-dark-base": t.surface.page,
    "--hp-panel-light": t.surface.light,
    "--hp-light-bg": t.surface.light_bg,
    "--hp-light-panel": t.surface.light_panel,
    "--hp-light-hover": t.surface.light_hover,
    "--hp-light-active": t.surface.light_active,
    "--hp-surface-dark-section": t.surface.dark_section,
    "--hp-surface-dark-feature": t.surface.dark_feature,
    "--hp-surface-device": t.surface.device,

    // content
    "--hp-text": t.content.primary,
    "--hp-text-secondary": t.content.secondary,
    "--hp-text-muted": t.content.muted,
    "--hp-text-alpha": t.content.secondary_alpha,
    "--hp-text-dark": t.content.on_light,
    "--hp-text-dark-secondary": t.content.on_light_secondary,

    // accent
    "--hp-accent": t.accent.default,
    "--hp-accent-strong": t.accent.strong,
    "--hp-accent-focus": t.accent.focus_border,
    "--hp-accent-ring": t.accent.focus_ring,

    // status
    "--hp-danger": t.status.danger,
    "--hp-danger-soft": t.status.danger_soft,
    "--hp-success-soft": t.status.success_soft,
    "--hp-success-text": t.status.success_text,
    "--hp-error-text": t.status.error_text,

    // border
    "--hp-border": t.border.subtle,
    "--hp-border-strong": t.border.default,
    "--hp-light-border": t.border.light,
    "--hp-border-danger": t.border.danger,
    "--hp-border-success": t.border.success,

    // glass (previously only hardcoded inline)
    "--hp-header-bg": t.glass.header_bg,
    "--hp-header-border": t.glass.header_border,
    "--hp-auth-overlay": t.glass.overlay_bg,
    "--hp-auth-card-bg": t.glass.card_bg,
    "--hp-input-bg": t.glass.input_bg,
    "--hp-screen-header": t.glass.screen_header,
    "--hp-screen-pill": t.glass.screen_pill,

    // effect
    "--hp-shadow-soft": t.effect.shadow_soft,

    // layout
    "--hp-content-width": t.layout.content_width,
    "--hp-auth-width": t.layout.auth_width,

    // radius
    "--hp-radius-xl": t.radius.xl,
    "--hp-radius-lg": t.radius.lg,
    "--hp-radius-md": t.radius.md,
    "--hp-radius-sm": t.radius.sm,
    "--hp-radius-auth-card": t.radius.auth_card,

    // motion
    "--hp-transition-fast": t.motion.fast,
    "--hp-transition-base": t.motion.base,
    "--hp-transition-slow": t.motion.slow,

    // font family
    "--hp-font-family": HP_FONT_FAMILY,

    // ── Legacy short aliases ─────────────────────────────────────────────────
    // The existing CSS module already uses var(--bg), var(--text), etc.
    // Emitting them here preserves all existing references without a large
    // CSS rename pass.  Do not add NEW rules using these names.

    "--bg": t.surface.bg,
    "--bg-elevated": t.surface.bg_elevated,
    "--surface": t.surface.elevated,
    "--surface-hover": t.surface.hover,
    "--border": t.border.subtle,
    "--border-strong": t.border.default,
    "--text": t.content.primary,
    "--text-secondary": t.content.secondary,
    "--text-muted": t.content.muted,
    "--text-dark": t.content.on_light,
    "--text-dark-secondary": t.content.on_light_secondary,
    "--light-bg": t.surface.light_bg,
    "--light-panel": t.surface.light_panel,
    "--light-hover": t.surface.light_hover,
    "--light-active": t.surface.light_active,
    "--light-border": t.border.light,
    "--accent": t.accent.default,
    "--accent-strong": t.accent.strong,
    "--danger": t.status.danger,
    "--danger-soft": t.status.danger_soft,
    "--panel-dark-base": t.surface.page,
    "--panel-dark": t.surface.dark,
    "--panel-dark-elevated": t.surface.dark_elevated,
    "--panel-light": t.surface.light,
    "--content-width": t.layout.content_width,
    "--auth-width": t.layout.auth_width,
    "--radius-xl": t.radius.xl,
    "--radius-lg": t.radius.lg,
    "--radius-md": t.radius.md,
    "--radius-sm": t.radius.sm,
    "--shadow-soft": t.effect.shadow_soft,
    "--transition-fast": t.motion.fast,
    "--transition-base": t.motion.base,
    "--transition-slow": t.motion.slow,
  };
}

// ---------------------------------------------------------------------------
// Singleton — pre-resolved at module load time (values never change at runtime)
// ---------------------------------------------------------------------------

const _tokens = loadHomepageConfig();
export const HOMEPAGE_VARS: Record<string, string> = resolveHomepageVars(_tokens);
