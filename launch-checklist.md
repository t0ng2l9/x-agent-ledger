# Agent Ledger — launch checklist (day 1–3)

Everything here is a *decision you make once*, so that from day 4 you only
produce content. Do not skip to posting.

---

## Day 1 · Identity

**Name decision.** The plan originally recommended `Agent Dispatch`. The selected brand is `Agent Ledger`; before committing,
check availability in this order — the handle matters more than the display name:

1. Open `x.com/<handle>` in a private window. A 404 with "This account doesn't
   exist" = free. A suspended/withheld notice = taken.

   **Checked live on 2026-11-02** (HTTP 404 = free, 200 = taken):

   | handle | status | who has it |
   |---|---|---|
   | `agentdispatch` | **taken** | Multi-Agent Mastery |
   | `agent_dispatch` | **taken** | Agent Dispatch (a non-coder AI-news account) |
   | `dispatchagent` | taken | Truck Dispatch Agent |
   | `agentdispatchhq` | **free** | — |
   | `agentdispatch_` | **free** | — |
   | `agent_dispatch_` | **free** | — |
   | `agentdispatchdaily` | **free** | — |
   | `agentbrief` | taken | Agent Brief |
   | `dispatchai` | taken | Dispatch AI |
   | `agentledger` | **free** | — |

2. Take `agentdispatchhq` first — it keeps the brand wordmark intact and reads
   as "HQ", not as a bot suffix. `agentdispatch_` is the fallback. Note that
   `@agent_dispatch` already exists and covers almost exactly this beat
   ("AI news for people who create with AI — no code required"), so the display
   name `Agent Dispatch` will look like a knock-off next to it. Either lean on
   "HQ" in the display name too, or use `AgentLedger` as the brand.
3. **Do not** add random digits (`agentdispatch2847`) — it reads as a bot and
   costs you trust on day one.

**Display name:** `Agent Ledger`
**Handle:** whatever you secured above

**Bio** (≤160 chars, paste as-is):

```
Tracking the frontier of AI.
Tools, agents, workflows & the business of AI.
Researching what works. Testing what matters. EN / 中文
```

**Profile setup** — the images already exist, just upload them:
- [x] Avatar: `assets\avatar.png` (400×400)
- [x] Banner: `assets\banner.png` (1500×500)
- [x] Location: your real location (see the region note in README)
- [x] Website: leave empty until the resource page exists (day 16). A dead link
      is worse than no link.
- [x] Pinned post: none until you have a thread worth pinning.

---

## Day 1 · Visual system

**Account registered:** `@agentledger` (user confirmed 2026-11-02).

Profile setup status:

Keep it boring and repeatable. You are not designing a magazine; you are
building something you can produce in 10 minutes at 11pm.

| Element | Spec |
|---|---|
| Base | near-black `#0B0D10` |
| Text | `#F2F4F7` |
| Accent (one only) | `#4ADE80` (signal green) or `#F5A524` (amber) — pick one, never both |
| Muted | `#8A94A6` |
| Display type | Inter / Geist / IBM Plex Sans, Bold |
| Body type | same family, Regular |
| Card size | 1600×900 (16:9) for infographics, 1200×675 for link cards |
| Logo | wordmark `AGENT LEDGER` in caps, letterspaced, or the ledger avatar mark |

**Do:** one number, one label, lots of empty space.
**Don't:** gradients, glow, 3D robots, stock photos of people at laptops,
screenshots with the browser chrome visible.

Avatar: three ledger lines plus a closing chevron, accent green on
near-black. At 32×32 the accent still covers 7.91% of the frame, which is the
threshold where the shape stays recognisable in a reply thread.

Banner: wordmark left, tagline under it, hairline rule running to a right-
aligned `EN / 中文 · EST. 2026` block. The bottom-left 230×210 is deliberately
empty — X draws the avatar there.

Details and the testing rules are in `visual-spec.md`.

---

## Day 1 · Research base

- [ ] Create the Notion database (or just use `board.csv` in Excel/Numbers —
      do not let tooling become the project)
- [ ] Columns: `date, day, phase, slot, type, deliverable, est_min, status,
      impressions, likes, profile_clicks, link_clicks, notes`
- [x] Compile 30 unique reference accounts with reasons in `reference-accounts.md`. Target mix:
      - 8 AI company / lab accounts
      - 8 indie AI builders shipping in public
      - 8 AI reviewers / tool testers
      - 6 agent / automation practitioners
- [x] Reasons are recorded per entry in `reference-accounts.md`. An
      account you can't justify is an account you'll copy by accident.

---

## Day 2 · Topic bank

- [ ] Run `node scripts/research.mjs --days 5 --top 20` three times over the
      next three days; append to a `topics` note
- [ ] You need 20 candidates, each with: source link, date, your one-line angle
- [ ] Kill any topic where you cannot state the angle in one sentence

---

## Day 3 · Production loop rehearsal

- [ ] Write **one** English post and **one** Chinese post end to end, using
      `prompts/01` → `prompts/02`. There are already 10 pairs in
      `posts-01-10.md` — use those as the calibration reference instead of
      starting from a blank page
- [ ] Time it. If the pair takes more than 40 minutes, the bottleneck is the
      research step, not the writing — fix that first
- [ ] Post the English one. Yes, on day 3, before you feel ready. You need to
      see the composer, the character counter, and how your own post looks in
      the timeline before you build a system around it
- [ ] Log it in `board.csv` even though it's off-schedule

**Day 3 exit criteria:** account is live, one post is published, and you know
exactly how long one post takes you.

> **Schedule note.** `board.csv` puts the first published post on **2026-11-05
> (day 4)**, not day 3 — days 1–3 are build-only rows. The "post on day 3"
> above is the rehearsal in this checklist; the board is what the publishing
> scripts read. If you rehearse on 11-04, mark that row `skipped` so the
> scheduler does not treat 11-05 as a first post on a cold account.

---

## The daily loop from day 4 (target: 45–60 min)

```
morning   10 min  node scripts/research.mjs --days 3
          10 min  prompts/01 (Grok) → pick 1 topic, note the angle
midday    15 min  prompts/02 → EN post, edit by hand, publish
          10 min  中文帖 rewritten for CN readers, publish
          10 min  5 replies using prompts/03 on accounts from your list
evening    5 min  fill in impressions / likes / profile_clicks in board.csv
```

The 5 replies are not optional. A new account with zero replies gets no
distribution, regardless of content quality.

---

## What not to do in month one

- Do not open a second account. The plan is explicit about this and it's right.
- Do not buy Premium for reach until you have 30 posts of data. Premium helps
  distribution; it does not fix positioning.
- Do not use a scheduler for the *first* month. Posting by hand keeps you in
  the timeline, where you see what's working.
- Do not automate replies or follows. That's the fastest route to a limited
  account, and it disqualifies you from the reward programme you're aiming at.

