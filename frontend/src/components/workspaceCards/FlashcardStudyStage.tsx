"use client";

import { FileTextIcon, PlusIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { CHAT_CONTENT_RAIL_CENTERED_CLASS } from "@/components/chat/chatRail";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { PillButton } from "@/components/ui/PillButton";
import { ControlButton } from "@/components/ui/factory/groups/button/components";
import { cn } from "@/lib/utils";
import {
  type FlashcardEmptyStateKind,
  type FlashcardStudyStageState,
} from "@/hooks/workspaceCards/studyStage";
import { formatRelativeTimeFromUnixSeconds } from "@/lib/i18n/dateTime";
import { flashcardStageStyles } from "./flashcardStyles";
import { type DeckSummary } from "./types";

function ratingToneClassName(tone: "again" | "hard" | "good" | "easy"): string {
  return {
    again: "text-error",
    hard: "text-warning",
    good: "text-info",
    easy: "text-success",
  }[tone];
}

function RatingButton({
  label,
  caption,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  caption: string;
  tone: "again" | "hard" | "good" | "easy";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <ControlButton
      type="button"
      disabled={disabled}
      onClick={onClick}
      variant="outline"
      className="flex min-h-[76px] flex-col items-start justify-center rounded-[var(--radius-surface-1)] px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-45"
    >
      <span className={cn("text-base font-semibold tracking-tight", ratingToneClassName(tone))}>
        {label}
      </span>
      <span className="mt-1 text-xs uppercase tracking-[0.16em] text-text-muted">
        {caption}
      </span>
    </ControlButton>
  );
}

function emptyStateCopy(params: {
  emptyKind: FlashcardEmptyStateKind;
  currentDeckSummary: DeckSummary | null;
}) {
  const { emptyKind, currentDeckSummary } = params;
  if (emptyKind === "no_decks") {
    return {
      title: "还没有卡片",
      body: currentDeckSummary ? `当前牌组：${currentDeckSummary.deck}` : "点击右上角开始创建",
    };
  }

  if (emptyKind === "deck_has_no_cards") {
    return {
      title: "当前牌组下还没有卡片",
      body: currentDeckSummary ? `牌组：${currentDeckSummary.deck}` : "请先创建卡片",
    };
  }

  return {
    title: "没有待复习卡片",
    body: currentDeckSummary ? `当前牌组：${currentDeckSummary.deck}` : "切换牌组查看其他内容",
  };
}

export function FlashcardStudyStage({
  stage,
  cardsError,
  currentDeckSummary,
  onRevealAnswer,
  onReview,
  onCreateFlashcard,
}: {
  stage: FlashcardStudyStageState;
  cardsError: string | null;
  currentDeckSummary: DeckSummary | null;
  onRevealAnswer: () => void;
  onReview: (rating: "again" | "hard" | "good" | "easy") => void;
  onCreateFlashcard: () => void;
}) {
  const emptyCopy = stage.kind === "empty"
    ? emptyStateCopy({ emptyKind: stage.emptyKind, currentDeckSummary })
    : null;

  return (
    <div className={flashcardStageStyles.root()}>
      {cardsError ? (
        <div className={cn(flashcardStageStyles.statusBanner(), "status-banner status-banner-error")}>
          {cardsError}
        </div>
      ) : null}

      <div className={flashcardStageStyles.content()}>
        {stage.kind === "loading" ? (
          <div className={flashcardStageStyles.loadingShell()} data-testid="flashcard-stage-loading">
            <div className="flex items-center gap-3 text-text-secondary">
              <SpinnerGapIcon size={20} className="animate-spin" />
              <span>正在载入记忆卡...</span>
            </div>
          </div>
        ) : null}

        {stage.kind === "prompt" || stage.kind === "revealed" ? (
          <div className={flashcardStageStyles.studyShell()} data-testid="flashcard-stage-study">
            <div className={flashcardStageStyles.studyHeader()}>
              <span className={flashcardStageStyles.deckBadge()}>{stage.card.deck}</span>
              <span className={flashcardStageStyles.dueLabel()}>
                {stage.card.review_state ? formatRelativeTimeFromUnixSeconds(stage.card.review_state.due_at) : "new"}
              </span>
            </div>

            <div className={flashcardStageStyles.studyBody()}>
              <div className={cn(CHAT_CONTENT_RAIL_CENTERED_CLASS, flashcardStageStyles.promptWrap())}>
                <MarkdownRenderer
                  content={stage.card.prompt}
                  renderScope={`flashcard-front-${stage.card.id}`}
                  className={flashcardStageStyles.promptMarkdown()}
                />
                <div
                  className={cn(
                    flashcardStageStyles.answerMotion(),
                    stage.kind === "revealed"
                      ? flashcardStageStyles.answerVisible()
                      : flashcardStageStyles.answerHidden(),
                  )}
                >
                  <div className={cn(CHAT_CONTENT_RAIL_CENTERED_CLASS, flashcardStageStyles.answerText())}>
                    <MarkdownRenderer
                      content={stage.card.answer}
                      renderScope={`flashcard-back-${stage.card.id}`}
                      className={flashcardStageStyles.answerMarkdown()}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={flashcardStageStyles.studyFooter()}>
              {stage.kind === "prompt" ? (
                <div className={flashcardStageStyles.revealButtonWrap()}>
                  <ControlButton
                    type="button"
                    onClick={onRevealAnswer}
                    variant="secondary"
                    size="lg"
                    className="w-full max-w-xl"
                  >
                    显示答案
                  </ControlButton>
                </div>
              ) : (
                <div className={flashcardStageStyles.ratingsGrid()}>
                  <RatingButton label="Again" caption="重新学习" tone="again" disabled={stage.submittingRating} onClick={() => onReview("again")} />
                  <RatingButton label="Hard" caption="有点难" tone="hard" disabled={stage.submittingRating} onClick={() => onReview("hard")} />
                  <RatingButton label="Good" caption="按时复习" tone="good" disabled={stage.submittingRating} onClick={() => onReview("good")} />
                  <RatingButton label="Easy" caption="非常熟悉" tone="easy" disabled={stage.submittingRating} onClick={() => onReview("easy")} />
                </div>
              )}
            </div>
          </div>
        ) : null}

        {stage.kind === "empty" && emptyCopy ? (
          <div className={flashcardStageStyles.emptyShell()} data-testid="flashcard-stage-empty">
            <div className={flashcardStageStyles.emptyIconWrap()}>
              <FileTextIcon size={30} className="text-text-muted" />
            </div>
            <div className={flashcardStageStyles.emptyTitle()}>{emptyCopy.title}</div>
            <div className={flashcardStageStyles.emptyBody()}>{emptyCopy.body}</div>
            <div className={flashcardStageStyles.emptyActions()}>
              <PillButton type="button" onClick={onCreateFlashcard} variant="secondary" height={40}>
                <PlusIcon size={16} weight="bold" />
                新建卡片
              </PillButton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
