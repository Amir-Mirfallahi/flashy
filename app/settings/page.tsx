"use client";

import { ChangeEvent, useState } from "react";
import { AppFrame } from "../components/AppFrame";
import { useFlashcards } from "../lib/flashcards";

export default function SettingsPage() {
  const {
    meta,
    cards,
    importDeck,
    reverseAllCards,
    resetProgress,
    settings,
    remainingToday,
    setDailyCardLimit,
  } = useFlashcards();
  const [jsonText, setJsonText] = useState("");
  const [status, setStatus] = useState("");

  const handleImport = () => {
    try {
      const payload = JSON.parse(jsonText);
      const result = importDeck(payload);
      const message = `Imported ${result.imported} new cards and updated ${result.updated} existing cards.`;
      setStatus(message);
      window.alert(message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not import that JSON.";
      setStatus(message);
      window.alert(message);
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setJsonText(String(reader.result ?? ""));
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset Flashy and remove all imported cards and progress?",
    );
    if (!confirmed) return;
    resetProgress();
    setJsonText("");
    setStatus("Progress reset.");
  };

  return (
    <AppFrame>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
          Management
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Settings</h1>
      </header>

      <section className="mb-5 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-bold text-slate-500">Current Deck</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          {meta.source}
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-2xl font-black text-slate-950">
              {cards.length}
            </p>
            <p className="text-xs font-bold text-slate-500">cards</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-2xl font-black text-slate-950">
              {meta.exported ?? "Local"}
            </p>
            <p className="text-xs font-bold text-slate-500">exported</p>
          </div>
        </div>
      </section>

      <section className="mb-5 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-slate-950">Daily Study</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Choose how many due cards Flashy should serve in one day.
        </p>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold text-slate-500">
            Cards per day
          </span>
          <input
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-2xl font-black text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            inputMode="numeric"
            max={500}
            min={1}
            onChange={(event) =>
              setDailyCardLimit(Number(event.target.value))
            }
            type="number"
            value={settings.dailyCardLimit}
          />
        </label>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {[10, 20, 50, 100].map((limit) => (
            <button
              className={`min-h-11 rounded-2xl px-2 text-sm font-black transition active:scale-[0.97] ${
                settings.dailyCardLimit === limit
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700 active:bg-slate-200"
              }`}
              key={limit}
              onClick={() => setDailyCardLimit(limit)}
              type="button"
            >
              {limit}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-indigo-50 p-3">
            <p className="text-2xl font-black text-indigo-700">
              {settings.reviewedToday}
            </p>
            <p className="text-xs font-bold text-indigo-500">done today</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3">
            <p className="text-2xl font-black text-emerald-700">
              {remainingToday}
            </p>
            <p className="text-xs font-bold text-emerald-600">left today</p>
          </div>
        </div>
      </section>

      <section className="mb-5 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-slate-950">Import JSON</h2>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold text-slate-500">
            Upload file
          </span>
          <input
            accept="application/json,.json"
            className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
            onChange={handleFile}
            type="file"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold text-slate-500">
            Paste payload
          </span>
          <textarea
            className="min-h-56 w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            onChange={(event) => setJsonText(event.target.value)}
            placeholder='{"meta":{"source":"Édito French Notebook"},"flashcards":[...]}'
            value={jsonText}
          />
        </label>

        <button
          className="mt-4 min-h-14 w-full rounded-3xl bg-indigo-600 px-4 text-base font-black text-white shadow-lg shadow-indigo-600/20 transition active:scale-[0.98] active:bg-indigo-700 disabled:opacity-40"
          disabled={!jsonText.trim()}
          onClick={handleImport}
          type="button"
        >
          Import
        </button>
        {status ? (
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            {status}
          </p>
        ) : null}
      </section>

      <section className="mb-5 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-slate-950">Card Management</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Tools to manage your flashcard deck.
        </p>
        <button
          className="mt-4 min-h-14 w-full rounded-3xl bg-indigo-600 px-4 text-base font-black text-white shadow-lg shadow-indigo-600/20 transition active:scale-[0.98] active:bg-indigo-700"
          onClick={() => {
            const confirmed = window.confirm(
              "Reverse all cards? This will swap the front and back of every card in your deck.",
            );
            if (confirmed) {
              reverseAllCards();
              window.alert("All cards have been reversed!");
            }
          }}
          type="button"
        >
          Reverse All Cards
        </button>
      </section>

      <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5">
        <h2 className="text-xl font-black text-rose-950">Danger Zone</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-rose-700">
          This removes the local deck and review history stored on this device.
        </p>
        <button
          className="mt-4 min-h-14 w-full rounded-3xl bg-rose-600 px-4 text-base font-black text-white shadow-lg shadow-rose-600/20 transition active:scale-[0.98] active:bg-rose-700"
          onClick={handleReset}
          type="button"
        >
          Reset Progress
        </button>
      </section>
    </AppFrame>
  );
}
