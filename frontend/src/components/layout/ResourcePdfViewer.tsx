"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    CaretLeftIcon,
    CaretRightIcon,
    SpinnerGapIcon,
    WarningCircleIcon,
} from "@phosphor-icons/react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist/types/src/display/api";
import type { EvidenceHit } from "@/types/schema";
import { Input } from "@/components/ui/Input";
import {
    ControlButton,
    ControlIconButton,
} from "@/components/ui/factory/groups/button/components";

type PdfJsModule = typeof import("pdfjs-dist");
type ViewerMode = "single" | "continuous";

interface ResourcePdfViewerProps {
    pdfBlob: Blob;
    focusHit: EvidenceHit | null;
    mode?: ViewerMode;
    suspendResponsiveResize?: boolean;
}

interface PageLayout {
    scale: number;
    width: number;
    height: number;
}

interface PdfCanvasPageProps {
    pdfDoc: PDFDocumentProxy;
    pageNumber: number;
    containerWidth: number;
    focusBbox: number[] | null;
    showFocusRing: boolean;
    onError: (error: unknown) => void;
    onRenderStateChange?: (rendering: boolean) => void;
    setWrapperRef?: (node: HTMLDivElement | null) => void;
}

let pdfJsModulePromise: Promise<PdfJsModule> | null = null;
const pdfWorkerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

async function loadPdfJs(): Promise<PdfJsModule> {
    if (!pdfJsModulePromise) {
        pdfJsModulePromise = import("pdfjs-dist").then((module) => {
            module.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
            return module;
        });
    }
    return pdfJsModulePromise;
}

function clampPage(page: number, pageCount: number): number {
    if (pageCount <= 0) return 1;
    return Math.min(Math.max(page, 1), pageCount);
}

function formatViewerError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return "无法渲染预览文件。";
}

function PdfCanvasPage({
    pdfDoc,
    pageNumber,
    containerWidth,
    focusBbox,
    showFocusRing,
    onError,
    onRenderStateChange,
    setWrapperRef,
}: PdfCanvasPageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<RenderTask | null>(null);
    const [pageLayout, setPageLayout] = useState<PageLayout | null>(null);

    useEffect(() => {
        if (!canvasRef.current || containerWidth <= 0) return;

        let cancelled = false;

        const renderPage = async () => {
            onRenderStateChange?.(true);

            try {
                const page = await pdfDoc.getPage(pageNumber);
                if (cancelled) return;

                const baseViewport = page.getViewport({ scale: 1 });
                const cssScale = containerWidth / baseViewport.width;
                const cssViewport = page.getViewport({ scale: cssScale });
                const devicePixelRatio = window.devicePixelRatio || 1;
                const renderViewport = page.getViewport({
                    scale: cssScale * devicePixelRatio,
                });

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext("2d");
                if (!context) {
                    throw new Error("canvas 2d context unavailable");
                }

                renderTaskRef.current?.cancel();
                renderTaskRef.current = null;

                canvas.width = Math.ceil(renderViewport.width);
                canvas.height = Math.ceil(renderViewport.height);
                canvas.style.width = `${cssViewport.width}px`;
                canvas.style.height = `${cssViewport.height}px`;

                context.setTransform(1, 0, 0, 1, 0, 0);
                context.clearRect(0, 0, canvas.width, canvas.height);

                setPageLayout({
                    scale: cssScale,
                    width: cssViewport.width,
                    height: cssViewport.height,
                });

                const renderTask = page.render({
                    canvas,
                    canvasContext: context,
                    viewport: renderViewport,
                });
                renderTaskRef.current = renderTask;
                await renderTask.promise;
            } catch (error) {
                if (cancelled) return;
                const message = error instanceof Error ? error.message : String(error);
                if (!message.includes("Rendering cancelled")) {
                    onError(error);
                }
            } finally {
                if (!cancelled) {
                    onRenderStateChange?.(false);
                }
            }
        };

        void renderPage();

        return () => {
            cancelled = true;
            renderTaskRef.current?.cancel();
            renderTaskRef.current = null;
        };
    }, [containerWidth, onError, onRenderStateChange, pageNumber, pdfDoc]);

    const highlightStyle = useMemo(() => {
        if (!pageLayout || !focusBbox) {
            return null;
        }

        const [x, y, width, height] = focusBbox;
        if (width <= 0 || height <= 0) {
            return null;
        }

        return {
            left: `${x * pageLayout.scale}px`,
            top: `${y * pageLayout.scale}px`,
            width: `${width * pageLayout.scale}px`,
            height: `${height * pageLayout.scale}px`,
        };
    }, [focusBbox, pageLayout]);

    return (
        <div ref={setWrapperRef} className="mx-auto w-full max-w-[960px]">
            <div
                className="relative mx-auto border border-border/70 bg-white shadow-[0_18px_48px_rgba(0,0,0,0.12)]"
                style={pageLayout ? { width: `${pageLayout.width}px` } : undefined}
            >
                <canvas ref={canvasRef} className="block bg-white" />
                {showFocusRing && (
                    <>
                        {highlightStyle ? (
                            <div
                                className="pointer-events-none absolute border-2 border-warning bg-warning/20 shadow-[0_0_0_1px_rgba(255,199,0,0.24)] animate-pulse"
                                style={highlightStyle}
                            />
                        ) : (
                            <div className="pointer-events-none absolute inset-0 ring-4 ring-warning/35" />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export function ResourcePdfViewer({
    pdfBlob,
    focusHit,
    mode = "single",
    suspendResponsiveResize = false,
}: ResourcePdfViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef(new Map<number, HTMLDivElement>());
    const pendingContainerWidthRef = useRef<number | null>(null);
    const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInput, setPageInput] = useState("1");
    const [loadingDocument, setLoadingDocument] = useState(true);
    const [renderingPage, setRenderingPage] = useState(false);
    const [viewerError, setViewerError] = useState<string | null>(null);

    const focusPage = focusHit?.locator_meta?.page ?? null;
    const focusBbox = focusHit?.locator_meta?.bbox ?? null;
    const isContinuous = mode === "continuous";
    const pageNumbers = useMemo(
        () => Array.from({ length: pageCount }, (_, index) => index + 1),
        [pageCount],
    );

    const navigateToPage = useCallback((
        page: number,
        behavior: ScrollBehavior = "smooth",
    ) => {
        if (pageCount <= 0) return;

        const nextPage = clampPage(page, pageCount);
        setCurrentPage((current) => (current === nextPage ? current : nextPage));

        if (!isContinuous) {
            return;
        }

        const container = containerRef.current;
        const element = pageRefs.current.get(nextPage);
        if (!container || !element) {
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const targetRect = element.getBoundingClientRect();
        const targetTop = container.scrollTop + (targetRect.top - containerRect.top) - 12;

        container.scrollTo({
            top: Math.max(0, targetTop),
            behavior,
        });
    }, [isContinuous, pageCount]);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const updateWidth = () => {
            const computedStyle = window.getComputedStyle(element);
            const horizontalPadding =
                Number.parseFloat(computedStyle.paddingLeft || "0")
                + Number.parseFloat(computedStyle.paddingRight || "0");
            const nextWidth = Math.max(element.clientWidth - horizontalPadding, 0);
            if (suspendResponsiveResize) {
                pendingContainerWidthRef.current = nextWidth;
                return;
            }

            pendingContainerWidthRef.current = null;
            setContainerWidth((currentWidth) =>
                currentWidth === nextWidth ? currentWidth : nextWidth,
            );
        };

        updateWidth();

        const observer = new ResizeObserver(() => {
            updateWidth();
        });
        observer.observe(element);

        return () => observer.disconnect();
    }, [suspendResponsiveResize]);

    useEffect(() => {
        if (suspendResponsiveResize) {
            return;
        }

        const pendingWidth = pendingContainerWidthRef.current;
        if (pendingWidth === null) {
            return;
        }

        pendingContainerWidthRef.current = null;
        setContainerWidth((currentWidth) =>
            currentWidth === pendingWidth ? currentWidth : pendingWidth,
        );
    }, [suspendResponsiveResize]);

    useEffect(() => {
        let cancelled = false;
        let loadingTask: PDFDocumentLoadingTask | null = null;
        let loadedDocument: PDFDocumentProxy | null = null;

        setLoadingDocument(true);
        setRenderingPage(false);
        setViewerError(null);
        setPdfDoc(null);
        setPageCount(0);
        setCurrentPage(1);
        pageRefs.current.clear();

        const loadDocument = async () => {
            try {
                const [pdfJs, arrayBuffer] = await Promise.all([
                    loadPdfJs(),
                    pdfBlob.arrayBuffer(),
                ]);
                if (cancelled) return;

                const bytes = new Uint8Array(arrayBuffer);
                loadingTask = pdfJs.getDocument({ data: bytes });
                loadedDocument = await loadingTask.promise;
                if (cancelled) {
                    return;
                }

                const totalPages = loadedDocument.numPages;
                setPdfDoc(loadedDocument);
                setPageCount(totalPages);
                setCurrentPage(1);
                setPageInput("1");
            } catch (error) {
                if (cancelled) return;
                setViewerError(formatViewerError(error));
            } finally {
                if (!cancelled) {
                    setLoadingDocument(false);
                }
            }
        };

        void loadDocument();

        return () => {
            cancelled = true;
            loadingTask?.destroy();
            if (loadedDocument) {
                void loadedDocument.destroy();
            }
        };
    }, [pdfBlob]);

    useEffect(() => {
        if (!pdfDoc || focusPage == null) return;
        navigateToPage(clampPage(focusPage, pdfDoc.numPages));
    }, [focusPage, navigateToPage, pdfDoc]);

    useEffect(() => {
        if (pageCount <= 0) {
            setPageInput("1");
            return;
        }
        setPageInput(String(clampPage(currentPage, pageCount)));
    }, [currentPage, pageCount]);

    useEffect(() => {
        if (!isContinuous) {
            return;
        }

        const container = containerRef.current;
        if (!container || pageCount <= 0) {
            return;
        }

        let animationFrame = 0;

        const updateCurrentPageFromScroll = () => {
            animationFrame = 0;
            const containerRect = container.getBoundingClientRect();
            const anchorY = containerRect.top + Math.min(120, container.clientHeight / 3);

            let nextPage = currentPage;
            let bestDistance = Number.POSITIVE_INFINITY;

            for (const [pageNumber, node] of pageRefs.current.entries()) {
                const rect = node.getBoundingClientRect();
                if (rect.height <= 0) {
                    continue;
                }

                if (rect.top <= anchorY && rect.bottom >= anchorY) {
                    nextPage = pageNumber;
                    bestDistance = 0;
                    break;
                }

                const distance = Math.abs(rect.top - anchorY);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    nextPage = pageNumber;
                }
            }

            setCurrentPage((page) => (page === nextPage ? page : nextPage));
        };

        const onScroll = () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            animationFrame = requestAnimationFrame(updateCurrentPageFromScroll);
        };

        updateCurrentPageFromScroll();
        container.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            container.removeEventListener("scroll", onScroll);
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [currentPage, isContinuous, pageCount]);

    const handleJumpToPage = useCallback(() => {
        if (pageCount <= 0) return;
        const parsed = Number.parseInt(pageInput, 10);
        if (!Number.isFinite(parsed)) {
            setPageInput(String(clampPage(currentPage, pageCount)));
            return;
        }
        const nextPage = clampPage(parsed, pageCount);
        setPageInput(String(nextPage));
        navigateToPage(nextPage);
    }, [currentPage, navigateToPage, pageCount, pageInput]);

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-2">
                <div className="text-xs text-text-secondary">
                    {pageCount > 0 ? `第 ${currentPage} / ${pageCount} 页` : "加载中"}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <ControlIconButton
                        type="button"
                        variant="quiet"
                        size="iconMd"
                        aria-label="上一页"
                        disabled={loadingDocument || renderingPage || currentPage <= 1}
                        onClick={() => navigateToPage(currentPage - 1)}
                        icon={<CaretLeftIcon size={16} />}
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary">跳至</span>
                        <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={pageInput}
                            disabled={loadingDocument || pageCount <= 0}
                            onChange={(event) => {
                                const nextValue = event.target.value.replace(/[^\d]/g, "");
                                setPageInput(nextValue);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    handleJumpToPage();
                                }
                            }}
                            className="h-9 w-16 rounded-[12px] px-3 py-2 text-center text-sm"
                            aria-label="输入页码"
                        />
                        <ControlButton
                            type="button"
                            variant="outline"
                            className="rounded-[12px] px-3 py-1.5 text-xs"
                            disabled={loadingDocument || pageCount <= 0}
                            onClick={handleJumpToPage}
                        >
                            跳转
                        </ControlButton>
                    </div>
                    <ControlIconButton
                        type="button"
                        variant="quiet"
                        size="iconMd"
                        aria-label="下一页"
                        disabled={loadingDocument || renderingPage || currentPage >= pageCount}
                        onClick={() => navigateToPage(currentPage + 1)}
                        icon={<CaretRightIcon size={16} />}
                    />
                </div>
            </div>

            <div ref={containerRef} className="min-h-0 flex-1 overflow-auto px-4 py-4">
                {loadingDocument ? (
                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                        <SpinnerGapIcon size={28} className="animate-spin text-accent" />
                        <div>
                            <div className="text-sm font-medium text-text">正在加载预览</div>
                            <div className="mt-1 text-xs text-text-muted">文件较大时可能需要几秒钟。</div>
                        </div>
                    </div>
                ) : viewerError ? (
                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                        <WarningCircleIcon size={28} className="text-error" />
                        <div>
                            <div className="text-sm font-medium text-text">预览加载失败</div>
                            <div className="mt-1 text-xs leading-relaxed text-text-muted">{viewerError}</div>
                        </div>
                    </div>
                ) : (
                    <div className={isContinuous ? "mx-auto flex w-full max-w-[960px] flex-col gap-6" : ""}>
                        {pdfDoc && isContinuous ? (
                            pageNumbers.map((pageNumber) => (
                                <PdfCanvasPage
                                    key={pageNumber}
                                    pdfDoc={pdfDoc}
                                    pageNumber={pageNumber}
                                    containerWidth={containerWidth}
                                    focusBbox={focusPage === pageNumber ? focusBbox : null}
                                    showFocusRing={focusPage === pageNumber}
                                    onError={(error) => setViewerError(formatViewerError(error))}
                                    setWrapperRef={(node) => {
                                        if (node) {
                                            pageRefs.current.set(pageNumber, node);
                                            if (focusPage === pageNumber) {
                                                requestAnimationFrame(() => {
                                                    navigateToPage(pageNumber, "auto");
                                                });
                                            }
                                        } else {
                                            pageRefs.current.delete(pageNumber);
                                        }
                                    }}
                                />
                            ))
                        ) : pdfDoc ? (
                            <PdfCanvasPage
                                pdfDoc={pdfDoc}
                                pageNumber={currentPage}
                                containerWidth={containerWidth}
                                focusBbox={focusPage === currentPage ? focusBbox : null}
                                showFocusRing={focusPage === currentPage}
                                onError={(error) => setViewerError(formatViewerError(error))}
                                onRenderStateChange={setRenderingPage}
                            />
                        ) : null}
                    </div>
                )}
            </div>

            {focusHit && !isContinuous && (
                <div className="border-t border-border/50 bg-surface/65 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-xs font-semibold tracking-[0.08em] text-accent">
                                已定位证据
                            </div>
                            <div className="mt-1 text-xs text-text-secondary">
                                {focusHit.locator || `Page ${focusPage ?? currentPage}`}
                            </div>
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">
                                {focusHit.snippet}
                            </p>
                        </div>
                        <ControlButton
                            type="button"
                            variant="outline"
                            className="shrink-0 rounded-[12px] px-3 py-1.5 text-xs"
                            onClick={() => {
                                if (pageCount > 0) {
                                    navigateToPage(clampPage(focusPage ?? currentPage, pageCount));
                                }
                            }}
                        >
                            重新定位
                        </ControlButton>
                    </div>
                </div>
            )}
        </div>
    );
}
