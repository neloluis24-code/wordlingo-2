"use client";

import { useRef, useState, type PointerEvent } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { COL_COLORS, COL_MARKS, hexToRgb } from "@/lib/words";
import { useApp } from "@/lib/store";
import type { Collection, WordEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

function ColModal({
  title,
  nm,
  setNm,
  em,
  setEm,
  co,
  setCo,
  onSave,
  onClose,
  saveLabel,
}: {
  title: string;
  nm: string;
  setNm: (v: string) => void;
  em: string;
  setEm: (v: string) => void;
  co: string;
  setCo: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
  saveLabel: string;
}) {
  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[rgb(0_0_0/0.5)]"
        onClick={onClose}
      />
      <div className="absolute right-0 bottom-0 left-0 mx-auto max-w-[480px] rounded-t-xl border border-border bg-card pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="flex justify-center pt-3">
          <div className="h-1 w-9 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <h3 className="text-[22px] font-extrabold tracking-tight text-fg">{title}</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-inp text-fg"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="px-6 pb-5">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex size-14 items-center justify-center rounded-lg text-[22px] font-semibold text-white"
              style={{ background: co }}
            >
              {em || "✦"}
            </div>
            <input
              value={nm}
              onChange={(e) => setNm(e.target.value)}
              placeholder="Collection name"
              className="h-14 min-w-0 flex-1 rounded-lg bg-inp px-4 text-[16px] text-fg outline-none"
            />
          </div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.1em] text-muted uppercase">Mark</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {COL_MARKS.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => setEm(x)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-md text-[16px] transition-colors",
                  em === x ? "bg-accent text-accent-fg" : "bg-inp text-fg",
                )}
              >
                {x}
              </button>
            ))}
          </div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.1em] text-muted uppercase">Color</p>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {COL_COLORS.map((x) => (
              <button
                key={x}
                type="button"
                aria-label={x}
                onClick={() => setCo(x)}
                className={cn(
                  "size-8 rounded-full",
                  co === x && "ring-2 ring-fg ring-offset-2 ring-offset-card",
                )}
                style={{ background: x }}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={!nm.trim()}
            onClick={onSave}
            className="h-14 w-full rounded-lg bg-accent text-[16px] font-semibold text-accent-fg disabled:opacity-40"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

type Drag = {
  id: number;
  ghostX: number;
  ghostY: number;
  offsetX: number;
  offsetY: number;
  w: number;
  h: number;
};

export function Collections({ onOpen }: { onOpen: (e: WordEntry) => void }) {
  const dark = useApp((s) => s.dark);
  const saved = useApp((s) => s.saved);
  const cols = useApp((s) => s.cols);
  const setCols = useApp((s) => s.setCols);
  const [sel, setSel] = useState<Collection | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [nm, setNm] = useState("");
  const [em, setEm] = useState("✦");
  const [co, setCo] = useState("#2F6FED");
  const [drag, setDrag] = useState<Drag | null>(null);
  const pressTimer = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const pageBg = dark
    ? "linear-gradient(160deg, #0c1018 0%, #101018 55%, #0c1210 100%)"
    : "linear-gradient(160deg, #d7e2f4 0%, #ebe4d8 100%)";

  const clearPress = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const onPagePressStart = () => {
    if (sel) return;
    clearPress();
    pressTimer.current = window.setTimeout(() => setEditMode(true), 700);
  };

  const createCol = () => {
    if (!nm.trim()) return;
    setCols((p) => [
      ...p,
      { id: Date.now(), name: nm.trim(), emoji: em || "✦", col: co },
    ]);
    setShowNew(false);
  };

  const saveEdit = () => {
    if (!nm.trim() || !editing) return;
    const oldName = editing.name;
    const nextName = nm.trim();
    setCols((p) =>
      p.map((x) =>
        x.id === editing.id ? { ...x, name: nextName, emoji: em || "✦", col: co } : x,
      ),
    );
    if (oldName !== nextName) {
      useApp.setState({
        saved: useApp.getState().saved.map((s) =>
          s.col === oldName ? { ...s, col: nextName } : s,
        ),
      });
    }
    setEditing(null);
  };

  const onCardPointerDown = (e: PointerEvent<HTMLDivElement>, cl: Collection) => {
    if (!editMode) return;
    e.stopPropagation();
    clearPress();
    const r = e.currentTarget.getBoundingClientRect();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setDrag({
      id: cl.id,
      ghostX: r.left,
      ghostY: r.top,
      offsetX: e.clientX - r.left,
      offsetY: e.clientY - r.top,
      w: r.width,
      h: r.height,
    });
  };

  const onGridMove = (e: PointerEvent) => {
    if (!drag) return;
    e.preventDefault();
    const ghostX = e.clientX - drag.offsetX;
    const ghostY = e.clientY - drag.offsetY;
    setDrag((d) => (d ? { ...d, ghostX, ghostY } : d));
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-cid]");
    let closest: number | null = null;
    let dist = Infinity;
    cards.forEach((card) => {
      const cid = Number(card.dataset.cid);
      if (cid === drag.id) return;
      const r = card.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      if (d < dist) {
        dist = d;
        closest = cid;
      }
    });
    if (closest != null && dist < drag.w * 0.8) {
      setCols((prev) => {
        const arr = [...prev];
        const fi = arr.findIndex((x) => x.id === drag.id);
        const ti = arr.findIndex((x) => x.id === closest);
        if (fi < 0 || ti < 0 || fi === ti) return prev;
        const [item] = arr.splice(fi, 1);
        arr.splice(ti, 0, item);
        return arr;
      });
    }
  };

  if (sel) {
    const words = saved.filter((s) => s.col === sel.name);
    return (
      <div
        className="min-h-dvh pb-[140px] font-sans"
        style={{ background: pageBg }}
      >
        <div
          className="px-5 pt-14 pb-7"
          style={{
            background: `linear-gradient(160deg, ${sel.col}dd, ${sel.col}88)`,
          }}
        >
          <button
            type="button"
            aria-label="Back"
            onClick={() => setSel(null)}
            className="mb-5 flex size-10 items-center justify-center rounded-md border border-white/30 bg-white/20 text-white backdrop-blur-sm"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="mb-2 text-[48px] leading-none text-white">{sel.emoji}</div>
          <h2 className="text-[30px] font-extrabold tracking-[-0.02em] text-white">{sel.name}</h2>
          <p className="mt-1 text-[14px] text-white/70">
            {words.length} word{words.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="p-5">
          {words.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-3 text-[40px]">{sel.emoji}</div>
              <p className="text-[16px] font-semibold text-fg">No words here yet</p>
              <p className="mt-1 text-[14px] text-muted">
                Save a word and choose this collection.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {words.map((s) => (
                <button
                  key={s.word}
                  type="button"
                  onClick={() => onOpen(s.entry)}
                  className="flex items-center justify-between rounded-xl border border-white/20 px-[18px] py-4 text-left"
                  style={{
                    background: `rgba(${hexToRgb(sel.col)}, 0.22)`,
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <div>
                    <div className="text-[18px] font-bold text-white">{s.word}</div>
                    <div className="mt-0.5 text-[13px] text-white/70">{s.short}</div>
                  </div>
                  <span className="ml-3 shrink-0 text-[12px] text-white/50">{s.date}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const draggedCol = drag ? cols.find((x) => x.id === drag.id) : null;

  return (
    <div
      className="min-h-dvh pb-[140px] font-sans"
      style={{ background: pageBg }}
      onPointerDown={onPagePressStart}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
    >
      {editMode ? (
        <div className="pointer-events-none fixed inset-0 z-[5] bg-black/40 backdrop-blur-[2px]" />
      ) : null}

      <div className={cn("relative px-5 pt-14", editMode ? "z-10" : "z-[1]")}>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-[32px] font-extrabold tracking-[-0.03em] text-white [text-shadow:0_2px_12px_rgb(0_0_0/0.3)]">
            Collections
          </h2>
          {editMode ? (
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setDrag(null);
              }}
              className="rounded-md border border-white/35 bg-white/20 px-5 py-2 text-[14px] font-bold text-white backdrop-blur-sm"
            >
              Done
            </button>
          ) : null}
        </div>
        <p className="mb-5 text-[13px] text-white/65 [text-shadow:0_1px_4px_rgb(0_0_0/0.3)]">
          {editMode
            ? "Drag to reorder  ·  × to delete  ·  tap to edit"
            : "Hold anywhere to edit  ·  tap to open"}
        </p>

        <div
          ref={gridRef}
          onPointerMove={onGridMove}
          onPointerUp={() => setDrag(null)}
          className="grid grid-cols-2 gap-3.5"
        >
          {cols.map((cl) => {
            const n = saved.filter((s) => s.col === cl.name).length;
            const isDragging = drag?.id === cl.id;
            return (
              <div
                key={cl.id}
                data-cid={cl.id}
                className="relative"
                style={{ opacity: isDragging ? 0.25 : 1 }}
              >
                {editMode ? (
                  <button
                    type="button"
                    aria-label={`Delete ${cl.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCols((p) => p.filter((x) => x.id !== cl.id));
                    }}
                    className="absolute -top-2.5 -left-2.5 z-20 flex size-7 items-center justify-center rounded-full border-2 border-white/50 bg-[rgb(10_10_20/0.85)] text-[16px] font-bold text-white"
                  >
                    ×
                  </button>
                ) : null}
                <div
                  onPointerDown={(e) => onCardPointerDown(e, cl)}
                  onClick={() => (editMode ? (setEditing(cl), setNm(cl.name), setEm(cl.emoji), setCo(cl.col)) : setSel(cl))}
                  className={cn(
                    "flex min-h-[150px] cursor-pointer flex-col justify-between rounded-[22px] border p-5 pt-5",
                    editMode && !isDragging && "animate-wiggle",
                  )}
                  style={{
                    background: `rgba(${hexToRgb(cl.col)}, ${dark ? 0.32 : 0.28})`,
                    borderColor: `rgba(255,255,255,${dark ? 0.15 : 0.38})`,
                    boxShadow: `0 8px 32px rgba(${hexToRgb(cl.col)}, 0.35), inset 0 1px 0 rgba(255,255,255,0.25)`,
                    backdropFilter: "blur(24px)",
                    transformOrigin: "50% 50%",
                  }}
                >
                  <div className="text-[34px] leading-none text-white">{cl.emoji}</div>
                  <div>
                    <div className="text-[32px] leading-none font-extrabold text-white tabular-nums [text-shadow:0_2px_10px_rgb(0_0_0/0.25)]">
                      {n}
                    </div>
                    <div className="mt-0.5 text-[11px] font-medium tracking-wide text-white/65">
                      word{n !== 1 ? "s" : ""}
                    </div>
                    <div className="mt-2 text-[14px] leading-snug font-bold text-white">
                      {cl.name}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              clearPress();
            }}
            onClick={(e) => {
              e.stopPropagation();
              setNm("");
              setEm("✦");
              setCo("#2F6FED");
              setShowNew(true);
            }}
            className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed bg-white/10"
            style={{
              borderColor: `rgba(255,255,255,${dark ? 0.2 : 0.45})`,
            }}
          >
            <span className="flex size-[42px] items-center justify-center rounded-full bg-white/20 text-white">
              <Plus className="size-5" />
            </span>
            <span className="text-[13px] font-semibold text-white/60">New</span>
          </button>
        </div>
      </div>

      {drag && draggedCol ? (
        <div
          className="pointer-events-none fixed z-[1000] flex flex-col justify-between rounded-[22px] p-5"
          style={{
            left: drag.ghostX,
            top: drag.ghostY,
            width: drag.w,
            height: drag.h,
            transform: "scale(1.07) rotate(3deg)",
            background: `rgba(${hexToRgb(draggedCol.col)}, 0.9)`,
            border: "1px solid rgba(255,255,255,0.4)",
            boxShadow: `0 24px 64px rgba(${hexToRgb(draggedCol.col)}, 0.6), 0 8px 32px rgb(0 0 0 / 0.4)`,
          }}
        >
          <div className="text-[34px] text-white">{draggedCol.emoji}</div>
          <div>
            <div className="text-[32px] font-extrabold text-white">
              {saved.filter((s) => s.col === draggedCol.name).length}
            </div>
            <div className="text-[11px] text-white/65">words</div>
            <div className="mt-2 text-[14px] font-bold text-white">{draggedCol.name}</div>
          </div>
        </div>
      ) : null}

      {showNew ? (
        <ColModal
          title="New collection"
          nm={nm}
          setNm={setNm}
          em={em}
          setEm={setEm}
          co={co}
          setCo={setCo}
          onSave={createCol}
          onClose={() => setShowNew(false)}
          saveLabel="Create collection"
        />
      ) : null}
      {editing ? (
        <ColModal
          title="Edit collection"
          nm={nm}
          setNm={setNm}
          em={em}
          setEm={setEm}
          co={co}
          setCo={setCo}
          onSave={saveEdit}
          onClose={() => setEditing(null)}
          saveLabel="Save changes"
        />
      ) : null}
    </div>
  );
}
