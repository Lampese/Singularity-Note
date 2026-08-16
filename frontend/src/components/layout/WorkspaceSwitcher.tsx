"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
    PlusIcon,
    TrashIcon,
    CheckIcon,
    SpinnerGapIcon,
} from "@phosphor-icons/react";
import type { components } from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ControlButton } from "@/components/ui/factory/groups/button/components";
import { FactoryListRow as ListRow, ListActionButton } from "@/components/ui/factory/groups/list";
import { Input } from "@/components/ui/Input";
import { useWorkspaceSwitcherActions } from "@/hooks/useWorkspaceSwitcherActions";

type WorkspaceView = components["schemas"]["WorkspaceViewDoc"];

export interface WorkspaceSwitcherProps {
    open: boolean;
    onClose: () => void;
    currentWorkspaceId: string;
    workspaces: WorkspaceView[];
    onWorkspacesChange: () => void;
    triggerRef?: RefObject<HTMLElement | null>;
}

export function WorkspaceSwitcher({
    open,
    onClose,
    currentWorkspaceId,
    workspaces,
    onWorkspacesChange,
    triggerRef,
}: WorkspaceSwitcherProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const panelOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const panelUnmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [newName, setNewName] = useState("");
    const [showCreateInput, setShowCreateInput] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
    const [editWorkspaceName, setEditWorkspaceName] = useState("");
    const [shouldRenderPanel, setShouldRenderPanel] = useState(open);
    const [panelExpanded, setPanelExpanded] = useState(open);
    const pendingSelectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const {
        creating,
        createError,
        deleteSubmitting,
        switchingId,
        renamingWorkspaceId,
        clearCreateError,
        selectWorkspace,
        renameWorkspace,
        createWorkspace,
        deleteWorkspace,
    } = useWorkspaceSwitcherActions({
        currentWorkspaceId,
        workspaces,
        onWorkspacesChange,
        onClose,
    });

    const clearPendingSelect = useCallback(() => {
        if (pendingSelectTimerRef.current) {
            clearTimeout(pendingSelectTimerRef.current);
            pendingSelectTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (panelRef.current?.contains(target)) return;
            if (triggerRef?.current?.contains(target)) return;
            onClose();
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [open, onClose, triggerRef]);

    useEffect(() => {
        if (showCreateInput) {
            inputRef.current?.focus();
        }
    }, [showCreateInput]);

    useEffect(() => {
        if (open) {
            return;
        }

        const frameId = window.requestAnimationFrame(() => {
            clearPendingSelect();
            setShowCreateInput(false);
            setNewName("");
            setEditingWorkspaceId(null);
            setEditWorkspaceName("");
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [open, clearPendingSelect]);

    useEffect(() => {
        return () => {
            clearPendingSelect();
        };
    }, [clearPendingSelect]);

    useEffect(() => {
        if (panelOpenTimerRef.current) {
            clearTimeout(panelOpenTimerRef.current);
            panelOpenTimerRef.current = null;
        }
        if (panelUnmountTimerRef.current) {
            clearTimeout(panelUnmountTimerRef.current);
            panelUnmountTimerRef.current = null;
        }

        let frameId: number | null = null;

        if (open) {
            frameId = window.requestAnimationFrame(() => {
                setShouldRenderPanel(true);
                setPanelExpanded(false);
                panelOpenTimerRef.current = setTimeout(() => {
                    setPanelExpanded(true);
                    panelOpenTimerRef.current = null;
                }, 16);
            });
        } else {
            frameId = window.requestAnimationFrame(() => {
                setPanelExpanded(false);
                panelUnmountTimerRef.current = setTimeout(() => {
                    setShouldRenderPanel(false);
                    panelUnmountTimerRef.current = null;
                }, 240);
            });
        }

        return () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
            if (panelOpenTimerRef.current) {
                clearTimeout(panelOpenTimerRef.current);
                panelOpenTimerRef.current = null;
            }
            if (panelUnmountTimerRef.current) {
                clearTimeout(panelUnmountTimerRef.current);
                panelUnmountTimerRef.current = null;
            }
        };
    }, [open]);

    useEffect(() => {
        return () => {
            if (panelOpenTimerRef.current) {
                clearTimeout(panelOpenTimerRef.current);
                panelOpenTimerRef.current = null;
            }
            if (panelUnmountTimerRef.current) {
                clearTimeout(panelUnmountTimerRef.current);
                panelUnmountTimerRef.current = null;
            }
        };
    }, []);

    const handleRename = useCallback(async (workspace: WorkspaceView) => {
        const nextName = editWorkspaceName.trim();
        if (!nextName || nextName === workspace.name) {
            setEditingWorkspaceId(null);
            setEditWorkspaceName("");
            return;
        }

        const succeeded = await renameWorkspace(workspace, nextName);
        if (succeeded) {
            setEditingWorkspaceId(null);
            setEditWorkspaceName("");
        }
    }, [editWorkspaceName, renameWorkspace]);

    const scheduleSelect = useCallback((workspaceId: string) => {
        clearPendingSelect();
        pendingSelectTimerRef.current = setTimeout(() => {
            pendingSelectTimerRef.current = null;
            void selectWorkspace(workspaceId);
        }, 180);
    }, [clearPendingSelect, selectWorkspace]);

    const handleCreate = useCallback(async () => {
        const succeeded = await createWorkspace(newName);
        if (succeeded) {
            setNewName("");
            setShowCreateInput(false);
        }
    }, [createWorkspace, newName]);

    const confirmDelete = useCallback(async () => {
        if (!pendingDeleteId) return;
        const idToDelete = pendingDeleteId;
        setPendingDeleteId(null);
        await deleteWorkspace(idToDelete);
    }, [deleteWorkspace, pendingDeleteId]);

    if (!shouldRenderPanel) return null;

    return (
        <>
            <div
                className={cn(
                    "absolute left-1/2 top-full z-50 mt-1 w-[min(calc(100%-16px),320px)] -translate-x-1/2",
                    panelExpanded ? "pointer-events-auto" : "pointer-events-none",
                )}
            >
                <div
                    className={cn(
                        "transform-gpu transition-[opacity,transform] [transition-duration:var(--motion-duration-medium)] [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
                        panelExpanded ? "translate-y-0 scale-100 opacity-100" : "-translate-y-2 scale-[0.98] opacity-0",
                    )}
                >
                        <div
                            ref={panelRef}
                            className="frosted-surface-subtle max-h-[min(420px,60vh)] flex flex-col rounded-[28px] ring-0 outline-none"
                        >
                            <div className="flex-1 overflow-y-auto py-1">
                                {workspaces.map(ws => {
                                    const isCurrent = ws.id === currentWorkspaceId;
                                    const isSwitching = ws.id === switchingId;
                                    const isEditing = ws.id === editingWorkspaceId;
                                    const isRenaming = ws.id === renamingWorkspaceId;
                                    return (
                                        <ListRow
                                            key={ws.id}
                                            className={cn(
                                                "mx-1.5 grid grid-cols-[32px_minmax(0,1fr)_32px] rounded-[18px] px-3 py-2.5 transition-colors",
                                                isCurrent
                                                    ? "bg-accent-muted text-accent font-semibold"
                                                    : "font-medium text-text hover:bg-surface-hover",
                                                (isSwitching || isRenaming) && "opacity-70",
                                            )}
                                            onClick={() => {
                                                if (isEditing || isRenaming) return;
                                                scheduleSelect(ws.id);
                                            }}
                                            onDoubleClick={(e) => {
                                                e.stopPropagation();
                                                clearPendingSelect();
                                                if (isRenaming) {
                                                    return;
                                                }
                                                if (ws.role !== "owner") {
                                                    scheduleSelect(ws.id);
                                                    return;
                                                }
                                                setEditingWorkspaceId(ws.id);
                                                setEditWorkspaceName(ws.name);
                                            }}
                                            leading={
                                                <span className="inline-flex w-4 shrink-0 items-center justify-center">
                                                    {isSwitching || isRenaming
                                                        ? <SpinnerGapIcon size={14} className="animate-spin" />
                                                        : isCurrent
                                                            ? <CheckIcon size={14} weight="bold" />
                                                            : null
                                                    }
                                                </span>
                                            }
                                            leadingInsetPx={0}
                                            labelClassName="min-w-0 text-center"
                                            label={
                                                isEditing ? (
                                                <Input
                                                        autoFocus
                                                        value={editWorkspaceName}
                                                        onChange={(e) => setEditWorkspaceName(e.target.value)}
                                                        onBlur={() => { void handleRename(ws); }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                void handleRename(ws);
                                                            } else if (e.key === "Escape") {
                                                                setEditingWorkspaceId(null);
                                                                setEditWorkspaceName("");
                                                            }
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onDoubleClick={(e) => e.stopPropagation()}
                                                        disabled={isRenaming}
                                                        className="min-w-0 w-full rounded-[12px] border-accent/50 bg-surface-active px-2 py-1 text-sm font-medium"
                                                    />
                                                ) : (
                                                    <span className="block w-full min-w-0 truncate text-center text-sm font-medium select-none">{ws.name}</span>
                                                )
                                            }
                                            trailingAction={ws.role === "owner" && !isEditing ? (
                                                <ListActionButton
                                                    className="text-text-muted hover:text-error"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPendingDeleteId(ws.id);
                                                    }}
                                                    aria-label="删除工作区"
                                                >
                                                    <TrashIcon size={14} />
                                                </ListActionButton>
                                            ) : undefined}
                                            trailingInsetPx={0}
                                        />
                                    );
                                })}
                            </div>

                            <div className="mx-3 h-px bg-border/55" />

                            <div className="mx-1.5 mb-1 mt-1 p-1.5">
                                {showCreateInput ? (
                                    <div className="flex flex-col gap-2 rounded-2xl bg-surface px-3 py-3">
                                        <div className="flex items-center gap-2">
                                                <Input
                                                ref={inputRef}
                                                type="text"
                                                placeholder="工作区名称"
                                                value={newName}
                                                onChange={(e) => {
                                                    setNewName(e.target.value);
                                                    clearCreateError();
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleCreate();
                                                    if (e.key === "Escape") {
                                                        setShowCreateInput(false);
                                                        setNewName("");
                                                        clearCreateError();
                                                    }
                                                }}
                                                disabled={creating}
                                                className="min-w-0 flex-1 rounded-[14px] border-border/40 bg-surface text-sm"
                                            />
                                            <ControlButton
                                                type="button"
                                                variant="menuPrimary"
                                                onClick={handleCreate}
                                                disabled={!newName.trim() || creating}
                                                className="shrink-0 rounded-[14px] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {creating ? "..." : "创建"}
                                            </ControlButton>
                                        </div>
                                        {createError && (
                                            <span className="status-banner status-banner-error px-3 py-2 text-xs">{createError}</span>
                                        )}
                                    </div>
                                ) : (
                                    <ControlButton
                                        type="button"
                                        variant="menuPrimary"
                                        className="min-h-[44px] w-full justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
                                        onClick={() => setShowCreateInput(true)}
                                    >
                                        <PlusIcon size={14} weight="bold" />
                                        新建工作区
                                    </ControlButton>
                                )}
                            </div>
                        </div>
                </div>
            </div>

            <ConfirmDialog
                open={pendingDeleteId !== null}
                title="确认删除该工作区？"
                description="此操作不可恢复，相关资源与会话也会一并删除。"
                confirmText="确认删除"
                cancelText="取消"
                loading={deleteSubmitting}
                onCancel={() => setPendingDeleteId(null)}
                onConfirm={confirmDelete}
            />
        </>
    );
}
