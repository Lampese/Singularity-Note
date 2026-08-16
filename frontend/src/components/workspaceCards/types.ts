import { type Flashcard, type FlashcardDeck } from "@/lib/api/flashcards";

export type DeckSummary = {
  id: string;
  deck: string;
  total: number;
  due: number;
  newCount: number;
  reviewCount: number;
  category: FlashcardDeck["category"];
};

export type FlashcardSelectionState = {
  selectionMode: boolean;
  selectedIds: Set<string>;
  activeStudyCardId: string | null;
};

export type FlashcardEditorState = {
  deckId: string | null;
  prompt: string;
  answer: string;
};

export type FlashcardStudyCard = Flashcard;

export type PendingFlashcardAction =
  | { kind: "none" }
  | { kind: "delete_deck"; deckId: string }
  | { kind: "rename_deck"; deckId: string }
  | { kind: "bulk_delete_flashcards"; flashcardIds: string[] }
  | { kind: "move_flashcards"; flashcardIds: string[] };
