"use client";

import { Bookmark, FolderOpen, Search, Settings } from "lucide-react";
import type { PageId } from "@/lib/types";
import { cn } from "@/lib/cn";

const TABS: { id: PageId; icon: typeof Search; label: string }[] = [
  { id: "home", icon: Search, label: "Search" },
  { id: "saved", icon: Bookmark, label: "Saved" },
  { id: "collections", icon: FolderOpen, label: "Library" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function Nav({
  page,
  go,
}: {
  page: PageId;
  go: (p: PageId) => void;
}) {
  return (
    <nav
      className="fixed bottom-5 left-1/2 z-40 w-[min(440px,calc(100%-32px))] -translate-x-1/2 rounded-xl border border-border bg-nav p-1.5 shadow-[0_12px_40px_rgb(22_21_19/0.12)] backdrop-blur-xl"
      style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex">
        {TABS.map((t) => {
          const active = page === t.id || (page === "result" && t.id === "home");
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 transition-colors duration-150"
            >
              <Icon
                className={cn("size-[18px]", active ? "text-accent" : "text-fg/40")}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span
                className={cn(
                  "text-[10px] tracking-wide",
                  active ? "font-bold text-accent" : "font-medium text-muted",
                )}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
