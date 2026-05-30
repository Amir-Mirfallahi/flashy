"use client";

import { FlashcardProvider } from "./lib/flashcards";

export function Providers({ children }: { children: React.ReactNode }) {
  return <FlashcardProvider>{children}</FlashcardProvider>;
}
