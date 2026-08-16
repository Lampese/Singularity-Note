"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckIcon, CopySimpleIcon } from "@phosphor-icons/react";
import { createHighlighter } from "shiki";
import { ControlButton } from "@/components/ui/factory/groups/button/components";

type ThemeMode = "light" | "dark";

type MermaidThemeVariables = {
    darkMode: boolean;
    background: string;
    primaryColor: string;
    primaryTextColor: string;
    primaryBorderColor: string;
    secondaryColor: string;
    secondaryTextColor: string;
    secondaryBorderColor: string;
    tertiaryColor: string;
    tertiaryTextColor: string;
    tertiaryBorderColor: string;
    lineColor: string;
    textColor: string;
    mainBkg: string;
    secondBkg: string;
    tertiaryBkg: string;
    nodeBkg: string;
    clusterBkg: string;
    clusterBorder: string;
    edgeLabelBackground: string;
};

const SHIKI_THEMES = {
    light: "github-light",
    dark: "github-dark",
} as const;

const SUPPORTED_LANGUAGES = [
    "bash",
    "c",
    "cpp",
    "csharp",
    "css",
    "dockerfile",
    "go",
    "html",
    "java",
    "javascript",
    "jsx",
    "json",
    "kotlin",
    "markdown",
    "plaintext",
    "python",
    "rust",
    "scss",
    "sql",
    "swift",
    "toml",
    "tsx",
    "typescript",
    "text",
    "xml",
    "yaml",
] as const;

const LANG_ALIAS: Record<string, string> = {
    "js": "javascript",
    "mjs": "javascript",
    "ts": "typescript",
    "tsx": "tsx",
    "jsx": "jsx",
    "py": "python",
    "yml": "yaml",
    "c++": "cpp",
    "cxx": "cpp",
    "cp": "cpp",
    "shell": "bash",
    "zsh": "bash",
    "sh": "bash",
    "docker": "dockerfile",
};

const MERMAID_LANGUAGE = "mermaid";
const LANGUAGE_SET = new Set<string>(SUPPORTED_LANGUAGES);
const HIGHLIGHTER_CACHE = new Map<string, string>();
const MERMAID_SVG_CACHE = new Map<string, string>();
let highlighterPromise: Promise<Awaited<ReturnType<typeof createHighlighter>>> | null = null;
let mermaidRenderCounter = 0;

function getDocumentTheme(): ThemeMode {
    if (typeof document === "undefined") return "dark";
    const documentTheme = document.documentElement.getAttribute("data-theme");
    if (documentTheme === "light" || documentTheme === "dark") {
        return documentTheme;
    }
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
        return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    return "dark";
}

function nextMermaidRenderId(): string {
    mermaidRenderCounter += 1;
    return `sn-mermaid-${mermaidRenderCounter}`;
}

function readResolvedCssColor(
    style: CSSStyleDeclaration,
    name: string,
    fallback: string,
): string {
    const value = style.getPropertyValue(name).trim();
    return value || fallback;
}

function resolveMermaidThemeVariables(themeMode: ThemeMode): MermaidThemeVariables {
    if (typeof document === "undefined") {
        return {
            darkMode: themeMode === "dark",
            background: "transparent",
            primaryColor: "var(--color-surface-sub)",
            primaryTextColor: "var(--color-content-primary)",
            primaryBorderColor: "var(--color-info)",
            secondaryColor: "var(--color-panel)",
            secondaryTextColor: "var(--color-content-primary)",
            secondaryBorderColor: "var(--color-border-default)",
            tertiaryColor: "var(--color-bg)",
            tertiaryTextColor: "var(--color-content-secondary)",
            tertiaryBorderColor: "var(--color-border-default)",
            lineColor: "var(--color-info)",
            textColor: "var(--color-content-primary)",
            mainBkg: "var(--color-surface-sub)",
            secondBkg: "var(--color-panel)",
            tertiaryBkg: "var(--color-bg)",
            nodeBkg: "var(--color-panel)",
            clusterBkg: "var(--color-bg)",
            clusterBorder: "var(--color-border-default)",
            edgeLabelBackground: "var(--color-panel)",
        };
    }

    const style = window.getComputedStyle(document.documentElement);
    const surfaceBase = readResolvedCssColor(style, "--color-bg", "var(--color-bg)");
    const surfacePanel = readResolvedCssColor(style, "--color-panel", "var(--color-panel)");
    const surfaceSub = readResolvedCssColor(style, "--color-surface-sub", "var(--color-surface-sub)");
    const contentPrimary = readResolvedCssColor(style, "--color-content-primary", "var(--color-content-primary)");
    const contentSecondary = readResolvedCssColor(style, "--color-content-secondary", "var(--color-content-secondary)");
    const border = readResolvedCssColor(style, "--color-border-default", "var(--color-border-default)");
    const info = readResolvedCssColor(style, "--color-info", "var(--color-info)");

    return {
        darkMode: themeMode === "dark",
        background: "transparent",
        primaryColor: surfaceSub,
        primaryTextColor: contentPrimary,
        primaryBorderColor: info,
        secondaryColor: surfacePanel,
        secondaryTextColor: contentPrimary,
        secondaryBorderColor: border,
        tertiaryColor: surfaceBase,
        tertiaryTextColor: contentSecondary,
        tertiaryBorderColor: border,
        lineColor: info,
        textColor: contentPrimary,
        mainBkg: surfaceSub,
        secondBkg: surfacePanel,
        tertiaryBkg: surfaceBase,
        nodeBkg: surfacePanel,
        clusterBkg: surfaceBase,
        clusterBorder: border,
        edgeLabelBackground: surfacePanel,
    };
}

function getShikiHighlighter() {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: [SHIKI_THEMES.light, SHIKI_THEMES.dark],
            langs: [...SUPPORTED_LANGUAGES],
        });
    }
    return highlighterPromise;
}

function normalizeLanguage(className?: string): string | undefined {
    if (!className) return undefined;
    const lang = className
        .split(/\s+/)[0]
        .replace(/^language-/, "")
        .trim()
        .toLowerCase();
    if (!lang) return undefined;
    return LANG_ALIAS[lang] ?? lang;
}

function normalizeCode(code: React.ReactNode): string {
    if (typeof code === "boolean" || code === null || code === undefined) {
        return "";
    }
    return React.Children.toArray(code)
        .map((part) => {
            if (typeof part === "string" || typeof part === "number") {
                return String(part);
            }
            return "";
        })
        .join("");
}

function resolveHighlightLanguage(language: string | undefined): string {
    if (!language) {
        return "text";
    }

    const normalized = LANGUAGE_SET.has(language) ? language : LANG_ALIAS[language] ?? language;
    return LANGUAGE_SET.has(normalized) ? normalized : "text";
}

function buildHighlightCacheKey(
    code: string,
    language: string | undefined,
    themeMode: ThemeMode,
): string {
    return `${SHIKI_THEMES[themeMode]}:${resolveHighlightLanguage(language)}:${code}`;
}

async function highlightCode(code: string, language: string | undefined): Promise<string> {
    const themeMode = getDocumentTheme();
    const theme = SHIKI_THEMES[themeMode];
    const languageOrFallback = resolveHighlightLanguage(language);
    const cacheKey = buildHighlightCacheKey(code, language, themeMode);

    const cached = HIGHLIGHTER_CACHE.get(cacheKey);
    if (cached) return cached;

    const highlighter = await getShikiHighlighter();

    const toHtml = (targetLanguage: string) => highlighter.codeToHtml(code, {
        lang: targetLanguage,
        theme,
        rootStyle: false,
    });

    try {
        const html = toHtml(languageOrFallback);
        HIGHLIGHTER_CACHE.set(cacheKey, html);
        return html;
    } catch (error) {
        console.warn("[Chat] Failed to render shiki code block", error);
        const fallback = toHtml("text");
        HIGHLIGHTER_CACHE.set(cacheKey, fallback);
        return fallback;
    }
}

async function renderMermaidDiagram(code: string): Promise<{
    svg: string;
    bindFunctions?: ((element: Element) => void) | undefined;
}> {
    const mermaid = (await import("mermaid")).default;
    const themeMode = getDocumentTheme();
    mermaid.initialize({
        startOnLoad: false,
        suppressErrorRendering: true,
        securityLevel: "strict",
        theme: "base",
        themeVariables: resolveMermaidThemeVariables(themeMode),
    });
    const rendered = await mermaid.render(nextMermaidRenderId(), code);
    return {
        ...rendered,
        svg: normalizeMermaidSvgMarkup(rendered.svg),
    };
}

function parseMermaidViewBoxSize(
    viewBox: string | null,
): { width: number; height: number } | null {
    if (!viewBox) {
        return null;
    }

    const values = viewBox
        .trim()
        .split(/[\s,]+/)
        .map((value) => Number.parseFloat(value));

    if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
        return null;
    }

    const width = values[2];
    const height = values[3];

    if (width <= 0 || height <= 0) {
        return null;
    }

    return { width, height };
}

function normalizeMermaidSvgMarkup(svg: string): string {
    if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") {
        return svg;
    }

    try {
        const document = new DOMParser().parseFromString(svg, "image/svg+xml");
        const svgElement = document.documentElement;

        if (svgElement.tagName.toLowerCase() !== "svg") {
            return svg;
        }

        const size = parseMermaidViewBoxSize(svgElement.getAttribute("viewBox"));
        if (size) {
            svgElement.setAttribute("width", `${size.width}`);
            svgElement.setAttribute("height", `${size.height}`);
        }
        if (!svgElement.getAttribute("preserveAspectRatio")) {
            svgElement.setAttribute("preserveAspectRatio", "xMinYMin meet");
        }

        const existingStyle = svgElement.getAttribute("style") ?? "";
        const normalizedStyle = existingStyle
            .split(";")
            .map((part) => part.trim())
            .filter(Boolean)
            .filter((part) => {
                const property = part.split(":")[0]?.trim().toLowerCase();
                return property !== "max-width" && property !== "width" && property !== "height";
            });

        normalizedStyle.push("max-width: none");
        if (size) {
            normalizedStyle.push(`width: ${size.width}px`);
            normalizedStyle.push(`height: ${size.height}px`);
        }

        svgElement.setAttribute("style", normalizedStyle.join("; "));
        return new XMLSerializer().serializeToString(svgElement);
    } catch {
        return svg;
    }
}

function buildStreamingMermaidCandidates(code: string): string[] {
    const normalized = code.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
    const lines = normalized.split("\n");
    const candidates: string[] = [];

    for (let end = lines.length; end >= 2; end -= 1) {
        const candidate = lines.slice(0, end).join("\n").trimEnd();
        if (!candidate) {
            continue;
        }
        if (candidates[candidates.length - 1] !== candidate) {
            candidates.push(candidate);
        }
    }

    return candidates.length > 0 ? candidates : [normalized];
}

async function renderMermaidDiagramIncremental(
    code: string,
    isStreaming: boolean,
): Promise<{
    svg: string;
    bindFunctions?: ((element: Element) => void) | undefined;
}> {
    const candidates = isStreaming ? buildStreamingMermaidCandidates(code) : [code];
    let lastError: unknown = null;

    for (const candidate of candidates) {
        try {
            return await renderMermaidDiagram(candidate);
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError ?? new Error("Mermaid render failed");
}

function useDocumentThemeTick(): number {
    const [themeTick, setThemeTick] = useState(0);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setThemeTick((prev) => prev + 1);
        });
        observer.observe(document.documentElement, {
            attributeFilter: ["data-theme"],
            attributes: true,
        });
        return () => observer.disconnect();
    }, []);

    return themeTick;
}

function CodeCopyButton({
    copyStatus,
    onClick,
}: {
    copyStatus: "idle" | "copied";
    onClick: () => void;
}) {
    const copyBtnClassName = `markdown-code-copy-btn${copyStatus === "copied" ? " is-copied" : ""}`;
    const CopyButtonIcon = copyStatus === "copied" ? CheckIcon : CopySimpleIcon;

    return (
        <ControlButton
            type="button"
            variant="unstyled"
            size="iconSm"
            className={copyBtnClassName}
            aria-label={copyStatus === "copied" ? "代码已复制" : "复制代码"}
            onClick={onClick}
        >
            <CopyButtonIcon size={13} weight="bold" />
        </ControlButton>
    );
}

function CodeBlockHeader({ language, copyStatus, onCopy }: {
    language?: string;
    copyStatus: "idle" | "copied";
    onCopy: () => void;
}) {
    return (
        <div className="markdown-code-header">
            <div className="markdown-code-header-leading" aria-hidden={language ? undefined : true}>
                {language ? (
                    <span className="markdown-code-language-label">{language}</span>
                ) : (
                    <span className="markdown-code-traffic-lights" aria-hidden="true">
                        <span className="markdown-code-traffic-light markdown-code-traffic-light-red" />
                        <span className="markdown-code-traffic-light markdown-code-traffic-light-yellow" />
                        <span className="markdown-code-traffic-light markdown-code-traffic-light-green" />
                    </span>
                )}
            </div>
            <CodeCopyButton copyStatus={copyStatus} onClick={onCopy} />
        </div>
    );
}

function useCodeCopy(code: string) {
    const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
    const copyResetTimerRef = useRef<number | null>(null);

    const copyCode = async () => {
        if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
            return;
        }

        try {
            await navigator.clipboard.writeText(code);
            setCopyStatus("copied");
            if (copyResetTimerRef.current) {
                window.clearTimeout(copyResetTimerRef.current);
            }
            copyResetTimerRef.current = window.setTimeout(() => setCopyStatus("idle"), 1500);
        } catch (error) {
            console.warn("[Chat] Failed to copy code block", error);
        }
    };

    useEffect(() => {
        return () => {
            if (copyResetTimerRef.current) {
                window.clearTimeout(copyResetTimerRef.current);
            }
        };
    }, []);

    return { copyCode, copyStatus };
}

function ShikiCodeBlockContent({ code, language }: { code: string; language?: string }) {
    const themeTick = useDocumentThemeTick();
    const themeMode = getDocumentTheme();
    const highlightCacheKey = buildHighlightCacheKey(code, language, themeMode);
    const [html, setHtml] = useState<string | null>(() => HIGHLIGHTER_CACHE.get(highlightCacheKey) ?? null);
    const lastSuccessfulHtmlRef = useRef<string | null>(HIGHLIGHTER_CACHE.get(highlightCacheKey) ?? null);
    const { copyCode, copyStatus } = useCodeCopy(code);

    useEffect(() => {
        let cancelled = false;
        const cachedHtml = HIGHLIGHTER_CACHE.get(highlightCacheKey) ?? null;

        if (cachedHtml) {
            lastSuccessfulHtmlRef.current = cachedHtml;
        }

        void highlightCode(code, language).then((renderedHtml) => {
            if (!cancelled) {
                lastSuccessfulHtmlRef.current = renderedHtml;
                setHtml(renderedHtml);
            }
        }).catch((error) => {
            if (!cancelled) {
                console.warn("[Chat] Failed to render shiki code block", error);
                if (lastSuccessfulHtmlRef.current) {
                    setHtml(lastSuccessfulHtmlRef.current);
                    return;
                }
                setHtml(null);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [code, highlightCacheKey, language, themeTick]);

    if (!html) {
        return (
            <div className="markdown-code-block not-prose">
                <CodeBlockHeader
                    language={language}
                    copyStatus={copyStatus}
                    onCopy={() => void copyCode()}
                />
                <pre className="markdown-code-fallback">
                    <code>{code}</code>
                </pre>
            </div>
        );
    }

    return (
        <div className="markdown-code-block not-prose">
            <CodeBlockHeader
                language={language}
                copyStatus={copyStatus}
                onCopy={() => void copyCode()}
            />
            <div className="markdown-code-shiki" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
}

function MermaidCodeBlockContent({
    code,
    isStreaming = false,
    cacheKey,
}: {
    code: string;
    isStreaming?: boolean;
    cacheKey?: string;
}) {
    const themeTick = useDocumentThemeTick();
    const themeMode = getDocumentTheme();
    const themedCacheKey = cacheKey ? `${cacheKey}:${themeMode}` : undefined;
    const [svg, setSvg] = useState<string | null>(() =>
        themedCacheKey ? MERMAID_SVG_CACHE.get(themedCacheKey) ?? null : null,
    );
    const [renderFailed, setRenderFailed] = useState(false);
    const { copyCode, copyStatus } = useCodeCopy(code);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const lastSuccessfulSvgRef = useRef<string | null>(themedCacheKey ? MERMAID_SVG_CACHE.get(themedCacheKey) ?? null : null);

    useEffect(() => {
        let cancelled = false;

        void renderMermaidDiagramIncremental(code, isStreaming).then((rendered) => {
            if (cancelled) {
                return;
            }
            lastSuccessfulSvgRef.current = rendered.svg;
            if (themedCacheKey) {
                MERMAID_SVG_CACHE.set(themedCacheKey, rendered.svg);
            }
            setSvg(rendered.svg);
            setRenderFailed(false);
            requestAnimationFrame(() => {
                if (!cancelled && containerRef.current) {
                    rendered.bindFunctions?.(containerRef.current);
                }
            });
        }).catch((error) => {
            if (!cancelled) {
                console.warn("[Chat] Failed to render Mermaid diagram", error);
                const cachedSvg =
                    lastSuccessfulSvgRef.current ??
                    (themedCacheKey ? MERMAID_SVG_CACHE.get(themedCacheKey) ?? null : null);
                if (isStreaming && cachedSvg) {
                    setSvg(cachedSvg);
                    setRenderFailed(false);
                    return;
                }
                if (isStreaming) {
                    setRenderFailed(false);
                    return;
                }
                setRenderFailed(true);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [code, isStreaming, themeTick, themedCacheKey]);

    if ((!svg || renderFailed) && isStreaming) {
        return (
            <div className="markdown-code-block not-prose">
                <CodeBlockHeader
                    language={MERMAID_LANGUAGE}
                    copyStatus={copyStatus}
                    onCopy={() => void copyCode()}
                />
                <div className="markdown-mermaid-placeholder">
                    <span>正在生成 Mermaid 图表…</span>
                </div>
            </div>
        );
    }

    if (!svg || renderFailed) {
        return (
            <div className="markdown-code-block not-prose">
                <CodeBlockHeader
                    language={MERMAID_LANGUAGE}
                    copyStatus={copyStatus}
                    onCopy={() => void copyCode()}
                />
                <pre className="markdown-code-fallback">
                    <code>{code}</code>
                </pre>
            </div>
        );
    }

    return (
        <div className="markdown-code-block not-prose">
            <CodeBlockHeader
                language={MERMAID_LANGUAGE}
                copyStatus={copyStatus}
                onCopy={() => void copyCode()}
            />
            <div className="markdown-mermaid-render" ref={containerRef} dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
    );
}

export function ShikiCodeBlock({
    children,
    isStreaming = false,
    renderScope,
    node,
    ...props
}: React.ComponentPropsWithoutRef<"pre"> & {
    isStreaming?: boolean;
    renderScope?: string;
    node?: { position?: { start?: { offset?: number } } };
}) {
    const childrenArray = React.Children.toArray(children);
    const codeChild = childrenArray.find(
        (item): item is React.ReactElement<{ className?: string; children?: React.ReactNode }> => {
            return React.isValidElement(item) && item.type === "code";
        },
    );

    if (!codeChild) {
        return <pre {...props}>{children}</pre>;
    }

    const language = normalizeLanguage(codeChild.props.className);
    const code = normalizeCode(codeChild.props.children);
    const cacheKey = renderScope ? `${renderScope}:${node?.position?.start?.offset ?? 0}` : undefined;

    if (language === MERMAID_LANGUAGE) {
        return (
            <MermaidCodeBlockContent
                code={code}
                isStreaming={isStreaming}
                cacheKey={cacheKey}
            />
        );
    }

    return (
        <ShikiCodeBlockContent
            code={code}
            language={language}
        />
    );
}
