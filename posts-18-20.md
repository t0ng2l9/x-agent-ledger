# Agent Dispatch — posts 18–20

Fetched 2026-11-02. #18 is the first post in the kit built on something I ran
myself rather than something I read. Full method and raw numbers in
`tool-test-01-webgpu.md`.

---

## 18 · Greedy decoding that isn't deterministic

**EN** (256 chars)

```
I ran Qwen2.5-0.5B in Chrome on WebGPU, greedy decoding, same prompt three
times.

Call 1: "2 + 2 equals 4." 3.9s.
Call 2: "2 + = 2 +/2 ThisThis means means..." 1.2s.
Call 3: different garbage. 1.2s.

Greedy means deterministic. It got 3x faster and wrong.
```

**中文** (186 字)

```
我在 Chrome 里用 WebGPU 跑 Qwen2.5-0.5B，greedy 解码，同一个 prompt 连跑三次。

第一次："2 + 2 equals 4"，3.9 秒。
第二次："2 + = 2 +/2 ThisThis means means..."，1.2 秒。
第三次：另一种乱码，1.2 秒。

greedy 本该是确定性的。它快了 3 倍，同时错了。
```

- **Source** my own run, 2026-11-02 — `tool-test-01-webgpu.md`, reproduction in
  `tests/webgpu-repeat.html`. No third-party link, because there isn't one
- **Environment** RTX 5060 Laptop 8GB · driver 592.25 · Chrome 156.0.8078.76
  headless · transformers.js 3.5.2 · `onnx-community/Qwen2.5-0.5B-Instruct` ·
  `device: webgpu`, `dtype: q4`, `do_sample: false`, `max_new_tokens: 30`
- **Verified** three consecutive calls in one page, one pipeline; call 1
  coherent at 3.93s, calls 2–3 degenerate at 1.18s / 1.24s. Reproduced with a
  second prompt: 5 runs produced 2 distinct token sequences, run 1 correct and
  runs 2–5 identical to each other and wrong (`2326` repeated). Disposing and
  rebuilding the pipeline did not fix it. A warm-up call did not prevent it
- **Not claimed** that WebGPU inference is broken, or that local models are
  unreliable. One model, one GPU, one browser build. I could not separate
  transformers.js from onnxruntime-web from the Dawn driver — that needs a
  build without the wrapper, which I did not do. I did try the WASM control and
  it never produced a token in 47 minutes (see `tool-test-01-webgpu.md`), so
  "the WebGPU backend is at fault" is a sentence I cannot support. I did try the WASM control and
  it never produced a token in 47 minutes (see `tool-test-01-webgpu.md`), so
  "the WebGPU backend is at fault" is a sentence I cannot support
- **Angle** the speed is the tell. 3x faster is not a warm cache; it is less
  work being done. Anyone who benchmarks on-device inference and only reads
  tok/s would call this a win
- **Counterargument** a 0.5B model is a toy, q4 on WebGPU is an unusual path,
  and headless Chrome is not how anyone ships. All fair. The post's claim is
  deliberately narrow — "greedy decoding is not deterministic here" — and the
  full caveat list is in `tool-test-01-webgpu.md` for anyone who asks
- **Image:** `assets\card-webgpu.png` (1600×900) — rendered and measured:
  3.9s / 1.2s, the two outputs side by side, gutter 0px, margins 120/120

---

## 19 · Six 2B models on one backbone

**EN** (260 chars)

```
Liquid AI's LFM3-1.7B beats their own LFM2.5-2.6B with 35% fewer parameters,
fits in about 1GB at 4-bit, 256K context.

Six 2B-class models on one backbone: text, vision, audio, omni, decision.

The pitch isn't "smaller". It's one model per job, on the device.
```

**中文** (137 字)

```
Liquid AI 的 LFM3-1.7B 用少 35% 的参数打赢自家 LFM2.5-2.6B，4bit 下约 1GB，
上下文 256K。

同一个骨干上分出六个 2B 级模型：文本、视觉、音频、omni、决策。

卖点不是"更小"，是"每个任务一个模型，跑在设备上"。
```

- **Source** https://huggingface.co/blog/LiquidAI/lfm3 (Hugging Face / Liquid
  AI, 2026-10-27)
- **Verified facts** LFM3-1.7B outperforms LFM2.5-2.6B with 35% fewer parameters
  (the post says "using 35% fewer parameters"; the source says LFM3-1.7B
  outperforms LFM2.5-2.6B with 35% fewer parameters) · text model ≈1GB at 4-bit
  · 256K context · six 2B-class models branched from LFM3-1.7B-Base (text,
  vision, audio, omni, decision, plus d1-2B) · LFM3-1.7B-Base pre-trained on 22T
  tokens with a 128K vocabulary · 8K-token context is ~25% faster per parameter
  than LFM2-1.2B · LFM3-VL-2B is their first vision model that takes video ·
  LFM3-Omni-2B replaces separate ASR + VLM + LLM + TTS · d1-2B scores 75.5 vs
  64.0 on ImajevBench against d1-3B
- **Angle** the family structure, not the parameter count. "Smaller" is a
  crowded claim; "one backbone, six models, pick per task" is a distribution
  strategy
- **Counterargument** the 35% claim is per-parameter, and the benchmark wins are
  Liquid's own suites. LFM2.5-2.6B is their previous generation, so beating it
  is the minimum bar. Say "their own" — the post does
- **Do not say** "runs on a phone" without the 4-bit/1GB qualifier. The 1GB
  figure is for the text model at 4-bit only
- **Visual** none

---

## 20 · 830,000 flagged aid accounts

**EN** (269 chars)

```
DOJ charged five people in the first "ghost student" case: stolen identities,
fake enrolments, AI keeping up the appearance of a student in online classes.

830,000 aid accounts flagged. Up to $130M. $32M confirmed.

The fraud wasn't the AI. It was the enrolment check.
```

**中文** (107 字)

```
美国司法部首次起诉"幽灵学生"案，五个人：盗用身份、虚假入学，用 AI 在网课里
维持一个学生的样子。

83 万个助学金账户被标记，潜在损失 1.3 亿美元，已确认 3200 万。

问题不在 AI，在入学核验。
```

- **Source** https://arstechnica.com/tech-policy/2026/10/doj-exposes-ghost-students-using-ai-to-complete-courses-steal-student-loans/
  (Ars Technica, 2026-10-30)
- **Verified facts** five individuals charged, first broad federal crackdown on
  "ghost students" · scheme: steal identities, file FAFSA, enrol, collect
  leftover aid into controlled accounts · DOE identified "over 830,000
  potentially fraudulent federal student aid accounts" · if all are ghost
  students, total losses near $130M · "more than $32 million in actual loss tied
  to these specific subjects" · money traced to US and foreign bank accounts and
  crypto wallets · DOJ quotes an official: "It looks like the ghost student is
  actually completing the class"
- **Angle** where the control failed. The AI is the last mile; the identity and
  enrolment checks are the missing control
- **Counterargument** "AI" is doing very little work here — the fraud predates
  LLMs, and the DOJ's own framing is about identity theft. The post concedes
  that in its last line, which is the point
- **Do not say** "AI stole $130M". $130M is the ceiling if all 830k accounts are
  fraudulent; $32M is the confirmed loss for these defendants
- **Visual** none. A number this sensitive does not need a graphic





