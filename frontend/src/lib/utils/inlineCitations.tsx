import React from "react";
import { ControlButton } from "@/components/ui/factory/groups/button/components";
import type { EvidenceHit } from "@/types/schema";

const CITATION_REGEX = /\[(\d+)\]/g;
const CITATION_HANDLE_PREFIX = "[[cite:";

export type CitationHandleRenderResult = {
    content: string;
    evidence: EvidenceHit[];
    visibleHitIndices: number[] | null;
};

export function renderCitationHandles(
    content: string,
    evidence: EvidenceHit[] | undefined,
): CitationHandleRenderResult {
    const safeEvidence = evidence ?? [];
    const handleToIndex = new Map<string, number>();

    safeEvidence.forEach((hit, index) => {
        if (hit.citation_handle && !handleToIndex.has(hit.citation_handle)) {
            handleToIndex.set(hit.citation_handle, index);
        }
    });

    if (handleToIndex.size === 0) {
        return {
            content,
            evidence: safeEvidence,
            visibleHitIndices: null,
        };
    }

    if (!content.includes(CITATION_HANDLE_PREFIX)) {
        return {
            content,
            evidence: safeEvidence,
            visibleHitIndices: [],
        };
    }

    const citedOrder = new Map<string, number>();
    const visibleHitIndices: number[] = [];
    const citedEvidence: EvidenceHit[] = [];
    let output = "";
    let cursor = 0;

    while (true) {
        const start = content.indexOf(CITATION_HANDLE_PREFIX, cursor);
        if (start < 0) {
            output += content.slice(cursor);
            break;
        }

        output += content.slice(cursor, start);
        const handleStart = start + CITATION_HANDLE_PREFIX.length;
        const end = content.indexOf("]]", handleStart);

        if (end < 0) {
            output += content.slice(start);
            break;
        }

        const handle = content.slice(handleStart, end).trim();
        const evidenceIndex = handleToIndex.get(handle);

        if (evidenceIndex !== undefined) {
            let citationNumber = citedOrder.get(handle);
            if (citationNumber === undefined) {
                citationNumber = citedOrder.size + 1;
                citedOrder.set(handle, citationNumber);
                visibleHitIndices.push(evidenceIndex);
                citedEvidence.push(safeEvidence[evidenceIndex]);
            }
            output += `[${citationNumber}]`;
        }

        cursor = end + 2;
    }

    return {
        content: output,
        evidence: citedEvidence.length > 0 ? citedEvidence : safeEvidence,
        visibleHitIndices,
    };
}

export function renderInlineCitations(
    text: string,
    evidence: EvidenceHit[],
    onSelectEvidence?: (hit: EvidenceHit) => void,
): React.ReactNode[] {
    if (!evidence.length) return [text];

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const regex = new RegExp(CITATION_REGEX);
    while ((match = regex.exec(text)) !== null) {
        const idx = parseInt(match[1], 10) - 1;
        if (idx < 0 || idx >= evidence.length) continue;

        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        const citation = onSelectEvidence ? (
            <ControlButton
                key={`cite-${match.index}`}
                variant="unstyled"
                size="xs"
                className="mx-0.5 inline-flex h-[1.2em] min-w-[1.2em] items-center justify-center rounded-sm border border-accent/20 bg-accent-muted px-0.5 align-super type-caption font-bold leading-none text-accent transition-colors hover:border-accent/40 hover:bg-accent/15"
                onClick={() => onSelectEvidence(evidence[idx])}
            >
                {idx + 1}
            </ControlButton>
        ) : (
            <span
                key={`cite-${match.index}`}
                className="mx-0.5 inline-flex h-[1.2em] min-w-[1.2em] items-center justify-center rounded-sm border border-accent/20 bg-accent-muted px-0.5 align-super type-caption font-bold leading-none text-accent"
            >
                {idx + 1}
            </span>
        );

        parts.push(citation);
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
}
