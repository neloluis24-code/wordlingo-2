# WordLingo 2.0

A living lexicon — search any English word, slang, idiom, or short phrase.

This is a **new public project**. The original WordLingo (`neloluis24-code/wordlingo`) stays private. Same product, rebuilt so it can be deployed from here.

## What it does

- Curated WordLingo entries for a core lexicon
- Public English dictionary for everything else
- Optional Grok / OpenAI enrichment (US vs UK usage, examples, etymology)
- Save words into collections
- Dark mode, auto-save, slow pronunciation
- Runs in the browser — saved words stay on the device (`localStorage`)

## Deploy on Vercel

1. Import **this** public repo in [Vercel](https://vercel.com/new)
2. Framework: Next.js (auto-detected)
3. Optional env vars in Project Settings:
   - `XAI_API_KEY` — Grok enrichment
   - or `OPENAI_API_KEY` — same enrichment via OpenAI
4. Deploy

Without an AI key, dictionary lookups still work. Curated words work offline in the app.

## Local

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` if you want AI enrichment.

## Version

| | |
|---|---|
| **2.0** (this repo) | Public Next.js app — dictionary + Grok, collections, no accounts required |
| **1.x** (private) | Original Next.js app with user accounts and an admin dashboard |
