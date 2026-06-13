"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Flashcard = {
  id: string;
  type?: string;
  front: string;
  back: string;
  word_type?: string;
  example?: string;
  example_translation?: string;
  tags?: string[];
};

export type DeckMeta = {
  source: string;
  exported?: string;
  total_cards?: number;
  units_covered?: string[];
};

export type TrackedFlashcard = Flashcard & {
  box: number;
  nextReviewDate: string;
  lastReviewed: string | null;
};

type ImportPayload = {
  meta?: DeckMeta;
  flashcards?: Flashcard[];
};

type StudySettings = {
  dailyCardLimit: number;
  reviewedToday: number;
  reviewDate: string;
};

type FlashcardState = {
  meta: DeckMeta;
  cards: TrackedFlashcard[];
  settings: StudySettings;
};

type FlashcardContextValue = FlashcardState & {
  initialized: boolean;
  dueCards: TrackedFlashcard[];
  studyCards: TrackedFlashcard[];
  remainingToday: number;
  boxCounts: number[];
  allTags: string[];
  allWordTypes: string[];
  answerCard: (cardId: string, remembered: boolean) => void;
  importDeck: (payload: ImportPayload) => { imported: number; updated: number };
  addCard: (card: Omit<Flashcard, 'id'>) => void;
  reverseAllCards: () => void;
  resetProgress: () => void;
  setDailyCardLimit: (limit: number) => void;
};

const STORAGE_KEY = "flashy.deck.v1";
const DEFAULT_DAILY_CARD_LIMIT = 20;
const REVIEW_INTERVALS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 9,
  5: 16,
};

const demoMeta: DeckMeta = {
  source: "Flashy Demo Deck",
  exported: "2026-05-30",
  total_cards: 5,
  units_covered: ["Starter"],
};

const demoCards: Flashcard[] = [
  {
    id: "demo_001",
    type: "vocabulary",
    front: "pressé(e)",
    back: "in a hurry",
    word_type: "adjective",
    example: "Je suis pressée de commencer.",
    example_translation: "I am in a hurry to start.",
    tags: ["french", "adjective"],
  },
  {
    id: "demo_002",
    type: "vocabulary",
    front: "un rendez-vous",
    back: "an appointment",
    word_type: "noun",
    example: "J'ai un rendez-vous à midi.",
    example_translation: "I have an appointment at noon.",
    tags: ["french", "noun"],
  },
  {
    id: "demo_003",
    type: "vocabulary",
    front: "réussir",
    back: "to succeed",
    word_type: "verb",
    example: "Elle veut réussir son examen.",
    example_translation: "She wants to pass her exam.",
    tags: ["french", "verb"],
  },
  {
    id: "demo_004",
    type: "vocabulary",
    front: "la semaine prochaine",
    back: "next week",
    word_type: "phrase",
    tags: ["french", "time"],
  },
  {
    id: "demo_005",
    type: "vocabulary",
    front: "gentil(le)",
    back: "kind",
    word_type: "adjective",
    tags: ["french", "adjective"],
  },
];

const defaultState: FlashcardState = {
  meta: demoMeta,
  cards: seedCards(demoCards),
  settings: {
    dailyCardLimit: DEFAULT_DAILY_CARD_LIMIT,
    reviewedToday: 0,
    reviewDate: todayKey(),
  },
};

const FlashcardContext = createContext<FlashcardContextValue | null>(null);

function nowIso() {
  return new Date().toISOString();
}

function addDaysIso(box: number, from = new Date()) {
  const next = new Date(from);
  next.setDate(next.getDate() + REVIEW_INTERVALS[box]);
  return next.toISOString();
}

function clampBox(box: number) {
  return Math.min(5, Math.max(1, box));
}

function clampDailyLimit(limit: number) {
  return Math.min(500, Math.max(1, Math.round(limit || 1)));
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function generateId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function seedCards(cards: Flashcard[]): TrackedFlashcard[] {
  const createdAt = nowIso();
  return cards
    .filter((card) => card.id && card.front && card.back)
    .map((card) => ({
      ...card,
      tags: card.tags ?? [],
      box: 1,
      nextReviewDate: createdAt,
      lastReviewed: null,
    }));
}

function loadState(): FlashcardState {
  if (typeof window === "undefined") return defaultState;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;
    const parsed = JSON.parse(stored) as FlashcardState;
    if (!Array.isArray(parsed.cards)) return defaultState;
    const reviewDate = todayKey();
    const savedSettings = parsed.settings ?? defaultState.settings;
    return {
      meta: parsed.meta ?? demoMeta,
      cards: parsed.cards.map((card) => ({
        ...card,
        tags: card.tags ?? [],
        box: clampBox(card.box ?? 1),
        nextReviewDate: card.nextReviewDate ?? nowIso(),
        lastReviewed: card.lastReviewed ?? null,
      })),
      settings: {
        dailyCardLimit: clampDailyLimit(
          savedSettings.dailyCardLimit ?? DEFAULT_DAILY_CARD_LIMIT,
        ),
        reviewedToday:
          savedSettings.reviewDate === reviewDate
            ? Math.max(0, savedSettings.reviewedToday ?? 0)
            : 0,
        reviewDate,
      },
    };
  } catch {
    return defaultState;
  }
}

function validatePayload(payload: ImportPayload) {
  if (!payload || !Array.isArray(payload.flashcards)) {
    throw new Error("Expected a JSON object with a flashcards array.");
  }

  const invalid = payload.flashcards.find(
    (card) => !card?.id || !card.front || !card.back,
  );
  if (invalid) {
    throw new Error("Every flashcard needs id, front, and back fields.");
  }
}

export function FlashcardProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [state, setState] = useState<FlashcardState>(defaultState);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      setState(loadState());
      setCurrentTime(Date.now());
      setInitialized(true);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [initialized, state]);

  const dueCards = useMemo(() => {
    const now = currentTime ?? 0;
    return state.cards
      .filter((card) => new Date(card.nextReviewDate).getTime() <= now)
      .sort(
        (a, b) =>
          new Date(a.nextReviewDate).getTime() -
          new Date(b.nextReviewDate).getTime(),
      );
  }, [currentTime, state.cards]);

  const remainingToday = useMemo(
    () =>
      Math.max(
        0,
        state.settings.dailyCardLimit - state.settings.reviewedToday,
      ),
    [state.settings.dailyCardLimit, state.settings.reviewedToday],
  );

  const studyCards = useMemo(
    () => dueCards.slice(0, remainingToday),
    [dueCards, remainingToday],
  );

  const boxCounts = useMemo(
    () =>
      [1, 2, 3, 4, 5].map(
        (box) => state.cards.filter((card) => card.box === box).length,
      ),
    [state.cards],
  );

  const allTags = useMemo(
    () =>
      Array.from(new Set(state.cards.flatMap((card) => card.tags ?? []))).sort(),
    [state.cards],
  );

  const allWordTypes = useMemo(
    () =>
      Array.from(
        new Set(state.cards.map((card) => card.word_type).filter(Boolean)),
      ).sort() as string[],
    [state.cards],
  );

  const answerCard = useCallback((cardId: string, remembered: boolean) => {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        reviewedToday: current.settings.reviewedToday + 1,
        reviewDate: todayKey(),
      },
      cards: current.cards.map((card) => {
        if (card.id !== cardId) return card;
        const reviewedAt = new Date();
        const nextBox = remembered ? clampBox(card.box + 1) : 1;
        return {
          ...card,
          box: nextBox,
          lastReviewed: reviewedAt.toISOString(),
          nextReviewDate: addDaysIso(nextBox, reviewedAt),
        };
      }),
    }));
    setCurrentTime(Date.now());
  }, []);

  const setDailyCardLimit = useCallback((limit: number) => {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        dailyCardLimit: clampDailyLimit(limit),
      },
    }));
  }, []);

  const addCard = useCallback((cardData: Omit<Flashcard, 'id'>) => {
    const newCard: Flashcard = {
      id: generateId(),
      ...cardData,
    };
    const trackedCard: TrackedFlashcard = {
      ...newCard,
      tags: newCard.tags ?? [],
      box: 1,
      nextReviewDate: nowIso(),
      lastReviewed: null,
    };
    setState((current) => ({
      ...current,
      cards: [...current.cards, trackedCard],
    }));
  }, []);

  const reverseAllCards = useCallback(() => {
    setState((current) => ({
      ...current,
      cards: current.cards.map((card) => ({
        ...card,
        front: card.back,
        back: card.front,
      })),
    }));
  }, []);

  const importDeck = useCallback((payload: ImportPayload) => {
    validatePayload(payload);
    let imported = 0;
    let updated = 0;
    const existing = new Map(state.cards.map((card) => [card.id, card]));
    const incoming = seedCards(payload.flashcards ?? []);

    for (const card of incoming) {
      const saved = existing.get(card.id);
      if (saved) {
        updated += 1;
        existing.set(card.id, {
          ...saved,
          ...card,
          box: saved.box,
          nextReviewDate: saved.nextReviewDate,
          lastReviewed: saved.lastReviewed,
        });
      } else {
        imported += 1;
        existing.set(card.id, card);
      }
    }

    setState({
      meta: {
        source: payload.meta?.source || state.meta.source || "Flashy Deck",
        exported: payload.meta?.exported,
        total_cards: payload.meta?.total_cards ?? existing.size,
        units_covered: payload.meta?.units_covered,
      },
      cards: Array.from(existing.values()),
      settings: state.settings,
    });

    return { imported, updated };
  }, [state.cards, state.meta.source, state.settings]);

  const resetProgress = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      initialized,
      dueCards,
      studyCards,
      remainingToday,
      boxCounts,
      allTags,
      allWordTypes,
      answerCard,
      importDeck,
      addCard,
      reverseAllCards,
      resetProgress,
      setDailyCardLimit,
    }),
    [
      state,
      initialized,
      dueCards,
      studyCards,
      remainingToday,
      boxCounts,
      allTags,
      allWordTypes,
      answerCard,
      importDeck,
      addCard,
      reverseAllCards,
      resetProgress,
      setDailyCardLimit,
    ],
  );

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
}

export function useFlashcards() {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error("useFlashcards must be used inside FlashcardProvider.");
  }
  return context;
}
