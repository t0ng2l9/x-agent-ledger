# Agent Dispatch — first 10 posts (EN + 中文)

Written against primary sources fetched on 2026-11-02. Every claim below is
traceable to the link under each post. Nothing here is generated from a
headline alone.

**Bilingual rule applied:** the Chinese version is *not* a translation. It
drops the setup and leads with the judgement, because a Chinese reader already
knows what Gemini or Cursor is. Same topic, different entry point.

**Publishing order** matches `board.csv` from day 4 (2026-11-05). Slot `am` =
English, slot `pm` = 中文. Two posts per day, so this is five days of content.

One deviation: #3 runs on 11-06 and #2 on 11-07, not the other way round.
Thread 01 expands the Octoverse story on the same day, and a thread works better
next to the post it expands than a day later.

---

## 1 · Gemini 4 Carbon — announced, unavailable

**EN** (227 chars)

```
Google announced Gemini 4 Carbon: +89 points on WebDev Arena, now #4, beating
GPT-6 Astra and Opus 5.5 on almost every test.

It is not available to anyone yet.

A frontier model you can't use is a press release, not a product.
```

**中文** (117 字)

```
谷歌发布 Gemini 4 Carbon：WebDev Arena 涨 89 分冲到第 4，几乎所有测试都赢
GPT-6 Astra 和 Opus 5.5。

但谁都还用不了。

跑分第一、可用性为零的"前沿模型"，本质是一份新闻稿。
```

- **Source** https://arstechnica.com/ai/2026/10/google-announces-gemini-4-carbon-its-latest-frontier-ai-model-that-you-cant-use/ (Ars Technica, 2026-10-28)
- **Angle** availability as the real differentiator, not benchmark rank
- **Counterargument** Google shipped Argon two weeks earlier and it did reach
  users on a similar timeline, so "unavailable" may be a two-week gap, not a
  vapourware story. If you post this, say "not yet" — not "never".
- **Visual** none needed; the claim is the post

---

## 2 · Anthropic's Claude extension on Cursor was backdoored

**EN** (277 chars)

```
Anthropic's official Claude extension on Cursor was backdoored for ~12 hours.
Version 2.1.313, up to 5,000 machines, shipped from a verified account. The
attackers were after cloud credentials.

Your AI IDE is a distribution channel. A verified badge is not a security
control.
```

**中文** (116 字)

```
Anthropic 在 Cursor 上的官方 Claude 插件被投毒约 12 小时：2.1.313 版本，
最多 5000 台机器，走的是官方认证账号。攻击者要的是云凭证。

AI IDE 本质是分发渠道。认证徽章不是安全措施。
```

- **Source** https://arstechnica.com/security/2026/10/anthropic-vs-code-extension-on-cursor-backdoored-for-nearly-12-hours/ (Ars Technica, 2026-10-30)
- **Angle** supply chain risk moved from npm packages to editor extensions
- **Counterargument** 5,000 users out of a very large install base is a small
  blast radius; the real story may be that it was fixed in hours. Acknowledge
  the fast patch or the post reads as alarmist.
- **Image:** `assets\card-cursor.png` (1600×900) — rendered and measured

---

## 3 · Octoverse: 40% of PRs start with an agent

**Image:** `assets\card-octoverse.png` (1600×900)

**EN** (251 chars)

```
GitHub Octoverse: 17.9B pushes in 12 months, more than 2024 and 2025 combined.
1.3B merged PRs. And since September, over 40% of pull requests are started by
an agent.

The question is no longer whether agents write code. It's whether anyone
reads it.
```

**中文** (122 字)

```
GitHub 年度报告：12 个月 179 亿次 push，超过 2024 和 2025 之和；13 亿个 PR
被合并。9 月起，超过 40% 的 PR 由 agent 起草。

问题已经不是 agent 会不会写代码，而是还有没有人读代码。
```

- **Source** https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/ (GitHub, 2026-10-28)
- **Angle** volume metrics are now ambiguous — agents inflate them
- **Counterargument** "started by an agent" includes a developer asking Copilot
  to draft a one-line fix. The 40% number is softer than it sounds. Worth
  saying so in a reply if challenged; it makes you credible.
- **Visual** `assets\card-octoverse.png` — already rendered, attach to the English post

---

## 4 · Vibe-coded games crossed a line

**EN** (256 chars)

```
Vibe-coded games crossed a line this month. Opus 5.5 now handles 3D modelling,
music, and — the hard part — game design. Simon Willison's "make it a LOT more
fun" prompt rebuilt an entire RTS.

GPT-6 Astra can build a game. It doesn't yet know what fun is.
```

**中文** (131 字)

```
这个月，vibe coding 做游戏跨过了一条线：Opus 5.5 能处理 3D 建模、配乐，以及
最难的那部分——游戏设计。Simon Willison 一句"让它好玩很多"，重做了整个 RTS。

GPT-6 Astra 能做出游戏，但还不知道什么叫好玩。
```

- **Source** https://simonwillison.net/2026/Oct/28/vibe-game-development/ (Simon Willison, 2026-10-28)
- **Angle** the bottleneck moved from capability to taste
- **Counterargument** one person's four games is not a trend, and "fun" is
  judged by the same person who prompted it. Fair hit — answer it in a reply
  rather than pre-empting it in the post.
- **Visual** screenshot of Battle Drones, cropped, no browser chrome

---

## 5 · The middle tier is where agents ship

**EN** (230 chars)

```
GPT-6.1 Terra is $1/M input and $5/M output. OpenAI says it matched GPT-6 Astra
on one computer-use benchmark at one-tenth the token price.

My take: agents may ship where task economics work, not where capability peaks.
(OpenAI, 26 Oct 2026)
https://openai.com/index/introducing-gpt-6-1-terra/
```

**中文** (103 字)

```
GPT-6.1 Terra API 定价：每百万输入 token $1、输出 $5。OpenAI 称它在一项
computer-use benchmark 上达到 GPT-6 Astra 的表现，token 价格约为十分之一。

我的判断：agent 可能先在任务成本划算的区间落地，而不是能力峰值。（OpenAI，
2026-10-26）
https://openai.com/index/introducing-gpt-6-1-terra/
```

- **Source** https://openai.com/index/introducing-gpt-6-1-terra/ (OpenAI, 2026-10-26)
- **Angle** cost-per-task, not capability, decides deployment
- **Counterargument** OpenAI's own positioning is about *communication* and
  *visual reasoning*, not price. My "middle tier" framing is an inference.
  Label it as one.
- **Visual** three-column price/capability card

---

## 6 · Genie 4 renders worlds, not games

**EN** (269 chars)

```
Genie 4 generates a playable world frame by frame — no engine, no assets, no
pre-rendering. Audio and human motion included. Rolling out to developers and
AI Ultra subscribers.

Last year Genie 3 moved gaming stocks. This year the question is who pays
Google per world.
```

**中文** (104 字)

```
Genie 4 逐帧生成可玩世界：没有引擎、没有素材、没有预渲染，还带音频和人体
动作。先给开发者和 AI Ultra 订阅用户。

去年 Genie 3 让游戏股跌了一轮。今年的问题是：谁按世界给谷歌付钱。
```

- **Source** https://arstechnica.com/google/2026/10/deepminds-genie-4-world-model-adds-audio-and-more-realistic-people-to-simulations/ (Ars Technica, 2026-10-27)
- **Angle** world models as a rendering-cost story, not an AGI story
- **Counterargument** Google frames this as an AGI milestone, and the demo
  videos are curated. "Playable" in a demo is not "shippable" in a product.
- **Visual** none — link the demo video instead

---

## 7 · Mistral Large 4 and the new meaning of "open"

**EN** (256 chars)

```
Mistral Large 4: 1T total parameters, 49B active, 1M context, multimodal, and
open weights under an MIT-derived license.

The carve-out is model-as-a-service. Open enough to self-host and fine-tune,
not open enough to resell.

That's what "open" means now.
```

**中文** (104 字)

```
Mistral Large 4：总参数 1T、激活 49B、1M 上下文、多模态，权重开放，用的是
MIT 衍生许可。

例外条款是"模型即服务"：能自托管、能微调，但不能转卖。

这就是现在"开源"的意思。
```

- **Source** https://huggingface.co/blog/mistral-large4 (Hugging Face, 2026-10-29)
- **Angle** license carve-outs are the real product decision
- **Counterargument** an MIT derivative is still far more permissive than
  Llama's community licence, so "open" hasn't degraded as much as the post
  implies. Worth conceding in replies.
- **Visual** licence comparison table (MIT / Mistral Ecosystem / Llama)

---

## 8 · Apple Intelligence arrives in China, partially

**EN** (252 chars)

```
Apple Intelligence reaches China with iOS 27.3: beta next week, full release in
December, and only "initial" features.

The same product now ships in different countries with different capabilities.
Feature parity has become a variable, not a baseline.
```

**中文** (99 字)

```
Apple Intelligence 随 iOS 27.3 进入中国：下周 beta，12 月正式版，而且只有
"首批"功能。

同一个产品，在不同国家以不同能力上线。功能对齐已经从默认变成了变量。
```

- **Source** https://www.theverge.com/tech/1023974/apple-intelligence-china-ios-27-3 (The Verge, 2026-10-30)
- **Angle** market fragmentation as a product constraint
- **Counterargument** every Apple feature has rolled out region by region for
  years; this may be normal, not a signal. The AI-specific angle is weaker
  than it looks.
- **Visual** none

---

## 9 · Compute in orbit

**EN** (253 chars)

```
Google booted TPUs on a satellite and ran Gemma 4 in orbit. The output was a
haiku. The actual result is that the chip survived.

Twin interconnected satellites are targeted for 2027. Orbital compute is a
thermal and power problem, not a poetry problem.
```

**中文** (84 字)

```
谷歌在卫星上点亮了 TPU，Gemma 4 在轨跑通，输出是一首俳句。真正的结果是：
芯片没烧。

双星互联目标定在 2027。轨道计算是散热和供电问题，不是写诗问题。
```

- **Source** https://www.theverge.com/tech/1023528/google-project-suncatcher-ai-satellite-transmission (The Verge, 2026-10-30)
- **Angle** ignore the demo output, read the engineering constraint
- **Counterargument** one satellite running one small model is a stunt until
  bandwidth and downlink economics are addressed. Say that in a reply.
- **Visual** none

---

## 10 · The unglamorous post

**EN** (248 chars)

```
datasette-llm 0.1a9 now inherits your default model, so Datasette Agent runs
without explicit config.

Not a big story. But this is what agents in production actually look like:
removing one config flag at a time, by people who use their own tools.
```

**中文** (106 字)

```
datasette-llm 0.1a9 现在会继承默认模型，Datasette Agent 不用再显式配置就能跑。

不是什么大新闻。但 agent 落地真实的样子就是这样：用自己工具的人，一次删掉
一个配置项。
```

- **Source** https://simonwillison.net/2026/Oct/31/datasette-llm/ (Simon Willison, 2026-10-31)
- **Angle** deliberately low-reach, high-credibility. This is the post that
  makes builders follow you.
- **Counterargument** none — it's a small release and the post says so
- **Visual** none

---

## Notes on what I left out

The radar surfaced three r/LocalLLaMA threads that scored highest
(GLB-3D-Coder, DeepSeek's super-agent paper, the Strata/DeepSeek-V4.1 speed
patch). I did not write posts for them: Reddit blocked the article fetch, so I
have a title and nothing else. Posting from a title is exactly how AI-assisted
accounts get caught being wrong.

If you want those, open them in a browser, read the top comments, and I'll
write them from what you paste back.

## Character counts

Counts above are measured, not estimated: `node scripts\check-posts.mjs` weights
CJK as 2 units and any URL as 23 (t.co), which is how X actually counts. All
20 posts are under 280.

Re-run it after you edit anything.




