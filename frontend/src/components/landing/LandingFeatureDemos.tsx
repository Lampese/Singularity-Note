"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowSquareOutIcon,
  CardsIcon,
  CheckCircleIcon,
  FileAudioIcon,
  FilePdfIcon,
  GlobeIcon,
  ImageIcon,
  MicrosoftWordLogoIcon,
  PlayIcon,
  PresentationChartIcon,
  QuotesIcon,
  SpinnerGapIcon,
  TableIcon,
  TerminalIcon,
  VideoIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { FeatureDemoCard, FeatureWindow } from "./FeatureDemoCard";
import type { LandingFeatureStory } from "./landingDemoData";

type FeatureDemoCardCopy = Pick<LandingFeatureStory, "stageSize">;

function LoadingDots() {
  return (
    <div className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2ea043] [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2ea043] [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2ea043] [animation-delay:240ms]" />
    </div>
  );
}

function resourceIcon(kind: string) {
  switch (kind) {
    case "pdf":
      return <FilePdfIcon size={16} weight="fill" className="text-[#dc4c3e]" />;
    case "ppt":
      return <PresentationChartIcon size={16} weight="fill" className="text-[#c98a15]" />;
    case "image":
      return <ImageIcon size={16} weight="fill" className="text-[#2ea043]" />;
    case "audio":
      return <FileAudioIcon size={16} weight="fill" className="text-[#16a34a]" />;
    case "doc":
      return <MicrosoftWordLogoIcon size={16} weight="fill" className="text-[#5b8def]" />;
    case "sheet":
      return <TableIcon size={16} weight="fill" className="text-[#16a34a]" />;
    case "video":
      return <VideoIcon size={16} weight="fill" className="text-[#8b7cff]" />;
    default:
      return <QuotesIcon size={16} weight="fill" className="text-text-secondary" />;
  }
}

function MultimodalDemo({
  stageSize,
}: FeatureDemoCardCopy) {
  const resources = [
    { name: "现代文学期中讲义.pdf", kind: "pdf", meta: "讲义" },
    { name: "第七周课堂课件.pptx", kind: "ppt", meta: "课件" },
    { name: "板书照片-傅里叶展开.jpg", kind: "image", meta: "板书" },
    { name: "周三课堂录音.m4a", kind: "audio", meta: "录音" },
    { name: "阅读提纲与批注.docx", kind: "doc", meta: "批注" },
    { name: "研究资料对照表.xlsx", kind: "sheet", meta: "表格" },
    { name: "课堂演示录像.mp4", kind: "video", meta: "视频" },
    { name: "期末复习笔记.pdf", kind: "pdf", meta: "笔记" },
    { name: "习题课截图.png", kind: "image", meta: "截图" },
    { name: "小组讨论录音.m4a", kind: "audio", meta: "录音" },
    { name: "参考论文摘要.docx", kind: "doc", meta: "摘要" },
    { name: "课程大纲.pdf", kind: "pdf", meta: "大纲" },
    { name: "答疑记录.docx", kind: "doc", meta: "记录" },
  ] as const;
  const positions = [
    { top: "2%", left: "4%", rotate: "-8deg" },
    { top: "3%", left: "36%", rotate: "3deg" },
    { top: "6%", left: "58%", rotate: "6deg" },
    { top: "14%", left: "76%", rotate: "-3deg" },
    { top: "22%", left: "10%", rotate: "5deg" },
    { top: "28%", left: "72%", rotate: "-6deg" },
    { top: "42%", left: "5%", rotate: "-4deg" },
    { top: "48%", left: "74%", rotate: "7deg" },
    { top: "58%", left: "12%", rotate: "3deg" },
    { top: "66%", left: "68%", rotate: "-7deg" },
    { top: "76%", left: "6%", rotate: "-5deg" },
    { top: "80%", left: "52%", rotate: "4deg" },
    { top: "84%", left: "30%", rotate: "-4deg" },
  ] as const;
  const [floatTick, setFloatTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFloatTick((current) => (current + 1) % 4);
    }, 1800);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <FeatureDemoCard stageSize={stageSize}>
      <div className="relative h-full min-h-0 overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_18%,rgba(124,198,255,0.16),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,209,102,0.16),transparent_24%),radial-gradient(circle_at_76%_80%,rgba(46,160,67,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,249,252,0.95))]">
        <div className="absolute inset-0">
          {resources.map((item, index) => {
            const position = positions[index];
            const driftX = ((floatTick + index) % 4 - 1.5) * 6;
            const driftY = ((floatTick * 2 + index) % 5 - 2) * 5;
            return (
              <div
                key={item.name}
                className="absolute w-[176px] rounded-[22px] border border-[rgba(208,215,222,0.78)] bg-white/92 px-4 py-3 shadow-[0_24px_44px_rgba(15,23,42,0.08)] transition-transform duration-[1800ms] ease-in-out"
                style={{
                  top: position.top,
                  left: position.left,
                  transform: `translate(${driftX}px, ${driftY}px) rotate(${position.rotate})`,
                }}
              >
                <div className="flex items-center gap-2.5 text-sm font-medium text-[var(--text-dark)]">
                  {resourceIcon(item.kind)}
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="mt-2 text-xs leading-5 text-[var(--text-dark-secondary)]">
                  {item.meta}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute left-1/2 top-1/2 h-[344px] w-[344px] -translate-x-1/2 -translate-y-1/2">
          <div
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(124,198,255,0.22),rgba(124,198,255,0.05)_54%,transparent_74%)] transition-transform duration-[1800ms] ease-in-out"
            style={{
              transform: `scale(${1 + ((floatTick % 4) - 1.5) * 0.02})`,
            }}
          />
          <div
            className="absolute inset-[18px] rounded-full border border-[rgba(208,215,222,0.82)] bg-[rgba(255,255,255,0.92)] shadow-[0_26px_56px_rgba(15,23,42,0.08)] transition-transform duration-[1800ms] ease-in-out"
            style={{
              transform: `scale(${1 + ((floatTick + 1) % 4 - 1.5) * 0.012})`,
            }}
          >
            <div className="flex h-full flex-col items-center justify-center px-10 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-dark-secondary)]">
                Singularity Note
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-dark)]">
                同一个
                <br />
                学习上下文
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {["讲义", "课件", "板书", "录音"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-white px-3 py-1.5 text-xs text-[var(--text-dark)] shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FeatureDemoCard>
  );
}

const FLASHCARD_MOCK = [
  {
    prompt: "odd extension 的作用是什么？",
    answer: "先把函数延拓成奇函数，让后续展开只保留 sine 项，与边界条件自然对齐。",
  },
  {
    prompt: "PINN 的 loss 由哪两部分组成？",
    answer: "数据拟合项 ‖u_θ − u_data‖² 和 PDE 残差项 λ‖𝒩[u_θ]‖²。",
  },
  {
    prompt: "Fourier Neural Operator 在频域做了什么？",
    answer: "用可学习的权重矩阵 R 在频域做全局卷积，再逆变换回时域。",
  },
];

const RATING_BUTTONS = [
  { label: "重来", caption: "1 分钟", tone: "border-rose-500/30 bg-rose-500/11 text-rose-700" },
  { label: "困难", caption: "6 分钟", tone: "border-amber-500/30 bg-amber-500/11 text-amber-700" },
  { label: "良好", caption: "10 分钟", tone: "border-sky-500/30 bg-sky-500/11 text-sky-700" },
  { label: "简单", caption: "4 天", tone: "border-emerald-500/30 bg-emerald-500/11 text-emerald-700" },
] as const;

function FlashcardDemo({
  stageSize,
}: FeatureDemoCardCopy) {
  const [cardIndex, setCardIndex] = useState(0);
  const [phase, setPhase] = useState<"prompt" | "flipped" | "rated">("prompt");
  const [selectedRating, setSelectedRating] = useState(2);
  const card = FLASHCARD_MOCK[cardIndex];

  // 随机选一个评分（偏向 good/easy）
  const pickRating = () => {
    const weights = [0.08, 0.15, 0.52, 0.25];
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (r < sum) return i;
    }
    return 2;
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "prompt") {
      timer = setTimeout(() => setPhase("flipped"), 2000);
    } else if (phase === "flipped") {
      const rating = pickRating();
      timer = setTimeout(() => {
        setSelectedRating(rating);
        setPhase("rated");
      }, 1800);
    } else if (phase === "rated") {
      timer = setTimeout(() => {
        setCardIndex((prev) => (prev + 1) % FLASHCARD_MOCK.length);
        setPhase("prompt");
      }, 1200);
    }

    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <FeatureDemoCard stageSize={stageSize}>
      <FeatureWindow title="Workspace / 记忆卡" bodyClassName="p-0">
        <div className="flex h-full min-h-0 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[rgba(208,215,222,0.5)] px-5 py-3">
            <div className="flex items-center gap-2.5">
              <CardsIcon size={18} weight="fill" className="text-[var(--text-dark-secondary)]" />
              <span className="text-base font-medium text-[var(--text-dark)]">Calculus / Fourier</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--text-dark-secondary)]">
              <span className="text-sm">{cardIndex + 1} / {FLASHCARD_MOCK.length}</span>
              <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-sm font-medium text-sky-700">2 due</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-sm font-medium text-emerald-700">1 new</span>
            </div>
          </div>

          {/* Progress */}
          <div className="h-1 bg-[rgba(148,163,184,0.08)]">
            <div
              className="h-full bg-sky-500 transition-all duration-500 ease-out"
              style={{ width: `${((cardIndex + (phase === "rated" ? 1 : 0)) / FLASHCARD_MOCK.length) * 100}%` }}
            />
          </div>

          {/* Card body */}
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-10 py-8">
            <div className="w-full text-center">
              {/* Prompt */}
              <div className="text-3xl font-semibold leading-snug tracking-[-0.03em] text-[var(--text-dark)]">
                {card.prompt}
              </div>

              {/* Divider + Answer (animated) */}
              <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{
                  maxHeight: phase !== "prompt" ? 240 : 0,
                  opacity: phase !== "prompt" ? 1 : 0,
                  marginTop: phase !== "prompt" ? 28 : 0,
                }}
              >
                <div className="mb-5 h-px bg-[rgba(208,215,222,0.6)]" />
                <div className="text-lg leading-relaxed text-[var(--text-dark-secondary)]">
                  {card.answer}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="border-t border-[rgba(208,215,222,0.5)] px-5 py-4">
            {phase === "prompt" ? (
              <div className="flex h-[76px] items-center justify-center rounded-[20px] border border-[rgba(208,215,222,0.72)] bg-[rgba(255,255,255,0.92)] text-lg font-medium text-[var(--text-dark-secondary)]">
                显示答案
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5">
                {RATING_BUTTONS.map((btn, i) => (
                  <div
                    key={btn.label}
                    className={cn(
                      "flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-[20px] border transition-all duration-300",
                      btn.tone,
                      phase === "rated" && i === selectedRating
                        ? "ring-2 ring-offset-1 ring-sky-500/50 scale-[1.03]"
                        : phase === "rated" && i !== selectedRating
                          ? "opacity-50"
                          : "",
                    )}
                  >
                    <span className="text-base font-semibold">{btn.label}</span>
                    <span className="text-xs uppercase tracking-[0.12em] opacity-70">{btn.caption}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FeatureWindow>
    </FeatureDemoCard>
  );
}

function highlightPython(code: string) {
  const s = (color: string, text: string) => `<span style="color:${color}">${text}</span>`;

  let result = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // comments first (won't be re-matched)
  result = result.replace(/#.*/g, (m) => s("#8b949e", m));
  // strings
  result = result.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (m) => {
    if (m.includes("style=")) return m; // skip already-wrapped
    return s("#a5d6ff", m);
  });
  // keywords
  result = result.replace(/\b(import|from|def|for|in|return|as|if|else|print|range|sum)\b/g, (m) => s("#ff7b72", m));
  // builtins / lib names
  result = result.replace(/\b(np|plt|round|len)\b/g, (m) => s("#d2a8ff", m));
  // numbers
  result = result.replace(/\b(\d+(\.\d+)?)\b/g, (m) => s("#79c0ff", m));

  return result;
}

const AGENT_CODE = `import numpy as np
import matplotlib.pyplot as plt

L = np.pi

def f(x):
    return x * (L - x)

# 计算前 5 项 Fourier 正弦系数
x = np.linspace(0, L, 1000)
coeffs = []
for n in range(1, 6):
    b_n = (2/L) * np.trapezoid(f(x) * np.sin(n*np.pi*x/L), x)
    coeffs.append(round(b_n, 4))
    print(f"b_{n} = {round(b_n, 4)}")

# 画逼近曲线
approx = sum(coeffs[n]*np.sin((n+1)*np.pi*x/L) for n in range(5))
plt.plot(x, f(x), label="f(x)")
plt.plot(x, approx, "--", label="5-term approx")
plt.legend()
plt.savefig("fourier_approx.png")`;

const AGENT_OUTPUT = `b_1 = 1.2937
b_2 = 0.0000
b_3 = 0.1438
b_4 = 0.0000
b_5 = 0.0518`;

type AgentPhase = "question" | "writing" | "running" | "output" | "plot" | "summary";

function AgentCodeDemo({
  stageSize,
}: FeatureDemoCardCopy) {
  const [phase, setPhase] = useState<AgentPhase>("question");
  const [codeChars, setCodeChars] = useState(0);
  const [outputLines, setOutputLines] = useState(0);
  const codeAreaRef = useRef<HTMLDivElement>(null);

  const outputLineArray = AGENT_OUTPUT.split("\n");

  // Auto-scroll to bottom as content grows
  useLayoutEffect(() => {
    const el = codeAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [codeChars, outputLines, phase]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "question") {
      timer = setTimeout(() => setPhase("writing"), 1400);
    } else if (phase === "writing") {
      if (codeChars < AGENT_CODE.length) {
        const step = 4 + Math.floor(Math.random() * 5);
        timer = setTimeout(() => setCodeChars((c) => Math.min(c + step, AGENT_CODE.length)), 20);
      } else {
        timer = setTimeout(() => setPhase("running"), 500);
      }
    } else if (phase === "running") {
      timer = setTimeout(() => setPhase("output"), 700);
    } else if (phase === "output") {
      if (outputLines < outputLineArray.length) {
        timer = setTimeout(() => setOutputLines((l) => l + 1), 180);
      } else {
        timer = setTimeout(() => setPhase("plot"), 400);
      }
    } else if (phase === "plot") {
      timer = setTimeout(() => setPhase("summary"), 1200);
    } else {
      timer = setTimeout(() => {
        setCodeChars(0);
        setOutputLines(0);
        setPhase("question");
      }, 4000);
    }

    return () => clearTimeout(timer);
  }, [phase, codeChars, outputLines, outputLineArray.length]);

  const visibleCode = AGENT_CODE.slice(0, codeChars);
  const showOutput = phase === "running" || phase === "output" || phase === "plot" || phase === "summary";
  const showPlot = phase === "plot" || phase === "summary";

  return (
    <FeatureDemoCard stageSize={stageSize}>
      <FeatureWindow title="Workspace / Agent" bodyClassName="p-0">
        <div className="flex h-full min-h-0 flex-col">
          {/* Question */}
          <div className="border-b border-[rgba(208,215,222,0.5)] px-5 py-3">
            <div className="text-sm leading-relaxed text-[var(--text-dark)]">
              对 f(x) = x(π−x) 做 odd extension，算前 5 项系数并画出逼近曲线
            </div>
          </div>

          {/* Code area */}
          <div className="min-h-0 flex-1 overflow-hidden bg-[#0d1117]">
            {phase === "question" ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center gap-2.5 text-sm text-[#8b949e]">
                  <TerminalIcon size={18} weight="bold" />
                  <span>Agent 正在分析问题...</span>
                </div>
              </div>
            ) : (
              <div ref={codeAreaRef} className="h-full overflow-y-auto p-4 custom-scrollbar">
                {/* Highlighted code */}
                <pre
                  className="font-mono text-[11px] leading-[1.7] whitespace-pre-wrap text-[#e6edf3]"
                  dangerouslySetInnerHTML={{
                    __html: highlightPython(visibleCode) +
                      (phase === "writing"
                        ? '<span style="display:inline-block;width:6px;height:14px;background:#58a6ff;margin-left:1px;vertical-align:middle;animation:pulse 1s infinite"></span>'
                        : ""),
                  }}
                />

                {/* Output */}
                {showOutput && (
                  <div className="mt-3 border-t border-[#21262d] pt-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#8b949e] mb-2">
                      {phase === "running" ? (
                        <>
                          <SpinnerGapIcon size={12} className="animate-spin" />
                          <span>执行中</span>
                        </>
                      ) : (
                        <>
                          <PlayIcon size={12} weight="fill" className="text-[#3fb950]" />
                          <span className="text-[#3fb950]">输出</span>
                        </>
                      )}
                    </div>
                    <pre className="font-mono text-[11px] leading-[1.7] text-[#3fb950]">
                      {outputLineArray.slice(0, outputLines).join("\n")}
                    </pre>
                  </div>
                )}

                {/* Generated plot preview */}
                {showPlot && (
                  <div className="mt-3 border-t border-[#21262d] pt-3 animate-[fadeInUp_300ms_ease-out]">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#8b949e] mb-2">
                      <CheckCircleIcon size={12} weight="fill" className="text-[#3fb950]" />
                      <span className="text-[#3fb950]">生成文件</span>
                    </div>
                    <div className="rounded-lg border border-[#21262d] bg-[#161b22] p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#e6edf3]">fourier_approx.png</span>
                        <span className="text-[10px] text-[#8b949e]">已保存到工作区</span>
                      </div>
                      {/* Mini plot mock */}
                      <div className="mt-2 flex h-[72px] items-end gap-[3px] rounded bg-[#0d1117] px-3 py-2">
                        {[0, 0.31, 0.59, 0.81, 0.95, 1, 0.95, 0.81, 0.59, 0.31, 0].map((v, i) => (
                          <div key={i} className="flex-1 flex flex-col justify-end gap-[2px]">
                            <div className="rounded-sm bg-[#58a6ff]" style={{ height: `${v * 48}px` }} />
                            <div className="rounded-sm bg-[#f0883e]/70" style={{ height: `${v * 46 + (i === 5 ? 2 : i % 2 === 0 ? -1 : 1)}px` }} />
                          </div>
                        ))}
                      </div>
                      <div className="mt-1.5 flex items-center gap-4 text-[9px] text-[#8b949e]">
                        <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-sm bg-[#58a6ff]" />f(x)</span>
                        <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-sm bg-[#f0883e]/70" />5-term approx</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary bar */}
          <div
            className="overflow-hidden border-t border-[rgba(208,215,222,0.5)] transition-all duration-300 ease-out"
            style={{
              maxHeight: phase === "summary" ? 80 : 0,
              opacity: phase === "summary" ? 1 : 0,
            }}
          >
            <div className="flex items-center justify-between px-5 py-3">
              <div className="text-sm leading-relaxed text-[var(--text-dark)]">
                偶数项系数为 0，能量集中在 b₁ = 1.2937，5 项逼近已经很接近原函数。
              </div>
            </div>
          </div>
        </div>
      </FeatureWindow>
    </FeatureDemoCard>
  );
}

const SEARCH_RESULTS = [
  {
    title: "Physics-Informed Neural Networks: A Deep Learning Framework for Solving PDEs",
    source: "arxiv.org",
    snippet: "We introduce physics-informed neural networks that are trained to solve supervised learning tasks while respecting the laws described by general PDEs.",
  },
  {
    title: "Fourier Neural Operator for Parametric Partial Differential Equations",
    source: "openreview.net",
    snippet: "We propose a new operator learning method by parameterizing the integral kernel directly in Fourier space, achieving state-of-the-art results.",
  },
  {
    title: "Spectral Methods in MATLAB - Lloyd N. Trefethen",
    source: "mathworks.com",
    snippet: "An accessible introduction to spectral methods for solving differential equations using Fourier and Chebyshev polynomial expansions.",
  },
  {
    title: "Poseidon: Efficient Foundation Models for PDEs",
    source: "arxiv.org",
    snippet: "A pretrained foundation model for PDEs that achieves zero-shot generalization across 15 equation types, outperforming FNO baselines.",
  },
] as const;

function WebSearchDemo({
  stageSize,
}: FeatureDemoCardCopy) {
  const [phase, setPhase] = useState<"typing" | "searching" | "results">("typing");
  const [queryChars, setQueryChars] = useState(0);
  const [visibleResults, setVisibleResults] = useState(0);

  const query = "Fourier methods for solving PDEs recent advances";

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (queryChars < query.length) {
        timer = setTimeout(() => setQueryChars((c) => c + 1), 50);
      } else {
        timer = setTimeout(() => setPhase("searching"), 600);
      }
    } else if (phase === "searching") {
      timer = setTimeout(() => setPhase("results"), 1200);
    } else if (phase === "results") {
      if (visibleResults < SEARCH_RESULTS.length) {
        timer = setTimeout(() => setVisibleResults((v) => v + 1), 350);
      } else {
        timer = setTimeout(() => {
          setQueryChars(0);
          setVisibleResults(0);
          setPhase("typing");
        }, 4500);
      }
    }

    return () => clearTimeout(timer);
  }, [phase, queryChars, visibleResults, query.length]);

  return (
    <FeatureDemoCard stageSize={stageSize}>
      <FeatureWindow title="Workspace / 网络搜索" bodyClassName="p-0">
        <div className="flex h-full min-h-0 flex-col">
          {/* Search bar */}
          <div className="border-b border-[rgba(208,215,222,0.5)] px-5 py-3">
            <div className="flex items-center gap-3 rounded-[14px] border border-[rgba(208,215,222,0.6)] bg-white/80 px-4 py-2.5">
              <GlobeIcon size={18} weight="bold" className="shrink-0 text-[var(--text-dark-secondary)]" />
              <span className="flex-1 text-sm text-[var(--text-dark)]">
                {query.slice(0, queryChars)}
                {phase === "typing" && (
                  <span className="inline-block w-0.5 h-4 bg-[var(--text-dark)] animate-pulse ml-px align-middle" />
                )}
              </span>
              {phase !== "typing" && (
                <span className="shrink-0 text-xs font-medium text-[var(--text-dark-secondary)]">
                  {phase === "searching" ? "搜索中..." : `${SEARCH_RESULTS.length} 条结果`}
                </span>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
            {phase === "searching" && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--text-dark-secondary)]">
                <LoadingDots />
                <span>正在搜索网络和学术数据库...</span>
              </div>
            )}

            {phase === "results" && (
              <div className="grid gap-3">
                {SEARCH_RESULTS.slice(0, visibleResults).map((result) => (
                  <div
                    key={result.title}
                    className="rounded-[16px] border border-[rgba(208,215,222,0.6)] bg-white/90 px-4 py-3.5 animate-[fadeInUp_250ms_ease-out]"
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium leading-snug text-[#1a6dcc]">
                          {result.title}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-dark-secondary)]">
                          <ArrowSquareOutIcon size={12} />
                          <span>{result.source}</span>
                        </div>
                        <div className="mt-1.5 text-sm leading-relaxed text-[var(--text-dark-secondary)]">
                          {result.snippet}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FeatureWindow>
    </FeatureDemoCard>
  );
}

const INGEST_FILES = [
  { name: "Calculus-Week07.pdf", kind: "pdf" as const, pages: 36, units: 148 },
  { name: "Heat-Equation.pptx", kind: "ppt" as const, pages: 54, units: 210 },
  { name: "week07-lecture.mp4", kind: "video" as const, pages: null, units: 86 },
] as const;

function LongFileDemo({
  stageSize,
}: FeatureDemoCardCopy) {
  const [fileIndex, setFileIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const file = INGEST_FILES[fileIndex];
  const phase = progress >= 100 ? "ready" as const
    : progress >= 70 ? "indexing" as const
    : progress >= 30 ? "parsing" as const
    : "uploading" as const;

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setFileIndex((i) => (i + 1) % INGEST_FILES.length);
        setProgress(0);
      }, 2500);
      return () => clearTimeout(timer);
    }

    const speed = phase === "uploading" ? 12 : phase === "parsing" ? 5 : 3;
    const jitter = Math.random() * speed * 0.6;
    const timer = setTimeout(() => setProgress((p) => Math.min(p + speed + jitter, 100)), 90);
    return () => clearTimeout(timer);
  }, [progress, phase]);

  const fileIcon = (kind: string) => {
    if (kind === "pdf") return <FilePdfIcon size={20} weight="fill" className="text-[#dc4c3e]" />;
    if (kind === "ppt") return <PresentationChartIcon size={20} weight="fill" className="text-[#c98a15]" />;
    return <VideoIcon size={20} weight="fill" className="text-[#8b7cff]" />;
  };

  const phaseLabel = phase === "uploading" ? "上传中" : phase === "parsing" ? "解析中" : phase === "indexing" ? "建立索引" : "就绪";
  const phaseColor = phase === "ready" ? "#2ea043" : "#3b82f6";

  return (
    <FeatureDemoCard stageSize={stageSize}>
      <FeatureWindow title="Workspace / 资料处理" bodyClassName="p-0">
        <div className="flex h-full min-h-0 flex-col">
          {/* Current file */}
          <div className="border-b border-[rgba(208,215,222,0.5)] px-5 py-4">
            <div className="flex items-center gap-3">
              {fileIcon(file.kind)}
              <div className="min-w-0 flex-1">
                <div className="text-base font-medium text-[var(--text-dark)]">{file.name}</div>
                <div className="mt-0.5 text-sm text-[var(--text-dark-secondary)]">
                  {file.pages ? `${file.pages} 页` : "48 分钟"} · 目标：{file.units} 个证据单元
                </div>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                style={{ backgroundColor: `${phaseColor}15`, color: phaseColor }}
              >
                {phaseLabel}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[rgba(148,163,184,0.1)]">
              <div
                className="h-full rounded-full transition-all duration-200 ease-out"
                style={{ width: `${phase === "ready" ? 100 : progress}%`, backgroundColor: phaseColor }}
              />
            </div>

            {/* Phase steps */}
            <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-dark-secondary)]">
              {(["上传", "解析", "索引", "就绪"] as const).map((step, i) => {
                const phases = ["uploading", "parsing", "indexing", "ready"] as const;
                const current = phases.indexOf(phase);
                const done = i < current;
                const active = i === current;
                return (
                  <div key={step} className="flex items-center gap-1.5">
                    {done ? (
                      <CheckCircleIcon size={14} weight="fill" className="text-[#2ea043]" />
                    ) : (
                      <div className={cn(
                        "h-3.5 w-3.5 rounded-full border-2",
                        active ? "border-[#3b82f6] bg-[#3b82f6]/20" : "border-[rgba(148,163,184,0.3)]",
                      )} />
                    )}
                    <span className={cn(done ? "text-[#2ea043]" : active ? "font-medium text-[var(--text-dark)]" : "")}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Processed files list */}
          <div className="min-h-0 flex-1 px-5 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-dark-secondary)]">
              已就绪的资料
            </div>
            <div className="mt-3 grid gap-2">
              {INGEST_FILES.map((f, i) => {
                const isDone = i < fileIndex || (i === fileIndex && phase === "ready");
                const isCurrent = i === fileIndex && phase !== "ready";
                return (
                  <div
                    key={f.name}
                    className={cn(
                      "flex items-center gap-3 rounded-[14px] border px-3.5 py-2.5 transition-all duration-300",
                      isDone
                        ? "border-[#2ea043]/20 bg-[#2ea043]/5"
                        : isCurrent
                          ? "border-[#3b82f6]/20 bg-[#3b82f6]/5"
                          : "border-[rgba(208,215,222,0.5)] bg-white/60",
                    )}
                  >
                    {fileIcon(f.kind)}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[var(--text-dark)]">{f.name}</div>
                    </div>
                    {isDone ? (
                      <span className="text-xs font-medium text-[#2ea043]">{f.units} 单元</span>
                    ) : isCurrent ? (
                      <LoadingDots />
                    ) : (
                      <span className="text-xs text-[var(--text-dark-secondary)]">等待中</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </FeatureWindow>
    </FeatureDemoCard>
  );
}

interface LandingFeatureDemoProps {
  story: LandingFeatureStory;
}

function TechStackDemo({
  stageSize,
}: FeatureDemoCardCopy) {
  return (
    <FeatureDemoCard stageSize={stageSize}>
      <div className="flex h-full flex-col items-center justify-center rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,249,252,0.95))]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/moonbit-logo.png"
          alt="MoonBit"
          className="h-auto w-32"
        />
        <div className="mt-6 text-center">
          <div className="text-2xl font-semibold tracking-tight text-[var(--text-dark)]">
            Built with MoonBit
          </div>
          <div className="mt-2 text-base text-[var(--text-dark-secondary)]">
            WebAssembly Native · 快是基本功
          </div>
        </div>
      </div>
    </FeatureDemoCard>
  );
}

export function LandingFeatureDemo({ story }: LandingFeatureDemoProps) {
  const copy = {
    stageSize: story.stageSize,
  } satisfies FeatureDemoCardCopy;

  switch (story.demoId) {
    case "multimodal":
      return <MultimodalDemo {...copy} />;
    case "flashcard":
      return <FlashcardDemo {...copy} />;
    case "agent_code":
      return <AgentCodeDemo {...copy} />;
    case "web_lookup":
      return <WebSearchDemo {...copy} />;
    case "long_file":
      return <LongFileDemo {...copy} />;
    case "tech_stack":
      return <TechStackDemo {...copy} />;
    default:
      return null;
  }
}
