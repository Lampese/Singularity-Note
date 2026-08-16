"use client";

import React, { useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { rehypeTwemoji } from "@yuna0x0/rehype-twemoji";
import { ShikiCodeBlock } from "@/components/chat/ShikiCodeBlock";
import { formatResourceIdInText } from "@/lib/utils/resourceFormat";
import { renderInlineCitations } from "@/lib/utils/inlineCitations";
import { preprocessMarkdownCompatibility } from "@/lib/utils/mathPreprocess";
import { closeOpenMermaidFenceForStreaming } from "@/lib/utils/streamingMarkdown";
import type { EvidenceHit } from "@/types/schema";
import type { components } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

type MarkdownBlockNodeProps = {
    children?: React.ReactNode;
};

type MarkdownNodePosition = {
    start?: { line?: number; offset?: number };
    end?: { line?: number; offset?: number };
};

type MarkdownNodeLike = {
    position?: MarkdownNodePosition;
};

type MarkdownElementProps<Tag extends keyof React.JSX.IntrinsicElements> =
    React.ComponentPropsWithoutRef<Tag> & {
        node?: MarkdownNodeLike;
        children?: React.ReactNode;
    };

type MarkdownPreProps = React.ComponentPropsWithoutRef<"pre"> & {
    node?: MarkdownNodeLike;
};

type FocusLineRange = {
    lineStart: number;
    lineEnd: number;
};

interface MarkdownRendererProps {
    content: string;
    resources?: components["schemas"]["ResourceView"][];
    evidence?: EvidenceHit[];
    isStreaming?: boolean;
    renderScope: string;
    surface?: "chat" | "notes";
    className?: string;
    onEvidenceSelect?: (hit: EvidenceHit) => void;
    focusLineRange?: FocusLineRange | null;
}

const FOCUS_TARGET_CLASS_NAME = "preview-focus-target";
const FOCUS_TARGET_STYLE: React.CSSProperties = {
    textDecorationLine: "underline",
    textDecorationThickness: "2px",
    textUnderlineOffset: "0.22em",
    textDecorationColor: "color-mix(in srgb, var(--color-accent) 72%, transparent)",
    backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
    borderRadius: "0.55rem",
    scrollMarginBlock: "7rem",
};

function renderChildrenWithInlineCitations(
    children: React.ReactNode,
    evidence: EvidenceHit[] | undefined,
    onEvidenceSelect?: (hit: EvidenceHit) => void,
): React.ReactNode {
    const safeEvidence = evidence ?? [];

    return React.Children.map(children, (child) => {
        if (typeof child === "string") {
            return renderInlineCitations(child, safeEvidence, onEvidenceSelect);
        }
        return child;
    });
}

function resolveNodeLineRange(node?: MarkdownNodeLike): FocusLineRange | null {
    const lineStart = node?.position?.start?.line;
    const lineEnd = node?.position?.end?.line ?? lineStart;
    if (typeof lineStart !== "number" || typeof lineEnd !== "number") {
        return null;
    }
    return {
        lineStart,
        lineEnd,
    };
}

function lineRangesOverlap(
    nodeRange: FocusLineRange | null,
    focusLineRange: FocusLineRange | null | undefined,
): boolean {
    if (!nodeRange || !focusLineRange) {
        return false;
    }
    return nodeRange.lineStart <= focusLineRange.lineEnd
        && nodeRange.lineEnd >= focusLineRange.lineStart;
}

function buildFocusProps(
    node: MarkdownNodeLike | undefined,
    focusLineRange: FocusLineRange | null | undefined,
    className?: string,
    style?: React.CSSProperties,
): {
    className?: string;
    style?: React.CSSProperties;
    "data-preview-focus-target"?: "true";
    "data-md-line-start"?: number;
    "data-md-line-end"?: number;
} {
    const nodeRange = resolveNodeLineRange(node);
    const lineStart = nodeRange?.lineStart;
    const lineEnd = nodeRange?.lineEnd;
    const isFocused = lineRangesOverlap(nodeRange, focusLineRange);

    return {
        className: cn(className, isFocused && FOCUS_TARGET_CLASS_NAME),
        style: isFocused ? { ...style, ...FOCUS_TARGET_STYLE } : style,
        "data-preview-focus-target": isFocused ? "true" : undefined,
        "data-md-line-start": lineStart,
        "data-md-line-end": lineEnd,
    };
}

export const MarkdownRenderer = React.memo(function MarkdownRenderer({
    content,
    resources = [],
    evidence,
    isStreaming = false,
    renderScope,
    surface = "chat",
    className,
    onEvidenceSelect,
    focusLineRange,
}: MarkdownRendererProps) {
    const markdownContent = isStreaming
        ? closeOpenMermaidFenceForStreaming(content)
        : content;
    const formattedContent = useMemo(
        () => preprocessMarkdownCompatibility(formatResourceIdInText(markdownContent, resources)),
        [markdownContent, resources],
    );
    const renderParagraph = useCallback(({ children }: MarkdownBlockNodeProps) => (
        <p>{renderChildrenWithInlineCitations(children, evidence, onEvidenceSelect)}</p>
    ), [evidence, onEvidenceSelect]);
    const renderListItem = useCallback(({ children }: MarkdownBlockNodeProps) => (
        <li>{renderChildrenWithInlineCitations(children, evidence, onEvidenceSelect)}</li>
    ), [evidence, onEvidenceSelect]);
    const renderFocusedParagraph = useCallback((props: MarkdownElementProps<"p">) => {
        const { children, node, className, style, ...rest } = props;
        return (
            <p
                {...rest}
                {...buildFocusProps(node, focusLineRange, className, style)}
            >
                {renderChildrenWithInlineCitations(children, evidence, onEvidenceSelect)}
            </p>
        );
    }, [evidence, focusLineRange, onEvidenceSelect]);
    const renderFocusedListItem = useCallback((props: MarkdownElementProps<"li">) => {
        const { children, node, className, style, ...rest } = props;
        return (
            <li
                {...rest}
                {...buildFocusProps(node, focusLineRange, className, style)}
            >
                {renderChildrenWithInlineCitations(children, evidence, onEvidenceSelect)}
            </li>
        );
    }, [evidence, focusLineRange, onEvidenceSelect]);
    const renderFocusedHeading = useCallback((Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => {
        return function FocusedHeading(props: MarkdownElementProps<typeof Tag>) {
            const { children, node, className, style, ...rest } = props;
            return React.createElement(
                Tag,
                {
                    ...rest,
                    ...buildFocusProps(node, focusLineRange, className, style),
                },
                children,
            );
        };
    }, [focusLineRange]);
    const renderFocusedBlockquote = useCallback((props: MarkdownElementProps<"blockquote">) => {
        const { children, node, className, style, ...rest } = props;
        return (
            <blockquote
                {...rest}
                {...buildFocusProps(node, focusLineRange, className, style)}
            >
                {children}
            </blockquote>
        );
    }, [focusLineRange]);
    const renderFocusedTable = useCallback((props: MarkdownElementProps<"table">) => {
        const { children, node, className, style, ...rest } = props;
        return (
            <table
                {...rest}
                {...buildFocusProps(node, focusLineRange, className, style)}
            >
                {children}
            </table>
        );
    }, [focusLineRange]);
    const renderPre = useCallback((props: MarkdownPreProps) => {
        const { className, style, node, children, ...rest } = props;
        return (
            <div {...buildFocusProps(node, focusLineRange, className, style)}>
                <ShikiCodeBlock
                    {...rest}
                    node={node}
                    isStreaming={isStreaming}
                    renderScope={renderScope}
                >
                    {children}
                </ShikiCodeBlock>
            </div>
        );
    }, [focusLineRange, isStreaming, renderScope]);
    const markdownComponents = useMemo(() => {
        const components: Record<string, unknown> = {
            pre: renderPre,
        };

        if (focusLineRange) {
            components.p = renderFocusedParagraph;
            components.li = renderFocusedListItem;
            components.h1 = renderFocusedHeading("h1");
            components.h2 = renderFocusedHeading("h2");
            components.h3 = renderFocusedHeading("h3");
            components.h4 = renderFocusedHeading("h4");
            components.h5 = renderFocusedHeading("h5");
            components.h6 = renderFocusedHeading("h6");
            components.blockquote = renderFocusedBlockquote;
            components.table = renderFocusedTable;
            return components;
        }

        if (evidence && evidence.length > 0) {
            components.p = renderParagraph;
            components.li = renderListItem;
        }

        return components;
    }, [
        evidence,
        focusLineRange,
        renderFocusedBlockquote,
        renderFocusedHeading,
        renderFocusedListItem,
        renderFocusedParagraph,
        renderFocusedTable,
        renderListItem,
        renderParagraph,
        renderPre,
    ]);

    if (!content) {
        return null;
    }

    return (
        <div className={cn(
            "prose markdown-prose max-w-none",
            surface === "chat" ? "markdown-prose-chat" : "markdown-prose-notes",
            "prose-code:font-mono prose-code:bg-accent-muted prose-code:text-accent",
            "prose-table:w-full prose-table:border-collapse",
            "prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:bg-panel prose-th:font-semibold",
            "prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-td:text-left",
            className,
        )}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeTwemoji]}
                components={markdownComponents}
            >
                {formattedContent}
            </ReactMarkdown>
        </div>
    );
});

MarkdownRenderer.displayName = "MarkdownRenderer";
