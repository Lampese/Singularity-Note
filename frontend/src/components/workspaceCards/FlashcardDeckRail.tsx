"use client";

import { type RefObject, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  CheckIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/Input";
import { PillField } from "@/components/ui/PillField";
import { PillButton } from "@/components/ui/PillButton";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  ControlButton,
  ControlIconButton,
  FactoryCollapseToggle as CollapseToggle,
} from "@/components/ui/factory/groups/button/components";
import { FactoryListRow as ListRow, ListActionButton } from "@/components/ui/factory/groups/list";
import { cn } from "@/lib/utils";
import { WorkspaceSidebarShell } from "@/components/layout";
import { resourceSidebarStyles as sidebarStyles } from "@/components/layout/ResourceSidebar.styles";
import { flashcardListItemStyles, flashcardRailStyles } from "./flashcardStyles";
import { type DeckSummary } from "./types";
import { type Flashcard, type FlashcardDeck } from "@/lib/api/flashcards";
import { formatFlashcardRepsLabel, formatFlashcardStateLabel } from "./WorkspaceCardsScreen";

const HOVER_ACTIONS_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";
const SIDEBAR_SLOT_EDGE_INSET_PX = 9;
const FLASHCARD_ROW_ACTIONS_SLOT_WIDTH_PX = 108;
function getHoverActionSupportSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(HOVER_ACTIONS_MEDIA_QUERY).matches;
}

function subscribeHoverActionSupport(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(HOVER_ACTIONS_MEDIA_QUERY);
  const handleChange = () => onStoreChange();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }

  mediaQuery.addListener(handleChange);
  return () => {
    mediaQuery.removeListener(handleChange);
  };
}

function DeckSummaryCounters({
  deck,
  className,
}: {
  deck: DeckSummary;
  className?: string;
}) {
  return (
    <span className={cn(flashcardRailStyles.deckSummaryRow(), className)}>
      <span className={flashcardRailStyles.deckSummaryItem({ tone: "neutral" })}>{deck.total}</span>
      <span className={flashcardRailStyles.deckSummaryItem({ tone: "info" })}>{deck.newCount}</span>
      <span className={flashcardRailStyles.deckSummaryItem({ tone: "error" })}>{deck.due}</span>
      <span className={flashcardRailStyles.deckSummaryItem({ tone: "success" })}>{deck.reviewCount}</span>
    </span>
  );
}

function FlashcardCardListItem({
  card,
  selectionMode,
  isSelected,
  isActiveCard,
  supportsHoverCardActions,
  showPersistentActions,
  onSelectCard,
  onToggleSelection,
  onMove,
  onEdit,
  onDelete,
  formatDueLabel,
}: {
  card: Flashcard;
  selectionMode: boolean;
  isSelected: boolean;
  isActiveCard: boolean;
  supportsHoverCardActions: boolean;
  showPersistentActions: boolean;
  onSelectCard: () => void;
  onToggleSelection: () => void;
  onMove: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatDueLabel: (card: Flashcard) => string;
}) {
  const itemState = selectionMode
    ? (isSelected ? "selected" : "idle")
    : (isActiveCard ? "active" : "idle");
  const repsLabel = card.review_state ? formatFlashcardRepsLabel(card.review_state.reps) : null;
  const metaLabel = repsLabel ? `${formatDueLabel(card)} ${repsLabel}` : formatDueLabel(card);

  const rowActions = (
    <span className="inline-flex items-center justify-end gap-0.5">
      <ListActionButton
        className="px-2 text-xs font-medium text-text-muted hover:text-text"
        aria-label={`移动 ${card.prompt}`}
        onClick={(event) => {
          event.stopPropagation();
          onMove();
        }}
      >
        移动
      </ListActionButton>
      <ListActionButton
        className="text-text-muted hover:text-text"
        aria-label={`编辑 ${card.prompt}`}
        onClick={(event) => {
          event.stopPropagation();
          onEdit();
        }}
      >
        <PencilSimpleIcon size={14} />
      </ListActionButton>
      <ListActionButton
        className="text-text-muted hover:text-error"
        aria-label={`删除 ${card.prompt}`}
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <TrashIcon size={14} />
      </ListActionButton>
    </span>
  );

  return (
    <ListRow
      className={cn(
        sidebarStyles.item({ active: itemState !== "idle" }),
        flashcardListItemStyles.root({ state: itemState }),
      )}
      leadingInsetPx={SIDEBAR_SLOT_EDGE_INSET_PX}
      metaInsetPx={SIDEBAR_SLOT_EDGE_INSET_PX}
      trailingInsetPx={SIDEBAR_SLOT_EDGE_INSET_PX}
      trailingSlotWidthPx={!selectionMode ? FLASHCARD_ROW_ACTIONS_SLOT_WIDTH_PX : undefined}
      onClick={() => {
        if (selectionMode) {
          onToggleSelection();
          return;
        }
        onSelectCard();
      }}
      leading={
        selectionMode ? (
          <span className={flashcardListItemStyles.selectionMark({ active: isSelected })}>
            {isSelected ? <CheckIcon size={11} weight="bold" /> : null}
          </span>
        ) : (
          <span className={flashcardListItemStyles.stateMark()}>
            {formatFlashcardStateLabel(card.review_state?.state ?? "new")}
          </span>
        )
      }
      label={<span className={flashcardListItemStyles.prompt()}>{card.prompt}</span>}
      labelClassName="min-w-0"
      meta={
        !selectionMode && !showPersistentActions ? (
          <span className={flashcardListItemStyles.metaRow()}>
            <span className={flashcardListItemStyles.dueText()}>{metaLabel}</span>
          </span>
        ) : showPersistentActions ? (
          rowActions
        ) : undefined
      }
      trailingAction={!selectionMode && supportsHoverCardActions ? rowActions : undefined}
    />
  );
}

function CardsDeckSwitcher({
  open,
  onClose,
  currentDeckId,
  deckSummaries,
  onSelect,
  onCreateDeck,
  onRenameDeck,
  onRequestDeleteDeck,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  currentDeckId: string | null;
  deckSummaries: DeckSummary[];
  onSelect: (deckId: string) => void;
  onCreateDeck: (name: string) => Promise<void>;
  onRenameDeck: (deckId: string, name: string) => Promise<void>;
  onRequestDeleteDeck: (deckId: string) => void;
  triggerRef?: RefObject<HTMLElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [shouldRenderPanel, setShouldRenderPanel] = useState(open);
  const [panelExpanded, setPanelExpanded] = useState(open);
  const panelOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelUnmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;
      onClose();
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose, open, triggerRef]);

  useEffect(() => {
    if (panelOpenTimerRef.current) {
      clearTimeout(panelOpenTimerRef.current);
      panelOpenTimerRef.current = null;
    }
    if (panelUnmountTimerRef.current) {
      clearTimeout(panelUnmountTimerRef.current);
      panelUnmountTimerRef.current = null;
    }

    if (open) {
      const rafId = window.requestAnimationFrame(() => {
        setShouldRenderPanel(true);
        setPanelExpanded(false);
        panelOpenTimerRef.current = setTimeout(() => {
          setPanelExpanded(true);
          panelOpenTimerRef.current = null;
        }, 16);
      });
      return () => window.cancelAnimationFrame(rafId);
    }

    const rafId = window.requestAnimationFrame(() => {
      setPanelExpanded(false);
      panelUnmountTimerRef.current = setTimeout(() => {
        setShouldRenderPanel(false);
        panelUnmountTimerRef.current = null;
      }, 240);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [open]);

  useEffect(() => {
    return () => {
      if (panelOpenTimerRef.current) clearTimeout(panelOpenTimerRef.current);
      if (panelUnmountTimerRef.current) clearTimeout(panelUnmountTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (showCreateInput || editingDeckId) {
      inputRef.current?.focus();
    }
  }, [editingDeckId, showCreateInput]);

  useEffect(() => {
    if (open) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setShowCreateInput(false);
      setEditingDeckId(null);
      setDraftName("");
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [open]);

  const submitDraft = useCallback(async (mode: "create" | "rename") => {
    const value = draftName.trim();
    if (!value || submitting) return;
    setSubmitting(true);
    try {
      if (mode === "rename") {
        if (!editingDeckId) {
          return;
        }
        await onRenameDeck(editingDeckId, value);
        setEditingDeckId(null);
      } else {
        await onCreateDeck(value);
        setShowCreateInput(false);
      }
      setDraftName("");
    } finally {
      setSubmitting(false);
    }
  }, [draftName, editingDeckId, onCreateDeck, onRenameDeck, submitting]);

  if (!shouldRenderPanel) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-full z-50 mt-1 mx-2",
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
            {deckSummaries.length === 0 ? (
              <div className="px-4 py-6 type-body-secondary text-text-muted">还没有牌组</div>
            ) : (
              deckSummaries.map((deck) => {
                const isCurrent = deck.id === currentDeckId;
                const isEditing = deck.id === editingDeckId;

                return (
                  <ListRow
                    key={deck.id}
                    className={cn(
                      "mx-1.5 rounded-[18px] px-3 py-2.5 transition-colors",
                      isCurrent
                        ? "bg-accent-muted text-accent font-semibold"
                        : "font-medium text-text hover:bg-surface-hover",
                      submitting && isEditing && "opacity-70",
                    )}
                    onClick={() => {
                      if (isEditing) return;
                      onSelect(deck.id);
                      onClose();
                    }}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      if (!isCurrent) {
                        onSelect(deck.id);
                      }
                      setShowCreateInput(false);
                      setEditingDeckId(deck.id);
                      setDraftName(deck.deck);
                    }}
                    leading={(
                      <span className="w-4 shrink-0 inline-flex items-center justify-center">
                        {isCurrent ? <CheckIcon size={14} weight="bold" /> : null}
                      </span>
                    )}
                    label={isEditing ? (
                      <Input
                        ref={inputRef}
                        autoFocus
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        onBlur={() => void submitDraft("rename")}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            void submitDraft("rename");
                          } else if (event.key === "Escape") {
                            setEditingDeckId(null);
                            setDraftName("");
                          }
                        }}
                        onClick={(event) => event.stopPropagation()}
                        onDoubleClick={(event) => event.stopPropagation()}
                        disabled={submitting}
                        className="min-w-0 w-full rounded-[12px] border-accent/50 bg-surface-active px-2 py-1 text-sm font-medium"
                      />
                    ) : (
                      <span className="truncate text-sm font-medium select-none">{deck.deck}</span>
                    )}
                    meta={!isEditing ? <DeckSummaryCounters deck={deck} /> : undefined}
                    trailingSlotWidthPx={!isEditing ? 40 : undefined}
                    trailingAction={!isEditing ? (
                      <ListActionButton
                        className="text-text-muted hover:text-error"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!isCurrent) {
                            onSelect(deck.id);
                          }
                          onRequestDeleteDeck(deck.id);
                        }}
                        aria-label={`删除 ${deck.deck}`}
                      >
                        <TrashIcon size={14} />
                      </ListActionButton>
                    ) : undefined}
                  />
                );
              })
            )}
          </div>

          <div className="mx-3 h-px bg-border/55" />

          <div className="mx-1.5 mb-1 mt-1 p-1.5">
            {showCreateInput ? (
              <div className="flex flex-col gap-2 rounded-2xl bg-surface px-3 py-3">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="新牌组名称"
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void submitDraft("create");
                      } else if (event.key === "Escape") {
                        setShowCreateInput(false);
                        setDraftName("");
                      }
                    }}
                    disabled={submitting}
                    className="min-w-0 flex-1 rounded-[14px] border-border/40 bg-surface text-sm"
                  />
                  <ControlButton
                    type="button"
                    variant="menuPrimary"
                    onClick={() => void submitDraft("create")}
                    disabled={!draftName.trim() || submitting}
                    className="shrink-0 rounded-[14px] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "..." : "创建"}
                  </ControlButton>
                </div>
              </div>
            ) : (
              <ControlButton
                type="button"
                variant="menuPrimary"
                className="min-h-[44px] w-full justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
                onClick={() => {
                  setEditingDeckId(null);
                  setDraftName("");
                  setShowCreateInput(true);
                }}
              >
                <PlusIcon size={14} weight="bold" />
                新建牌组
              </ControlButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlashcardDeckRail({
  cardsSidebarCollapsed,
  leftSidebarWidth,
  onResizeStart,
  deckSwitcherTriggerRef,
  deckSwitcherOpen,
  setDeckSwitcherOpen,
  currentDeckSummary,
  selectedDeckId,
  setSelectedDeckId,
  deckSummaries,
  flashcardDecks,
  handleCreateDeck,
  handleRenameDeck,
  setPendingDeleteDeck,
  setCardsSidebarCollapsed,
  flashcardSearchText,
  setFlashcardSearchText,
  selectionMode,
  clearFlashcardSelection,
  filteredFlashcards,
  setSelectionMode,
  setSelectedFlashcardIds,
  selectedFlashcardCount,
  selectedFlashcardIds,
  openMoveFlashcardsDialog,
  setPendingBulkDeleteFlashcardIds,
  activeStudyCardId,
  setActiveStudyCardId,
  setShowAnswer,
  toggleFlashcardSelection,
  setPendingDeleteFlashcard,
  handleEditFlashcard,
  formatDueLabel,
}: {
  cardsSidebarCollapsed: boolean;
  leftSidebarWidth: number;
  onResizeStart: () => void;
  deckSwitcherTriggerRef: RefObject<HTMLButtonElement | null>;
  deckSwitcherOpen: boolean;
  setDeckSwitcherOpen: (open: boolean | ((current: boolean) => boolean)) => void;
  currentDeckSummary: DeckSummary | null;
  selectedDeckId: string | null;
  setSelectedDeckId: (deckId: string | null) => void;
  deckSummaries: DeckSummary[];
  flashcardDecks: FlashcardDeck[];
  handleCreateDeck: (name: string) => Promise<void>;
  handleRenameDeck: (deckId: string, name: string) => Promise<void>;
  setPendingDeleteDeck: (deck: FlashcardDeck | null) => void;
  setCardsSidebarCollapsed: (collapsed: boolean) => void;
  flashcardSearchText: string;
  setFlashcardSearchText: (value: string) => void;
  selectionMode: boolean;
  clearFlashcardSelection: () => void;
  filteredFlashcards: Flashcard[];
  setSelectionMode: (selectionMode: boolean) => void;
  setSelectedFlashcardIds: (ids: Set<string>) => void;
  selectedFlashcardCount: number;
  selectedFlashcardIds: Set<string>;
  openMoveFlashcardsDialog: (flashcardIds: string[]) => void;
  setPendingBulkDeleteFlashcardIds: (ids: string[] | null) => void;
  activeStudyCardId: string | null;
  setActiveStudyCardId: (id: string | null) => void;
  setShowAnswer: (show: boolean) => void;
  toggleFlashcardSelection: (flashcardId: string) => void;
  setPendingDeleteFlashcard: (card: Flashcard | null) => void;
  handleEditFlashcard: (card: Flashcard) => void;
  formatDueLabel: (card: Flashcard) => string;
}) {
  const supportsHoverCardActions = useSyncExternalStore(
    subscribeHoverActionSupport,
    getHoverActionSupportSnapshot,
    () => false,
  );
  const [focusedFlashcardId, setFocusedFlashcardId] = useState<string | null>(null);

  return (
    <WorkspaceSidebarShell
      collapsed={cardsSidebarCollapsed}
      width={leftSidebarWidth}
      onResizeStart={onResizeStart}
      header={(
        <div className={flashcardRailStyles.header()}>
          <ControlButton
            ref={deckSwitcherTriggerRef}
            type="button"
            variant="unstyled"
            onClick={() => setDeckSwitcherOpen((current) => !current)}
            className={flashcardRailStyles.deckTrigger()}
            aria-label="切换牌组"
            trailing={
              <CollapseToggle
                expanded={deckSwitcherOpen}
                direction={{ kind: "free", collapsed: "down", expanded: "up" }}
                iconSize={12}
                className="h-3 w-3 text-text-muted"
                iconClassName="text-current"
              />
            }
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{currentDeckSummary?.deck ?? "选择牌组"}</span>
              {currentDeckSummary ? (
                <DeckSummaryCounters
                  deck={currentDeckSummary}
                  className={flashcardRailStyles.deckSummaryRow({ compact: true })}
                />
              ) : null}
            </span>
          </ControlButton>
          <ControlIconButton
            type="button"
            onClick={() => setCardsSidebarCollapsed(true)}
            size="iconLg"
            variant="quiet"
            className={sidebarStyles.header.collapseButton()}
            aria-label="收起侧边栏"
            icon={
              <CollapseToggle
                expanded
                direction={{ kind: "free", collapsed: "right", expanded: "left" }}
                iconSize={16}
                variant="plain"
                iconClassName="text-current"
              />
            }
          />
          <CardsDeckSwitcher
            open={deckSwitcherOpen}
            onClose={() => setDeckSwitcherOpen(false)}
            currentDeckId={selectedDeckId}
            deckSummaries={deckSummaries}
            onSelect={(deckId) => setSelectedDeckId(deckId)}
            onCreateDeck={handleCreateDeck}
            onRenameDeck={handleRenameDeck}
            onRequestDeleteDeck={(deckId) => {
              setPendingDeleteDeck(
                flashcardDecks.find((deck) => deck.id === deckId) ?? null,
              );
            }}
            triggerRef={deckSwitcherTriggerRef}
          />
        </div>
      )}
      bodyProps={{ className: "flex-1 min-h-0 overflow-hidden" }}
      body={(
        <ScrollArea className="h-full" autoHideScrollbar>
          <div className={sidebarStyles.sections.stack()}>
            <section className={sidebarStyles.section.block()}>
              <div className={sidebarStyles.section.container()}>
                <div className={cn(sidebarStyles.section.actions(), "w-full")}>
                  <PillField
                    leading={<MagnifyingGlassIcon size={18} />}
                    type="text"
                    value={flashcardSearchText}
                    onChange={(event) => setFlashcardSearchText(event.target.value)}
                    placeholder="搜索卡片"
                    shellClassName={flashcardRailStyles.searchLayout()}
                  />
                  {selectionMode ? (
                    <PillButton
                      type="button"
                      variant="secondary"
                      height={24}
                      className={sidebarStyles.section.actionPill()}
                      onClick={clearFlashcardSelection}
                    >
                      取消选择
                    </PillButton>
                  ) : (
                    <PillButton
                      type="button"
                      variant="secondary"
                      height={24}
                      className={sidebarStyles.section.actionPill()}
                      disabled={filteredFlashcards.length === 0}
                      onClick={() => {
                        setSelectionMode(true);
                        setSelectedFlashcardIds(new Set());
                      }}
                    >
                      选择
                    </PillButton>
                  )}
                </div>
              </div>

              {selectionMode ? (
                <div className={sidebarStyles.selectionBar.container()}>
                  <span className={sidebarStyles.selectionBar.text()}>
                    已选 {selectedFlashcardCount} 张
                  </span>
                  <div className="flex items-center gap-2">
                    <PillButton
                      type="button"
                      variant="secondary"
                      height={28}
                      className={sidebarStyles.selectionBar.button()}
                      disabled={selectedFlashcardCount === 0}
                      onClick={() => openMoveFlashcardsDialog(Array.from(selectedFlashcardIds))}
                    >
                      批量移动
                    </PillButton>
                    <PillButton
                      type="button"
                      variant="destructive"
                      height={28}
                      className={sidebarStyles.selectionBar.button()}
                      disabled={selectedFlashcardCount === 0}
                      onClick={() => setPendingBulkDeleteFlashcardIds(Array.from(selectedFlashcardIds))}
                    >
                      批量删除
                    </PillButton>
                  </div>
                </div>
              ) : null}

              <div className={sidebarStyles.section.content()}>
                {filteredFlashcards.length === 0 ? (
                  <div className={flashcardRailStyles.emptyList()}>当前牌组下没有卡片</div>
                ) : (
                  filteredFlashcards.map((card) => {
                    const isSelected = selectedFlashcardIds.has(card.id);
                    const isActiveCard = activeStudyCardId === card.id;
                    const showPersistentActions =
                      !supportsHoverCardActions && (isActiveCard || focusedFlashcardId === card.id);

                    return (
                      <div
                        key={card.id}
                        className="min-w-0"
                        onFocusCapture={() => setFocusedFlashcardId(card.id)}
                        onBlurCapture={(event) => {
                          const nextTarget = event.relatedTarget;
                          if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
                            return;
                          }
                          setFocusedFlashcardId((currentFocusedId) =>
                            currentFocusedId === card.id ? null : currentFocusedId,
                          );
                        }}
                      >
                        <FlashcardCardListItem
                          card={card}
                          selectionMode={selectionMode}
                          isSelected={isSelected}
                          isActiveCard={isActiveCard}
                          supportsHoverCardActions={supportsHoverCardActions}
                          showPersistentActions={showPersistentActions}
                          onSelectCard={() => {
                            setActiveStudyCardId(card.id);
                            setShowAnswer(false);
                          }}
                          onToggleSelection={() => toggleFlashcardSelection(card.id)}
                          onMove={() => openMoveFlashcardsDialog([card.id])}
                          onEdit={() => handleEditFlashcard(card)}
                          onDelete={() => setPendingDeleteFlashcard(card)}
                          formatDueLabel={formatDueLabel}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </ScrollArea>
      )}
    />
  );
}
