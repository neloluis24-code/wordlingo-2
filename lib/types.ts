export type WordEntry = {
  w: string;
  ph: string;
  pos: string;
  d: string[];
  ex: string[];
  us: string;
  uk: string;
  syn: string[];
  fact: string;
  source?: "lexicon" | "dictionary" | "ai";
};

export type SavedWord = {
  word: string;
  short: string;
  date: string;
  col: string;
  entry: WordEntry;
};

export type Collection = {
  id: number;
  name: string;
  emoji: string;
  col: string;
};

export type PageId = "home" | "result" | "saved" | "collections" | "settings";
