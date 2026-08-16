"use client";

import { FileTextIcon } from "@phosphor-icons/react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DialogBase } from "@/components/ui/DialogBase";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ControlButton } from "@/components/ui/factory/groups/button/components";
import { flashcardDialogStyles } from "./flashcardStyles";
import { type Flashcard, type FlashcardDeck } from "@/lib/api/flashcards";
import { type FlashcardEditorState } from "./types";

export function FlashcardDialogs({
  cardsIntroOpen,
  closeCardsIntro,
  editorOpen,
  editingFlashcardId,
  closeFlashcardEditor,
  flashcardEditor,
  setFlashcardEditor,
  editorDeckName,
  savingFlashcard,
  handleSaveFlashcard,
  moveFlashcardIds,
  moveSubmitting,
  moveTargetDeckId,
  setMoveTargetDeckId,
  setMoveFlashcardIds,
  availableMoveDecks,
  handleMoveFlashcards,
  pendingDeleteFlashcard,
  setPendingDeleteFlashcard,
  deleteFlashcardSubmitting,
  handleDeleteFlashcard,
  pendingBulkDeleteFlashcardIds,
  setPendingBulkDeleteFlashcardIds,
  handleDeleteFlashcardsBulk,
  pendingDeleteDeck,
  setPendingDeleteDeck,
  handleDeleteDeck,
}: {
  cardsIntroOpen: boolean;
  closeCardsIntro: () => void;
  editorOpen: boolean;
  editingFlashcardId: string | null;
  closeFlashcardEditor: () => void;
  flashcardEditor: FlashcardEditorState;
  setFlashcardEditor: (updater: FlashcardEditorState | ((current: FlashcardEditorState) => FlashcardEditorState)) => void;
  editorDeckName: string;
  savingFlashcard: boolean;
  handleSaveFlashcard: () => Promise<void>;
  moveFlashcardIds: string[];
  moveSubmitting: boolean;
  moveTargetDeckId: string;
  setMoveTargetDeckId: (value: string) => void;
  setMoveFlashcardIds: (value: string[]) => void;
  availableMoveDecks: FlashcardDeck[];
  handleMoveFlashcards: () => Promise<void>;
  pendingDeleteFlashcard: Flashcard | null;
  setPendingDeleteFlashcard: (card: Flashcard | null) => void;
  deleteFlashcardSubmitting: boolean;
  handleDeleteFlashcard: () => Promise<void>;
  pendingBulkDeleteFlashcardIds: string[] | null;
  setPendingBulkDeleteFlashcardIds: (ids: string[] | null) => void;
  handleDeleteFlashcardsBulk: () => Promise<void>;
  pendingDeleteDeck: FlashcardDeck | null;
  setPendingDeleteDeck: (deck: FlashcardDeck | null) => void;
  handleDeleteDeck: () => Promise<void>;
}) {
  return (
    <>
      <DialogBase
        open={cardsIntroOpen}
        title="欢迎来到记忆卡"
        onClose={closeCardsIntro}
        icon={<FileTextIcon size={28} weight="fill" className="text-accent" />}
        panelClassName="max-w-2xl p-0"
        panelStyle={{ paddingBlock: "0px", paddingInline: "0px" }}
        panelContent={(
          <div className="flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col gap-5 px-6 pt-14 pb-6">
            <div className="frosted-surface-subtle rounded-[var(--radius-surface-1)] px-5 py-4">
              <div className="type-section-title text-text">欢迎来到记忆卡</div>
              <p className="mt-2 type-body-secondary text-text-secondary">
                这里会帮你把知识点安排进可持续的复习节奏里。你可以手动建卡，也可以直接让 Agent
                根据资料为你生成整组记忆卡。
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              <div className="space-y-5 text-text-secondary">
                <section className="space-y-2">
                  <div className="type-section-title text-text">我们怎么安排复习</div>
                  <p className="type-body-secondary whitespace-pre-line text-text-secondary">
                    记忆卡使用 <span className="font-semibold text-text">FSRS</span>
                    （Free Spaced Repetition Scheduler）算法。你每次给出
                    <span className="font-semibold text-text"> Again / Hard / Good / Easy </span>
                    评分后，系统会按你的实际记忆强度动态调整下一次出现时间，而不是固定间隔轮询。
                  </p>
                </section>

                <section className="space-y-3">
                  <div className="type-section-title text-text">侧边栏颜色是什么意思</div>
                  <div className="grid gap-2">
                    <div className="frosted-surface-subtle rounded-[var(--radius-surface-1)] px-4 py-3">
                      <span className="type-body-secondary text-text-secondary">
                        灰色代表牌组总卡数，蓝色代表新卡，红色代表到期卡，绿色代表稳定复习中的卡。
                      </span>
                    </div>
                  </div>
                </section>

                <section className="space-y-2">
                  <div className="type-section-title text-text">想更快开始</div>
                  <p className="type-body-secondary whitespace-pre-line text-text-secondary">
                    你不一定要手动建卡。回到聊天页直接让它帮你生成即可，比如：
                    “根据这份 PDF 生成 20 张记忆卡，按章节分牌组。”
                  </p>
                </section>
              </div>
            </div>

            <div className="flex shrink-0 justify-end pt-1">
              <ControlButton type="button" onClick={closeCardsIntro} variant="menuPrimary" className="min-w-28">
                开始使用
              </ControlButton>
            </div>
          </div>
        )}
      />

      <DialogBase
        open={editorOpen}
        title={editingFlashcardId ? "编辑卡片" : "新建卡片"}
        onClose={closeFlashcardEditor}
        panelClassName="max-w-2xl p-0"
        panelStyle={{ paddingBlock: "0px", paddingInline: "0px" }}
        panelContent={(
          <div className={flashcardDialogStyles.panelContent()}>
            <div className="grid gap-3">
              <div className={flashcardDialogStyles.fieldGroup()}>
                <label className="type-meta text-text-secondary">所属牌组</label>
                <div className={flashcardDialogStyles.infoBlock()}>{editorDeckName}</div>
              </div>

              <div className={flashcardDialogStyles.fieldGroup()}>
                <label className="type-meta text-text-secondary">正面</label>
                <Textarea
                  value={flashcardEditor.prompt}
                  onChange={(event) =>
                    setFlashcardEditor((current) => ({
                      ...current,
                      prompt: event.target.value,
                    }))
                  }
                  className="min-h-[118px] bg-panel/70"
                  placeholder="写下问题、定义、公式或提示"
                />
              </div>

              <div className={flashcardDialogStyles.fieldGroup()}>
                <label className="type-meta text-text-secondary">背面</label>
                <Textarea
                  value={flashcardEditor.answer}
                  onChange={(event) =>
                    setFlashcardEditor((current) => ({
                      ...current,
                      answer: event.target.value,
                    }))
                  }
                  className="min-h-[168px] bg-panel/70"
                  placeholder="写下答案、解释或证明"
                />
              </div>
            </div>

            <div className={flashcardDialogStyles.actions()}>
              <ControlButton type="button" onClick={closeFlashcardEditor} variant="ghost">
                取消
              </ControlButton>
              <ControlButton
                type="button"
                disabled={savingFlashcard}
                onClick={() => void handleSaveFlashcard()}
                variant="default"
              >
                {savingFlashcard ? "正在保存..." : editingFlashcardId ? "更新卡片" : "创建卡片"}
              </ControlButton>
            </div>
          </div>
        )}
      />

      <DialogBase
        open={moveFlashcardIds.length > 0}
        title={moveFlashcardIds.length > 1 ? "批量移动卡片" : "移动卡片"}
        onClose={() => {
          if (moveSubmitting) return;
          setMoveFlashcardIds([]);
          setMoveTargetDeckId("");
        }}
        panelClassName="max-w-xl p-0"
        panelStyle={{ paddingBlock: "0px", paddingInline: "0px" }}
        panelContent={(
          <div className={flashcardDialogStyles.panelContent()}>
            <div className="grid gap-3">
              <div className={flashcardDialogStyles.infoBlock()}>
                {moveFlashcardIds.length > 1
                  ? `将 ${moveFlashcardIds.length} 张卡片移动到其他牌组。`
                  : "将这张卡片移动到其他牌组。"}
              </div>
              <div className={flashcardDialogStyles.fieldGroup()}>
                <label className="type-meta text-text-secondary">目标牌组</label>
                <Select
                  value={moveTargetDeckId}
                  onChange={(event) => setMoveTargetDeckId(event.target.value)}
                  className="w-full bg-panel/70"
                >
                  <option value="">选择目标牌组</option>
                  {availableMoveDecks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className={flashcardDialogStyles.actions()}>
              <ControlButton
                type="button"
                onClick={() => {
                  setMoveFlashcardIds([]);
                  setMoveTargetDeckId("");
                }}
                variant="ghost"
              >
                取消
              </ControlButton>
              <ControlButton
                type="button"
                disabled={moveSubmitting || !moveTargetDeckId}
                onClick={() => void handleMoveFlashcards()}
                variant="default"
              >
                {moveSubmitting ? "正在移动..." : "确认移动"}
              </ControlButton>
            </div>
          </div>
        )}
      />

      <ConfirmDialog
        open={pendingDeleteFlashcard !== null}
        title="确认删除这张记忆卡？"
        description="删除后将同时清除这张卡的复习安排和历史记录。"
        confirmText="确认删除"
        cancelText="取消"
        loading={deleteFlashcardSubmitting}
        onCancel={() => setPendingDeleteFlashcard(null)}
        onConfirm={handleDeleteFlashcard}
      />
      <ConfirmDialog
        open={pendingBulkDeleteFlashcardIds !== null}
        title="确认批量删除这些记忆卡？"
        description={`删除后将同时清除 ${pendingBulkDeleteFlashcardIds?.length ?? 0} 张卡片的复习安排和历史记录。`}
        confirmText="确认删除"
        cancelText="取消"
        loading={deleteFlashcardSubmitting}
        onCancel={() => setPendingBulkDeleteFlashcardIds(null)}
        onConfirm={handleDeleteFlashcardsBulk}
      />
      <ConfirmDialog
        open={pendingDeleteDeck !== null}
        title="确认删除这个牌组？"
        description="删除后会同时移除该牌组下的所有卡片及其复习安排和历史记录。"
        confirmText="确认删除"
        cancelText="取消"
        loading={deleteFlashcardSubmitting}
        onCancel={() => setPendingDeleteDeck(null)}
        onConfirm={handleDeleteDeck}
      />
    </>
  );
}
