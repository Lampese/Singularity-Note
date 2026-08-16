import React, { useMemo } from "react";
import type { components } from "@/lib/api/schema";
import { EvidenceHit } from "@/types/schema";

type ResourceView = components["schemas"]["ResourceView"];

interface CitationsProps {
    evidence: EvidenceHit[];
    resources: ResourceView[];
}

/**
 * 将文本中的资源 ID 简单替换为资源名称。
 * 不再生成超链接，保持对话文本的纯净。
 */
export function formatResourceIdInText(text: string, resources: ResourceView[]): string {
    if (!text) return text;

    // 1. 统一连字符变体
    let processedText = text.replace(/[\u2010-\u2015\u2011]/g, '-');

    if (!resources.length) return processedText;

    // 建立 ID 映射
    const idMap = new Map<string, ResourceView>();
    const prefixMap = new Map<string, ResourceView>();
    resources.forEach(res => {
        idMap.set(res.id.toLowerCase(), res);
        prefixMap.set(res.id.split('-')[0].toLowerCase(), res);
    });

    // 2. 识别并转换引用标注 (仅文本替换)
    // 匹配模板: [Ref: ID, p. X] 或 【证据：ID，第X页】
    const complexPatterns = [
        /\[Ref:\s*([0-9a-f]{8}(?:-[0-9a-f]{4}){0,4})[\s,，.．\-]*p\.\s*(\d+)\]/gi,
        /【证据：\s*([0-9a-f]{8}(?:-[0-9a-f]{4}){0,4})[\s,，.．\-]*第\s*(\d+)\s*页】/gi
    ];

    complexPatterns.forEach(regex => {
        processedText = processedText.replace(regex, (match, idPart, page) => {
            const lowId = idPart.toLowerCase();
            const res = idMap.get(lowId) || prefixMap.get(lowId.slice(0, 8));
            return res ? `[Ref: ${res.name}, p.${page}]` : match;
        });
    });

    // 3. 识别并转换独立 ID
    const loneIdPattern = /[0-9a-f]{8}(?:-[0-9a-f]{4}){4}|(?<![a-z0-9])[0-9a-f]{8}(?![a-z0-9\-])/gi;
    processedText = processedText.replace(loneIdPattern, (idPart) => {
        const lowId = idPart.toLowerCase();
        const res = idMap.get(lowId) || (lowId.length === 8 ? prefixMap.get(lowId) : null);
        return res ? res.name : idPart;
    });

    // 4. 通用标点收尾
    processedText = processedText
        .replace(/【/g, "[")
        .replace(/】/g, "]")
        .replace(/证据[：:]\s*/g, "Ref: ")
        .replace(/第\s*(\d+)\s*页/g, "p.$1");

    return processedText;
}

/**
 * 通用文本预处理
 */
export function preprocessMessageText(text: string): string {
    return text;
}

/**
 * 将 EvidenceHit 数组按资源 ID 分组，并提取页码
 */
export function useGroupedCitations(evidence: EvidenceHit[], resources: ResourceView[]) {
    return useMemo(() => {
        const groups: Map<string, { resource: ResourceView; pages: Map<number, EvidenceHit> }> = new Map();

        evidence.forEach((hit) => {
            const res = resources.find((r) => r.id === hit.resource_id);
            if (!res) return;

            if (!groups.has(res.id)) {
                groups.set(res.id, { resource: res, pages: new Map() });
            }

            const group = groups.get(res.id)!;
            const page = hit.locator_meta?.page;

            if (typeof page === "number") {
                if (!group.pages.has(page)) {
                    group.pages.set(page, hit);
                }
            }
        });

        return Array.from(groups.values()).sort((a, b) => a.resource.name.localeCompare(b.resource.name));
    }, [evidence, resources]);
}

/**
 * 渲染底部的引用 badge
 */
export function MessageCitations({ evidence, resources }: CitationsProps) {
    const grouped = useGroupedCitations(evidence, resources);

    if (grouped.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-3 text-xs text-text-secondary">
            {grouped.map((group) => {
                const sortedPages = Array.from(group.pages.keys()).sort((a, b) => a - b);

                return (
                    <div key={group.resource.id} className="flex items-center bg-surface-sub px-2 py-0.5 rounded-sm">
                        <span className="opacity-50 font-mono">[ </span>
                        <span className="font-semibold text-accent">
                            {group.resource.name}
                        </span>

                        {sortedPages.length > 0 && (
                            <>
                                <span className="ml-1">p.</span>
                                {sortedPages.map((page, idx) => (
                                    <React.Fragment key={page}>
                                        <span className="text-accent px-0.5 font-medium">
                                            {page}
                                        </span>
                                        {idx < sortedPages.length - 1 && <span className="mr-0.5 opacity-70">, </span>}
                                    </React.Fragment>
                                ))}
                            </>
                        )}
                        <span className="opacity-50 font-mono"> ]</span>
                    </div>
                );
            })}
        </div>
    );
}
