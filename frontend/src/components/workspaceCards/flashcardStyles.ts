import { cva } from "class-variance-authority";

export const flashcardStageStyles = {
  root: cva("flex h-full min-h-0 flex-col px-4 pb-8 pt-[calc(var(--workspace-topbar-height)+var(--workspace-topbar-control-offset-y)+16px)] sm:px-6"),
  content: cva("mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col"),
  statusBanner: cva("mx-auto mb-4 w-full max-w-5xl rounded-[var(--radius-surface-1)] px-4 py-3 type-body-secondary"),
  loadingShell: cva("frosted-surface-subtle flex h-full min-h-[420px] items-center justify-center rounded-[28px]"),
  studyShell: cva("frosted-surface-subtle flex h-full min-h-[520px] flex-col rounded-[28px] px-6 py-6 sm:px-8"),
  studyHeader: cva("flex items-center justify-between gap-3"),
  deckBadge: cva("inline-flex items-center rounded-full bg-surface/80 px-3 py-1 type-caption font-semibold text-text-secondary"),
  dueLabel: cva("type-caption font-medium text-text-muted"),
  studyBody: cva("flex flex-1 flex-col justify-center"),
  promptWrap: cva("mx-auto flex w-full max-w-3xl flex-col items-center text-center"),
  promptMarkdown: cva("flashcard-markdown-front w-full text-text"),
  answerMotion: cva(
    "w-full overflow-hidden transition-[max-height,opacity,margin] [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
  ),
  answerVisible: cva("mt-10 max-h-[420px] opacity-100"),
  answerHidden: cva("mt-0 max-h-0 opacity-0"),
  answerText: cva("mx-auto w-full max-w-3xl border-t border-border/50 pt-8 text-text-secondary"),
  answerMarkdown: cva("flashcard-markdown-back w-full text-left text-text-secondary"),
  studyFooter: cva("mt-6"),
  revealButtonWrap: cva("flex justify-center"),
  ratingsGrid: cva("grid gap-3 md:grid-cols-4"),
  emptyShell: cva("frosted-surface-subtle flex h-full min-h-[420px] flex-col items-center justify-center rounded-[28px] px-6 text-center"),
  emptyIconWrap: cva("flex h-20 w-20 items-center justify-center rounded-full bg-surface/80"),
  emptyTitle: cva("mt-6 type-section-title text-text"),
  emptyBody: cva("mt-3 type-body-secondary text-text-secondary"),
  emptyActions: cva("mt-6 flex flex-wrap items-center justify-center gap-3"),
};

export const flashcardRailStyles = {
  root: cva("flex h-full min-h-0 flex-col"),
  header: cva("relative flex h-[var(--workspace-topbar-height)] shrink-0 items-center justify-center border-b border-border/50 px-3"),
  searchLayout: cva("min-w-[112px] flex-1"),
  deckTrigger: cva("inline-flex min-h-[32px] min-w-0 cursor-pointer select-none items-center justify-start gap-2 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-text bg-transparent transition-colors [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] hover:bg-surface-hover active:bg-surface-active motion-reduce:transition-none tracking-tight"),
  selectionBar: cva("mt-3 flex flex-wrap items-center gap-2"),
  selectionBadge: cva("inline-flex items-center rounded-full bg-surface/80 px-3 py-1 type-caption font-medium text-text-secondary"),
  listWrap: cva("mt-4 h-full overflow-y-auto pr-1"),
  emptyList: cva("rounded-[var(--radius-surface-1)] bg-surface-sub/40 px-4 py-6 type-body-secondary text-text-muted"),
  cardList: cva("space-y-2"),
  deckSummaryRow: cva("deck-counter inline-flex shrink-0 items-center gap-1.5", {
    variants: {
      compact: {
        true: "gap-1",
        false: "",
      },
    },
    defaultVariants: {
      compact: false,
    },
  }),
  deckSummaryItem: cva("inline-flex min-w-[1rem] items-center justify-center rounded-full px-1.5 py-0.5", {
    variants: {
      tone: {
        neutral: "bg-surface/80 text-text-muted",
        info: "bg-info/12 text-info",
        error: "bg-error/12 text-error",
        success: "bg-success/12 text-success",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }),
};

export const flashcardListItemStyles = {
  root: cva(
    "group/card relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
    {
      variants: {
        state: {
          idle: "bg-panel/72 hover:bg-surface-hover/80",
          active: "bg-accent/10",
          selected: "bg-accent/10",
        },
      },
      defaultVariants: {
        state: "idle",
      },
    },
  ),
  selectionMark: cva("inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs", {
    variants: {
      active: {
        true: "bg-accent/15 text-accent",
        false: "text-transparent",
      },
    },
    defaultVariants: {
      active: false,
    },
  }),
  stateMark: cva("inline-flex h-5 shrink-0 items-center rounded-full bg-surface/80 px-2 py-0.5 text-[10px] font-semibold leading-none text-text-muted"),
  prompt: cva("block min-w-0 truncate select-none text-sm font-medium tracking-tight text-text"),
  metaRow: cva("inline-flex min-w-0 shrink items-center justify-end overflow-hidden whitespace-nowrap type-caption text-text-muted leading-4"),
  dueText: cva("truncate leading-4"),
  actionRow: cva(
    "flex items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover/card:opacity-100 md:group-focus-within/card:opacity-100",
  ),
};

export const flashcardDialogStyles = {
  panelContent: cva("flex max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto px-6 pt-14 pb-6"),
  infoBlock: cva("frosted-surface-subtle rounded-[var(--radius-surface-1)] px-4 py-4"),
  fieldGroup: cva("grid gap-2"),
  actions: cva("mt-5 flex flex-wrap justify-end gap-3"),
};
