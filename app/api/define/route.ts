import { NextResponse } from "next/server";
import type { WordEntry } from "@/lib/types";

export const runtime = "nodejs";

type DictSense = {
  word: string;
  phonetic: string;
  pos: string;
  definitions: string[];
  examples: string[];
  synonyms: string[];
};

async function fetchPublicDictionary(query: string): Promise<DictSense | null> {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`,
      { signal: AbortSignal.timeout(7000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{
      word?: string;
      phonetic?: string;
      phonetics?: { text?: string }[];
      meanings?: Array<{
        partOfSpeech?: string;
        definitions?: Array<{
          definition?: string;
          example?: string;
          synonyms?: string[];
        }>;
        synonyms?: string[];
      }>;
    }>;
    const first = data[0];
    if (!first) return null;
    const meanings = first.meanings ?? [];
    const definitions: string[] = [];
    const examples: string[] = [];
    const synonyms: string[] = [];
    for (const m of meanings) {
      for (const d of m.definitions ?? []) {
        if (d.definition && definitions.length < 3) definitions.push(d.definition);
        if (d.example && examples.length < 3) examples.push(d.example);
        for (const s of d.synonyms ?? []) {
          if (synonyms.length < 6 && !synonyms.includes(s)) synonyms.push(s);
        }
      }
      for (const s of m.synonyms ?? []) {
        if (synonyms.length < 6 && !synonyms.includes(s)) synonyms.push(s);
      }
    }
    if (definitions.length === 0) return null;
    const phonetic = first.phonetic || first.phonetics?.find((p) => p.text)?.text || "";
    return {
      word: first.word || q,
      phonetic,
      pos: meanings[0]?.partOfSpeech || "word",
      definitions,
      examples,
      synonyms,
    };
  } catch {
    return null;
  }
}

function fromDictionary(dict: DictSense): WordEntry {
  return {
    w: dict.word,
    ph: dict.phonetic || "",
    pos: dict.pos,
    d: dict.definitions,
    ex: dict.examples.length
      ? dict.examples
      : [`People use "${dict.word}" in everyday English with this sense.`],
    us: "Common in American English. Usage varies by region and register.",
    uk: "Understood across British English. Formality depends on context.",
    syn: dict.synonyms,
    fact: "Sourced from the public English dictionary. Open this again later and Grok can enrich the cultural notes if AI is available.",
    source: "dictionary",
  };
}

const SYSTEM = `You are WordLingo, a sharp, culturally literate English lexicon.
The user submits a word, slang term, idiom, or short phrase.
Return ONLY a JSON object. No markdown.

If the query is a real English word, idiom, slang, or a phrase that actually means something:
{
  "ok": true,
  "entry": {
    "w": "canonical written form",
    "ph": "/ipa pronunciation/",
    "pos": "noun|verb|adjective|adverb|phrase|idiom|slang|interjection",
    "d": ["primary definition", "optional second sense"],
    "ex": ["natural example sentence.", "second example.", "third example."],
    "us": "How Americans actually say or use this in casual speech.",
    "uk": "How British speakers actually say or use this.",
    "syn": ["five", "near", "synonyms", "or", "paraphrases"],
    "fact": "One surprising etymology, origin, or cultural fact. One or two sentences."
  }
}

If the query is gibberish, a random character dump, or does not make sense as language:
{ "ok": false, "reason": "Short, plain explanation that this is not a real word or phrase." }

Voice: precise, warm, a little literary. Avoid contractions. Do not moralize. Do not invent fake citations. Prefer public-dictionary senses when they are provided as context. For slang and idioms, explain the real current meaning, not a naive literal reading.`;

function parseAiJson(text: string): {
  ok: boolean;
  entry?: WordEntry;
  reason?: string;
} | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1].trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as {
      ok: boolean;
      entry?: WordEntry;
      reason?: string;
    };
  } catch {
    return null;
  }
}

function sanitizeEntry(entry: WordEntry, fallbackWord: string, source: WordEntry["source"]): WordEntry {
  const w = (entry.w || fallbackWord).trim().slice(0, 80);
  const d = (entry.d || []).map((x) => String(x).trim()).filter(Boolean).slice(0, 3);
  const ex = (entry.ex || []).map((x) => String(x).trim()).filter(Boolean).slice(0, 3);
  const syn = (entry.syn || []).map((x) => String(x).trim()).filter(Boolean).slice(0, 6);
  return {
    w,
    ph: String(entry.ph || "").slice(0, 80),
    pos: String(entry.pos || "word").slice(0, 32),
    d: d.length ? d : ["A word or phrase in English."],
    ex: ex.length ? ex : [`I used ${w} in a sentence.`],
    us: String(entry.us || "").slice(0, 400),
    uk: String(entry.uk || "").slice(0, 400),
    syn,
    fact: String(entry.fact || "").slice(0, 500),
    source,
  };
}

function aiProvider(): { url: string; key: string; model: string } | null {
  const xai = process.env.XAI_API_KEY;
  if (xai) {
    return { url: "https://api.x.ai/v1/chat/completions", key: xai, model: "grok-4.5" };
  }
  const openai = process.env.OPENAI_API_KEY;
  if (openai) {
    return {
      url: "https://api.openai.com/v1/chat/completions",
      key: openai,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }
  return null;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { query?: string };
  const query = String(body.query ?? "").trim();
  if (query.length < 1) {
    return NextResponse.json({ ok: false, error: "Enter a word or phrase." }, { status: 400 });
  }
  if (query.length > 160) {
    return NextResponse.json({ ok: false, error: "Keep it under 160 characters." }, { status: 400 });
  }

  const dict = await fetchPublicDictionary(query);
  const provider = aiProvider();

  if (!provider) {
    if (dict) return NextResponse.json({ ok: true, entry: fromDictionary(dict) });
    return NextResponse.json({
      ok: false,
      error: "No dictionary entry for that, and AI lookup is not configured. Set XAI_API_KEY or OPENAI_API_KEY.",
    });
  }

  const user = dict
    ? `Query: ${JSON.stringify(query)}\n\nPublic dictionary context (prefer these senses, then add US/UK usage, examples if thin, synonyms, and a fact):\n${JSON.stringify(dict)}`
    : `Query: ${JSON.stringify(query)}\n\nNo public-dictionary hit. If this is a real idiom, slang, name of a concept, or phrase that native speakers would recognize, define it. If it is nonsense, return ok:false.`;

  try {
    const res = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.key}`,
      },
      body: JSON.stringify({
        model: provider.model,
        temperature: 0.35,
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      if (dict) return NextResponse.json({ ok: true, entry: fromDictionary(dict) });
      return NextResponse.json({ ok: false, error: `Lookup failed (${res.status}). Try again in a moment.` });
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = payload.choices?.[0]?.message?.content ?? "";
    const parsed = parseAiJson(text);

    if (parsed?.ok && parsed.entry) {
      return NextResponse.json({
        ok: true,
        entry: sanitizeEntry(parsed.entry, dict?.word || query, dict ? "ai" : "ai"),
      });
    }

    if (parsed && parsed.ok === false) {
      return NextResponse.json({
        ok: false,
        error: parsed.reason || "That does not look like a real word or phrase.",
      });
    }

    if (dict) return NextResponse.json({ ok: true, entry: fromDictionary(dict) });
    return NextResponse.json({ ok: false, error: "Could not parse a definition. Try a simpler word." });
  } catch {
    if (dict) return NextResponse.json({ ok: true, entry: fromDictionary(dict) });
    return NextResponse.json({ ok: false, error: "Lookup failed. Check the spelling and try again." });
  }
}
