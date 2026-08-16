import { z } from "zod";
import themeDarkRaw from "../../../theme_dark.json";
import themeLightRaw from "../../../theme_light.json";
import fontRaw from "../../../font.json";

const themeSchema = z.object({
  surface: z.object({
    base: z.string().min(1),
    panel: z.string().min(1),
    elevated: z.string().min(1),
    sub: z.string().min(1),
    hover: z.string().min(1),
    active: z.string().min(1),
  }),
  content: z.object({
    primary: z.string().min(1),
    secondary: z.string().min(1),
    muted: z.string().min(1),
    inverse: z.string().min(1),
  }),
  status: z.object({
    success: z.string().min(1),
    warning: z.string().min(1),
    error: z.string().min(1),
    info: z.string().min(1),
  }),
  interaction: z.object({
    primary: z.string().min(1),
    secondary: z.string().min(1),
    focus: z.string().min(1),
    selection: z.string().min(1),
    input_shadow: z.string().min(1),
    input_shadow_focus: z.string().min(1),
    theme_switch_track: z.string().min(1),
    theme_switch_handle: z.string().min(1),
    theme_switch_auto: z.string().min(1),
  }),
  context: z.object({
    terminal_bg: z.string().min(1),
    terminal_fg: z.string().min(1),
    terminal_muted: z.string().min(1),
    terminal_warning: z.string().min(1),
    terminal_error: z.string().min(1),
    terminal_border: z.string().min(1),
    terminal_prompt: z.string().min(1),
    code_bg: z.string().min(1),
    highlight: z.string().min(1),
    overlay: z.string().min(1),
  }),
  border: z.object({
    default: z.string().min(1),
  }),
});

const fontScaleStepSchema = z.object({
  size: z.string().min(1),
  line_height: z.string().min(1),
  weight: z.number().int().positive(),
});

const fontScaleSchema = z.object({
  desktop: fontScaleStepSchema,
  mobile: fontScaleStepSchema,
});

const markdownRhythmStepSchema = z.object({
  paragraph_margin_block: z.string().min(1),
  heading_margin_top: z.string().min(1),
  heading_margin_bottom: z.string().min(1),
  list_margin_block: z.string().min(1),
  list_item_margin_block: z.string().min(1),
  list_padding_inline_start: z.string().min(1),
  blockquote_margin_block: z.string().min(1),
  blockquote_padding_inline_start: z.string().min(1),
  hr_margin_block: z.string().min(1),
  code_block_margin_block: z.string().min(1),
  code_block_padding_block: z.string().min(1),
  code_block_padding_inline: z.string().min(1),
  table_margin_block: z.string().min(1),
});

const markdownSurfaceStepSchema = z.object({
  measure_max_width: z.string().min(1),
});

const fontSchema = z.object({
  ui_roles: z.object({
    hero_title: fontScaleSchema,
    hero_subtitle: fontScaleSchema,
    page_title: fontScaleSchema,
    section_title: fontScaleSchema,
    card_title: fontScaleSchema,
    body_primary: fontScaleSchema,
    body_secondary: fontScaleSchema,
    meta: fontScaleSchema,
    caption: fontScaleSchema,
    code: fontScaleSchema,
    badge: fontScaleSchema,
  }),
  markdown_roles: z.object({
    body: fontScaleSchema,
    h1: fontScaleSchema,
    h2: fontScaleSchema,
    h3: fontScaleSchema,
    h4: fontScaleSchema,
    h5: fontScaleSchema,
    h6: fontScaleSchema,
    code_inline: fontScaleSchema,
    code_block: fontScaleSchema,
    quote: fontScaleSchema,
    table: fontScaleSchema,
    caption: fontScaleSchema,
  }),
  markdown_rhythm: z.object({
    desktop: markdownRhythmStepSchema,
    mobile: markdownRhythmStepSchema,
  }),
  markdown_surfaces: z.object({
    chat: z.object({
      desktop: markdownSurfaceStepSchema,
      mobile: markdownSurfaceStepSchema,
    }),
    notes_preview: z.object({
      desktop: markdownSurfaceStepSchema,
      mobile: markdownSurfaceStepSchema,
    }),
  }),
});

export type ThemeTokens = z.infer<typeof themeSchema>;
export type FontTokens = z.infer<typeof fontSchema>;

export type ThemeMode = "dark" | "light";
export type ThemePreferenceMode = ThemeMode | "auto";

export const DEFAULT_THEME_MODE: ThemeMode = "dark";
export const DEFAULT_THEME_PREFERENCE_MODE: ThemePreferenceMode = "auto";
export const THEME_STORAGE_KEY = "singularity_note_theme_mode";

function parseWithFailFast<T>(schema: z.ZodSchema<T>, payload: unknown, sourceName: string): T {
  const parsed = schema.safeParse(payload);
  if (parsed.success) {
    return parsed.data;
  }

  const issueSummary = parsed.error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "<root>";
      return `${path}: ${issue.message}`;
    })
    .join("; ");

  throw new Error(`[theme_config] Invalid ${sourceName}. ${issueSummary}`);
}

export function loadThemeConfig(): Record<ThemeMode, ThemeTokens> {
  return {
    dark: parseWithFailFast(themeSchema, themeDarkRaw, "theme_dark.json"),
    light: parseWithFailFast(themeSchema, themeLightRaw, "theme_light.json"),
  };
}

export function loadFontConfig(): FontTokens {
  return parseWithFailFast(fontSchema, fontRaw, "font.json");
}

export function resolveThemeVars(theme: ThemeTokens): Record<string, string> {
  return {
    "--color-content-primary": theme.content.primary,
    "--color-content-secondary": theme.content.secondary,
    "--color-content-muted": theme.content.muted,
    "--color-content-inverse": theme.content.inverse,
    "--color-interaction-primary": theme.interaction.primary,
    "--color-interaction-secondary": theme.interaction.secondary,
    "--color-interaction-focus": theme.interaction.focus,
    "--color-interaction-selection": theme.interaction.selection,
    "--effect-input-shadow": theme.interaction.input_shadow,
    "--effect-input-shadow-focus": theme.interaction.input_shadow_focus,
    "--color-interaction-theme-switch-track": theme.interaction.theme_switch_track,
    "--color-interaction-theme-switch-handle": theme.interaction.theme_switch_handle,
    "--color-interaction-theme-switch-auto": theme.interaction.theme_switch_auto,
    "--color-context-terminal-bg": theme.context.terminal_bg,
    "--color-context-terminal-fg": theme.context.terminal_fg,
    "--color-context-terminal-muted": theme.context.terminal_muted,
    "--color-context-terminal-warning": theme.context.terminal_warning,
    "--color-context-terminal-error": theme.context.terminal_error,
    "--color-context-terminal-border": theme.context.terminal_border,
    "--color-context-terminal-prompt": theme.context.terminal_prompt,
    "--color-context-code-bg": theme.context.code_bg,
    "--color-context-highlight": theme.context.highlight,
    "--color-context-overlay": theme.context.overlay,
    "--color-border-default": theme.border.default,

    // Compatibility aliases for existing Tailwind/CVA usage.
    "--color-text": theme.content.primary,
    "--color-text-secondary": theme.content.secondary,
    "--color-text-muted": theme.content.muted,
    "--color-text-inverse": theme.content.inverse,
    "--color-surface": theme.surface.elevated,
    "--color-surface-hover": theme.surface.hover,
    "--color-surface-active": theme.surface.active,
    "--color-panel": theme.surface.panel,
    "--color-bg": theme.surface.base,
    "--color-surface-sub": theme.surface.sub,
    "--color-accent": theme.interaction.primary,
    "--color-accent-hover": theme.interaction.secondary,
    "--color-accent-muted": theme.interaction.selection,
    "--color-success": theme.status.success,
    "--color-warning": theme.status.warning,
    "--color-error": theme.status.error,
    "--color-info": theme.status.info,
    "--color-alert": theme.status.error,
    "--color-alert-muted": theme.interaction.selection,
    "--color-border": theme.border.default,
    "--color-terminal-bg": theme.context.terminal_bg,
    "--color-terminal-fg": theme.context.terminal_fg,
  };
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

// Font family stacks.  The var() references are the primary fonts, injected by
// layout.tsx via the `geist` npm package (bundled, no CDN).  The trailing
// generic keywords are browser-level last-resort fallbacks only.
const UI_SANS_LATIN_FONT_FAMILY = [
  "var(--font-sans-latin)", // Geist Sans
  '"Geist"',
  "sans-serif",
].join(", ");

const UI_SANS_CJK_FONT_FAMILY = [
  "var(--font-sans-cjk)", // system CJK stack set in layout.tsx
  "sans-serif",
].join(", ");

const CODE_FONT_FAMILY = [
  "var(--font-mono)", // Geist Mono
  '"Geist Mono"',
  "monospace",
].join(", ");

type TypographyFontRole = "body" | "heading" | "code" | "caption";
type UiTypographyScaleKey = keyof FontTokens["ui_roles"];
type MarkdownTypographyScaleKey = keyof FontTokens["markdown_roles"];
type MarkdownRhythmKey = keyof FontTokens["markdown_rhythm"]["desktop"];

const UI_ROLE_FONT_MAP: Record<UiTypographyScaleKey, TypographyFontRole> = {
  hero_title: "heading",
  hero_subtitle: "body",
  page_title: "heading",
  section_title: "heading",
  card_title: "heading",
  body_primary: "body",
  body_secondary: "body",
  meta: "caption",
  caption: "caption",
  code: "code",
  badge: "caption",
};

const MARKDOWN_ROLE_FONT_MAP: Record<MarkdownTypographyScaleKey, TypographyFontRole> = {
  body: "body",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  code_inline: "code",
  code_block: "code",
  quote: "body",
  table: "body",
  caption: "caption",
};

const MARKDOWN_RHYTHM_VAR_MAP: Record<MarkdownRhythmKey, string> = {
  paragraph_margin_block: "--md-rhythm-paragraph-margin-block",
  heading_margin_top: "--md-rhythm-heading-margin-top",
  heading_margin_bottom: "--md-rhythm-heading-margin-bottom",
  list_margin_block: "--md-rhythm-list-margin-block",
  list_item_margin_block: "--md-rhythm-list-item-margin-block",
  list_padding_inline_start: "--md-rhythm-list-padding-inline-start",
  blockquote_margin_block: "--md-rhythm-blockquote-margin-block",
  blockquote_padding_inline_start: "--md-rhythm-blockquote-padding-inline-start",
  hr_margin_block: "--md-rhythm-hr-margin-block",
  code_block_margin_block: "--md-rhythm-code_block-margin-block",
  code_block_padding_block: "--md-rhythm-code_block-padding-block",
  code_block_padding_inline: "--md-rhythm-code_block-padding-inline",
  table_margin_block: "--md-rhythm-table-margin-block",
};

const MARKDOWN_SURFACE_VAR_MAP = {
  chat: "--md-surface-chat-measure-max-width",
  notes_preview: "--md-surface-notes_preview-measure-max-width",
} as const;

export function resolveTypographyVars(font: FontTokens): {
  root_vars: Record<string, string>;
  mobile_vars: Record<string, string>;
} {
  const sansStack = unique([UI_SANS_LATIN_FONT_FAMILY, UI_SANS_CJK_FONT_FAMILY]).join(", ");

  const rootVars: Record<string, string> = {
    "--font-role-body": sansStack,
    "--font-role-heading": sansStack,
    "--font-role-code": CODE_FONT_FAMILY,
    "--font-role-caption": sansStack,
  };

  const mobileVars: Record<string, string> = {};

  for (const [scaleKey, scale] of Object.entries(font.ui_roles) as [
    UiTypographyScaleKey,
    FontTokens["ui_roles"][UiTypographyScaleKey],
  ][]) {
    const role = UI_ROLE_FONT_MAP[scaleKey];
    rootVars[`--type-${scaleKey}-family`] = `var(--font-role-${role})`;
    rootVars[`--type-${scaleKey}-size`] = scale.desktop.size;
    rootVars[`--type-${scaleKey}-line_height`] = scale.desktop.line_height;
    rootVars[`--type-${scaleKey}-weight`] = String(scale.desktop.weight);

    mobileVars[`--type-${scaleKey}-size`] = scale.mobile.size;
    mobileVars[`--type-${scaleKey}-line_height`] = scale.mobile.line_height;
    mobileVars[`--type-${scaleKey}-weight`] = String(scale.mobile.weight);
  }

  for (const [scaleKey, scale] of Object.entries(font.markdown_roles) as [
    MarkdownTypographyScaleKey,
    FontTokens["markdown_roles"][MarkdownTypographyScaleKey],
  ][]) {
    const role = MARKDOWN_ROLE_FONT_MAP[scaleKey];
    rootVars[`--md-type-${scaleKey}-family`] = `var(--font-role-${role})`;
    rootVars[`--md-type-${scaleKey}-size`] = scale.desktop.size;
    rootVars[`--md-type-${scaleKey}-line_height`] = scale.desktop.line_height;
    rootVars[`--md-type-${scaleKey}-weight`] = String(scale.desktop.weight);

    mobileVars[`--md-type-${scaleKey}-size`] = scale.mobile.size;
    mobileVars[`--md-type-${scaleKey}-line_height`] = scale.mobile.line_height;
    mobileVars[`--md-type-${scaleKey}-weight`] = String(scale.mobile.weight);
  }

  for (const rhythmKey of Object.keys(MARKDOWN_RHYTHM_VAR_MAP) as MarkdownRhythmKey[]) {
    const variable = MARKDOWN_RHYTHM_VAR_MAP[rhythmKey];
    rootVars[variable] = font.markdown_rhythm.desktop[rhythmKey];
    mobileVars[variable] = font.markdown_rhythm.mobile[rhythmKey];
  }

  rootVars[MARKDOWN_SURFACE_VAR_MAP.chat] = font.markdown_surfaces.chat.desktop.measure_max_width;
  rootVars[MARKDOWN_SURFACE_VAR_MAP.notes_preview] =
    font.markdown_surfaces.notes_preview.desktop.measure_max_width;

  mobileVars[MARKDOWN_SURFACE_VAR_MAP.chat] = font.markdown_surfaces.chat.mobile.measure_max_width;
  mobileVars[MARKDOWN_SURFACE_VAR_MAP.notes_preview] =
    font.markdown_surfaces.notes_preview.mobile.measure_max_width;

  return {
    root_vars: rootVars,
    mobile_vars: mobileVars,
  };
}

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === "dark" || value === "light";
}

export function isThemePreferenceMode(value: string | null | undefined): value is ThemePreferenceMode {
  return value === "dark" || value === "light" || value === "auto";
}
