"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookOpenIcon,
  BrainIcon,
  ChatCircleDotsIcon,
  CheckCircleIcon,
  DownloadSimpleIcon,
  FileAudioIcon,
  FilePdfIcon,
  GlobeIcon,
  ImageIcon,
  MagnifyingGlassIcon,
  PaperPlaneRightIcon,
  PresentationChartIcon,
  SpinnerGapIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { EvidencePanel } from "@/components/chat/EvidencePanel";
import { ControlButton } from "@/components/ui/factory/groups/button/components";
import { WorkspaceModeSwitch } from "@/components/layout/WorkspaceModeSwitch";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { layout } from "@/styles/layout";
import { resourceSidebarStyles } from "@/components/layout/ResourceSidebar.styles";
import { cn } from "@/lib/utils";
import type { HeroMockResource, HeroMockScenario } from "./landingDemoData";

type RunState = "idle" | "tools" | "answering" | "done";
type HeroAnswerSegment =
  | { kind: "markdown"; content: string }
  | { kind: "formula"; content: string }
  | { kind: "image"; image: NonNullable<HeroMockScenario["inlineImages"]>[number] };

interface WorkspaceHeroPreviewProps {
  scenarios: HeroMockScenario[];
  defaultScenarioId: string;
}

function resourceIcon(kind: string) {
  const normalizedKind = kind.toLowerCase();
  if (normalizedKind.includes("pdf") || normalizedKind.includes("讲义")) {
    return <FilePdfIcon size={18} weight="fill" className="text-[#ff8a7a]" />;
  }
  if (normalizedKind.includes("ppt") || normalizedKind.includes("课件")) {
    return (
      <PresentationChartIcon size={18} weight="fill" className="text-[#ffd166]" />
    );
  }
  if (normalizedKind.includes("录像") || normalizedKind.includes("视频")) {
    return <VideoCameraIcon size={18} weight="fill" className="text-[#8b7cff]" />;
  }
  if (normalizedKind.includes("音频")) {
    return <FileAudioIcon size={18} weight="fill" className="text-[#67e8a5]" />;
  }
  return <ImageIcon size={18} weight="fill" className="text-[#7cc6ff]" />;
}

function toolIcon(kind: string) {
  switch (kind) {
    case "reasoning":
      return <BrainIcon size={16} weight="bold" className="text-[#ffd166]" />;
    case "material_search":
      return <MagnifyingGlassIcon size={16} weight="bold" className="text-[#7cc6ff]" />;
    case "paper_search":
      return <BookOpenIcon size={16} weight="bold" className="text-[#cda6ff]" />;
    case "web_lookup":
      return <GlobeIcon size={16} weight="bold" className="text-[#ff8a7a]" />;
    case "material_open":
      return <ArrowDownIcon size={16} weight="bold" className="text-[#ffd166]" />;
    case "save_result":
      return <ArrowUpIcon size={16} weight="bold" className="text-[#67e8a5]" />;
    case "clarify":
      return <ChatCircleDotsIcon size={16} weight="fill" className="text-[#cda6ff]" />;
    default:
      return <ChatCircleDotsIcon size={16} weight="fill" className="text-text-secondary" />;
  }
}

function formatFileSize(bytes?: number): string {
  if (typeof bytes !== "number") return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildMockResourceRefs(
  resources: HeroMockResource[],
  resourceIds?: string[],
): { id: string; name: string }[] {
  if (!resourceIds || resourceIds.length === 0) {
    return [];
  }

  return resourceIds
    .map((resourceId) => resources.find((resource) => resource.id === resourceId))
    .filter((resource): resource is HeroMockResource => !!resource)
    .map((resource) => ({ id: resource.id, name: resource.title }));
}

function buildMockResources(resources: HeroMockResource[]) {
  const now = Date.now();
  return resources.map((resource, index) => ({
    id: resource.id,
    name: resource.title,
    kind:
      resource.kind.includes("讲义")
        ? "pdf"
        : resource.kind.includes("课件")
          ? "pptx"
          : resource.kind.includes("音频")
            ? "audio"
            : "image",
    status: resource.status,
    object_key: `mock/${resource.id}`,
    workspace_id: "mock-workspace",
    created_at: now - index * 1_000,
    metadata: { display_meta: resource.meta },
  }));
}

function buildMockEvidence(
  scenario: HeroMockScenario,
  selectedResource: HeroMockResource,
) {
  const modality =
    selectedResource.kind.includes("录像") || selectedResource.kind.includes("视频")
      ? "audio_segment"
      : selectedResource.kind.includes("音频")
        ? "audio_segment"
        : selectedResource.kind.includes("图片")
          ? "image"
          : "text";

  return scenario.evidence.map((entry, index) => ({
    resource_id: selectedResource.id,
    resource_name: selectedResource.title,
    locator: entry.locator,
    snippet: entry.snippet,
    score: 0.96 - index * 0.03,
    modality,
  }));
}

function buildAnswerSegments(
  answer: string,
  images: HeroMockScenario["inlineImages"] | undefined,
): HeroAnswerSegment[] {
  const segments: HeroAnswerSegment[] = [];
  let cursor = 0;
  const pushMarkdownAndFormulaSegments = (content: string) => {
    let innerCursor = 0;
    while (true) {
      const formulaStart = content.indexOf("$$", innerCursor);
      if (formulaStart < 0) {
        const tail = content.slice(innerCursor).trim();
        if (tail) {
          segments.push({ kind: "markdown", content: tail });
        }
        break;
      }

      const before = content.slice(innerCursor, formulaStart).trim();
      if (before) {
        segments.push({ kind: "markdown", content: before });
      }

      const formulaEnd = content.indexOf("$$", formulaStart + 2);
      if (formulaEnd < 0) {
        const tail = content.slice(formulaStart).trim();
        if (tail) {
          segments.push({ kind: "markdown", content: tail });
        }
        break;
      }

      const formula = content.slice(formulaStart, formulaEnd + 2).trim();
      if (formula) {
        segments.push({ kind: "formula", content: formula });
      }
      innerCursor = formulaEnd + 2;
    }
  };

  while (true) {
    const start = answer.indexOf("[[image:", cursor);
    if (start < 0) {
      pushMarkdownAndFormulaSegments(answer.slice(cursor));
      break;
    }

    pushMarkdownAndFormulaSegments(answer.slice(cursor, start));

    const handleStart = start + "[[image:".length;
    const end = answer.indexOf("]]", handleStart);
    if (end < 0) {
      const rest = answer.slice(start).trim();
      if (rest) {
        segments.push({ kind: "markdown", content: rest });
      }
      break;
    }

    const token = answer.slice(handleStart, end).trim();
    if (/^\d+$/.test(token) && images?.[Number(token) - 1]) {
      segments.push({ kind: "image", image: images[Number(token) - 1] });
    }

    cursor = end + 2;
  }

  return segments;
}

function countMarkdownChars(segments: HeroAnswerSegment[]): number {
  return segments.reduce(
    (total, segment) =>
      total + (segment.kind === "markdown" ? segment.content.length : 0),
    0,
  );
}

function buildVisibleAnswerSegments(
  segments: HeroAnswerSegment[],
  visibleChars: number,
): HeroAnswerSegment[] {
  let remaining = visibleChars;
  const visible: HeroAnswerSegment[] = [];

  for (const segment of segments) {
    if (segment.kind === "image" || segment.kind === "formula") {
      if (remaining >= 0) {
        visible.push(segment);
      }
      continue;
    }

    if (remaining <= 0) {
      break;
    }

    const nextContent = segment.content.slice(0, remaining);
    if (nextContent.length > 0) {
      visible.push({ kind: "markdown", content: nextContent });
    }

    remaining -= segment.content.length;
  }

  return visible;
}

function HeroResourceRefChips({
  refs,
}: {
  refs: { id: string; name: string }[];
}) {
  if (refs.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {refs.map((ref) => (
        <span
          key={ref.id}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium bg-accent/15 text-accent border border-accent/20"
        >
          @{ref.name}
        </span>
      ))}
    </div>
  );
}

function HeroToolStack({
  scenario,
  runState,
  visibleToolCount,
}: {
  scenario: HeroMockScenario;
  runState: RunState;
  visibleToolCount: number;
}) {
  const visibleTools =
    runState === "tools"
      ? scenario.tools.slice(0, visibleToolCount)
      : scenario.tools;

  if (visibleTools.length === 0 && !scenario.pushedFiles?.length) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-col gap-2">
      {visibleTools.map((tool, index) => {
        const isRunning =
          runState === "tools" && index === visibleTools.length - 1;
        const label = tool.label;

        return (
          <div
            key={tool.id}
            className={cn(
              "overflow-hidden rounded-full border px-4 py-3 backdrop-blur-md",
              isRunning
                ? "border-success/20 bg-[color:color-mix(in_srgb,var(--color-panel)_92%,transparent)]"
                : "border-border/70 bg-[color:color-mix(in_srgb,var(--color-panel)_82%,transparent)]",
            )}
          >
            <div className="flex items-center gap-3 text-sm">
              {toolIcon(tool.kind)}
              <span className="font-medium text-text">{label}</span>
              <span className="text-text-secondary">· {tool.detail}</span>
              <span className="ml-auto shrink-0">
                {isRunning ? (
                  <SpinnerGapIcon size={14} className="animate-spin text-[#2ea043]" />
                ) : (
                  <CheckCircleIcon size={14} weight="fill" className="text-[#2ea043]" />
                )}
              </span>
            </div>
          </div>
        );
      })}

      {scenario.pushedFiles && runState !== "tools" && scenario.pushedFiles.map((file) => (
        <div key={file.filename} className="overflow-hidden rounded-[18px] border border-border/70 bg-panel/80">
          <div className="flex items-center gap-3 px-4 py-3 text-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center text-text">
              <DownloadSimpleIcon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-text">
                {file.filename}
              </div>
              <div className="text-xs text-text-muted">
                {formatFileSize(file.sizeBytes) || "已生成文件"}
              </div>
            </div>
            <span className="shrink-0 text-xs font-medium text-text-muted">下载</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HeroInlineImageCards({
  images,
  onLoaded,
}: {
  images: HeroMockScenario["inlineImages"] | undefined;
  onLoaded: () => void;
}) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {images.map((image) => (
        <div
          key={image.image_handle}
          className="my-4 overflow-hidden rounded-[24px] border border-border/70 bg-panel/70"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-text">{image.filename}</div>
              <div className="text-xs text-text-muted">生成图片</div>
            </div>
          </div>
          <div className="bg-surface-sub/30 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.preview_url}
              alt={image.filename}
              className="max-h-[420px] w-full rounded-[18px] object-contain bg-panel"
              onLoad={onLoaded}
            />
          </div>
        </div>
      ))}
    </>
  );
}

function HeroAskUserPanel({
  askUser,
}: {
  askUser: HeroMockScenario["askUser"];
}) {
  if (!askUser) {
    return null;
  }

  return (
    <div className="mt-3 rounded-[22px] border border-border/70 bg-panel/70 p-4">
      <div className="text-sm font-medium text-text">{askUser.question}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {askUser.options.map((option) => {
          const selected = option === askUser.selected;
          return (
            <span
              key={option}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                selected
                  ? "border-accent/30 bg-accent/12 text-accent"
                  : "border-border/60 bg-surface-sub/30 text-text-secondary",
              )}
            >
              {option}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function MockComposer({
  prompt,
  selectedResource,
  disabled,
  isRunning,
  onRun,
}: {
  prompt: string;
  selectedResource: HeroMockResource;
  disabled: boolean;
  isRunning: boolean;
  onRun: () => void;
}) {
  return (
    <div className="chat-composer-surface w-full max-h-[var(--size-chat-composer-frame-max-height)] overflow-hidden rounded-[var(--radius-chat-composer)] border border-border/50 bg-panel/80 p-[var(--inset-chat-composer-padding)] backdrop-blur-xl">
      <div className="relative">
        <div
          className={cn(
            "w-full bg-transparent px-2 py-2 text-md leading-relaxed text-text",
            "min-h-[var(--size-chat-composer-textarea-min-height,32px)]",
          )}
        >
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium bg-accent/15 text-accent border border-accent/20 align-baseline whitespace-nowrap">
            @{selectedResource.title}
          </span>
          <span className="ml-2">{prompt}</span>
        </div>
      </div>

      <div className="mt-[var(--gap-chat-composer-content)] flex h-[var(--size-chat-composer-toolbar-height)] items-center gap-[var(--gap-chat-composer-content)] border-t border-border/10 px-[var(--inset-chat-composer-toolbar)]">
        <div className="min-w-0 flex flex-1 items-center gap-[var(--gap-chat-composer-content)]" />

        <div className="flex shrink-0 items-center gap-[var(--gap-chat-composer-content)]">
          <ControlButton
            variant="menuProminent"
            size="sm"
            leading={<PaperPlaneRightIcon size={16} weight="fill" />}
            onClick={onRun}
            disabled={disabled}
          >
            {isRunning ? "运行中" : "发送并运行"}
          </ControlButton>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceHeroPreview({
  scenarios,
  defaultScenarioId,
}: WorkspaceHeroPreviewProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(defaultScenarioId);
  const [runState, setRunState] = useState<RunState>("idle");
  const [visibleToolCount, setVisibleToolCount] = useState(0);
  const [typedResponseChars, setTypedResponseChars] = useState(0);
  const [mediaLayoutVersion, setMediaLayoutVersion] = useState(0);
  const [selectedEvidenceKey, setSelectedEvidenceKey] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const evidencePanelRef = useRef<HTMLDivElement>(null);

  const selectedScenario =
    scenarios.find((entry) => entry.id === selectedScenarioId) ?? scenarios[0];
  const selectedResource =
    selectedScenario.resources.find(
      (entry) => entry.id === selectedScenario.selectedResourceId,
    ) ?? selectedScenario.resources[0];

  const mockEvidence = buildMockEvidence(selectedScenario, selectedResource);

  function handleCitationClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.classList.contains("align-super")) return;

    const num = parseInt(target.textContent ?? "", 10);
    if (Number.isNaN(num) || num < 1 || num > mockEvidence.length) return;

    const hit = mockEvidence[num - 1];
    setSelectedEvidenceKey([hit.resource_id, hit.locator, hit.snippet?.slice(0, 40)].join("::"));
    requestAnimationFrame(() => {
      evidencePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  const answerSegments = buildAnswerSegments(
    selectedScenario.answer,
    selectedScenario.inlineImages,
  );
  const answerTextLength = countMarkdownChars(answerSegments);
  const visibleAnswerSegments =
    runState === "tools"
      ? []
      : runState === "answering"
        ? typedResponseChars > 0
          ? buildVisibleAnswerSegments(answerSegments, typedResponseChars)
          : [{ kind: "markdown", content: selectedScenario.streamingStatus } satisfies HeroAnswerSegment]
        : answerSegments;

  useEffect(() => {
    if (runState !== "tools") {
      return;
    }

    if (visibleToolCount >= selectedScenario.tools.length) {
      const timer = window.setTimeout(() => {
        setTypedResponseChars(0);
        setRunState("answering");
      }, 120);
      return () => window.clearTimeout(timer);
    }

    const prevTool = visibleToolCount > 0
      ? selectedScenario.tools[visibleToolCount - 1]
      : undefined;
    const baseDelay = 240;
    const pause = prevTool?.pauseAfterMs ?? 0;

    const timer = window.setTimeout(() => {
      setVisibleToolCount((current) => current + 1);
    }, baseDelay + pause);
    return () => window.clearTimeout(timer);
  }, [runState, selectedScenario.tools, visibleToolCount]);

  useEffect(() => {
    if (runState !== "answering") {
      return;
    }

    if (typedResponseChars >= answerTextLength) {
      const timer = window.setTimeout(() => {
        setRunState("done");
      }, 180);
      return () => window.clearTimeout(timer);
    }

    const remaining = answerTextLength - typedResponseChars;
    const nextStep = Math.max(2, Math.ceil(remaining / 48));
    const timer = window.setTimeout(() => {
      setTypedResponseChars((current) =>
        Math.min(current + nextStep, answerTextLength),
      );
    }, 48);
    return () => window.clearTimeout(timer);
  }, [answerTextLength, runState, typedResponseChars]);

  useLayoutEffect(() => {
    if (runState === "idle") {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollTop = viewport.scrollHeight;

    if (runState !== "done") {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
    });
    const timeoutId = window.setTimeout(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
    }, 180);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [mediaLayoutVersion, runState, selectedScenario.id, typedResponseChars, visibleToolCount]);

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setRunState("idle");
    setVisibleToolCount(0);
    setTypedResponseChars(0);
    setMediaLayoutVersion(0);
    setSelectedEvidenceKey(null);
  };

  const handleRun = () => {
    if (selectedResource.status !== "ready") {
      return;
    }
    setRunState("tools");
    setVisibleToolCount(0);
    setTypedResponseChars(0);
    setMediaLayoutVersion(0);
    setSelectedEvidenceKey(null);
  };

  const currentResourceRefs = buildMockResourceRefs(selectedScenario.resources, [
    selectedResource.id,
  ]);

  return (
    <section data-theme="dark" className="h-full w-full overflow-hidden rounded-[32px] border border-border/60 bg-bg shadow-[0_36px_100px_rgba(0,0,0,0.24)]">
      <div className="grid h-full min-h-0 lg:grid-cols-[264px_minmax(0,1fr)]">
        <aside
          className={cn(
            layout.sidebar({ side: "left", collapsed: false }),
            "min-h-0 w-full border-b border-border/40 lg:border-b-0 lg:border-r lg:border-border/40",
          )}
        >
          <div className={resourceSidebarStyles.header.container()}>
            <button
              type="button"
              className={resourceSidebarStyles.header.workspaceButton()}
              aria-label="当前工作区"
            >
              <span aria-hidden="true" />
              <span className="min-w-0 truncate text-center">{selectedScenario.workspaceLabel}</span>
              <span aria-hidden="true" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className={resourceSidebarStyles.sections.stack()}>
              <section className={resourceSidebarStyles.section.block()}>
                <div className={resourceSidebarStyles.section.container()}>
                  <div className={resourceSidebarStyles.section.headingButton()}>
                    <span className={resourceSidebarStyles.section.title()}>资料</span>
                  </div>
                  <span className={resourceSidebarStyles.section.actionPill()}>上传</span>
                </div>
                <div className={resourceSidebarStyles.section.content()}>
                  {selectedScenario.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="mx-2 flex select-none items-center gap-2.5 rounded-xl px-4 py-2 text-sm font-medium text-text-secondary"
                    >
                      <span className="shrink-0">{resourceIcon(resource.kind)}</span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-sm">{resource.title}</span>
                        <span className="block truncate text-xs font-normal text-text-muted">
                          {resource.meta}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className={resourceSidebarStyles.section.block()}>
                <div className={resourceSidebarStyles.section.container()}>
                  <div className={resourceSidebarStyles.section.headingButton()}>
                    <span className={resourceSidebarStyles.section.title()}>对话</span>
                  </div>
                  <span className={resourceSidebarStyles.section.actionPill()}>
                    {scenarios.length}
                  </span>
                </div>
                <div className={resourceSidebarStyles.section.content()}>
                  {scenarios.map((scenario) => {
                    const active = scenario.id === selectedScenario.id;
                    const previewText = scenario.draftPrompt;
                    return (
                      <button
                        key={scenario.id}
                        type="button"
                        className={resourceSidebarStyles.item({ active })}
                        onClick={() => handleScenarioChange(scenario.id)}
                      >
                        <span className="shrink-0 pt-0.5 text-[#7cc6ff]">
                          <ChatCircleDotsIcon size={18} weight="fill" />
                        </span>
                        <span className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm">{scenario.tabLabel}</span>
                          <span className="block truncate text-xs font-normal text-text-muted">
                            {previewText}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </aside>

        <main className={cn(layout.main(), "min-h-0 overflow-hidden bg-bg")}>
          <div className="relative h-full min-h-0 overflow-hidden">
            <div className={layout.topbarRail()}>
              <WorkspaceModeSwitch
                workspaceId="mock-workspace"
                activeMode="chat"
                chatHref="#mock-chat"
                cardsHref="#mock-cards"
                onModeChange={() => {}}
              />
            </div>

            {runState === "idle" ? (
              <div className="flex h-full min-h-0 flex-col items-center justify-center px-4">
                <div className="mb-8 text-center text-text-muted/65">
                  <BrandLogo className="mx-auto h-16 w-16 text-text-muted" />
                  <h2 className="mt-4 mb-2 text-xl font-semibold tracking-tight text-text">
                    Singularity Note 学术助手
                  </h2>
                  <p className="text-sm leading-relaxed opacity-80">
                    上传你的资料，开始对话或智能检索
                  </p>
                </div>
                <div className="w-full max-w-3xl">
                  <MockComposer
                    prompt={selectedScenario.draftPrompt}
                    selectedResource={selectedResource}
                    disabled={selectedResource.status !== "ready"}
                    isRunning={false}
                    onRun={handleRun}
                  />
                </div>
              </div>
            ) : (
              <div
                ref={viewportRef}
                className="h-full min-h-0 overflow-y-auto overscroll-contain px-4 pt-16 pb-6 custom-scrollbar"
              >
                <div className="mx-auto flex max-w-[800px] flex-col gap-8">
                  <div className="flex justify-end">
                    <div className="min-w-0 max-w-[80%] items-end">
                      <HeroResourceRefChips refs={currentResourceRefs} />
                      <div className="mt-2 rounded-2xl rounded-br-sm bg-surface-sub px-4 py-3 text-md leading-relaxed text-text">
                        {selectedScenario.draftPrompt}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <HeroToolStack
                      scenario={selectedScenario}
                      runState={runState}
                      visibleToolCount={visibleToolCount}
                    />

                    <div className="text-md leading-relaxed text-text [&_.katex-display]:my-5 [&_.katex-display]:mx-auto [&_.katex-display]:flex [&_.katex-display]:w-full [&_.katex-display]:justify-center [&_.katex-display]:overflow-x-auto [&_.katex-display>.katex]:mx-auto [&_.katex-display>.katex]:inline-block [&_.align-super]:cursor-pointer [&_.align-super]:transition-colors [&_.align-super]:hover:bg-accent/15" onClick={handleCitationClick} onKeyDown={undefined} role="presentation">
                      {runState === "tools" ? (
                        <div className="flex items-center gap-3 py-2 text-text-secondary text-sm">
                          <SpinnerGapIcon size={16} className="animate-spin" />
                          <span>{selectedScenario.streamingStatus}</span>
                        </div>
                      ) : (
                        <>
                          {visibleAnswerSegments.map((segment, index) =>
                            segment.kind === "markdown" ? (
                              <MarkdownRenderer
                                key={`hero:${selectedScenario.id}:markdown:${index}`}
                                content={segment.content}
                                evidence={mockEvidence}
                                renderScope={`hero:${selectedScenario.id}:markdown:${index}`}
                                surface="chat"
                              />
                            ) : segment.kind === "formula" ? (
                              <div
                                key={`hero:${selectedScenario.id}:formula:${index}`}
                                className="my-5 flex w-full justify-center overflow-x-auto"
                              >
                                <div className="mx-auto inline-block">
                                  <MarkdownRenderer
                                    content={segment.content}
                                    renderScope={`hero:${selectedScenario.id}:formula:${index}`}
                                    surface="chat"
                                  />
                                </div>
                              </div>
                            ) : (
                              <HeroInlineImageCards
                                key={`hero:${selectedScenario.id}:image:${segment.image.image_handle}`}
                                images={[segment.image]}
                                onLoaded={() => setMediaLayoutVersion((current) => current + 1)}
                              />
                            ),
                          )}

                          {runState === "done" && (
                            <>
                              <HeroAskUserPanel askUser={selectedScenario.askUser} />
                              <div ref={evidencePanelRef}>
                                <EvidencePanel
                                  hits={mockEvidence}
                                  resources={buildMockResources(selectedScenario.resources)}
                                  selectedHitKey={selectedEvidenceKey}
                                />
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </section>
  );
}
