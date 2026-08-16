"use client";

import { useUpload } from "@/contexts/UploadContext";
import { useEffect, useCallback } from "react";
import { DialogBase } from "@/components/ui/DialogBase";
import { ControlButton } from "@/components/ui/factory/groups/button/components";
import { cn } from "@/lib/utils";
import { WarningCircleIcon, VideoIcon, MusicNoteIcon } from "@phosphor-icons/react";

function formatDuration(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return m > 0 ? `${m} 分 ${s} 秒` : `${s} 秒`;
}

export function MediaCreditConfirm() {
    const { pendingConfirm, confirmMediaUpload, cancelMediaUpload } = useUpload();

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") cancelMediaUpload();
        },
        [cancelMediaUpload],
    );

    useEffect(() => {
        if (!pendingConfirm) return;
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [pendingConfirm, handleKeyDown]);

    if (!pendingConfirm) return null;

    const { kind, durationSecs, creditsNeeded, creditsBalance, file } = pendingConfirm;
    const insufficient = creditsNeeded > creditsBalance;
    const Icon = kind === "video" ? VideoIcon : MusicNoteIcon;

    return (
        <DialogBase
            open
            onClose={cancelMediaUpload}
            title={`${kind === "video" ? "视频" : "音频"}解析确认`}
            description="多媒体解析会消耗积分，请在确认前检查时长与当前余额。"
            icon={
                <span
                    className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-[var(--radius-container-inner)]",
                        kind === "video"
                            ? "bg-info/10 text-info"
                            : "bg-accent/10 text-accent",
                    )}
                >
                    <Icon size={22} weight="bold" />
                </span>
            }
            panelClassName="max-w-lg"
        >
            <div className="space-y-5">
                <div className="frosted-surface-subtle rounded-[var(--radius-surface-2)] px-4 py-4">
                    <p className="type-meta truncate text-text-muted">{file.name}</p>
                    <div className="mt-3 space-y-2">
                        <div className="flex justify-between gap-3 type-body-secondary">
                            <span className="text-text-muted">时长</span>
                            <span className="text-text">{formatDuration(durationSecs)}</span>
                        </div>
                        <div className="flex justify-between gap-3 type-body-secondary">
                            <span className="text-text-muted">所需积分</span>
                            <span className="text-text">{creditsNeeded}</span>
                        </div>
                        <div className="flex justify-between gap-3 type-body-secondary">
                            <span className="text-text-muted">当前余额</span>
                            <span className={cn(insufficient ? "text-error" : "text-text")}>
                                {creditsBalance} 积分
                            </span>
                        </div>
                    </div>
                </div>

                {insufficient ? (
                    <div className="status-banner status-banner-error type-body-secondary flex items-center gap-2">
                        <WarningCircleIcon size={14} weight="bold" className="shrink-0" />
                        积分不足，当前无法解析该文件。
                    </div>
                ) : null}

                <div className="flex flex-wrap justify-end gap-3">
                    <ControlButton
                        type="button"
                        variant="secondary"
                        onClick={cancelMediaUpload}
                        className="min-w-[108px]"
                    >
                        {insufficient ? "关闭" : "取消"}
                    </ControlButton>
                    {!insufficient ? (
                        <ControlButton
                            type="button"
                            variant="menuProminent"
                            onClick={confirmMediaUpload}
                            className="min-w-[132px]"
                        >
                            确认解析
                        </ControlButton>
                    ) : null}
                </div>
            </div>
        </DialogBase>
    );
}
