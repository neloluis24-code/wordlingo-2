"use client";

export function LookupLoading({ query }: { query: string }) {
  return (
    <div className="fixed inset-0 z-[45] bg-[var(--wl-desk)]">
      <div className="mx-auto min-h-dvh max-w-[480px] bg-bg px-5 pt-16 pb-[140px]">
        <p className="text-[12px] font-bold tracking-[0.16em] text-accent uppercase">Looking up</p>
        <h1 className="font-display mt-2 text-[34px] leading-tight font-semibold tracking-[-0.03em] text-fg">
          {query}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Checking the public dictionary, then asking Grok to write it in WordLingo form.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
          <div className="h-28 animate-pulse rounded-xl border border-border bg-card" />
          <div className="h-24 animate-pulse rounded-xl border border-border bg-card" />
        </div>
      </div>
    </div>
  );
}
