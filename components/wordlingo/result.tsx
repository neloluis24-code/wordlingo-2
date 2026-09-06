"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Lightbulb,
  Quote,
  Tags,
  Volume2,
} from "lucide-react";
import type { WordEntry } from "@/lib/types";
import { useApp } from "@/lib/store";
import { SectionCard } from "./ui";
import { cn } from "@/lib/cn";

function speak(word: string, slow: boolean) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = "en-US";
  u.rate = slow ? 0.7 : 1;
  window.speechSynthesis.speak(u);
}

function sourceLabel(src?: WordEntry["source"]) {
  if (src === "lexicon") return "WordLingo lexicon";
  if (src === "dictionary") return "Public dictionary";
  if (src === "ai") return "Dictionary + Grok";
  return "WordLingo";
}

export function Result() {
  const entry = useApp((s) => s.entry);
  const saved = useApp((s) => s.saved);
  const cols = useApp((s) => s.cols);
  const slow = useApp((s) => s.slowSpeech);
  const goHome = useApp((s) => s.goHome);
  const saveToCol = useApp((s) => s.saveToCol);
  const unsave = useApp((s) => s.unsave);
  const [pulse, setPulse] = useState(false);
  const [picker, setPicker] = useState(false);

  if (!entry) return null;

  const savedEntry = saved.find((s) => s.word === entry.w);
  const isSaved = Boolean(savedEntry);

  const bump = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
  };

  return (
    <div className="min-h-dvh bg-bg pb-[140px] font-sans">
      <div className="flex items-center gap-3 px-5 pt-14">
        <button
          type="button"
          aria-label="Back"
          onClick={goHome}
          className="flex size-10 items-center justify-center rounded-md border border-border bg-card text-fg transition-transform duration-150 active:scale-[0.96]"
        >
          <ArrowLeft className="size-4" />
        </button>
        <span className="text-[12px] font-bold tracking-[0.08em] text-muted uppercase">
          {sourceLabel(entry.source)}
        </span>
      </div>

      <div className="animate-fu px-5 pt-6">
        <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em] text-fg">
          {entry.w}
        </h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {entry.ph ? (
            <span className="text-[16px] text-muted italic">{entry.ph}</span>
          ) : null}
          <button
            type="button"
            aria-label="Pronounce"
            onClick={() => speak(entry.w, slow)}
            className="flex size-8 items-center justify-center rounded-full bg-pill text-accent"
          >
            <Volume2 className="size-4" />
          </button>
          <span className="rounded-full bg-pill px-2.5 py-1 text-[11px] font-bold tracking-wide text-accent uppercase">
            {entry.pos}
          </span>
          {isSaved ? (
            <span className="rounded-full bg-[rgb(16_185_129/0.12)] px-2.5 py-1 text-[11px] font-semibold text-[#059669]">
              Saved · {savedEntry?.col}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3.5 px-5">
        <SectionCard label="Definition" icon={<BookOpen className="size-4" />} delay={40}>
          {entry.d.map((def, i) => (
            <p
              key={i}
              className={cn("text-[16px] leading-relaxed text-fg", i > 0 && "mt-3")}
            >
              {def}
            </p>
          ))}
        </SectionCard>

        <SectionCard label="Real-life usage" icon={<Quote className="size-4" />} delay={80}>
          <div className="flex flex-col gap-3">
            {entry.ex.map((ex, i) => (
              <p
                key={i}
                className="border-l-[3px] border-accent pl-3 text-[15px] leading-relaxed text-fg"
              >
                {ex}
              </p>
            ))}
          </div>
        </SectionCard>

        {(entry.us || entry.uk) && (
          <SectionCard label="Casual usage" icon={<Quote className="size-4" />} delay={120}>
            <div className="flex flex-col gap-3">
              {entry.us ? (
                <div>
                  <div className="text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
                    American
                  </div>
                  <p className="mt-1 text-[15px] leading-relaxed text-fg">{entry.us}</p>
                </div>
              ) : null}
              {entry.uk ? (
                <div>
                  <div className="text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
                    British
                  </div>
                  <p className="mt-1 text-[15px] leading-relaxed text-fg">{entry.uk}</p>
                </div>
              ) : null}
            </div>
          </SectionCard>
        )}

        {entry.fact ? (
          <SectionCard label="Did you know?" icon={<Lightbulb className="size-4" />} delay={160}>
            <p className="text-[16px] leading-relaxed text-fg">{entry.fact}</p>
          </SectionCard>
        ) : null}

        {entry.syn.length > 0 ? (
          <SectionCard label="Synonyms" icon={<Tags className="size-4" />} delay={200}>
            <div className="flex flex-wrap gap-2">
              {entry.syn.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-inp px-3 py-1.5 text-[13px] font-medium text-fg"
                >
                  {s}
                </span>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>

      <div
        className="fixed z-50"
        style={{
          right: "max(1.5rem, calc(50vw - 240px + 1.5rem))",
          bottom: "6rem",
        }}
      >
        <button
          type="button"
          aria-label={isSaved ? "Unsave" : "Save"}
          onClick={() => {
            bump();
            if (isSaved) unsave(entry.w);
            else setPicker(true);
          }}
          className={cn(
            "flex size-[58px] items-center justify-center rounded-full text-accent-fg shadow-[0_10px_28px_rgb(47_111_237/0.35)] transition-transform duration-150 active:scale-[0.96]",
            isSaved ? "bg-[#059669]" : "bg-accent",
            pulse && "animate-fab",
          )}
        >
          {isSaved ? <BookmarkCheck className="size-6" /> : <Bookmark className="size-6" />}
        </button>
      </div>

      {picker ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-[rgb(0_0_0/0.45)]"
            onClick={() => setPicker(false)}
          />
          <div className="absolute right-0 bottom-0 left-0 mx-auto max-w-[480px] rounded-t-xl border border-border bg-card pb-[max(20px,env(safe-area-inset-bottom))]">
            <div className="flex justify-center pt-3">
              <div className="h-1 w-9 rounded-full bg-border" />
            </div>
            <div className="px-6 pt-4 pb-2">
              <h3 className="text-[20px] font-bold tracking-tight text-fg">Save to collection</h3>
              <p className="mt-1 text-[13px] text-muted">Where should this word live?</p>
            </div>
            <div className="max-h-[50vh] overflow-y-auto px-3 pb-3">
              {cols.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => {
                    bump();
                    saveToCol(col.name);
                    setPicker(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-inp"
                >
                  <div
                    className="flex size-11 items-center justify-center rounded-md text-[18px] font-semibold text-white"
                    style={{ background: col.col }}
                  >
                    {col.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-semibold text-fg">{col.name}</div>
                    <div className="text-[12px] text-muted">
                      {saved.filter((s) => s.col === col.name).length} words
                    </div>
                  </div>
                  {savedEntry?.col === col.name ? (
                    <span className="text-[12px] font-semibold text-accent">Current</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
