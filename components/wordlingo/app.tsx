"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import type { WordEntry } from "@/lib/types";
import { Home } from "./home";
import { Result } from "./result";
import { Saved } from "./saved";
import { Collections } from "./collections";
import { Settings } from "./settings";
import { Nav } from "./nav";
import { LookupLoading } from "./loading";

export function WordLingoApp() {
  const dark = useApp((s) => s.dark);
  const page = useApp((s) => s.page);
  const setPage = useApp((s) => s.setPage);
  const openEntry = useApp((s) => s.openEntry);
  const cacheEntry = useApp((s) => s.cacheEntry);
  const entry = useApp((s) => s.entry);
  const [looking, setLooking] = useState(false);
  const [pending, setPending] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0E0E10" : "#F4F1EA");
  }, [dark]);

  const open = (e: WordEntry) => {
    cacheEntry(e);
    openEntry(e);
  };

  const go = (p: typeof page) => {
    if (p === "result" && !entry) return;
    setPage(p);
  };

  return (
    <div className="min-h-dvh" style={{ background: "var(--wl-desk)" }}>
      <div className="relative mx-auto min-h-dvh max-w-[480px] overflow-x-hidden bg-bg shadow-[0_0_80px_rgb(22_21_19/0.08)]">
        {page === "home" && (
          <Home
            onOpen={open}
            looking={looking}
            setLooking={setLooking}
            setPending={setPending}
          />
        )}
        {page === "result" && <Result />}
        {page === "saved" && <Saved onOpen={open} />}
        {page === "collections" && <Collections onOpen={open} />}
        {page === "settings" && <Settings />}
        {looking ? <LookupLoading query={pending} /> : null}
        <Nav page={page} go={go} />
      </div>
    </div>
  );
}
