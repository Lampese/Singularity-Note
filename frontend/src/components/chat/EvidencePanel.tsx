"use client";

import React, { useMemo, useState } from "react";
import {
    FilePdfIcon,
    FileTextIcon,
    ImageIcon,
    PresentationIcon,
    QuotesIcon,
    SpeakerHighIcon,
    TableIcon,
} from "@phosphor-icons/react";
import type { components } from "@/lib/api/schema";
import type { EvidenceHit } from "@/types/schema";
import { cn } from "@/lib/utils";
import { renderCitationHandles, renderInlineCitations } from "@/lib/utils/inlineCitations";
import {
    ControlButton,
    FactoryCollapseToggle as CollapseToggle,
} from "@/components/ui/factory/groups/button/components";
import { CollapsibleRegion } from "@/components/ui/CollapsibleRegion";

type ResourceView = components["schemas"]["ResourceView"];

interface EvidencePanelProps {
    hits: EvidenceHit[];
    resources?: ResourceView[];
    onSelectHit?: (hit: EvidenceHit) => void;
    selectedHitKey?: string | null;
    visibleHitIndices?: number[] | null;
}

const EXT_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
    pdf: { label: "PDF", icon: <FilePdfIcon size={14} weight="fill" className="text-error" /> },
    pptx: { label: "PPTX", icon: <PresentationIcon size={14} weight="fill" className="text-warning" /> },
    ppt: { label: "PPT", icon: <PresentationIcon size={14} weight="fill" className="text-warning" /> },
    docx: { label: "DOCX", icon: <FileTextIcon size={14} weight="fill" className="text-info" /> },
    doc: { label: "DOC", icon: <FileTextIcon size={14} weight="fill" className="text-info" /> },
    xlsx: { label: "XLSX", icon: <TableIcon size={14} weight="fill" className="text-success" /> },
    xls: { label: "XLS", icon: <TableIcon size={14} weight="fill" className="text-success" /> },
    csv: { label: "CSV", icon: <TableIcon size={14} weight="fill" className="text-success" /> },
    png: { label: "图片", icon: <ImageIcon size={14} weight="fill" className="text-accent" /> },
    jpg: { label: "图片", icon: <ImageIcon size={14} weight="fill" className="text-accent" /> },
    jpeg: { label: "图片", icon: <ImageIcon size={14} weight="fill" className="text-accent" /> },
    mp3: { label: "音频", icon: <SpeakerHighIcon size={14} weight="fill" className="text-accent" /> },
    wav: { label: "音频", icon: <SpeakerHighIcon size={14} weight="fill" className="text-accent" /> },
};

const MODALITY_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
    text: { label: "文本", icon: <FileTextIcon size={14} weight="fill" className="text-accent" /> },
    image: { label: "图片", icon: <ImageIcon size={14} weight="fill" className="text-warning" /> },
    table: { label: "表格", icon: <TableIcon size={14} weight="fill" className="text-success" /> },
    audio_segment: { label: "音频", icon: <SpeakerHighIcon size={14} weight="fill" className="text-accent" /> },
};

const FALLBACK_CONFIG = {
    label: "文档",
    icon: <FileTextIcon size={14} weight="fill" className="text-accent" />,
};

function CitationAwareSnippet({
    text,
    evidence,
    onSelectHit,
}: {
    text: string;
    evidence: EvidenceHit[];
    onSelectHit?: (hit: EvidenceHit) => void;
}) {
    const citationDisplay = useMemo(
        () => renderCitationHandles(text, evidence),
        [evidence, text],
    );

    return (
        <span className="type-meta mt-2 block break-words text-text-secondary sm:line-clamp-4">
            {renderInlineCitations(citationDisplay.content, citationDisplay.evidence, onSelectHit)}
        </span>
    );
}

function resolveDisplay(resourceName: string, modality: string): { label: string; icon: React.ReactNode } {
    const ext = resourceName.split(".").pop()?.toLowerCase();
    if (ext && EXT_CONFIG[ext]) {
        return EXT_CONFIG[ext];
    }
    return MODALITY_CONFIG[modality] ?? FALLBACK_CONFIG;
}

function resolveResourceName(hit: EvidenceHit, resourceMap: Map<string, ResourceView>): string {
    const fallbackName = resourceMap.get(hit.resource_id)?.name?.trim() ?? "";
    return hit.resource_name.trim() || fallbackName || "参考资料";
}

function buildEvidenceHitKey(hit: EvidenceHit): string {
    return [
        hit.resource_id,
        hit.locator,
        hit.snippet,
        hit.score.toFixed(6),
    ].join("::");
}

function formatEvidenceLocation(hit: EvidenceHit): string | null {
    if (typeof hit.locator_meta?.page === "number") {
        return `页码 ${hit.locator_meta.page}`;
    }
    if (typeof hit.locator_meta?.slide === "number") {
        return `幻灯片 ${hit.locator_meta.slide}`;
    }
    if (typeof hit.locator_meta?.line_start === "number") {
        if (
            typeof hit.locator_meta.line_end === "number"
            && hit.locator_meta.line_end > hit.locator_meta.line_start
        ) {
            return `行 ${hit.locator_meta.line_start}-${hit.locator_meta.line_end}`;
        }
        return `行 ${hit.locator_meta.line_start}`;
    }
    if (typeof hit.locator_meta?.timestamp_start === "number") {
        if (
            typeof hit.locator_meta.timestamp_end === "number"
            && hit.locator_meta.timestamp_end > hit.locator_meta.timestamp_start
        ) {
            return `时间 ${hit.locator_meta.timestamp_start}-${hit.locator_meta.timestamp_end}s`;
        }
        return `时间 ${hit.locator_meta.timestamp_start}s`;
    }

    const rawLocator = hit.locator.trim();
    if (!rawLocator) {
        return null;
    }

    const pageMatch = rawLocator.match(/page\s*=?\s*(\d+)/i);
    if (pageMatch) {
        return `页码 ${pageMatch[1]}`;
    }

    const slideMatch = rawLocator.match(/slide\s*=?\s*(\d+)/i);
    if (slideMatch) {
        return `幻灯片 ${slideMatch[1]}`;
    }

    const lineRangeMatch = rawLocator.match(/lines?\s*=?\s*(\d+)(?:\s*[-~]\s*(\d+))?/i);
    if (lineRangeMatch) {
        const [, start, end] = lineRangeMatch;
        return end ? `行 ${start}-${end}` : `行 ${start}`;
    }

    return null;
}

function formatEvidenceRelevance(score: number): string {
    return `关联度 ${score.toFixed(2)}`;
}

export function EvidencePanel({
    hits,
    resources = [],
    onSelectHit,
    selectedHitKey = null,
    visibleHitIndices = null,
}: EvidencePanelProps) {
    const [expanded, setExpanded] = useState(false);
    const [hoveredHitKey, setHoveredHitKey] = useState<string | null>(null);
    const resourceMap = useMemo(
        () => new Map(resources.map((resource) => [resource.id, resource])),
        [resources],
    );
    const visibleHits = useMemo(
        () => {
            if (visibleHitIndices) {
                return visibleHitIndices
                    .map((index) => ({ hit: hits[index], index }))
                    .filter(({ hit }) => !!hit);
            }

            return hits.map((hit, index) => ({ hit, index }));
        },
        [hits, visibleHitIndices],
    );

    if (!visibleHits.length) return null;

    return (
        <div className="mt-4 w-full border-t border-border pt-3">
            <ControlButton
                type="button"
                variant="unstyled"
                size="xs"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                className="group type-caption mb-2 inline-flex cursor-pointer items-center gap-2 rounded-none border-0 bg-transparent px-0 py-0 font-semibold tracking-[0.08em] text-text-secondary transition-colors hover:bg-transparent hover:text-text"
                leading={
                    <CollapseToggle
                        expanded={expanded}
                        direction={{ kind: "free", collapsed: "right", expanded: "down" }}
                        iconSize={12}
                        className="h-4 w-4 text-text-muted/80 group-hover:text-text"
                        iconClassName="text-current"
                    />
                }
            >
                <QuotesIcon size={14} weight="fill" />
                <span>参考证据 ({visibleHits.length})</span>
            </ControlButton>

            <CollapsibleRegion expanded={expanded}>
                <div className="flex flex-col gap-2">
                    {visibleHits.map(({ hit }, visibleIndex) => {
                        const resourceName = resolveResourceName(hit, resourceMap);
                        const display = resolveDisplay(resourceName, hit.modality);
                        const hitKey = buildEvidenceHitKey(hit);
                        const active = selectedHitKey === hitKey;
                        const hovered = hoveredHitKey === hitKey;
                        const locationLabel = formatEvidenceLocation(hit);
                        const evidenceCardClassName = cn(
                            "group/evidence frosted-surface-subtle type-meta flex w-full min-w-0 items-start gap-3 overflow-hidden rounded-[var(--radius-surface-1)] px-3 py-3 text-left text-text-secondary transition-colors",
                            active || hovered
                                ? "text-text"
                                : undefined,
                            onSelectHit && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                        );
                        const evidenceCardStyle = {
                            backgroundColor: active
                                ? "var(--color-surface-sub)"
                                : hovered
                                    ? "var(--color-surface-hover)"
                                    : "var(--color-panel)",
                        } as const;
                        const evidenceContent = (
                            <>
                                <span className="mt-0.5 shrink-0">{display.icon}</span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-start gap-2">
                                        <span className="type-caption rounded-full bg-surface/80 px-2 py-0.5 font-semibold tracking-[0.12em] text-text-secondary transition-colors group-hover/evidence:bg-surface">
                                            [{visibleIndex + 1}]
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="type-meta block break-all text-text sm:line-clamp-2">
                                                {resourceName}
                                            </span>
                                        </span>
                                        <span className="type-caption shrink-0 rounded-full bg-surface/80 px-2 py-0.5 font-semibold uppercase tracking-[0.12em] text-text-secondary transition-colors group-hover/evidence:bg-surface">
                                            {display.label}
                                        </span>
                                    </span>
                                    <span className="type-caption mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-text-muted">
                                        {locationLabel && <span>{locationLabel}</span>}
                                        <span>{formatEvidenceRelevance(hit.score)}</span>
                                    </span>
                                    <CitationAwareSnippet
                                        text={hit.snippet}
                                        evidence={hits}
                                        onSelectHit={onSelectHit}
                                    />
                                </span>
                            </>
                        );

                        if (!onSelectHit) {
                            return (
                                <div key={hitKey} className={evidenceCardClassName} style={evidenceCardStyle}>
                                    {evidenceContent}
                                </div>
                            );
                        }

                        return (
                            <div
                                key={hitKey}
                                role="button"
                                tabIndex={0}
                                className={cn(evidenceCardClassName, "cursor-pointer")}
                                style={evidenceCardStyle}
                                aria-pressed={active}
                                onClick={() => onSelectHit(hit)}
                                onMouseEnter={() => setHoveredHitKey(hitKey)}
                                onMouseLeave={() => setHoveredHitKey((current) => current === hitKey ? null : current)}
                                onFocus={() => setHoveredHitKey(hitKey)}
                                onBlur={() => setHoveredHitKey((current) => current === hitKey ? null : current)}
                                onKeyDown={(event) => {
                                    if (event.key !== "Enter" && event.key !== " ") {
                                        return;
                                    }
                                    event.preventDefault();
                                    onSelectHit(hit);
                                }}
                            >
                                {evidenceContent}
                            </div>
                        );
                    })}
                </div>
            </CollapsibleRegion>
        </div>
    );
}
