import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Collection, PageId, SavedWord, WordEntry } from "./types";
import { DEFAULT_COLS, W, shortDef, todayLabel } from "./words";

type AppState = {
  dark: boolean;
  autoSave: boolean;
  slowSpeech: boolean;
  page: PageId;
  entry: WordEntry | null;
  saved: SavedWord[];
  cols: Collection[];
  cache: Record<string, WordEntry>;
  hydrated: boolean;
  setDark: (v: boolean) => void;
  setAutoSave: (v: boolean) => void;
  setSlowSpeech: (v: boolean) => void;
  setPage: (p: PageId) => void;
  openEntry: (e: WordEntry) => void;
  goHome: () => void;
  cacheEntry: (e: WordEntry) => void;
  saveToCol: (colName: string) => void;
  unsave: (word: string) => void;
  setCols: (fn: (prev: Collection[]) => Collection[]) => void;
  setHydrated: () => void;
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      dark: false,
      autoSave: false,
      slowSpeech: false,
      page: "home",
      entry: null,
      saved: [],
      cols: DEFAULT_COLS,
      cache: {},
      hydrated: false,
      setDark: (v) => set({ dark: v }),
      setAutoSave: (v) => set({ autoSave: v }),
      setSlowSpeech: (v) => set({ slowSpeech: v }),
      setPage: (p) => set({ page: p }),
      openEntry: (e) => {
        const next: Partial<AppState> = { entry: e, page: "result" };
        const { autoSave, saved, cols } = get();
        if (autoSave && !saved.some((s) => s.word === e.w)) {
          const col = cols[0]?.name ?? "Daily Words";
          next.saved = [
            {
              word: e.w,
              short: shortDef(e),
              date: todayLabel(),
              col,
              entry: e,
            },
            ...saved,
          ];
        }
        set(next);
      },
      goHome: () => set({ page: "home" }),
      cacheEntry: (e) => {
        const key = e.w.toLowerCase();
        const cache = { ...get().cache, [key]: e };
        const keys = Object.keys(cache);
        if (keys.length > 80) {
          for (const k of keys.slice(0, keys.length - 80)) delete cache[k];
        }
        set({ cache });
      },
      saveToCol: (colName) => {
        const entry = get().entry;
        if (!entry) return;
        const rest = get().saved.filter((s) => s.word !== entry.w);
        set({
          saved: [
            {
              word: entry.w,
              short: shortDef(entry),
              date: todayLabel(),
              col: colName,
              entry,
            },
            ...rest,
          ],
        });
      },
      unsave: (word) => set({ saved: get().saved.filter((s) => s.word !== word) }),
      setCols: (fn) => set({ cols: fn(get().cols) }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "wordlingo-v2",
      partialize: (s) => ({
        dark: s.dark,
        autoSave: s.autoSave,
        slowSpeech: s.slowSpeech,
        saved: s.saved,
        cols: s.cols,
        cache: s.cache,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export function resolveLocal(query: string): WordEntry | undefined {
  const key = query.toLowerCase().trim();
  if (!key) return undefined;
  return W[key] ?? useApp.getState().cache[key];
}
