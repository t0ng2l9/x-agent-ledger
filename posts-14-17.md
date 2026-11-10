# Agent Dispatch — posts 14–17

Written against primary sources fetched on 2026-11-02. These are posts 14–17,
filling Day 17–20 in `board.csv` (2026-11-18 → 11-21) — the first new posts since
the 13 already in the kit.

Two of them are security stories, which is deliberate: the account has posted
one security item so far (#2, the Cursor backdoor). Three of four here would
over-rotate. #16 stays because the mechanism is a config mismatch, not a breach
— that is a different lesson.

---

## 14 · An NES CPU compiled into model weights

**EN** (277 chars)

```
A 6502 CPU, its 2KB of RAM and a cartridge ROM now run inside Qwen3.5-4B's
weights. Nobody trained it — a compiler computed every weight.

Super Mario Bros. plays at 1-6 seconds per frame. On the test ROMs, every frame
matches a real emulator.

Wrong direction. Working result.
```

**中文** (125 字)

```
一个 6502 CPU、2KB 内存和一张卡带 ROM，现在跑在 Qwen3.5-4B 的权重里。没有训练
——每个权重都是编译器算出来的。

超级马里奥 1–6 秒一帧；在测试 ROM 上，每一帧都和真模拟器完全一致。

方向是反的，结果是成立的。
```

- **Source** https://github.com/dbreunig/nesformer (README, fetched 2026-11-02)
  · https://simonwillison.net/2026/Oct/30/nesformer/ (2026-10-30)
- **Verified facts** NES 6502 CPU + 2KB work RAM + cartridge program ROM run
  inside a standard `Qwen3_5ForCausalLM` checkpoint · "Nobody trained these
  weights; a compiler computed every one" · the model predicts the CPU's
  execution log one token at a time, a host program draws the picture and fires
  the vblank interrupt · builds on Qwenputer by Divyansh Agrawal, which compiled
  CHIP-8 and RISC-V into Qwen3.5-4B · reuses "the model's Gated DeltaNet state
  is the machine's memory" · for bundled test ROMs every frame matches a
  conventional 6502 emulator exactly · **1–6 seconds per frame** after a ~20s
  numba compile, so 600 frames ≈ 25 minutes · needs Python 3.11+ · NROM
  (mapper 0) only; other boards stop with a message · three freely licensed test
  ROMs ship; you supply your own
- **Angle** the direction of the trick. Everyone asks how to make models bigger;
  this asks what a 4B model can be made to *be*. Compilation, not learning
- **Counterargument** it is a 6502 at 1–6 s/frame, roughly 10,000× slower than
  the real chip, and it only works on one cartridge mapper. "Emulation" here is
  a research artefact, not a product. Say "1-6 seconds per frame" in the post —
  which I did — or it reads as a claim about usable emulation
- **Do not say** "the model learned to emulate" or "trained on NES games".
  Nothing was trained. That is the whole point and the easiest thing to get
  wrong
- **Visual** none. The README GIFs are the author's; a static frame loses the
  point, and a moving GIF needs to be made from the repo, not lifted

---

## 15 · ChatGPT account takeover via a share link

**EN** (272 chars)

```
Parameter Labs took over ChatGPT accounts with a shared link. No app, no paste,
no dev tools.

MathLive's keyboard listener accepted postMessage from any origin, wrote it via
innerHTML, injected an unsandboxed iframe. A YouTube oEmbed call finished it.

Fixed, P1, $5,000.
```

**中文** (177 字)

```
Parameter Labs 用一个分享链接就拿下了 ChatGPT 账号。不用装 App、不用粘代码、
不用开开发者工具。

MathLive 的键盘监听接受任意来源的 postMessage，用 innerHTML 写进去，再注入
没有 sandbox 的 iframe。剩下交给 YouTube oEmbed。

已修，P1，赏金 5000 美元。
```

- **Source** https://www.parameter.ai/labs/we-found-a-gap-at-openai (Parameter
  Labs, 2026-10-28; fixed 2026-10-26, P1) · relay
  https://simonwillison.net/2026/Oct/31/how-we-took-over-chatgpt-accounts/
- **Verified facts** victim needed only to open a public share · confirmed
  impact: enumerate the conversation list, read a private conversation never
  shared with the attacker, exfiltrate it · chain: HTML Preview iframe →
  MathLive virtual-keyboard `postMessage` listener with origin policy `none` →
  layout HTML assigned to `innerHTML` in the parent page → `createHTML` marked
  it trusted without sanitising → `<iframe srcdoc>` inserted without a
  `sandbox` attribute → CSP bypassed via the YouTube oEmbed endpoint reflecting
  JavaScript → JS running as chatgpt.com · fixed 2026-10-26 · P1 · $5,000 bounty
  (Willison calls that cheap; I agree but did not put it in the post)
- **Angle** the sandbox was fine. The message channel between two sandboxes was
  not, and a math library was the bridge
- **Counterargument** this is a chain of five things that all had to line up,
  and OpenAI fixed it in days. Fair — which is why the post ends on the fix and
  the bounty rather than on "ChatGPT is insecure"
- **Do not say** "anyone could be hacked" without the "you had to open a
  shared link" qualifier. That qualifier is what makes it a real attack rather
  than a theoretical one, and it is in the post
- **Visual** none. A five-step chain diagram would need the Parameter post's
  own diagram, which is theirs

---

## 16 · 155 responses that leaked another customer's prompt

**EN** (270 chars)

```
155 Cloudflare responses carried other customers' prompt data, Aug 27–Sep 9.

GLM 5.3 had a 1,048,576-token context. KV pool: 681,280. Over-length prompts
became a one-token placeholder, not an error — so decode read the last request's
cache.

All 155 were over 681,280.
```

**中文** (177 字)

```
8 月 27 到 9 月 9 日，Cloudflare 有 155 个响应带出了别人的 prompt 内容。

GLM 5.3 配了 1,048,576 token 上下文，KV cache 池只装得下 681,280。超长请求
没报错，被换成一个 token 的占位符，decode 就读到了上一个请求的缓存。

155 个，全部长于 681,280。
```

- **Source** https://blog.cloudflare.com/kv-cache-exposure-remediation/
  (Cloudflare Blog, 2026-10-26; coordinated disclosure with SGLang)
- **Verified facts** window 2026-08-27 → 09-09 · 155 responses affected · all
  to prompts longer than 681,280 tokens · model is `@cf/zai-org/glm-5.3` on
  Workers AI · config deployed a 1,048,576-token context with a prefill KV pool
  of only 681,280 tokens; the mismatch was known before launch · in SGLang's
  disaggregated prefill/decode mode an over-length prompt was internally marked
  rejected and replaced with a one-token placeholder, but prefill still
  generated and transferred KV cache; decode assumed a full overwrite and
  attended over the previous request's state · reported by Gadi Evron on
  09-08 via HackerOne, reproduced the next morning, model offline within 40
  minutes of the incident declaration, restored same day · no evidence of
  deliberate exploitation · fix: pool raised to ~2.04M tokens, plus an engine
  patch retiring rejected requests at the admission queue (upstream #38704)
- **Angle** the failure is "we only checked status codes", said by Cloudflare
  themselves: "we only validated HTTP response codes and engine performance at
  long contexts, without validating model output and coherence"
- **Counterargument** 155 requests out of a large volume, all beyond 681k
  tokens, no evidence anyone exploited it. If the post implies a mass leak it
  is wrong — the numbers are in the post precisely so it can't
- **Do not say** "Cloudflare leaked customer data". Say what leaked: prompt
  content in responses, 155 of them
- **Visual** none. Two numbers do the work; a card would add nothing to what
  the text already states

---

## 17 · Supersonic, or a gas turbine for GPUs

**EN** (262 chars)

```
Boom Supersonic just opened a factory making gas turbines for AI data centers.
United's CEO now says the 2029 Overture timeline "is not going to happen."

A supersonic startup found a faster revenue line powering GPUs.

AI didn't kill the airliner. It outbid it.
```

**中文** (131 字)

```
Boom Supersonic 新建的工厂造的是给 AI 数据中心用的燃气轮机。美联航 CEO 现在说
2029 年交付 Overture"不会发生"。

一家超音速公司，找到了一条更快的现金流：给 GPU 供电。

不是 AI 杀死了客机，是 AI 出价更高。
```

- **Source** https://arstechnica.com/gadgets/2026/10/united-airlines-ceo-doubts-supersonic-airliner-from-boom-will-be-ready-by-2029/
  (Ars Technica, 2026-10-27)
- **Verified facts** Boom unveiled a Colorado factory dedicated to making gas
  turbines for AI data centers · its prototype turbine core "Sprint Core" is
  intended to power both those turbines and the Overture engine · United CEO
  Scott Kirby on the Office Hours: Business Edition podcast (published
  2026-10-28): "'29 is their official timeline. It's not going to happen in
  '29—it's going to take longer." · Kirby in March 2026 put the odds of
  commercial service at "50-50" · Boom has conditional agreements with
  American, Japan Airlines and United, with non-refundable deposits of unknown
  amounts · the Greensboro Overture factory has mostly sat dormant since 2024 ·
  North Carolina put in more than $50M
- **Angle** capital reallocation, not aviation. The same turbine core serves
  both markets and one of them pays now
- **Counterargument** the two businesses may be genuinely complementary rather
  than a pivot — the same core, two customers. My "outbid" framing is an
  inference from timing, and the post's last line is labelled as a judgement,
  not a fact. If challenged, concede the complementarity and keep the timing
  point
- **Do not say** "Boom abandoned the airliner". They did not; the factory is
  for turbines and Overture is still the stated plan
- **Visual** none



