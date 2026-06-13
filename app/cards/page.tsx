"use client";

import { useMemo, useState } from "react";
import { AppFrame } from "../components/AppFrame";
import { useFlashcards } from "../lib/flashcards";

export default function CardsPage() {
  const { cards, allTags, allWordTypes } = useFlashcards();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [wordType, setWordType] = useState("all");
  const [boxFilter, setBoxFilter] = useState<string | number>("all");

  const filteredCards = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return cards.filter((card) => {
      const matchesQuery =
        !needle ||
        card.front.toLowerCase().includes(needle) ||
        card.back.toLowerCase().includes(needle);
      const matchesTag = tag === "all" || card.tags?.includes(tag);
      const matchesType = wordType === "all" || card.word_type === wordType;
      const matchesBox = boxFilter === "all" || card.box === boxFilter;
      return matchesQuery && matchesTag && matchesType && matchesBox;
    });
  }, [cards, query, tag, wordType, boxFilter]);

  return (
    <AppFrame>
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
          Browser
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Cards</h1>
      </header>

      <section className="sticky top-0 z-10 -mx-5 mb-4 border-b border-slate-200 bg-slate-50/95 px-5 pb-4 pt-1 backdrop-blur">
        <label className="block">
          <span className="sr-only">Search cards</span>
          <input
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search front or back"
            value={query}
          />
        </label>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <select
            className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
            onChange={(event) => setWordType(event.target.value)}
            value={wordType}
          >
            <option value="all">All types</option>
            {allWordTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
            onChange={(event) => setTag(event.target.value)}
            value={tag}
          >
            <option value="all">All tags</option>
            {allTags.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className="h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
            onChange={(event) => setBoxFilter(event.target.value === "all" ? "all" : Number(event.target.value))}
            value={boxFilter}
          >
            <option value="all">All boxes</option>
            {[1, 2, 3, 4, 5].map((box) => (
              <option key={box} value={box}>
                Box {box}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="mb-3 flex items-center justify-between text-sm font-bold text-slate-500">
        <span>{filteredCards.length} shown</span>
        <span>{cards.length} total</span>
      </div>

      <section className="space-y-3">
        {filteredCards.map((card) => (
          <article
            key={card.id}
            className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-black text-slate-950">
                  {card.front}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">
                  {card.back}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBoxFilter(card.box)}
                className={`shrink-0 rounded-2xl bg-indigo-50 px-3 py-2 text-center transition active:scale-[0.95] ${
                  boxFilter === card.box ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-wide text-indigo-500">
                  Box
                </p>
                <p className="text-xl font-black text-indigo-700">
                  {card.box}
                </p>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {card.word_type ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {card.word_type}
                </span>
              ) : null}
              {(card.tags ?? []).slice(0, 3).map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </AppFrame>
  );
}
