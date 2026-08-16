import { Fragment } from "react";

import { cn } from "@/lib/utils";

type Support = "yes" | "partial" | "no";

interface Product {
  name: string;
  highlight?: boolean;
}

interface Row {
  feature: string;
  values: Support[];
}

const PRODUCTS: Product[] = [
  { name: "Singularity Note", highlight: true },
  { name: "ChatGPT" },
  { name: "Gemini" },
  { name: "NotebookLM" },
  { name: "Kimi" },
];

const ROWS: Row[] = [
  //                                        SN     ChatGPT  Gemini   NbLM     Kimi
  { feature: "对话功能",          values: ["yes", "yes",     "yes",     "yes",     "yes"] },
  { feature: "文档解析（仅文字）", values: ["yes", "yes",     "yes",     "yes",     "yes"] },
  { feature: "OCR",               values: ["yes", "yes",     "yes",     "partial", "yes"] },
  { feature: "长文档处理",         values: ["yes", "yes",     "no",      "no",      "no"] },
  { feature: "多文件联动",         values: ["yes", "no",      "no",      "partial", "no"] },
  { feature: "长视频解析",          values: ["yes", "no",      "partial", "no",      "partial"] },
  { feature: "文件生成",           values: ["yes", "no",      "no",      "partial", "no"] },
  { feature: "网络搜索",           values: ["yes", "yes",     "yes",     "yes",     "yes"] },
  { feature: "学术搜索",           values: ["yes", "no",      "no",      "no",      "no"] },
  { feature: "智能助理能力",       values: ["yes", "partial", "partial", "partial", "partial"] },
];

function SupportIcon({ value }: { value: Support }) {
  if (value === "yes") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="inline-block">
        <path
          d="M4 10.5l4 4 8-8.5"
          stroke="var(--hp-accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (value === "partial") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="inline-block">
        <circle cx="10" cy="10" r="7" stroke="rgba(208,215,222,0.5)" strokeWidth="1.8" />
        <path
          d="M10 3a7 7 0 0 1 0 14z"
          fill="rgba(208,215,222,0.5)"
        />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="inline-block">
      <path
        d="M6 6l8 8M14 6l-8 8"
        stroke="rgba(248,81,73,0.75)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ComparisonMatrix() {
  return (
    <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
      <div
        className="min-w-[640px]"
        style={{
          display: "grid",
          gridTemplateColumns: `minmax(120px, 1.4fr) repeat(${PRODUCTS.length}, minmax(80px, 1fr))`,
        }}
      >
        {/* Header row */}
        <div className="py-3 px-4 text-sm font-medium text-[rgba(208,215,222,0.5)]" />
        {PRODUCTS.map((p) => (
          <div
            key={p.name}
            className={cn(
              "py-4 px-3 text-center text-base font-semibold tracking-[-0.01em]",
              p.highlight
                ? "text-[var(--hp-accent)] bg-[rgba(var(--accent-rgb,99,135,255),0.06)] border-t-2 border-[var(--hp-accent)] rounded-t-xl"
                : "text-[rgba(208,215,222,0.95)]",
            )}
          >
            {p.name}
          </div>
        ))}

        {/* Data rows */}
        {ROWS.map((row, ri) => (
          <Fragment key={row.feature}>
            <div
              className={cn(
                "py-4 px-4 text-base font-medium text-[rgba(208,215,222,0.95)] border-t border-[rgba(255,255,255,0.06)]",
                "sticky left-0 bg-[var(--hp-surface-dark-section)]",
              )}
            >
              {row.feature}
            </div>
            {row.values.map((v, ci) => (
              <div
                key={`v-${ri}-${ci}`}
                className={cn(
                  "py-3.5 px-3 flex items-center justify-center border-t border-[rgba(255,255,255,0.06)]",
                  PRODUCTS[ci].highlight && "bg-[rgba(var(--accent-rgb,99,135,255),0.06)]",
                  ri === ROWS.length - 1 && PRODUCTS[ci].highlight && "rounded-b-xl",
                )}
              >
                <SupportIcon value={v} />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
