"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionCard({
  label,
  icon,
  children,
  delay = 0,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="animate-fu rounded-xl border border-border bg-card p-[18px] pb-5 shadow-[0_2px_12px_rgb(22_21_19/0.04)] dark:shadow-none"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-3.5 flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <span className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
          {label}
        </span>
      </div>
      {children}
    </section>
  );
}

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-7 w-[50px] shrink-0 rounded-full transition-[background-color] duration-250",
        on ? "bg-accent" : "bg-inp",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] size-[22px] rounded-full bg-white shadow-[0_1px_4px_rgb(0_0_0/0.2)] transition-[left] duration-250",
          on ? "left-[25px]" : "left-[3px]",
        )}
      />
    </button>
  );
}

export function IconBtn({
  onClick,
  label,
  children,
  className,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-md border border-border bg-card text-fg transition-transform duration-150 ease-out active:scale-[0.96]",
        className,
      )}
    >
      {children}
    </button>
  );
}
