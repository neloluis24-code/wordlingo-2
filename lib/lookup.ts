import type { WordEntry } from "./types";

export type DefineResult =
  | { ok: true; entry: WordEntry }
  | { ok: false; error: string };

export async function lookupWord(query: string): Promise<DefineResult> {
  const res = await fetch("/api/define", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = (await res.json().catch(() => null)) as DefineResult | { error?: string } | null;
  if (!data || typeof data !== "object") {
    return { ok: false, error: "Lookup failed. Try again." };
  }
  if ("ok" in data && data.ok) return data;
  if ("ok" in data && !data.ok) return data;
  return { ok: false, error: (data as { error?: string }).error || "Lookup failed. Try again." };
}
