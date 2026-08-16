"use client";

import React, { useState, useMemo } from "react";
import {
    GlobeIcon,
    ArrowSquareOutIcon,
    SpinnerGapIcon,
    CheckCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
    ControlButton,
    FactoryCollapseToggle as CollapseToggle,
} from "@/components/ui/factory/groups/button/components";
import { CollapsibleRegion } from "@/components/ui/CollapsibleRegion";
import type { ToolCall } from "@/types/schema";

interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    source?: string;
    publication_year?: number;
    authors?: string[];
    cited_by_count?: number;
    doi?: string;
    is_open_access?: boolean;
}

interface WebSearchCardProps {
    tool: ToolCall;
}

const TOOL_PILL_CLASS = "relative overflow-hidden rounded-full border-0 bg-[color:color-mix(in_srgb,var(--color-panel)_82%,transparent)] backdrop-blur-md";
const TOOL_EXPANDED_PANEL_CLASS = "frosted-surface-subtle mx-4 rounded-[18px] px-4 py-3";
const TOOL_ROW_INSET_STYLE: React.CSSProperties = {
    paddingInline: "var(--inset-surface-2)",
    paddingBlock: "var(--space-2)",
};

export function WebSearchCard({ tool }: WebSearchCardProps) {
    const [resultsExpanded, setResultsExpanded] = useState(false);

    const isRunning = tool.status === "running";
    const isDone = tool.status === "done";
    const isError = tool.status === "error";

    const input = (tool.input as Record<string, unknown> | undefined) ?? undefined;
    const query = input?.query as string | undefined;
    const requestedMode = typeof input?.mode === "string" ? input.mode : undefined;
    const output = (tool.output as Record<string, unknown> | undefined) ?? undefined;
    const backend = typeof output?.backend === "string" ? output.backend : undefined;
    const effectiveMode = backend === "openalex"
        ? "scholarly_literature"
        : backend === "tencent"
            ? "general_web"
            : requestedMode;
    const structuredError = output?.error && typeof output.error === "object"
        ? output.error as Record<string, unknown>
        : undefined;
    const errorMessage = tool.error
        ?? (typeof structuredError?.message === "string" ? structuredError.message : undefined);

    const results: SearchResult[] = useMemo(() => {
        return (output?.results as SearchResult[]) ?? [];
    }, [output]);

    const total = results.length;
    const headerLabel = isRunning
        ? effectiveMode === "scholarly_literature"
            ? "正在检索文献..."
            : "正在搜索..."
        : isDone
            ? effectiveMode === "scholarly_literature"
                ? `文献检索完成 · ${total} 篇结果`
                : `搜索完成 · ${total} 条结果`
            : "搜索失败";
    const sourceLabel = effectiveMode === "scholarly_literature"
        ? "文献搜索"
        : effectiveMode === "general_web"
            ? "网页搜索"
            : undefined;

    return (
        <div className="flex flex-col gap-2">
            <div className={TOOL_PILL_CLASS}>
                <div
                    className="flex items-center gap-2 text-sm text-text-muted"
                    style={TOOL_ROW_INSET_STYLE}
                >
                    <GlobeIcon
                        size={16}
                        weight="bold"
                        className={cn(
                            isRunning ? "animate-pulse text-info" : "text-info",
                            isError && "text-error"
                        )}
                    />
                    <span className="text-sm font-medium text-text">
                        {headerLabel}
                    </span>
                    {isRunning && (
                        <SpinnerGapIcon size={14} className="ml-auto animate-spin text-info" />
                    )}
                    {isDone && (
                        <CheckCircleIcon size={14} weight="fill" className="text-success ml-auto" />
                    )}
                </div>
            </div>

            {(query || results.length > 0 || (isError && tool.error)) && (
                <div className={TOOL_EXPANDED_PANEL_CLASS}>
                    {query && (
                        <p className="text-xs text-text-muted">
                            <span className="font-medium text-text-secondary">搜索：</span>
                            {query}
                        </p>
                    )}
                    {sourceLabel && (
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-text-muted/70">
                            {sourceLabel}
                        </p>
                    )}

                    {results.length > 0 && (
                        <>
                            <ControlButton
                                type="button"
                                variant="unstyled"
                                onClick={() => setResultsExpanded(!resultsExpanded)}
                                className={cn(
                                    "mt-2 flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
                                )}
                            >
                                <CollapseToggle
                                    expanded={resultsExpanded}
                                    direction={{ kind: "free", collapsed: "right", expanded: "down" }}
                                    iconSize={10}
                                    className="h-3 w-3 text-text-muted/80"
                                    iconClassName="text-current"
                                />
                                <span>{total} 条搜索结果</span>
                            </ControlButton>
                            <CollapsibleRegion expanded={resultsExpanded} className="pt-2">
                                <div className="space-y-2">
                                    {results.map((r, i) => (
                                        <a
                                            key={i}
                                            href={r.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="frosted-surface-subtle block rounded-[16px] px-3 py-2.5 transition-colors hover:bg-surface-hover"
                                        >
                                            <span className="flex items-start gap-1.5 text-sm font-medium text-accent">
                                                <ArrowSquareOutIcon size={12} className="mt-0.5 shrink-0" />
                                                <span className="line-clamp-1">{r.title}</span>
                                            </span>
                                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
                                                {r.snippet}
                                            </p>
                                            {(r.authors && r.authors.length > 0)
                                                || r.publication_year
                                                || r.source
                                                || typeof r.cited_by_count === "number"
                                                || r.is_open_access !== undefined ? (
                                                <div className="mt-2 flex flex-wrap gap-1.5 text-xs leading-none text-text-muted/80">
                                                    {r.authors && r.authors.length > 0 && (
                                                        <span className="rounded-full bg-surface/70 px-2 py-1">
                                                            {r.authors.slice(0, 3).join(", ")}
                                                            {r.authors.length > 3 ? " et al." : ""}
                                                        </span>
                                                    )}
                                                    {r.publication_year && (
                                                        <span className="rounded-full bg-surface/70 px-2 py-1">
                                                            {r.publication_year}
                                                        </span>
                                                    )}
                                                    {r.source && (
                                                        <span className="rounded-full bg-surface/70 px-2 py-1">
                                                            {r.source}
                                                        </span>
                                                    )}
                                                    {typeof r.cited_by_count === "number" && (
                                                        <span className="rounded-full bg-surface/70 px-2 py-1">
                                                            被引 {r.cited_by_count}
                                                        </span>
                                                    )}
                                                    {r.is_open_access !== undefined && (
                                                        <span className="rounded-full bg-surface/70 px-2 py-1">
                                                            {r.is_open_access ? "开放获取" : "非开放获取"}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : null}
                                            {r.doi && (
                                                <span className="type-caption mt-1 block truncate text-text-muted/60">
                                                    DOI: {r.doi}
                                                </span>
                                            )}
                                            <span className="type-caption mt-0.5 block truncate text-text-muted/60">
                                                {r.url}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </CollapsibleRegion>
                        </>
                    )}

                    {errorMessage && (
                        <p className={cn("text-xs text-error", results.length > 0 || query ? "mt-2" : "")}>
                            {errorMessage}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
