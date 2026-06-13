"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppFrame } from "../../components/AppFrame";
import { useFlashcards } from "../../lib/flashcards";

export default function NewCardPage() {
  const router = useRouter();
  const { addCard, allTags } = useFlashcards();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [wordType, setWordType] = useState("");
  const [example, setExample] = useState("");
  const [exampleTranslation, setExampleTranslation] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) {
      alert("Please fill in both front and back fields");
      return;
    }

    addCard({
      front: front.trim(),
      back: back.trim(),
      word_type: wordType.trim() || undefined,
      example: example.trim() || undefined,
      example_translation: exampleTranslation.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });

    router.push("/cards");
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <AppFrame>
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
          New Card
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Add Card</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-500">
              Front
            </span>
            <input
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xl font-black text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              onChange={(e) => setFront(e.target.value)}
              placeholder="Enter front text"
              value={front}
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-slate-500">
              Back
            </span>
            <input
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xl font-black text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              onChange={(e) => setBack(e.target.value)}
              placeholder="Enter back text"
              value={back}
              required
            />
          </label>
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-500">
              Word Type (optional)
            </span>
            <input
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-lg font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              onChange={(e) => setWordType(e.target.value)}
              placeholder="e.g., noun, verb, adjective"
              value={wordType}
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-slate-500">
              Example (optional)
            </span>
            <input
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-lg font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              onChange={(e) => setExample(e.target.value)}
              placeholder="Example sentence"
              value={example}
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-slate-500">
              Example Translation (optional)
            </span>
            <input
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-lg font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              onChange={(e) => setExampleTranslation(e.target.value)}
              placeholder="Translation of example"
              value={exampleTranslation}
            />
          </label>
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <span className="mb-2 block text-sm font-bold text-slate-500">
            Tags (optional)
          </span>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-emerald-900 hover:text-emerald-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <select
              className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 flex-1"
              onChange={(e) => {
                const tag = e.target.value;
                if (tag && !selectedTags.includes(tag)) {
                  setSelectedTags([...selectedTags, tag]);
                }
              }}
              value=""
            >
              <option value="" disabled>
                Select existing tag
              </option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="h-10 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add new tag"
              value={newTag}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="min-h-10 rounded-2xl bg-indigo-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition active:scale-[0.97] active:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </section>

        <button
          className="min-h-16 w-full rounded-3xl bg-emerald-600 px-4 text-xl font-black text-white shadow-lg shadow-emerald-600/20 transition active:scale-[0.98] active:bg-emerald-700 disabled:opacity-40"
          disabled={!front.trim() || !back.trim()}
          type="submit"
        >
          Save Card
        </button>
      </form>
    </AppFrame>
  );
}
