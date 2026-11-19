# Agent Ledger — desktop kit

A working version of the plan you drafted on your phone, rebuilt so it runs on
this machine. Same strategy. The difference is that research, scoring, the
30-day schedule, and the prompt library are now files and commands instead of
a chat you have to scroll back through.

**You are in the UK**, so all four revenue channels in your plan are open to
you, including the X reward programme. No region workarounds needed anywhere.

---

## Quick start

```powershell
cd <repo>

# 1. today's topic radar
node scripts\research.mjs --days 3 --top 15

# or just double-click / run:
.\run.ps1

# check a post's length before publishing
node scripts\check-posts.mjs posts-01-10.md

# re-render the avatar / banner / cards after editing an SVG
.\scripts\render-assets.ps1
```

Output lands in `digests\radar-YYYY-MM-DD.md` — open it, pick a
topic, paste the handoff block at the bottom into Grok.

Requirements: Node 18+ (you have v24). No installs, no dependencies.

The publishing scripts (`x-*.mjs`) are the one optional exception: they need an
X developer app's client_id and one OAuth login, both stored in `secrets/`.
Everything else — radar, character counting, asset rendering, board generation —
runs with no accounts and no keys at all. Publishing stays off until you pass
`--yes`; see `auto-publish.md` before you turn it on.

---

## What's in here

```
X/
├─ README.md                  this file
├─ AGENTS.md                  project memory — auto-loaded each new session
├─ launch-checklist.md        day 1–3: identity, visuals, first post
├─ reference-accounts.md     30-account research list and rationale
├─ visual-spec.md             palette, type, and the layout rules that test well
├─ posts-01-10.md             posts 1-10, EN + CN, with sources
├─ posts-11-13.md             posts 11-13, written from primary sources
├─ posts-14-17.md             posts 14-17 (nesformer / ChatGPT ATO / Cloudflare / Boom)
├─ posts-18-20.md             posts 18-20 (WebGPU test / LFM3 / ghost students)
├─ tool-test-01-webgpu.md     the WebGPU test: method, raw numbers, what it does not prove
├─ auto-publish.md            X API publishing: setup, usage, cost, and the rule it conflicts with
├─ thread-01-octoverse.md     thread 1: the 40% number, read properly
├─ thread-02-spawn.md         thread 2: hourly shipping at Spawn
├─ thread-03-local-763b.md    thread 3: 763B on a laptop
├─ thread-04-trust-boundaries.md  thread 4: three incidents, one pattern
├─ tests/                     reproducible runs (webgpu-repeat.html + headless driver)
├─ board.csv                  30-day schedule + topic/asset/metrics, 11-02 → 12-01
├─ run.ps1                    one-command daily radar
├─ source-plan-phone.md       your original phone plan, kept for reference
├─ assets/
│  ├─ avatar.svg / .png       400×400 profile picture
│  ├─ banner.svg / .png       1500×500 header
│  ├─ card-octoverse.svg/.png 1600x900 post image (post 3, thread 1)
│  ├─ card-cursor.svg/.png    1600x900 post image (post 2)
│  ├─ card-763b.svg/.png      1600x900 post image (post 13, thread 3)
│  └─ card-webgpu.svg/.png    1600x900 post image (post 18)
├─ prompts/
│  ├─ 00-brand-and-voice.md   paste once per session, sets voice + bilingual rule
│  ├─ 01-researcher.md        Grok: daily research → 3 angles + counterargument
│  ├─ 02-editor-post.md       single post, EN + CN + thread outline
│  ├─ 03-reply-writer.md      the 5-replies-a-day routine
│  ├─ 04-thread-architect.md  long-form thread structure
│  └─ 05-analyst-weekly.md    Sunday review, reads board.csv
├─ digests/                   radar output, one md + one json per day
├─ secrets/                   client_id + OAuth token; gitignored, never leaves this machine
└─ scripts/
   ├─ research.mjs            the radar (zero deps)
   ├─ feeds.json              source list — edit this, it's yours
   ├─ check-posts.mjs         weighted character count against X's 280 limit
   ├─ render-assets.ps1       SVG → PNG for every asset
   ├─ gen-board.mjs           regenerates board.csv (only if you change the plan)
   ├─ x-auth.mjs              one-time OAuth 2.0 PKCE login → secrets/x-token.json
   ├─ publish-config.json     timezone the slot times mean (Europe/London)
   ├─ x-post.mjs              publish one post / a thread / a board row (dry run by default)
   └─ x-schedule.mjs          publish every row that is due today, write status back
```

This folder is the project. Work here from now on;
everything the kit needs is inside it and no path points outside.

---

## The daily loop

| When | What | Tool |
|---|---|---|
| morning | `node scripts\research.mjs --days 3` | terminal |
| morning | paste digest into `prompts/01` | Grok |
| midday | `prompts/02` → English post, edit by hand | ChatGPT / Grok |
| midday | rewrite (not translate) into 中文 | yourself |
| midday | 5 substantive replies | X |
| evening | log impressions / likes / profile clicks | `board.csv` |
| any time | preview what is due today (never publishes) | `node scripts\x-schedule.mjs --due` |

45–60 minutes. If it runs longer, the research step is too slow — tighten
`feeds.json` rather than writing more.

---

## Moving from phone to desktop: what actually changes

**Faster on desktop**

- Research. On the phone you ask Grok "what happened today" and trust it. Here
  you scan 11 primary sources, score them against your four coverage areas, and
  hand Grok a *list with links and dates*. That kills the main failure mode of
  AI-assisted media: confident posts built on a hallucinated or week-old story.
- Drafting. Long threads, side-by-side EN/CN editing, and character counting
  are all worse on a phone keyboard.
- Data. `board.csv` opens in Excel/Numbers. You can compute profile-clicks-per-
  impression in one column instead of eyeballing it.
- Assets. Canva desktop, real screenshots, actual tool testing on your own
  machine — the "实际工具测试" item in your plan is not really doable on a phone.

**Still manual, on purpose**

- Final publish. The default stays manual for month one: your plan records that
  X's reward programme excludes automated posting, and the programme is paying
  for original human judgement. The tooling to publish via API is built and
  working (see `auto-publish.md`), but it is off by default — every command is
  a dry run until you add `--yes`, and turning it on is a decision for you, not
  a default.
- Replies. Automating replies is the single fastest way to a limited account.
- Fact-checking. The radar gives you links; it does not verify claims. Open the
  source before you post. `prompts/01` asks Grok for a verification checklist
  for exactly this reason.

**New on desktop, not in the phone plan**

- `scripts/research.mjs` — the radar. This is the piece that was missing: your
  phone plan told you to "scan AI news" but gave you no mechanism.
- `board.csv` with per-post metric columns and `profile_clicks` separated from
  `likes`. Likes are vanity; profile clicks are what convert to follows.
- `prompts/03` — your plan says 5 quality replies a day but gives no prompt for
  them. This one refuses to produce "Great point".

---

## UK-specific notes

**Reward programme.** The UK is on the supported list, so the Original Content
Rewards path is genuinely available. Practical sequence:

1. Premium subscription (required for eligibility) — do this when you're
   committed, not on day 1.
2. 500 verified followers + 500k qualified impressions in a rolling 90 days.
   At 2 posts/day this is a multi-month target, not a 30-day one. Don't let it
   drive month-one decisions.
3. Stripe account + identity verification. Set this up early even though payout
   is far off — it's the step that stalls people later.

**Tax.** Affiliate commissions, digital product sales, and platform payouts are
self-employment income. Register as self-employed with HMRC once you're trading
(the deadline is by 5 October after the end of the tax year in which you
started). Digital products sold to EU customers can trigger VAT registration
thresholds — worth checking before you sell at volume, not after. I'm not your
accountant; this is the "don't get surprised in month 8" note.

**Pricing.** Your plan's $5–29 range is fine, but you're selling to a mostly
US audience while sitting in the UK — price in USD, and remember Stripe/Gumroad
fees plus FX eat into small tickets. A $9 product nets roughly $7.50.

---

## Honest read on the plan

Three things I'd change, having built the tooling:

1. **The 30-day revenue target is too generous for the content volume.** 27
   English posts + 27 Chinese posts in a month, from a cold account, with no
   existing audience, will not reliably produce paying customers. Your own
   "conservative: $0" is the realistic base case. Treat the first month as
   *audience proof*, and move the first paid product to month two — the plan
   already puts the PDF at day 15, which leaves only two weeks of list-building
   before you ask for money. Better: free PDF at day 15, paid pack at day 35.
2. **Bilingual doubles the work and halves the compounding.** 27 posts in
   English build one audience; 27 split across two languages build two weak
   ones. Your plan says 70/30 EN/CN — that's the right instinct, but the daily
   board currently gives CN equal weight. If you feel the load in week two, drop
   the Chinese post to 3×/week rather than dropping the English one.
3. **`实际工具测试` is the actual moat.** Everyone can summarize news with Grok.
   Almost nobody publishes a real test with real numbers. Your board has 7 of
   these; that's the number I'd protect when you're short on time.

---

## If something breaks

- **A feed stops working** → it's listed under `blocked` in `feeds.json` with
  the reason. TechCrunch, VentureBeat and Hacker News actively block datacenter
  IPs; use Grok or the web UI for those.
- **Radar returns nothing** → run with `--days 7`. Feeds are bursty.
- **Everything scores low** → your `feeds.json` is too narrow. Add a source
  from a different tag (vendor / media / community / launch).
- **You want to see the numbers** → `--json` prints the scored list.



