"use client";

import { useState } from "react";
import { Bookmark, Search, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import type { WordEntry } from "@/lib/types";

export function Saved({ onOpen }: { onOpen: (e: WordEntry) => void }) {
  const saved = useApp((s) => s.saved);
  const unsave = useApp((s) => s.unsave);
  const [q, setQ] = useState("");
  const l = q.toLowerCase();
  const list = saved.filter(
    (s) => !l || s.word.toLowerCase().includes(l) || s.short.toLowerCase().includes(l),
  );

  return (
    <div className="min-h-dvh bg-bg px-5 pt-14 pb-[140px] font-sans">
      <h2 className="animate-fu text-[32px] font-extrabold tracking-[-0.03em] text-fg">Saved</h2>
      <p className="mt-1 text-[14px] text-muted">
        {saved.length} word{saved.length !== 1 ? "s" : ""} in your lexicon
      </p>

      <div className="mt-5 flex items-center gap-3 rounded-[20px] bg-inp px-4">
        <Search className="size-4 text-fg/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your words"
          className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-muted/70"
        />
      </div>

      {saved.length === 0 ? (
        <div className="px-4 pt-16 text-center">
          <Bookmark className="mx-auto size-10 text-muted/40" />
          <p className="mt-4 text-[16px] font-semibold text-fg">Nothing saved yet</p>
          <p className="mt-1 text-[14px] text-muted">
            Open a word and tap the bookmark to keep it.
          </p>
        </div>
      ) : list.length === 0 ? (
        <p className="pt-16 text-center text-[14px] text-muted">No matches in your saved words.</p>
      ) : (
        <div className="mt-5 flex flex-col gap-2.5">
          {list.map((s) => (
            <div
              key={s.word}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5"
            >
              <button
                type="button"
                onClick={() => onOpen(s.entry)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="text-[17px] font-semibold text-fg">{s.word}</div>
                <div className="mt-0.5 line-clamp-2 text-[13px] text-muted">{s.short}</div>
                <div className="mt-1.5 text-[11px] font-medium tracking-wide text-muted/80 uppercase">
                  {s.col} · {s.date}
                </div>
              </button>
              <button
                type="button"
                aria-label={`Remove ${s.word}`}
                onClick={() => unsave(s.word)}
                className="flex size-10 shrink-0 items-center justify-center rounded-md text-muted hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
