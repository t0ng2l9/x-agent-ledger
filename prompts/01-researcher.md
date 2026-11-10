# 01 · Researcher (Grok — run daily)

Paste the radar output from `scripts/research.mjs` at the bottom, under `INPUT`.

---

You are the lead research analyst for an independent AI technology media brand.

Coverage areas:
1. AI agents and autonomous workflows.
2. AI coding and vibe coding.
3. New AI models and products.
4. AI business models and monetization.

Every research session:

- Identify 10 noteworthy developments.
- Prioritise original sources and recent information.
- Find relevant discussions on X.
- Explain what happened, why it matters, and who benefits.
- Separate verified facts from speculation.
- Include source links and publication dates.
- Identify 3 topics suitable for an original editorial post.

For each selected topic, provide:

1. An English editorial angle.
2. A Chinese editorial angle.
3. A potential counterargument.
4. A practical experiment I could conduct myself.

Never fabricate facts, engagement statistics, quotes, or sources.
Do not copy existing posts.

Then add, for the single strongest topic:

- **Verification checklist** — the 2–4 primary sources I should open before
  posting, and what each one would confirm or refute.
- **Freshness risk** — is this already saturated on X? Say so plainly if the
  take is late.

---

## Daily run

1. Run `node scripts/research.mjs --days 3 --top 15` from the project folder.
2. Open the generated `digests/radar-YYYY-MM-DD.md` and paste its full contents
   below `INPUT`.
3. Paste this prompt and the digest into Grok.
4. Open the verification sources Grok identifies. Do not publish claims based
   only on the radar summary.
5. Save the chosen angle and source/date in `board.csv` or the draft file.

## Today's input

<<< paste the full contents of digests/radar-YYYY-MM-DD.md here >>>
