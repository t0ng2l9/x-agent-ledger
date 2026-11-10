---
name: agent-ledger-x
description: Run Agent Ledger's X publishing and community engagement workflow: prepare and publish bilingual posts, or write and publish thoughtful bilingual replies to relevant AI creators. Use when asked to start the X skill, publish posts, or comment on X for Agent Ledger.
---

# Agent Ledger X

Use this skill only for the user's Agent Ledger account `@agentledger_` and the project in `C:\Users\刘\Desktop\X`. Answer in Chinese unless the user asks otherwise. A user request to start this skill means carry out the specific action they named; it does not authorize unrelated posts, follows, likes, or account changes.

## Choose the requested mode

- **Publish posts:** inspect the current date, `board.csv`, relevant draft files, and account timeline first. Match the requested number/topic to ready content. Publish both the English and Chinese versions for a paired post unless the user asks for one language. Chinese should be a concise, independently angled rewrite, not a literal translation. For threads, follow the thread files and language sections.
- **Cadence and duplication:** do not publish paired EN/CN versions back-to-back. Separate them by several hours where both are needed, or use a lighter Chinese cadence (about three posts per week) while the account is building an English-first audience. Avoid repeating the same link, image, and framing across adjacent posts. Use the schedule as a guide, but do not force a second post when it would be a near-duplicate.
- **Comment:** browse recent posts from the reference creators in `reference-accounts.md` and other clearly relevant AI builders/researchers. Choose posts whose subject is close to Agent Ledger. Write each reply specifically to the post, and include English and Chinese in the **same reply**. Keep the two language parts natural and concise; do not send two separate language replies.
- If a request says “several”, use judgment from the current schedule and engagement context. If it gives a count (for example 20), complete exactly that many successful posts/replies before reporting. Track confirmed sends so navigation, drafts, or failed submissions are not counted.

## Before publishing

1. Read `AGENTS.md` for project-specific rules, `board.csv` for schedule/status, the referenced draft, and any relevant `digests/` or source materials.
2. Check that claims are current as of today and backed by a verifiable primary-source link and date. Prefer timely items. Do not publish stale dated material as current; if using older research, make its date explicit and frame it as a retrospective or add a verified new development. Never invent links, quotes, metrics, or source dates.
3. Respect the project's post-writing rules: EN ≤280 characters (CJK counts as 2 and URL as 23); run `node scripts/check-posts.mjs <draft>` when checking a project draft. Keep Chinese editorially distinct. No emoji piles, hashtag piles, or empty opener.
4. Decide on hashtags per post. Add one relevant hashtag (occasionally two) only when it naturally improves topic discovery; omit hashtags when they add clutter, look like trend-chasing, or do not match how the intended audience searches. Never add tags just to game reach. Choose tags that fit each language version rather than forcing identical tags into EN and CN.
5. Verify the signed-in account is `@agentledger_` before sending if account identity is unclear. Use the X interface for manual publishing and verify each successful post in the UI. The project API scripts default to dry run; do not enable scheduling or unattended auto-publishing as part of this skill.
6. Update `board.csv` or project posting logs only when the existing workflow calls for it and the relevant entry can be identified reliably. Never mark a post published without a verified successful send.
7. Review post performance after roughly 24 hours, not only in the first minutes. Record impressions/views, profile visits, replies, reposts, and follows when available; treat view counts as non-unique. Use multiple posts before changing the content strategy based on a pattern.

## Before commenting

1. Open each candidate post and read its actual text and context. Favor recent posts; skip stale event announcements, protected posts, promotional bait, and topics where a useful, grounded reply is not possible.
2. Draft one substantive reply that adds an observation, a respectful question, or a concrete implication. Put both languages in that same reply, e.g. English paragraph followed by a concise Chinese paragraph. Do not mechanically translate if a natural Chinese angle is better.
3. Do not fabricate expertise, personal experience, evidence, or endorsements. Avoid generic praise, copied templates, repeated comments, engagement bait, unsolicited links, and excessive volume in a single thread. No automated replies, auto-following, or bulk API replies.
4. Send manually through the authenticated X interface. Verify the success toast or visible reply for each one, and count only confirmed sends toward the requested total. If X blocks posting or begins rate-limiting, stop and report the verified count and blocker rather than retrying blindly.

## Finish

Report what was actually completed, the count of confirmed posts/replies, the account used, and any items skipped or blocked. Include useful post links when available. Keep the report concise and do not claim success from an attempted click alone.
