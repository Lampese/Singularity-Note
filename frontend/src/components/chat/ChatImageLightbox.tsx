"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowClockwiseIcon,
  MinusIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  LIGHTBOX_DEFAULT_SCALE,
  LIGHTBOX_DOUBLE_CLICK_SCALE,
  LIGHTBOX_MAX_SCALE,
  LIGHTBOX_MIN_SCALE,
  clampLightboxOffset,
  zoomLightboxAroundPoint,
  type LightboxOffset,
} from "@/lib/chat/imageLightboxMath";
import { ControlButton, ControlIconButton } from "@/components/ui/factory/groups/button/components";

type ChatImageLightboxProps = {
  src: string;
  alt?: string;
  onClose: () => void;
};

type DragState = {
  pointerId: number;
  startPointer: LightboxOffset;
  startOffset: LightboxOffset;
};

function formatZoomLabel(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}

export function ChatImageLightbox({
  src,
  alt = "图片预览",
  onClose,
}: ChatImageLightboxProps) {
  const [scale, setScale] = useState(LIGHTBOX_DEFAULT_SCALE);
  const [offset, setOffset] = useState<LightboxOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  useBodyScrollLock(true);

  const readMetrics = useCallback(() => {
    const stage = stageRef.current;
    const image = imgRef.current;
    if (!stage || !image) {
      return null;
    }

    const stageRect = stage.getBoundingClientRect();
    const imageWidth = image.offsetWidth;
    const imageHeight = image.offsetHeight;

    if (stageRect.width <= 0 || stageRect.height <= 0 || imageWidth <= 0 || imageHeight <= 0) {
      return null;
    }

    return {
      stageRect,
      imageSize: {
        width: imageWidth,
        height: imageHeight,
      },
      viewportSize: {
        width: stageRect.width,
        height: stageRect.height,
      },
    };
  }, []);

  const applyZoom = useCallback((nextScaleInput: number, point: LightboxOffset = { x: 0, y: 0 }) => {
    const metrics = readMetrics();
    if (!metrics) {
      return;
    }

    const next = zoomLightboxAroundPoint(
      { scale, offset },
      nextScaleInput,
      point,
      metrics.imageSize,
      metrics.viewportSize,
    );

    setScale(next.scale);
    setOffset(next.offset);
  }, [offset, readMetrics, scale]);

  const applyZoomStep = useCallback((delta: number) => {
    applyZoom(scale + delta);
  }, [applyZoom, scale]);

  const resetTransform = useCallback(() => {
    setScale(LIGHTBOX_DEFAULT_SCALE);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "0") {
        event.preventDefault();
        resetTransform();
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        applyZoomStep(0.25);
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        applyZoomStep(-0.25);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [applyZoomStep, onClose, resetTransform]);

  useEffect(() => {
    const handleResize = () => {
      const metrics = readMetrics();
      if (!metrics) {
        return;
      }

      setOffset((currentOffset) => clampLightboxOffset(
        currentOffset,
        scale,
        metrics.imageSize,
        metrics.viewportSize,
      ));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [readMetrics, scale]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-300 bg-[color:color-mix(in_srgb,var(--color-context-overlay)_88%,transparent)] backdrop-blur-[14px]"
      role="dialog"
      aria-modal="true"
      aria-label="查看图片"
      onClick={onClose}
    >
      <div
        className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full frosted-surface-subtle px-2 py-2"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <ControlIconButton
          type="button"
          icon={<MinusIcon size={16} weight="bold" />}
          variant="toolbar"
          size="iconMd"
          onClick={(event) => {
            event.stopPropagation();
            applyZoomStep(-0.25);
          }}
          disabled={scale <= LIGHTBOX_MIN_SCALE}
          aria-label="缩小图片"
        />
        <ControlButton
          type="button"
          variant="toolbar"
          size="sm"
          className="min-w-[84px] justify-center text-xs tabular-nums"
          onClick={(event) => {
            event.stopPropagation();
            resetTransform();
          }}
          aria-label="还原缩放"
        >
          {formatZoomLabel(scale)}
        </ControlButton>
        <ControlIconButton
          type="button"
          icon={<PlusIcon size={16} weight="bold" />}
          variant="toolbar"
          size="iconMd"
          onClick={(event) => {
            event.stopPropagation();
            applyZoomStep(0.25);
          }}
          disabled={scale >= LIGHTBOX_MAX_SCALE}
          aria-label="放大图片"
        />
        <ControlIconButton
          type="button"
          icon={<ArrowClockwiseIcon size={16} weight="bold" />}
          variant="toolbar"
          size="iconMd"
          onClick={(event) => {
            event.stopPropagation();
            resetTransform();
          }}
          aria-label="重置图片位置和缩放"
        />
      </div>

      <ControlIconButton
        type="button"
        icon={<XIcon size={24} weight="bold" />}
        variant="floating"
        size="iconLg"
        className="absolute right-4 top-4 bg-transparent text-text-muted hover:bg-surface-hover hover:text-text"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label="关闭"
      />

      <div
        ref={stageRef}
        className="flex h-full w-full items-center justify-center overflow-hidden px-4 pb-6 pt-20"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
        onWheel={(event) => {
          const metrics = readMetrics();
          if (!metrics) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          const nextScale = scale + (event.deltaY < 0 ? 0.2 : -0.2);
          const point = {
            x: event.clientX - (metrics.stageRect.left + metrics.stageRect.width / 2),
            y: event.clientY - (metrics.stageRect.top + metrics.stageRect.height / 2),
          };

          applyZoom(nextScale, point);
        }}
      >
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full frosted-surface-subtle px-3 py-1.5 text-xs text-text-secondary">
          滚轮缩放，双击放大或还原，放大后可拖动查看细节
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          className="max-h-[calc(100vh-8rem)] max-w-[min(92vw,1200px)] select-none object-contain will-change-transform"
          style={{
            cursor: isDragging ? "grabbing" : scale > LIGHTBOX_DEFAULT_SCALE ? "grab" : "zoom-in",
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 160ms var(--motion-ease-standard)",
            touchAction: "none",
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
          onDoubleClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            const metrics = readMetrics();
            if (!metrics) {
              return;
            }

            const point = {
              x: event.clientX - (metrics.stageRect.left + metrics.stageRect.width / 2),
              y: event.clientY - (metrics.stageRect.top + metrics.stageRect.height / 2),
            };

            applyZoom(
              scale > LIGHTBOX_DEFAULT_SCALE ? LIGHTBOX_DEFAULT_SCALE : LIGHTBOX_DOUBLE_CLICK_SCALE,
              point,
            );
          }}
          onLoad={() => {
            const metrics = readMetrics();
            if (!metrics) {
              return;
            }

            setOffset((currentOffset) => clampLightboxOffset(
              currentOffset,
              scale,
              metrics.imageSize,
              metrics.viewportSize,
            ));
          }}
          onPointerDown={(event) => {
            if (scale <= LIGHTBOX_DEFAULT_SCALE) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            dragStateRef.current = {
              pointerId: event.pointerId,
              startPointer: { x: event.clientX, y: event.clientY },
              startOffset: offset,
            };
            setIsDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const dragState = dragStateRef.current;
            if (!dragState || dragState.pointerId !== event.pointerId) {
              return;
            }

            const metrics = readMetrics();
            if (!metrics) {
              return;
            }

            const nextOffset = clampLightboxOffset(
              {
                x: dragState.startOffset.x + (event.clientX - dragState.startPointer.x),
                y: dragState.startOffset.y + (event.clientY - dragState.startPointer.y),
              },
              scale,
              metrics.imageSize,
              metrics.viewportSize,
            );

            setOffset(nextOffset);
          }}
          onPointerUp={(event) => {
            if (dragStateRef.current?.pointerId !== event.pointerId) {
              return;
            }

            dragStateRef.current = null;
            setIsDragging(false);
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          onPointerCancel={(event) => {
            if (dragStateRef.current?.pointerId !== event.pointerId) {
              return;
            }

            dragStateRef.current = null;
            setIsDragging(false);
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
        />
      </div>
    </div>,
    document.body,
  );
}
