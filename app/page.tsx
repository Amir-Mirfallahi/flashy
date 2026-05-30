"use client";

import { useMemo, useRef, useState } from "react";
import { AppFrame } from "./components/AppFrame";
import { TrackedFlashcard, useFlashcards } from "./lib/flashcards";

export default function Home() {
  const { meta, cards, dueCards, boxCounts, answerCard, initialized } =
    useFlashcards();
  const [flipped, setFlipped] = useState(false);
  const touchStart = useRef<number | null>(null);
  const currentCard = dueCards[0];

  const dueLabel = initialized ? dueCards.length : 0;
  const totalCards = cards.length;

  const handleAnswer = (card: TrackedFlashcard, remembered: boolean) => {
    answerCard(card.id, remembered);
    setFlipped(false);
  };

  return (
    <AppFrame>
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Flashy
          </p>
          <h1 className="mt-2 text-2xl font-black leading-tight text-slate-950">
            {meta.source}
          </h1>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm ring-1 ring-slate-200">
          <p className="text-2xl font-black text-slate-950">{dueLabel}</p>
          <p className="text-xs font-semibold text-slate-500">due today</p>
        </div>
      </header>

      <section className="mb-6 rounded-[2rem] bg-slate-950 p-4 text-white shadow-xl shadow-slate-950/15">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Deck Progress</p>
            <p className="text-xs text-slate-300">{totalCards} cards stored</p>
          </div>
          <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            5 boxes
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {boxCounts.map((count, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white/10 p-2 text-center ring-1 ring-white/8"
            >
              <div className="mx-auto mb-2 flex h-14 items-end justify-center rounded-xl bg-white/8 p-1">
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-emerald-300 to-indigo-300"
                  style={{
                    height: `${Math.max(
                      12,
                      totalCards ? (count / totalCards) * 100 : 12,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] font-bold text-slate-300">
                Box {index + 1}
              </p>
              <p className="text-lg font-black">{count}</p>
            </div>
          ))}
        </div>
      </section>

      {currentCard ? (
        <StudyCard
          card={currentCard}
          flipped={flipped}
          onFlip={() => setFlipped(true)}
          onForgot={() => handleAnswer(currentCard, false)}
          onRemembered={() => handleAnswer(currentCard, true)}
          onTouchStart={(x) => {
            touchStart.current = x;
          }}
          onTouchEnd={(x) => {
            if (touchStart.current === null) return;
            const delta = x - touchStart.current;
            touchStart.current = null;
            if (delta < -60) handleAnswer(currentCard, false);
            if (delta > 60) handleAnswer(currentCard, true);
          }}
        />
      ) : (
        <AllCaughtUp />
      )}
    </AppFrame>
  );
}

function StudyCard({
  card,
  flipped,
  onFlip,
  onForgot,
  onRemembered,
  onTouchStart,
  onTouchEnd,
}: {
  card: TrackedFlashcard;
  flipped: boolean;
  onFlip: () => void;
  onForgot: () => void;
  onRemembered: () => void;
  onTouchStart: (x: number) => void;
  onTouchEnd: (x: number) => void;
}) {
  const badges = useMemo(
    () => [card.word_type, ...(card.tags ?? []).slice(0, 2)].filter(Boolean),
    [card.tags, card.word_type],
  );

  return (
    <section className="flex flex-1 flex-col justify-between gap-5">
      <button
        className="card-3d min-h-[25rem] w-full rounded-[2rem] text-left transition active:scale-[0.985]"
        onClick={onFlip}
        onTouchStart={(event) => onTouchStart(event.changedTouches[0].clientX)}
        onTouchEnd={(event) => onTouchEnd(event.changedTouches[0].clientX)}
        type="button"
      >
        <div
          className={`card-3d-inner relative h-full min-h-[25rem] ${
            flipped ? "is-flipped" : ""
          }`}
        >
          <div className="card-face absolute inset-0 flex flex-col rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-200 ring-1 ring-slate-200">
            <BadgeRow badges={badges} />
            <div className="flex flex-1 items-center justify-center text-center">
              <h2 className="text-5xl font-black leading-tight text-slate-950">
                {card.front}
              </h2>
            </div>
            <p className="text-center text-sm font-semibold text-slate-400">
              Tap to reveal
            </p>
          </div>

          <div className="card-face card-back absolute inset-0 flex flex-col rounded-[2rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-900 p-6 text-white shadow-2xl shadow-indigo-950/25">
            <BadgeRow badges={badges} inverse />
            <div className="flex flex-1 flex-col justify-center gap-5">
              <h2 className="text-center text-4xl font-black leading-tight">
                {card.back}
              </h2>
              {card.example ? (
                <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-base font-semibold text-white">
                    {card.example}
                  </p>
                  {card.example_translation ? (
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {card.example_translation}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </button>

      <div
        className={`grid grid-cols-2 gap-3 transition ${
          flipped
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <button
          className="min-h-16 rounded-3xl bg-rose-600 px-4 text-lg font-black text-white shadow-lg shadow-rose-600/20 transition active:scale-[0.97] active:bg-rose-700"
          onClick={onForgot}
          type="button"
        >
          Forgot
        </button>
        <button
          className="min-h-16 rounded-3xl bg-emerald-600 px-4 text-lg font-black text-white shadow-lg shadow-emerald-600/20 transition active:scale-[0.97] active:bg-emerald-700"
          onClick={onRemembered}
          type="button"
        >
          Remembered
        </button>
      </div>
    </section>
  );
}

function BadgeRow({
  badges,
  inverse = false,
}: {
  badges: (string | undefined)[];
  inverse?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={badge}
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            inverse ? "bg-white/12 text-white" : "bg-indigo-50 text-indigo-700"
          }`}
        >
          {badge}
        </span>
      ))}
    </div>
  );
}

function AllCaughtUp() {
  return (
    <section className="flex flex-1 items-center justify-center">
      <div className="w-full rounded-[2rem] bg-white p-8 text-center shadow-xl shadow-slate-200 ring-1 ring-slate-200">
        <div className="mx-auto mb-7 grid h-28 w-28 place-items-center rounded-full bg-emerald-50">
          <div className="relative h-16 w-16">
            {[0, 1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className="celebrate-dot absolute h-4 w-4 rounded-full bg-indigo-500"
                style={{
                  left: `${20 + dot * 10}%`,
                  top: `${dot % 2 ? 10 : 48}%`,
                  animationDelay: `${dot * 120}ms`,
                  backgroundColor: dot % 2 ? "#10b981" : "#6366f1",
                }}
              />
            ))}
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-950">All caught up!</h2>
        <p className="mt-3 text-base leading-7 text-slate-500">
          Nothing is due right now. Your future self has a little more room to
          breathe.
        </p>
      </div>
    </section>
  );
}
