"use client";

import React, { useState, useCallback } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import type { AskUserData } from "@/types/schema";
import {
    ControlButton,
    ControlSurfaceButton,
} from "@/components/ui/factory/groups/button/components";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAskUserSubmission } from "@/hooks/useAskUserSubmission";

interface AskUserCardProps {
    data: AskUserData;
    workspaceId: string;
    conversationId: string;
    onAnswered: (answers: Record<string, string>) => void;
}

export function AskUserCard({ data, workspaceId, conversationId, onAnswered }: AskUserCardProps) {
    const [selections, setSelections] = useState<Record<string, string>>(() => data.selectedAnswers ?? {});
    const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
    const [usingCustom, setUsingCustom] = useState<Record<string, boolean>>({});
    const {
        submitting,
        submissionError,
        clearSubmissionError,
        submitAnswers,
    } = useAskUserSubmission({
        workspaceId,
        conversationId,
        callId: data.callId,
    });

    const getAnswer = (qId: string): string | undefined => {
        if (usingCustom[qId]) return customInputs[qId]?.trim() || undefined;
        return selections[qId];
    };

    const allAnswered = data.questions.every((q) => getAnswer(q.id));

    const handleSelect = useCallback((questionId: string, label: string) => {
        if (data.answered || submitting) return;
        clearSubmissionError();
        setSelections((prev) => ({ ...prev, [questionId]: label }));
        setUsingCustom((prev) => ({ ...prev, [questionId]: false }));
    }, [clearSubmissionError, data.answered, submitting]);

    const handleCustomToggle = useCallback((questionId: string) => {
        if (data.answered || submitting) return;
        clearSubmissionError();
        setUsingCustom((prev) => ({ ...prev, [questionId]: true }));
        setSelections((prev) => {
            const next = { ...prev };
            delete next[questionId];
            return next;
        });
    }, [clearSubmissionError, data.answered, submitting]);

    const handleCustomInput = useCallback((questionId: string, value: string) => {
        if (data.answered || submitting) return;
        clearSubmissionError();
        setCustomInputs((prev) => ({ ...prev, [questionId]: value }));
    }, [clearSubmissionError, data.answered, submitting]);

    const handleSubmit = useCallback(async () => {
        if (!allAnswered || submitting || data.answered) return;
        const answers: Record<string, string> = {};
        for (const q of data.questions) {
            const ans = getAnswer(q.id);
            if (ans) answers[q.id] = ans;
        }
        const succeeded = await submitAnswers(answers);
        if (succeeded) {
            onAnswered(answers);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allAnswered, submitAnswers, submitting, data.answered, data.questions, onAnswered, usingCustom, customInputs, selections]);

    const displayAnswers = data.answered ? (data.selectedAnswers ?? {}) : null;

    return (
        <div className="my-3 space-y-5 rounded-[22px] bg-panel p-5">
            {data.questions.map((q) => {
                const answered = data.answered;
                const selectedLabel = answered ? displayAnswers?.[q.id] : (usingCustom[q.id] ? null : selections[q.id]);
                const isCustomActive = !answered && usingCustom[q.id];

                return (
                    <div key={q.id} className="space-y-3">
                        <p className="text-sm font-semibold tracking-[-0.01em] text-text">{q.question}</p>

                        {answered && displayAnswers?.[q.id] ? (
                            <div className="flex items-center gap-2 rounded-[16px] bg-surface px-3.5 py-3 text-sm text-text">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-panel text-success">
                                    <CheckIcon size={12} weight="bold" className="shrink-0" />
                                </span>
                                <span className="font-medium">{displayAnswers[q.id]}</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2">
                                    {q.options.map((opt) => {
                                        const isSelected = selectedLabel === opt.label;
                                        return (
                                            <ControlSurfaceButton
                                                key={opt.label}
                                                type="button"
                                                variant="unstyled"
                                                disabled={answered || submitting}
                                                onClick={() => handleSelect(q.id, opt.label)}
                                                className={cn(
                                                    "flex w-full items-start gap-3 rounded-[18px] px-4 py-3 text-left text-sm transition-colors",
                                                    isSelected
                                                        ? "bg-accent-muted text-text"
                                                        : "bg-surface-sub text-text-muted hover:bg-surface-hover hover:text-text",
                                                    (answered || submitting) && "cursor-default opacity-70",
                                                )}
                                            >
                                                <span className={cn(
                                                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center",
                                                    isSelected
                                                        ? "text-success"
                                                        : "text-transparent",
                                                )}>
                                                    {isSelected && <CheckIcon size={11} weight="bold" />}
                                                </span>
                                                <span className="flex min-w-0 flex-1 flex-col items-start text-left">
                                                    <span className="font-medium tracking-[-0.01em] text-text">{opt.label}</span>
                                                    {opt.description && (
                                                        <span className="text-xs text-text-muted">{opt.description}</span>
                                                    )}
                                                </span>
                                            </ControlSurfaceButton>
                                        );
                                    })}
                                </div>

                                {!answered && (
                                    <div className="mt-1">
                                        {isCustomActive ? (
                                            <Input
                                                type="text"
                                                placeholder="输入你的回答…"
                                                value={customInputs[q.id] ?? ""}
                                                onChange={(e) => handleCustomInput(q.id, e.target.value)}
                                                disabled={submitting}
                                                className="w-full rounded-[16px] border-border/40 bg-surface-sub"
                                            />
                                        ) : (
                                            <ControlButton
                                                type="button"
                                                variant="unstyled"
                                                onClick={() => handleCustomToggle(q.id)}
                                                disabled={submitting}
                                                className="text-xs text-text-muted hover:text-text"
                                            >
                                                其他回答…
                                            </ControlButton>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            })}

            {!data.answered && (
                <div className="space-y-3">
                    {submissionError ? (
                        <div className="status-banner status-banner-error type-caption">
                            {submissionError}
                        </div>
                    ) : null}
                    <div className="flex justify-end">
                        <ControlButton
                            type="button"
                            variant="unstyled"
                            disabled={!allAnswered || submitting}
                            onClick={handleSubmit}
                            className={cn(
                                "rounded-full px-4 py-2 text-sm font-medium",
                                allAnswered && !submitting
                                    ? "bg-accent text-text-inverse hover:bg-accent-hover"
                                    : "cursor-not-allowed bg-surface-sub text-text-muted",
                            )}
                        >
                            {submitting ? "提交中…" : "确认"}
                        </ControlButton>
                    </div>
                </div>
            )}
        </div>
    );
}
