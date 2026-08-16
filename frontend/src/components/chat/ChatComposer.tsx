"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import { createPortal } from "react-dom";
import {
    PaperPlaneRightIcon,
    StopIcon,
    MagnifyingGlassIcon,
    PaperclipIcon,
    XIcon,
    FileIcon,
    ImageIcon,
    ArchiveBoxIcon,
    SparkleIcon,
    BinocularsIcon,
    WarningCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
    ControlIconButton,
    ControlToggleButton,
} from "@/components/ui/factory/groups/button/components";
import { MentionPopover, filterMentionResources } from "./MentionPopover";
import type { MentionResource } from "./MentionPopover";
import {
    CHAT_ATTACHMENT_EXTENSIONS,
    inferKnownResourceKind,
} from "@/lib/upload/file";
import {
    DEFAULT_SEND_SHORTCUT,
    getComposerShortcutHint,
    type SendShortcutPreference,
} from "@/lib/userPreferences";

const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_INPUT_CHARS = 16_000;
const CHAR_COUNT_SHOW_RATIO = 0.8;
const FALLBACK_COMPOSER_FRAME_MIN_HEIGHT_PX = 112;
const COMPOSER_HEIGHT_CSS_VAR = "--workspace-chat-composer-current-height";
const MENTION_TAG_ATTR = "data-resource-id";
const MENTION_TAG_NAME_ATTR = "data-resource-name";

type ComposerPreviewKey =
    | "search"
    | "deep_research"
    | "deep_thinking"
    | "attachment"
    | "upload_to_library"
    | "send"
    | "stop";

const COMPOSER_PREVIEW_TEXT: Record<ComposerPreviewKey, string> = {
    search: "搜索增强",
    deep_research: "深度研究",
    deep_thinking: "深度思考",
    attachment: "上传附件",
    upload_to_library: "上传附件",
    send: "发送消息",
    stop: "停止生成",
};

function isPreviewKeyAvailable(
    key: ComposerPreviewKey,
    {
        isSending,
        hasUploadToLibrary,
    }: {
        isSending: boolean;
        hasUploadToLibrary: boolean;
    },
): boolean {
    if (key === "stop") {
        return isSending;
    }

    if (key === "upload_to_library") {
        return hasUploadToLibrary;
    }

    return true;
}

function readCssPxVar(
    node: HTMLElement,
    name: string,
    fallbackPx: number,
): number {
    const raw = window.getComputedStyle(node).getPropertyValue(name).trim();
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : fallbackPx;
}

export interface ResourceRef {
    id: string;
    name: string;
}

export interface PendingAttachment {
    file: File;
    preview?: string;
}

type AttachmentNoticeTone = "warning";

interface AttachmentNotice {
    tone: AttachmentNoticeTone;
    message: string;
}

interface ChatComposerProps {
    onSend: (text: string, attachments?: PendingAttachment[], resourceRefs?: ResourceRef[]) => void;
    onStop?: () => void;
    isSending: boolean;
    placeholder?: string;
    sendShortcut?: SendShortcutPreference;
    searchRequired?: boolean;
    onToggleSearchRequired?: () => void;
    deepResearch?: boolean;
    deepResearchAvailable?: boolean;
    onToggleDeepResearch?: () => void;
    deepThinking?: boolean;
    onToggleDeepThinking?: () => void;
    onUploadToLibrary?: () => void;
    availableResources?: MentionResource[];
}

function isImageFile(file: File): boolean {
    return file.type.startsWith("image/");
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function extractPlainText(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? "";
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.hasAttribute(MENTION_TAG_ATTR)) {
            return "";
        }
        if (el.tagName === "BR") {
            return "\n";
        }
        if (el.tagName === "DIV" || el.tagName === "P") {
            let text = "";
            for (const child of el.childNodes) {
                text += extractPlainText(child);
            }
            return text ? "\n" + text : "";
        }
    }
    let text = "";
    for (const child of node.childNodes) {
        text += extractPlainText(child);
    }
    return text;
}

function extractTextFromEditable(el: HTMLElement): string {
    let result = "";
    for (const child of el.childNodes) {
        result += extractPlainText(child);
    }
    return result.replace(/^\n/, "").replace(/\u200b/g, "");
}

function extractResourceRefs(el: HTMLElement): ResourceRef[] {
    const refs: ResourceRef[] = [];
    const seen = new Set<string>();
    const spans = el.querySelectorAll(`[${MENTION_TAG_ATTR}]`);
    for (const span of spans) {
        const id = span.getAttribute(MENTION_TAG_ATTR);
        const name = span.getAttribute(MENTION_TAG_NAME_ATTR) ?? "";
        if (id && !seen.has(id)) {
            seen.add(id);
            refs.push({ id, name });
        }
    }
    return refs;
}

function getMentionContext(editable: HTMLElement): { active: boolean; query: string; range: Range | null } {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editable.contains(sel.anchorNode)) {
        return { active: false, query: "", range: null };
    }

    const range = sel.getRangeAt(0);
    if (!range.collapsed) {
        return { active: false, query: "", range: null };
    }

    let textNode = sel.anchorNode;
    let offset = sel.anchorOffset;

    if (!textNode) {
        return { active: false, query: "", range: null };
    }

    // When the anchor is an element (e.g. the editable div itself or an inner <br>/<div>),
    // resolve to the nearest text node.
    if (textNode.nodeType !== Node.TEXT_NODE) {
        const children = textNode.childNodes;
        // Try the child just before the cursor offset
        if (offset > 0 && children[offset - 1]) {
            let candidate = children[offset - 1];
            // Walk into the last text node of the candidate subtree
            while (candidate.lastChild) {
                candidate = candidate.lastChild;
            }
            if (candidate.nodeType === Node.TEXT_NODE) {
                textNode = candidate;
                offset = (candidate.textContent ?? "").length;
            } else {
                return { active: false, query: "", range: null };
            }
        } else if (children[offset]?.nodeType === Node.TEXT_NODE) {
            textNode = children[offset];
            offset = 0;
        } else {
            return { active: false, query: "", range: null };
        }
    }

    const text = textNode.textContent ?? "";
    const before = text.slice(0, offset);

    const atIdx = before.lastIndexOf("@");
    if (atIdx === -1) {
        return { active: false, query: "", range: null };
    }

    if (atIdx > 0) {
        const charBefore = before[atIdx - 1];
        if (charBefore !== " " && charBefore !== "\n" && charBefore !== "\u00a0") {
            return { active: false, query: "", range: null };
        }
    }

    const queryStr = before.slice(atIdx + 1);
    if (queryStr.includes(" ") || queryStr.includes("\n")) {
        return { active: false, query: "", range: null };
    }

    return { active: true, query: queryStr, range };
}

function createMentionSpan(resource: MentionResource): HTMLSpanElement {
    const span = document.createElement("span");
    span.setAttribute(MENTION_TAG_ATTR, resource.id);
    span.setAttribute(MENTION_TAG_NAME_ATTR, resource.name);
    span.contentEditable = "false";
    span.className =
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 mx-0.5 text-xs font-medium bg-accent/15 text-accent border border-accent/20 select-none align-baseline whitespace-nowrap";
    span.textContent = `@${resource.name}`;
    return span;
}

function placeCursorAfter(node: Node) {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}

export function ChatComposer({
    onSend,
    onStop,
    isSending,
    placeholder,
    sendShortcut = DEFAULT_SEND_SHORTCUT,
    searchRequired,
    onToggleSearchRequired,
    deepResearch,
    deepResearchAvailable = true,
    onToggleDeepResearch,
    deepThinking,
    onToggleDeepThinking,
    onUploadToLibrary,
    availableResources = [],
}: ChatComposerProps) {
    const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
    const [isEmpty, setIsEmpty] = useState(true);
    const composerRef = useRef<HTMLDivElement>(null);
    const editableRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mentionActive, setMentionActive] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionIndex, setMentionIndex] = useState(0);
    const [mentionPos, setMentionPos] = useState({ top: 0, left: 0 });
    const [attachmentNotice, setAttachmentNotice] = useState<AttachmentNotice | null>(null);
    const [hoveredLeftPreview, setHoveredLeftPreview] = useState<ComposerPreviewKey | null>(null);
    const [focusedLeftPreview, setFocusedLeftPreview] = useState<ComposerPreviewKey | null>(null);
    const [hoveredActionPreview, setHoveredActionPreview] = useState<ComposerPreviewKey | null>(null);
    const [focusedActionPreview, setFocusedActionPreview] = useState<ComposerPreviewKey | null>(null);

    const readyResources: MentionResource[] = availableResources.filter((r) => r.status === "ready");
    const readyResourcesRef = useRef<MentionResource[]>([]);
    useEffect(() => {
        readyResourcesRef.current = readyResources;
    }, [readyResources]);

    useEffect(() => {
        if (!attachmentNotice) return;
        const timer = window.setTimeout(() => {
            setAttachmentNotice((current) =>
                current?.message === attachmentNotice.message ? null : current,
            );
        }, 4000);
        return () => window.clearTimeout(timer);
    }, [attachmentNotice]);

    const [charCount, setCharCount] = useState(0);
    const overLimit = charCount > MAX_INPUT_CHARS;
    const canSend = (!isEmpty || attachments.length > 0) && !isSending && !overLimit;
    const leftRawPreview = focusedLeftPreview ?? hoveredLeftPreview;
    const leftPreview =
        leftRawPreview &&
        isPreviewKeyAvailable(leftRawPreview, {
            isSending,
            hasUploadToLibrary: Boolean(onUploadToLibrary),
        })
            ? leftRawPreview
            : null;
    const actionRawPreview = focusedActionPreview ?? hoveredActionPreview;
    const actionPreview =
        actionRawPreview &&
        isPreviewKeyAvailable(actionRawPreview, {
            isSending,
            hasUploadToLibrary: Boolean(onUploadToLibrary),
        })
            ? actionRawPreview
            : null;
    const leftPreviewText = leftPreview ? COMPOSER_PREVIEW_TEXT[leftPreview] : null;
    const actionPreviewText = actionPreview ? COMPOSER_PREVIEW_TEXT[actionPreview] : "";
    const resolvedPlaceholder = placeholder ?? "输入消息";
    const keyboardHint = getComposerShortcutHint(sendShortcut);

    const leftPreviewHandlers = useCallback(
        (key: ComposerPreviewKey) => ({
            onMouseEnter: () => setHoveredLeftPreview(key),
            onMouseLeave: () =>
                setHoveredLeftPreview((current) => (current === key ? null : current)),
            onFocus: () => setFocusedLeftPreview(key),
            onBlur: () =>
                setFocusedLeftPreview((current) => (current === key ? null : current)),
        }),
        [],
    );

    const actionPreviewHandlers = useCallback(
        (key: ComposerPreviewKey) => ({
            onMouseEnter: () => setHoveredActionPreview(key),
            onMouseLeave: () =>
                setHoveredActionPreview((current) => (current === key ? null : current)),
            onFocus: () => setFocusedActionPreview(key),
            onBlur: () =>
                setFocusedActionPreview((current) => (current === key ? null : current)),
        }),
        [],
    );

    const checkEmpty = useCallback(() => {
        const el = editableRef.current;
        if (!el) return;
        const text = extractTextFromEditable(el).trim();
        const hasRefs = el.querySelector(`[${MENTION_TAG_ATTR}]`) !== null;
        setIsEmpty(text.length === 0 && !hasRefs);
        setCharCount(text.length);
    }, []);

    const updateMentionState = useCallback(() => {
        const el = editableRef.current;
        const resources = readyResourcesRef.current;
        if (!el || resources.length === 0) {
            setMentionActive(false);
            return;
        }

        const ctx = getMentionContext(el);
        if (!ctx.active || !ctx.range) {
            setMentionActive(false);
            return;
        }

        const filtered = filterMentionResources(resources, ctx.query);
        if (filtered.length === 0) {
            setMentionActive(false);
            return;
        }

        let rect = ctx.range.getBoundingClientRect();

        // Safari sometimes returns a zero-size DOMRect for collapsed ranges.
        // Insert a temporary zero-width space to get a measurable rect.
        if (rect.width === 0 && rect.height === 0) {
            const tmpSpan = document.createElement("span");
            tmpSpan.textContent = "\u200b";
            ctx.range.insertNode(tmpSpan);
            rect = tmpSpan.getBoundingClientRect();
            const parent = tmpSpan.parentNode;
            if (parent) {
                parent.removeChild(tmpSpan);
                parent.normalize();
            }
            // Restore selection after DOM mutation
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(ctx.range);
            }
        }

        if (rect.height === 0) {
            setMentionActive(false);
            return;
        }

        const popoverHeight = Math.min(filtered.length, 6) * 36 + 8;
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;

        let top: number;
        if (spaceAbove >= popoverHeight) {
            top = rect.top - popoverHeight;
        } else if (spaceBelow >= popoverHeight) {
            top = rect.bottom + 4;
        } else {
            top = Math.max(4, rect.bottom + 4);
        }

        setMentionPos({
            top,
            left: Math.min(rect.left, window.innerWidth - 330),
        });
        setMentionQuery(ctx.query);
        setMentionIndex((prev) => Math.min(prev, filtered.length - 1));
        setMentionActive(true);
    }, []);

    const insertMention = useCallback(
        (resource: MentionResource) => {
            const el = editableRef.current;
            if (!el) return;

            const ctx = getMentionContext(el);
            if (!ctx.active || !ctx.range) return;

            const sel = window.getSelection();
            if (!sel) return;

            const textNode = sel.anchorNode;
            if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

            const text = textNode.textContent ?? "";
            const offset = sel.anchorOffset;
            const before = text.slice(0, offset);
            const atIdx = before.lastIndexOf("@");
            if (atIdx === -1) return;

            const afterText = text.slice(offset);
            const beforeAt = text.slice(0, atIdx);

            const parentNode = textNode.parentNode;
            if (!parentNode) return;

            const beforeTextNode = document.createTextNode(beforeAt);
            const span = createMentionSpan(resource);
            const spacer = document.createTextNode("\u200b");
            const afterTextNode = document.createTextNode(afterText);

            parentNode.insertBefore(beforeTextNode, textNode);
            parentNode.insertBefore(span, textNode);
            parentNode.insertBefore(spacer, textNode);
            parentNode.insertBefore(afterTextNode, textNode);
            parentNode.removeChild(textNode);

            placeCursorAfter(spacer);

            setMentionActive(false);
            setMentionQuery("");
            setMentionIndex(0);
            checkEmpty();
        },
        [checkEmpty],
    );

    const addFiles = useCallback((files: FileList | File[]) => {
        const fileArray = Array.from(files);
        let unsupportedTypeCount = 0;
        let oversizedCount = 0;
        const valid = fileArray.filter((f) => {
            const kind = inferKnownResourceKind(f.name);
            if (!kind) {
                unsupportedTypeCount += 1;
                console.warn(`File ${f.name} is not supported for temporary attachments`);
                return false;
            }
            if (f.size > MAX_ATTACHMENT_SIZE) {
                oversizedCount += 1;
                console.warn(`File ${f.name} exceeds ${formatFileSize(MAX_ATTACHMENT_SIZE)} limit`);
                return false;
            }
            return true;
        });

        if (unsupportedTypeCount > 0) {
            setAttachmentNotice({
                tone: "warning",
                message:
                    unsupportedTypeCount === 1
                        ? "该附件类型暂不支持，请使用与资料上传相同的文件格式。"
                        : "部分附件类型暂不支持，请使用与资料上传相同的文件格式。",
            });
        } else if (oversizedCount > 0) {
            setAttachmentNotice({
                tone: "warning",
                message: `聊天附件单文件不能超过 ${formatFileSize(MAX_ATTACHMENT_SIZE)}。`,
            });
        } else {
            setAttachmentNotice(null);
        }

        const pending: PendingAttachment[] = valid.map((file) => ({ file }));

        for (const item of pending) {
            if (isImageFile(item.file)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setAttachments((prev) =>
                        prev.map((a) =>
                            a.file === item.file
                                ? { ...a, preview: e.target?.result as string }
                                : a,
                        ),
                    );
                };
                reader.readAsDataURL(item.file);
            }
        }

        setAttachments((prev) => [...prev, ...pending]);
    }, []);

    const removeAttachment = useCallback((index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const submit = useCallback(() => {
        const el = editableRef.current;
        if (!canSend || !el) return;
        const text = extractTextFromEditable(el).trim();
        const refs = extractResourceRefs(el);
        onSend(text, attachments.length > 0 ? attachments : undefined, refs.length > 0 ? refs : undefined);
        el.innerHTML = "";
        setAttachments([]);
        setIsEmpty(true);
        setMentionActive(false);
        setHoveredLeftPreview(null);
        setFocusedLeftPreview(null);
        setHoveredActionPreview(null);
        setFocusedActionPreview(null);
    }, [canSend, onSend, attachments]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const isComposing = e.nativeEvent.isComposing || e.keyCode === 229;
            if (isComposing) {
                return;
            }

            if (mentionActive) {
                const filtered = filterMentionResources(readyResourcesRef.current, mentionQuery);
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setMentionIndex((prev) => (prev + 1) % filtered.length);
                    return;
                }
                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setMentionIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
                    return;
                }
                if (e.key === "Enter" || e.key === "Tab") {
                    e.preventDefault();
                    if (filtered[mentionIndex]) {
                        insertMention(filtered[mentionIndex]);
                    }
                    return;
                }
                if (e.key === "Escape") {
                    e.preventDefault();
                    setMentionActive(false);
                    return;
                }
            }

            if (e.key === "Backspace") {
                const sel = window.getSelection();
                if (sel && sel.isCollapsed && sel.anchorNode) {
                    const node = sel.anchorNode;
                    const off = sel.anchorOffset;
                    const el = editableRef.current;

                    // Helper: find the mention span immediately before the cursor position
                    const findPrevMention = (): { mention: HTMLElement; zwsp: Node | null } | null => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            const text = node.textContent ?? "";
                            // Cursor at start of text node, or inside a zwsp-only text node
                            if (off === 0 || (off <= 1 && text[0] === "\u200b")) {
                                const isInZwsp = off <= 1 && text[0] === "\u200b";
                                // Check if previous sibling is a mention span
                                const prev = node.previousSibling;
                                if (prev && prev.nodeType === Node.ELEMENT_NODE && (prev as HTMLElement).hasAttribute(MENTION_TAG_ATTR)) {
                                    return { mention: prev as HTMLElement, zwsp: isInZwsp ? node : null };
                                }
                                // Check if previous sibling is a zwsp text node before a mention
                                if (prev && prev.nodeType === Node.TEXT_NODE && prev.textContent === "\u200b") {
                                    const mentionSib = prev.previousSibling;
                                    if (mentionSib && mentionSib.nodeType === Node.ELEMENT_NODE && (mentionSib as HTMLElement).hasAttribute(MENTION_TAG_ATTR)) {
                                        return { mention: mentionSib as HTMLElement, zwsp: prev };
                                    }
                                }
                            }
                        }
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Walk backwards from the offset to find the nearest mention
                            const children = node.childNodes;
                            for (let i = Math.min(off, children.length) - 1; i >= 0; i--) {
                                const child = children[i];
                                if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).hasAttribute(MENTION_TAG_ATTR)) {
                                    // Check if next sibling is a zwsp
                                    const next = child.nextSibling;
                                    const zwsp = (next && next.nodeType === Node.TEXT_NODE && next.textContent === "\u200b") ? next : null;
                                    return { mention: child as HTMLElement, zwsp };
                                }
                                // Stop searching if we hit non-empty text
                                if (child.nodeType === Node.TEXT_NODE && child.textContent && child.textContent.replace(/\u200b/g, "").length > 0) {
                                    break;
                                }
                            }
                        }
                        return null;
                    };

                    const found = findPrevMention();
                    if (found && el) {
                        e.preventDefault();
                        const parent = found.mention.parentNode;
                        if (parent) {
                            if (found.zwsp) {
                                const zwspText = found.zwsp.textContent ?? "";
                                if (zwspText.length <= 1) {
                                    parent.removeChild(found.zwsp);
                                } else {
                                    found.zwsp.textContent = zwspText.replace("\u200b", "");
                                }
                            }
                            parent.removeChild(found.mention);
                            checkEmpty();
                        }
                        return;
                    }
                }
            }

            const shouldSubmit =
                sendShortcut === "enter"
                    ? e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.altKey &&
                      !e.ctrlKey &&
                      !e.metaKey
                    : e.key === "Enter" &&
                      (e.metaKey || e.ctrlKey) &&
                      !e.shiftKey &&
                      !e.altKey;

            if (shouldSubmit) {
                e.preventDefault();
                submit();
            }
        },
        [mentionActive, mentionQuery, mentionIndex, insertMention, submit, checkEmpty, sendShortcut],
    );

    // Use native event listeners because React's onInput is unreliable on contentEditable.
    // setTimeout(0) ensures the DOM/selection is settled; flushSync forces React to re-render.
    // We also listen to keyup as a fallback for Safari which sometimes misses input events.
    useEffect(() => {
        const el = editableRef.current;
        if (!el) return;
        const handler = () => {
            flushSync(() => {
                checkEmpty();
            });
            setTimeout(() => {
                flushSync(() => {
                    updateMentionState();
                });
            }, 0);
        };
        el.addEventListener("input", handler);
        el.addEventListener("keyup", handler);
        return () => {
            el.removeEventListener("input", handler);
            el.removeEventListener("keyup", handler);
        };
    }, [checkEmpty, updateMentionState]);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files.length > 0) {
                addFiles(e.dataTransfer.files);
            }
        },
        [addFiles],
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            const items = e.clipboardData.items;
            const files: File[] = [];
            for (const item of items) {
                if (item.kind === "file") {
                    const file = item.getAsFile();
                    if (file) files.push(file);
                }
            }
            if (files.length > 0) {
                e.preventDefault();
                addFiles(files);
                return;
            }

            const text = e.clipboardData.getData("text/plain");
            if (text) {
                e.preventDefault();
                document.execCommand("insertText", false, text);
            }
        },
        [addFiles],
    );

    // Composer height CSS var observer
    useEffect(() => {
        const composer = composerRef.current;
        if (!composer) return;
        const lastHeightRef = { current: -1 };

        const updateComposerHeightCssVar = () => {
            const fallbackMin = readCssPxVar(
                composer,
                "--size-chat-composer-frame-min-height",
                FALLBACK_COMPOSER_FRAME_MIN_HEIGHT_PX,
            );
            const resolvedHeight = Math.max(
                fallbackMin,
                composer.offsetHeight || fallbackMin,
            );
            const roundedHeight = Math.round(resolvedHeight);
            if (lastHeightRef.current === roundedHeight) {
                return;
            }
            lastHeightRef.current = roundedHeight;
            document.documentElement.style.setProperty(COMPOSER_HEIGHT_CSS_VAR, `${roundedHeight}px`);
        };

        let rafId: number | null = null;
        const scheduleUpdate = () => {
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
            }
            rafId = window.requestAnimationFrame(() => {
                rafId = null;
                updateComposerHeightCssVar();
            });
        };

        scheduleUpdate();

        const observer = new ResizeObserver(() => {
            scheduleUpdate();
        });
        observer.observe(composer);

        return () => {
            observer.disconnect();
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
            }
        };
    }, []);

    // Close mention popover on blur
    useEffect(() => {
        const el = editableRef.current;
        if (!el) return;
        const handleBlur = () => {
            setTimeout(() => setMentionActive(false), 150);
        };
        el.addEventListener("blur", handleBlur);
        return () => el.removeEventListener("blur", handleBlur);
    }, []);

    return (
        <div
            ref={composerRef}
            data-tour-id="chat-composer"
            className={cn(
                "chat-composer-surface w-full flex flex-col gap-[var(--gap-chat-composer-content)]",
                "min-h-[var(--size-chat-composer-frame-min-height)] max-h-[var(--size-chat-composer-frame-max-height)] overflow-hidden rounded-[var(--radius-chat-composer)] border border-border/50 bg-panel/80 p-[var(--inset-chat-composer-padding)] backdrop-blur-xl",
                "transition-all [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
                "focus-within:ring-2 focus-within:ring-accent/35 focus-within:border-accent/35",
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {attachments.length > 0 && (
                <div className="shrink-0 flex flex-col gap-2 px-1">
                    <div className="type-caption flex items-center gap-2 select-none text-text-muted">
                        <PaperclipIcon size={10} />
                        <span>聊天附件 · 仅用于当前对话</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {attachments.map((att, idx) => (
                            <div
                                key={`${att.file.name}-${idx}`}
                                className="relative group flex max-w-[var(--size-chat-composer-attachment-max-width)] items-center gap-2 rounded-lg border border-border bg-panel px-2 py-2 text-xs text-text-muted"
                            >
                                {att.preview ? (
                                    // eslint-disable-next-line @next/next/no-img-element -- data URL thumbnail
                                    <img
                                        src={att.preview}
                                        alt={att.file.name}
                                        className="size-8 rounded object-cover shrink-0"
                                    />
                                ) : isImageFile(att.file) ? (
                                    <ImageIcon size={16} className="shrink-0 text-accent" />
                                ) : (
                                    <FileIcon size={16} className="shrink-0 text-text-secondary" />
                                )}
                                <div className="truncate min-w-0">
                                    <div className="truncate font-medium text-text">{att.file.name}</div>
                                    <div className="type-caption text-text-muted">{formatFileSize(att.file.size)}</div>
                                </div>
                                <ControlIconButton
                                    onClick={() => removeAttachment(idx)}
                                    variant="dangerGhost"
                                    size="iconXs"
                                    className="absolute -right-1 -top-1 opacity-0 transition-opacity group-hover:opacity-100 bg-error text-text-inverse hover:bg-error/90"
                                    icon={<XIcon size={10} weight="bold" />}
                                    aria-label="移除附件"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {attachmentNotice && (
                <div
                    className={cn(
                        "mx-1 shrink-0 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
                        attachmentNotice.tone === "warning" &&
                            "border-warning/25 bg-warning/10 text-warning",
                    )}
                    role="status"
                    aria-live="polite"
                >
                    <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
                    <span>{attachmentNotice.message}</span>
                </div>
            )}

            <div className="relative min-h-0">
                <div
                    className={cn(
                        "relative",
                        "min-h-[var(--size-chat-composer-textarea-min-height,32px)] max-h-[var(--size-chat-composer-textarea-max-height,120px)]",
                        "overflow-y-auto custom-scrollbar px-2 py-2 scroll-pb-2",
                    )}
                >
                    {isEmpty ? (
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-2 top-2 text-left text-md leading-relaxed text-text-muted/50 [direction:ltr] [unicode-bidi:plaintext]"
                            style={{ fontFamily: 'var(--font-role-body), "Twemoji"' }}
                        >
                            {resolvedPlaceholder}
                        </div>
                    ) : null}
                    <div
                        ref={editableRef}
                        contentEditable
                        suppressContentEditableWarning
                        role="textbox"
                        aria-multiline="true"
                        aria-placeholder={resolvedPlaceholder}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        dir="ltr"
                        className={cn(
                            "w-full resize-none border-none bg-transparent text-left text-md leading-relaxed text-text outline-none focus:ring-0 [direction:ltr] [unicode-bidi:plaintext]",
                            "min-h-[var(--size-chat-composer-textarea-min-height,32px)]",
                        )}
                        style={{ fontFamily: 'var(--font-role-body), "Twemoji"', whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    />
                </div>
            </div>

            {mentionActive &&
                createPortal(
                    <MentionPopover
                        resources={readyResources}
                        query={mentionQuery}
                        selectedIndex={mentionIndex}
                        position={mentionPos}
                        onSelect={insertMention}
                    />,
                    document.body,
                )}

            <div
                ref={toolbarRef}
                className="relative z-10 -mx-1 shrink-0 flex h-[var(--size-chat-composer-toolbar-height)] items-center gap-[var(--gap-chat-composer-content)] px-1"
            >
                <div className="min-w-0 flex flex-1 items-center gap-[var(--gap-chat-composer-content)]">
                    <div className="flex shrink-0 items-center gap-[var(--gap-chat-composer-content)]">
                        <ControlToggleButton
                            data-tour-id="search-required-toggle"
                            variant="toolbar"
                            variantByState={{ pressed: "toolbarActive" }}
                            pressed={Boolean(searchRequired)}
                            size="iconMd"
                            className="hover:text-accent transition-colors"
                            onClick={onToggleSearchRequired}
                            aria-pressed={searchRequired}
                            aria-label={searchRequired ? "关闭搜索增强" : "开启搜索增强"}
                            {...leftPreviewHandlers("search")}
                        >
                            <MagnifyingGlassIcon size={18} weight={searchRequired ? "fill" : "bold"} />
                        </ControlToggleButton>
                        <ControlToggleButton
                            data-tour-id="deep-thinking-toggle"
                            variant="toolbar"
                            variantByState={{ pressed: "toolbarActive" }}
                            pressed={Boolean(deepThinking)}
                            size="iconMd"
                            className="hover:text-accent transition-colors"
                            onClick={onToggleDeepThinking}
                            aria-pressed={deepThinking}
                            aria-label={deepThinking ? "关闭深度思考" : "开启深度思考"}
                            {...leftPreviewHandlers("deep_thinking")}
                        >
                            <SparkleIcon size={18} weight={deepThinking ? "fill" : "bold"} />
                        </ControlToggleButton>
                        <ControlToggleButton
                            data-tour-id="deep-research-toggle"
                            variant="toolbar"
                            variantByState={{ pressed: "toolbarActive" }}
                            pressed={Boolean(deepResearch && deepResearchAvailable)}
                            disabled={!deepResearchAvailable}
                            size="iconMd"
                            className="hover:text-accent transition-colors"
                            onClick={onToggleDeepResearch}
                            aria-pressed={deepResearch && deepResearchAvailable}
                            aria-label={
                                deepResearchAvailable
                                    ? (deepResearch ? "关闭深度研究" : "开启深度研究")
                                    : "深度研究仅限 Plus 和 Studio 用户使用"
                            }
                            {...leftPreviewHandlers("deep_research")}
                        >
                            <BinocularsIcon
                                size={18}
                                weight={deepResearch && deepResearchAvailable ? "fill" : "bold"}
                            />
                        </ControlToggleButton>
                        <ControlIconButton
                            data-tour-id="chat-attachment-button"
                            variant="toolbar"
                            size="iconMd"
                            icon={<PaperclipIcon size={18} weight="bold" />}
                            className="hover:text-accent transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="添加聊天附件"
                            {...leftPreviewHandlers("attachment")}
                        />
                        {onUploadToLibrary && (
                            <ControlIconButton
                                variant="toolbar"
                                size="iconMd"
                                icon={<ArchiveBoxIcon size={18} weight="bold" />}
                                className="hover:text-accent transition-colors"
                                onClick={onUploadToLibrary}
                                aria-label="上传到资源库"
                                {...leftPreviewHandlers("upload_to_library")}
                            />
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={CHAT_ATTACHMENT_EXTENSIONS}
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) addFiles(e.target.files);
                                e.target.value = "";
                            }}
                        />
                    </div>
                    {leftPreviewText ? (
                        <span className="type-caption hidden truncate select-none text-text-muted/60 sm:inline-block">
                            {leftPreviewText}
                        </span>
                    ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-[var(--gap-chat-composer-content)]">
                    {charCount > MAX_INPUT_CHARS * CHAR_COUNT_SHOW_RATIO && (
                        <span className={cn(
                            "type-caption tabular-nums select-none mr-1",
                            overLimit ? "text-destructive" : "text-text-muted/60",
                        )}>
                            {charCount.toLocaleString()}/{MAX_INPUT_CHARS.toLocaleString()}
                        </span>
                    )}
                    <span
                        className={cn(
                            "type-caption hidden select-none sm:inline-block",
                            actionPreviewText ? "text-text-muted/60" : "text-text-muted/40",
                        )}
                    >
                        {actionPreviewText || keyboardHint}
                    </span>
                    {isSending ? (
                        <ControlIconButton
                            variant="destructive"
                            size="iconMd"
                            icon={<StopIcon size={18} weight="fill" />}
                            className="hover:scale-105"
                            onClick={onStop}
                            aria-label="停止生成"
                            {...actionPreviewHandlers("stop")}
                        />
                    ) : (
                        <ControlIconButton
                            variant="default"
                            size="iconMd"
                            icon={<PaperPlaneRightIcon size={18} weight="fill" />}
                            className="hover:scale-105 disabled:bg-border disabled:text-text-secondary disabled:hover:scale-100"
                            onClick={submit}
                            disabled={!canSend}
                            aria-label="发送消息"
                            {...actionPreviewHandlers("send")}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
