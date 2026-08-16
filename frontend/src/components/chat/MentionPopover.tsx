"use client";

import React, { useEffect, useRef, useCallback } from "react";
import {
    FilePdfIcon,
    FileTextIcon,
    VideoIcon,
    MusicNoteIcon,
    ImageIcon,
    MicrosoftWordLogoIcon,
    MicrosoftPowerpointLogoIcon,
    TableIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface MentionResource {
    id: string;
    name: string;
    kind: string;
    status: string;
}

interface MentionPopoverProps {
    resources: MentionResource[];
    query: string;
    selectedIndex: number;
    position: { top: number; left: number };
    onSelect: (resource: MentionResource) => void;
}

function resourceIcon(kind: string, className: string) {
    const size = 16;
    const weight = "regular" as const;
    switch (kind) {
        case "pdf":
            return <FilePdfIcon size={size} weight={weight} className={className} />;
        case "video":
            return <VideoIcon size={size} weight={weight} className={className} />;
        case "audio":
            return <MusicNoteIcon size={size} weight={weight} className={className} />;
        case "image":
            return <ImageIcon size={size} weight={weight} className={className} />;
        case "docx":
        case "doc":
            return <MicrosoftWordLogoIcon size={size} weight={weight} className={className} />;
        case "pptx":
        case "ppt":
            return <MicrosoftPowerpointLogoIcon size={size} weight={weight} className={className} />;
        case "xlsx":
        case "xls":
        case "csv":
            return <TableIcon size={size} weight={weight} className={className} />;
        default:
            return <FileTextIcon size={size} weight={weight} className={className} />;
    }
}

function fuzzyMatch(name: string, query: string): boolean {
    if (!query) return true;
    const lower = name.toLowerCase();
    const q = query.toLowerCase();
    return lower.includes(q);
}

export function MentionPopover({
    resources,
    query,
    selectedIndex,
    position,
    onSelect,
}: MentionPopoverProps) {
    const listRef = useRef<HTMLDivElement>(null);

    const filtered = resources.filter((r) => fuzzyMatch(r.name, query));

    useEffect(() => {
        const active = listRef.current?.querySelector("[data-active='true']");
        active?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    const handleClick = useCallback(
        (e: React.MouseEvent, resource: MentionResource) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(resource);
        },
        [onSelect],
    );

    if (filtered.length === 0) {
        return null;
    }

    return (
        <div
            className="frosted-surface-subtle fixed z-9999 max-h-[240px] min-w-[220px] max-w-[320px] overflow-y-auto rounded-[18px] custom-scrollbar"
            style={{ top: position.top, left: position.left }}
            onMouseDown={(e) => e.preventDefault()}
        >
            <div ref={listRef} className="py-1.5">
                {filtered.map((resource, idx) => (
                    <div
                        key={resource.id}
                        data-active={idx === selectedIndex}
                        className={cn(
                            "mx-1.5 flex cursor-pointer items-center gap-2 rounded-[14px] px-3 py-2 text-sm transition-colors",
                            idx === selectedIndex
                                ? "bg-accent-muted text-accent"
                                : "text-text hover:bg-surface-hover",
                        )}
                        onClick={(e) => handleClick(e, resource)}
                    >
                        {resourceIcon(resource.kind, "shrink-0 text-text-secondary")}
                        <span className="truncate min-w-0">{resource.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function filterMentionResources(
    resources: MentionResource[],
    query: string,
): MentionResource[] {
    return resources.filter((r) => fuzzyMatch(r.name, query));
}
