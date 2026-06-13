# Flashy

Flashy is a mobile-first Leitner flashcard app built with Next.js App Router and Capacitor. It is designed to feel like a small native Android study app: safe-area aware layout, bottom tabs, touch-first interactions, local-only progress, and a static export that Capacitor can package into an APK.

## Features

- Study dashboard with due-card count and Leitner box progress matrix
- Double-sided 3D flashcards with tap-to-flip review flow
- Strict Leitner scheduling across boxes 1-5
- Swipe left to forget and swipe right to remember
- Vocabulary browser with search, tag filters, word-type filters, and box status
- JSON importer for deck data through paste or file upload
- LocalStorage persistence with no backend required
- Static Next.js export configured for Capacitor Android

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Capacitor 8 for Android packaging
- LocalStorage for deck and review state

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open the app at:

```text
http://localhost:3000
```

## Useful Commands

```bash
pnpm lint
pnpm build
```

`pnpm build` creates the static export in `out/`, which is the web directory used by Capacitor.

## Android Build

Build the static web app:

```bash
pnpm build
```

Sync the exported app into Android:

```bash
pnpm exec cap sync android
```

Open the Android project:

```bash
pnpm exec cap open android
```

From Android Studio, build or run the APK on an emulator/device.

## Import Format

Flashy imports a JSON payload with deck metadata and flashcards:

```json
{
  "meta": {
    "source": "Édito French Notebook",
    "exported": "2026-05-29",
    "total_cards": 198,
    "units_covered": ["Unit 6", "Unit 7"]
  },
  "flashcards": [
    {
      "id": "vocab_001",
      "type": "vocabulary",
      "front": "pressé(e)",
      "back": "in a hurry",
      "word_type": "adjective",
      "example": "Je suis pressée de commencer.",
      "example_translation": "I am in a hurry to start.",
      "tags": ["french", "edito", "adjective"]
    }
  ]
}
```

Required flashcard fields are `id`, `front`, and `back`. Optional fields such as `word_type`, `example`, `example_translation`, and `tags` improve filtering and review context.

## Leitner Rules

New cards start in Box 1 and are due immediately.

| Box | Review Interval |
| --- | --- |
| 1 | 1 day |
| 2 | 2 days |
| 3 | 4 days |
| 4 | 9 days |
| 5 | 16 days |

When a card is remembered, it moves up one box, up to Box 5. When a card is forgotten, it returns to Box 1. Each review recalculates `nextReviewDate` from the card's new box.

## Local Data

Flashy stores imported cards and progress in LocalStorage under:

```text
flashy.deck.v1
```

The Settings screen can reset this data. There is no remote backend, account system, or cloud sync.

## Project Structure

```text
app/
  components/
    AppFrame.tsx
    BottomNav.tsx
  lib/
    flashcards.tsx
  cards/page.tsx
  settings/page.tsx
  layout.tsx
  page.tsx
```

## Capacitor Notes

`next.config.ts` uses `output: "export"` and `images.unoptimized: true` so the app can be served as static files from Capacitor's Android WebView. `capacitor.config.ts` points `webDir` at `out`.
