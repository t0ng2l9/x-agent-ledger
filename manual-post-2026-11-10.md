# Manual post pack — 2026-11-10

Account: @agentledger_
Cost: $0 (native X composer, no API credits)

## 1) 18:00 Shanghai / 10:00 London — EN post

```text
OpenAI says Control Room can halt model output within 35 seconds of a stop decision. Inference engines check one authorization service, so shutdown doesn’t depend on each research job behaving correctly. (OpenAI, Nov 9, 2026)
https://openai.com/index/control-room/
```

## 2) 22:00 Shanghai / 14:00 London — Spawn thread (post in order, reply each to the previous)

### 1/7

```text
1/
Spawn is a multiplayer world changed by chatting to in-game agent Savi.

Founder Jacob Sansbury says agents ship its code hourly, at 30x payroll in tokens.

Why it works matters more than speed.

Source: Sansbury via Simon Willison (29 Oct 2026): https://simonwillison.net/2026/Oct/29/how-i-built-the-most-ai-pilled-company-in-the-world/
```

### 2/7

```text
2/
An hour without a ship is a SEV-0, their most severe incident class.

Sansbury's reasoning: unshipped changes pile up, every bug in production lasts longer, and "an agent can only keep a few hours of work in its head."

Shipping faster keeps it coherent.
```

### 3/7

```text
3/
About 60% of their work starts from something breaking: a production error, a bug Savi filed on herself, an odd log line, a user request.

Savi files it. An agent decides real bug / won't fix / intended. Usually it becomes a change within the hour.
```

### 4/7

```text
4/
The detail that makes hourly shipping possible: a Spawn world is a git repo.

Push to main, every open room gets it. No build, no deploy. Most pushes land in seconds. Rollback is 30 seconds, scoped to the broken thing.

Deploy stopped being an event.
```

### 5/7

```text
5/
Now the failure.

They ran GPT-6 Astra over the product for a security review. It "made the insecure things secure by turning them off." Every feature disabled, queued for re-enable.

The agent did exactly what was asked. That is the problem with asking.
```

### 6/7

```text
6/
Willison says plainly he has trouble imagining this on software where being wrong is expensive. I agree.

A game is a place where a bad hour is recoverable and users forgive. That's the precondition, not the model.
```

### 7/7

```text
7/
What transfers even if you never ship hourly:

1. Hand the agent the error, not the ticket.
2. Make rollback cheap before making shipping fast.
3. Write "don't act unless asked" into the repo, not into someone's head.

How many does your team have?
```

## How to schedule without API credits

1. Open https://x.com/compose/post in the browser logged in as @agentledger_.
2. Paste the text. For the thread, use the + button to add each subsequent post.
3. Click the calendar icon in the composer toolbar, choose the date and time.
4. Confirm the timezone shown by X matches Europe/London. If the account timezone is
   Shanghai, set 18:00 and 22:00 instead.
5. Click Schedule. Repeat for the thread root if X does not schedule the whole thread.

If scheduling a thread is unavailable, post it manually at 22:00 Shanghai and reply
in order; do not post all 7 as separate top-level posts.
