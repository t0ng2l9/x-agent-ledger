# Agent Dispatch — posts 11–13

These are the three I refused to write last round because I only had Reddit
titles. I found the primary sources instead of the threads, which is better
anyway: the Reddit posts were secondhand summaries of these.

Fetched 2026-11-02. Nothing below comes from a headline.

---

## 11 · A 4B model that ships 3D assets

**EN**

```
A 4B model now generates Three.js scenes and exports them as GLB, ready to drop
into Godot. Apache-2.0, fine-tuned from Qwen3.5-4B.

The author says most generations work on the first attempt with English prompts.

4B. That's the number worth noticing, not the Godot part.
```

**中文**

```
一个 4B 模型现在能生成 Three.js 场景并导出 GLB，直接拖进 Godot。Apache-2.0，
基于 Qwen3.5-4B 微调。

作者说英文提示词下大部分一次就成。

重点是 4B，不是 Godot。
```

- **Source** https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder (model card, 2026-11-01)
- **Verified facts** Apache-2.0 · fine-tune of Qwen/Qwen3.5-4B · independent CCORE
  release, explicitly not official Qwen · training still in progress, safetensors
  and dataset promised on completion · "most generations work on the first
  attempt, especially with English prompts" is the author's claim, not a
  benchmark
- **Angle** capability floor, not capability ceiling. Everyone reports the
  frontier; the story is that 4B is now enough for a narrow production task
- **Counterargument** "most work first try" is self-reported by the person
  shipping it, on hand-picked examples. No eval set, no failure rate. Say
  "author reports" — never "it works"
- **Visual** the mana potion / goblin renders from the model card
- **Do not say** "open source" without the Apache-2.0 qualifier, and do not
  imply the weights are final — they aren't released yet

---

## 12 · DeepSeek's super-agent, and the rule inside it

**EN**

```
DeepSeek published a super-agent prototype. Router, workers, triggers, watchdog
— nothing new.

The rule is new: it acts only when asked, or when a written team rule allows it.
Unrequested work runs in record-only mode.

An attention budget, in a README.
```

**中文**

```
DeepSeek 开源了一个 super-agent 原型。router、worker、trigger、watchdog，
架构没什么新鲜。

新鲜的是那条规则：只在被要求时行动，或者有团队明文规则允许时才动。没人要它
做的事，先跑在只记录、不执行。

一份写在 README 里的注意力预算。
```

- **Source** https://github.com/deepseek-ai/dsh-superagent-prototype (MIT, 2026-11-01)
- **Verified facts** research prototype, "not an official DeepSeek product" ·
  MIT · proactive coding agent for **one** GitHub repo, packaged as a DeepSeek
  Harness bundle · listens to GitHub, optionally Feishu · opens a work item,
  works in its own session and directory, answers in the original conversation
  (e.g. a PR) · web panel lists what needs a person · philosophy doc states
  "take as little human attention as possible, and give as much value as
  possible" · some designs in the paper are future work, **not implemented**
- **Angle** the governance rule is the product, not the architecture
- **Counterargument** it's research code that the team says may contain bugs and
  is not identical to their internal version. Calling it "DeepSeek's agent" is
  wrong — call it a prototype
- **Visual** none. The quote is the image
- **Do not say** "DeepSeek released an agent" — they released a reference
  prototype of one design

---

## 13 · 763B parameters on a laptop

**Image:** `assets\card-763b.png` (1600×900)

**EN**

```
A 763B MoE now runs on a 24GB laptop GPU at 30+ tokens/s. Strata splits its
15,360 experts across VRAM, RAM and SSD.

30 tok/s is not fast. But a 763B model running at all on a laptop changes who
can test frontier weights: from "who has a cluster" to "who has a 5090".
```

**中文**

```
763B 的 MoE 现在能在 24GB 笔记本 GPU 上跑到 30+ tokens/s。Strata 把模型的
15,360 个专家拆到显存、内存和 SSD 上。

30 tok/s 不算快。但 763B 能在笔记本上跑起来，改变的是谁能测前沿级别的权重：
从"有集群的人"变成"有 5090 的人"。
```

- **Source** https://github.com/Jackwwg83/Strata-DS (fork README, 2026-11-02)
- **Verified facts** DeepSeek V4.1 Flash, 763B MoE, 15,360 experts · RTX 5090
  Laptop 24GB + 64GB RAM: 30–32 tok/s cold start, 33–39 on a running server,
  24.4 at a 256K-token prompt · DGX Spark: 30.8 tok/s over a coding-agent
  session, 22.9 at 250K context · SAGE EXL3 1.59bpw needs 462GB disk; LibertAI
  EXL3 2.9bpw needs 625GB · Linux + NVIDIA
- **Angle** access, not speed. The interesting number is the VRAM, not the tok/s
- **Counterargument** 462GB of disk and a fork of a fork is not a consumer
  story, and 24 tok/s at long context is slow for agent loops. The "laptop"
  framing flatters it
- **Visual** `assets\card-763b.png` — rendered, verified (gutter 0px, margins 120/120)
- **Do not say** "20× faster". That was the Reddit poster's claim; the README
  contains measured numbers, not a speedup ratio. I could not verify the 20×
