"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Loader2, Search, X } from "lucide-react";
import { ALL, FEATURED, W, suggest } from "@/lib/words";
import { useApp } from "@/lib/store";
import { lookupWord } from "@/lib/lookup";
import type { WordEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

export function Home({
  onOpen,
  looking,
  setLooking,
  setPending,
}: {
  onOpen: (e: WordEntry) => void;
  looking: boolean;
  setLooking: (v: boolean) => void;
  setPending: (v: string) => void;
}) {
  const saved = useApp((s) => s.saved);
  const cache = useApp((s) => s.cache);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const extra = useMemo(
    () => Object.keys(cache).filter((k) => !ALL.includes(k)),
    [cache],
  );
  const sug = q.trim() ? suggest(q, extra) : [];

  const runLocal = (word: string) => {
    const key = word.toLowerCase().trim();
    const e = W[key] ?? cache[key];
    if (e) {
      onOpen(e);
      setQ("");
      setErr("");
    }
  };

  const lookup = async (raw: string) => {
    const word = raw.trim();
    if (!word) return;
    const key = word.toLowerCase();
    const local = W[key] ?? cache[key];
    if (local) {
      onOpen(local);
      setQ("");
      setErr("");
      return;
    }
    setErr("");
    setPending(word);
    setLooking(true);
    try {
      const res = await lookupWord(word);
      if (res.ok) {
        onOpen(res.entry);
        setQ("");
      } else {
        setErr(res.error);
      }
    } catch {
      setErr("Lookup failed. Try again.");
    } finally {
      setLooking(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (sug[0]) runLocal(sug[0]);
      else lookup(q);
    }
  };

  return (
    <div className="min-h-dvh bg-bg px-5 pb-[130px] font-sans">
      <header className="animate-fu pt-[72px] pb-8 text-center">
        <p className="text-[12px] font-bold tracking-[0.18em] text-accent uppercase">
          WordLingo
          <span className="ml-2 rounded-full bg-pill px-2 py-0.5 text-[10px] tracking-[0.12em]">
            2.0
          </span>
        </p>
        <h1 className="font-display mt-2 text-[38px] leading-[1.05] font-semibold tracking-[-0.03em] text-fg">
          A living lexicon
        </h1>
        <p className="mx-auto mt-3 max-w-[34ch] text-[15px] leading-relaxed text-muted">
          Search any English word or phrase. Curated entries, the public dictionary, and Grok for the rest.
        </p>
      </header>

      <div className="animate-fu relative" style={{ animationDelay: "80ms" }}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-[20px] border px-4 transition-[background-color,border-color,box-shadow] duration-200",
            q
              ? "border-border bg-card shadow-[0_8px_28px_rgb(22_21_19/0.06)]"
              : "border-transparent bg-inp",
          )}
        >
          <Search className="size-[18px] shrink-0 text-fg/40" strokeWidth={2} />
          <input
            ref={ref}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setErr("");
            }}
            onKeyDown={onKey}
            placeholder="word, slang, or a whole phrase"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-14 min-w-0 flex-1 bg-transparent text-[16px] text-fg outline-none placeholder:text-muted/70"
          />
          {q ? (
            <button
              type="button"
              aria-label="Clear"
              onClick={() => {
                setQ("");
                setErr("");
                ref.current?.focus();
              }}
              className="flex size-8 items-center justify-center rounded-full text-muted"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        {sug.length > 0 ? (
          <div className="mt-2 overflow-hidden rounded-[20px] border border-border bg-card">
            {sug.map((w) => {
              const entry = W[w] ?? cache[w];
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => runLocal(w)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-inp"
                >
                  <Search className="size-3.5 shrink-0 text-fg/30" />
                  <span className="flex-1 text-[16px] font-medium text-fg">{entry?.w ?? w}</span>
                  <span className="text-[12px] text-muted">{entry?.pos ?? ""}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {q.trim() && sug.length === 0 ? (
          <button
            type="button"
            disabled={looking}
            onClick={() => lookup(q)}
            className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-accent text-[15px] font-semibold text-accent-fg transition-transform duration-150 active:scale-[0.98] disabled:opacity-70"
          >
            {looking ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {looking ? "Looking it up…" : `Look up “${q.trim()}”`}
          </button>
        ) : null}
      </div>

      {err ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-[color-mix(in_oklab,var(--color-danger)_25%,transparent)] bg-[color-mix(in_oklab,var(--color-danger)_8%,transparent)] px-4 py-3 text-[14px] leading-snug text-danger"
        >
          {err}
        </div>
      ) : null}

      {!q.trim() ? (
        <>
          <div className="animate-fu mt-9" style={{ animationDelay: "150ms" }}>
            <p className="mb-3 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
              Featured
            </p>
            <div className="flex flex-wrap gap-2">
              {FEATURED.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => runLocal(w)}
                  className="rounded-full bg-pill px-3.5 py-2 text-[13px] font-medium text-accent transition-transform duration-150 active:scale-[0.96]"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {saved.length > 0 ? (
            <div className="mt-8">
              <p className="mb-3 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
                Recently saved
              </p>
              <div className="flex flex-col gap-2">
                {saved.slice(0, 3).map((s) => (
                  <button
                    key={s.word}
                    type="button"
                    onClick={() => onOpen(s.entry)}
                    className="rounded-lg border border-border bg-card px-4 py-3.5 text-left"
                  >
                    <div className="text-[16px] font-semibold text-fg">{s.word}</div>
                    <div className="mt-0.5 text-[13px] text-muted">{s.short}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
