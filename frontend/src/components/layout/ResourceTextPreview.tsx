"use client";

import { useEffect, useMemo, useRef } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import type { ResourceTextPreviewFormat } from "@/lib/preview/resourcePreview";
import type { EvidenceHit } from "@/types/schema";
import { cn } from "@/lib/utils";

interface ResourceTextPreviewProps {
    resourceId: string;
    content: string;
    format: ResourceTextPreviewFormat;
    focusHit: EvidenceHit | null;
}

type FocusLineRange = {
    lineStart: number;
    lineEnd: number;
};

const FOCUS_LINE_CLASS_NAME = "preview-focus-target";
const FOCUS_LINE_STYLE = {
    textDecorationLine: "underline",
    textDecorationThickness: "2px",
    textUnderlineOffset: "0.22em",
    textDecorationColor: "color-mix(in srgb, var(--color-accent) 72%, transparent)",
    backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
    borderRadius: "0.55rem",
    scrollMarginBlock: "7rem",
} as const;

function normalizeSearchText(text: string): string {
    return text
        .replace(/\s+/g, " ")
        .replace(/[\u2010-\u2015\u2011]/g, "-")
        .trim()
        .toLowerCase();
}

function findSnippetLineRange(content: string, snippet: string): FocusLineRange | null {
    const normalizedSnippet = normalizeSearchText(snippet);
    if (!normalizedSnippet) {
        return null;
    }

    const lines = content.split(/\r?\n/);
    for (let startIndex = 0; startIndex < lines.length; startIndex += 1) {
        let windowText = "";
        for (let endIndex = startIndex; endIndex < lines.length && endIndex < startIndex + 16; endIndex += 1) {
            windowText = windowText
                ? `${windowText} ${lines[endIndex]}`
                : lines[endIndex];
            const normalizedWindow = normalizeSearchText(windowText);
            if (!normalizedWindow) {
                continue;
            }
            if (normalizedWindow.includes(normalizedSnippet)) {
                return {
                    lineStart: startIndex + 1,
                    lineEnd: endIndex + 1,
                };
            }
            if (normalizedWindow.length > normalizedSnippet.length * 3) {
                break;
            }
        }
    }

    return null;
}

function resolveFocusLineRange(
    content: string,
    focusHit: EvidenceHit | null,
): FocusLineRange | null {
    if (!focusHit) {
        return null;
    }

    const explicitStart = focusHit.locator_meta?.line_start;
    const explicitEnd = focusHit.locator_meta?.line_end;
    if (typeof explicitStart === "number") {
        return {
            lineStart: explicitStart,
            lineEnd: typeof explicitEnd === "number" ? Math.max(explicitStart, explicitEnd) : explicitStart,
        };
    }

    return findSnippetLineRange(content, focusHit.snippet);
}

export function ResourceTextPreview({
    resourceId,
    content,
    format,
    focusHit,
}: ResourceTextPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const focusLineRange = useMemo(
        () => resolveFocusLineRange(content, focusHit),
        [content, focusHit],
    );

    useEffect(() => {
        if (!focusLineRange || !containerRef.current) {
            return;
        }

        const container = containerRef.current;
        const firstTarget = container.querySelector<HTMLElement>("[data-preview-focus-target='true']");
        if (!firstTarget) {
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const targetRect = firstTarget.getBoundingClientRect();
        const targetTop = container.scrollTop + (targetRect.top - containerRect.top);
        const centeredTop = targetTop - (container.clientHeight / 2) + (targetRect.height / 2);
        const nextTop = Math.max(0, centeredTop);

        container.scrollTo({
            top: nextTop,
            behavior: "smooth",
        });
    }, [focusLineRange, content, format]);

    if (!content.trim()) {
        return (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                <WarningCircleIcon size={28} className="text-warning" />
                <div>
                    <div className="text-sm font-medium text-text">文件内容为空</div>
                    <div className="mt-1 text-xs text-text-muted">当前没有可展示的文本内容。</div>
                </div>
            </div>
        );
    }

    const lines = content.split(/\r?\n/);

    return (
        <div ref={containerRef} className="h-full overflow-auto px-5 py-5">
            {format === "markdown" ? (
                <MarkdownRenderer
                    content={content}
                    renderScope={`resource-preview:${resourceId}`}
                    surface="notes"
                    focusLineRange={focusLineRange}
                />
            ) : (
                <div className="space-y-1.5">
                    {lines.map((line, index) => {
                        const lineNumber = index + 1;
                        const isFocused = !!focusLineRange
                            && lineNumber >= focusLineRange.lineStart
                            && lineNumber <= focusLineRange.lineEnd;
                        return (
                            <div
                                key={`${resourceId}:${lineNumber}`}
                                data-preview-focus-target={isFocused ? "true" : undefined}
                                className={cn(
                                    "whitespace-pre-wrap break-words text-sm leading-6 text-text",
                                    isFocused && FOCUS_LINE_CLASS_NAME,
                                )}
                                style={isFocused ? FOCUS_LINE_STYLE : undefined}
                            >
                                {line || "\u00A0"}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
