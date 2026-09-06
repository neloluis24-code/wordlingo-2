"use client";

import { ALL } from "@/lib/words";
import { useApp } from "@/lib/store";
import { Toggle } from "./ui";

export function Settings() {
  const dark = useApp((s) => s.dark);
  const setDark = useApp((s) => s.setDark);
  const autoSave = useApp((s) => s.autoSave);
  const setAutoSave = useApp((s) => s.setAutoSave);
  const slow = useApp((s) => s.slowSpeech);
  const setSlow = useApp((s) => s.setSlowSpeech);

  const rows: {
    label: string;
    desc: string;
    v: boolean;
    o: (v: boolean) => void;
  }[] = [
    { label: "Dark mode", desc: "Switch to a night theme", v: dark, o: setDark },
    { label: "Auto-save searches", desc: "Keep words as you look them up", v: autoSave, o: setAutoSave },
    { label: "Slow pronunciation", desc: "Reduced-speed playback", v: slow, o: setSlow },
  ];

  return (
    <div className="animate-fu min-h-dvh bg-bg px-5 pt-14 pb-[140px] font-sans">
      <h2 className="mb-7 text-[32px] font-extrabold tracking-[-0.03em] text-fg">Settings</h2>
      <div className="rounded-xl border border-border bg-card px-5 shadow-[0_2px_12px_rgb(22_21_19/0.05)] dark:shadow-none">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className="flex items-center justify-between py-4"
            style={{
              borderBottom: i < rows.length - 1 ? "1px solid var(--color-border)" : "none",
            }}
          >
            <div>
              <div className="text-[16px] font-medium text-fg">{r.label}</div>
              <div className="mt-0.5 text-[13px] text-muted">{r.desc}</div>
            </div>
            <Toggle on={r.v} onChange={r.o} label={r.label} />
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <div className="mb-1.5 text-[13px] font-extrabold tracking-[0.16em] text-accent uppercase">
          WordLingo 2.0
        </div>
        <div className="text-[12px] text-muted">
          A living lexicon — {ALL.length} curated words, plus any word or phrase via dictionary and Grok.
        </div>
      </div>
    </div>
  );
}
