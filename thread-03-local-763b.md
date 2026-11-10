# Thread 04 · 763B on a laptop, and what the floor moving actually means

**Slot** `board.csv` 2026-11-17 · Day 16 · `pm2`; 中文版 11-18 `pm3`. Runs the day
post 13 (the 763B single post) publishes, so the thread expands a story the
timeline already saw rather than introducing a second one.

**Primary source, opened 2026-11-02:**
https://github.com/Jackwwg83/Strata-DS — a fork of `Niko1221/Strata` that adds a
DeepSeek engine. Upstream Strata runs Qwen3.8-Flash-Next on 12GB+ cards.

**Verified from the README (measured numbers, machine spec attached):**

- DeepSeek V4.1 Flash, 763B MoE, 15,360 experts; experts split across VRAM, RAM
  and SSD; single GPU.
- RTX 5090 Laptop 24GB + 64GB RAM, SAGE EXL3 1.59bpw, 462GB disk: 30–32 tok/s
  cold start, 33–39 on a running server, 24.4 at a 256K-token prompt.
- DGX Spark (GB10, 128GB unified), V4.1 Flash 1017, LibertAI EXL3 2.9bpw, 625GB
  disk: 30.8 tok/s over a coding-agent session (23.6–36.4 per turn), 22.9 at
  250K context.
- Measured 2026-10-16, five runs per condition, medians; 37.6 tok/s over 30
  minutes of continuous generation with no slowdown. Raw data in
  `ds41/bench/results/2026-10-16-laptop-5090`.
- Accuracy cost of the fast settings: HumanEval+ 91.5% → 90.2%, GSM8K 97.5% →
  98.0%, needle-in-haystack 60/60 both; token distribution shifts measurably,
  most on Chinese prose.
- Measured 2026-10-16, five runs per condition, medians; 37.6 tok/s over 30
  minutes of continuous generation with no slowdown. Raw data in
  `ds41/bench/results/2026-10-16-laptop-5090`.
- Accuracy cost of the fast settings: HumanEval+ 91.5% → 90.2%, GSM8K 97.5% →
  98.0%, needle-in-haystack 60/60 both; token distribution shifts measurably,
  most on Chinese prose.
- Linux + NVIDIA. Upstream Strata also runs on AMD, Windows or Linux.
- Upstream on an RTX 5070 (12GB) / 64GB RAM: 94 tok/s at Q2_0, 53 at IQ3_S,
  with 32K-token prompt prefill at 1,620–2,650 tok/s.

**The argument in one line:** the constraint that moved is disk and patience, not
capability — and "who can afford to evaluate frontier weights" is a different
question from "who can deploy them".

**Counterargument, stated in post 4 on purpose:** 462GB of disk is not a consumer
setup, and 24 tok/s at long context is slow for an agent loop. The thread gives
that up front rather than defending the framing.

**Do not say** "20× faster". That came from a Reddit poster; the README has
measured numbers and no speedup ratio. Also do not call the fork "Strata" without
saying it is a fork — the upstream project runs a different model.

---

## EN thread — 7 posts
```
1/
A 763B model now runs on one laptop. Not a demo: 30-32 tok/s from a cold start, 33-39 on a warm server, 24.4 at a 256K prompt.

It costs 462GB of disk and about $0/month in API fees.

The interesting number isn't the speed. It's the VRAM.
```

```
2/
The setup: DeepSeek V4.1 Flash, 763B MoE, 15,360 experts. Strata splits the experts across GPU memory, RAM and SSD.

Hardware: an RTX 5090 Laptop with 24GB VRAM and 64GB of RAM. Quantization SAGE EXL3 at 1.59 bits per expert weight.

Linux + NVIDIA only.
```

```
3/
On a DGX Spark (128GB unified memory) the same architecture runs at 30.8 tok/s over a coding-agent session, 22.9 at 250K context — with a bigger quantization, 2.9 bits, 625GB of disk.

Two recipes, one engine, same 763B.
```

```
4/
Now the honest part, which the README states itself.

462GB of disk is not a consumer setup. 24 tok/s at 256K context is slow for an agent loop.

The speed comes from dropping low-ranked experts: HumanEval+ 91.5% → 90.2%. Inside the noise, but a trade.
```

```
5/
But the floor moved, and that's the point.

Testing frontier weights used to require a cluster. Now it requires a 5090 and a big SSD. The gap between "can afford to evaluate" and "can afford to deploy" is where most AI opinion gets made.
```

```
6/
One more thing worth noticing: the engine is a fork of a fork, and the README ships measured numbers with the machine spec attached — cold start vs warm, short vs 256K context.

That is more disclosure than most hosted-model cards give you.
```

```
7/
So: is this the year local stops being a hobby?

My read: no, but the reason changed. It isn't capability any more, it's disk and patience.

If you have a 5090 and 500GB free, you can now check a vendor's claim yourself. That's new.
```

---

## 中文 thread — 6 posts（重写，不是翻译）

```
中文1/
763B 的模型现在能跑在一台笔记本上。不是演示：冷启动 30–32 tok/s，热服务 33–39，256K 上下文下 24.4。

代价是 462GB 硬盘，以及每月 0 美元的 API 费用。

关键数字不是速度，是显存。
```

```
中文2/
配置：DeepSeek V4.1 Flash，763B MoE，15,360 个专家。Strata 把专家拆到显存、内存和 SSD 上。

硬件：RTX 5090 笔记本，24GB 显存 + 64GB 内存。量化 SAGE EXL3，每专家权重 1.59 bit。

只支持 Linux + NVIDIA。
```

```
中文3/
在 DGX Spark（128GB 统一内存）上，同样的架构跑编码 agent 会话是 30.8 tok/s，250K 上下文下 22.9——用的是更大的量化，2.9 bit，625GB 硬盘。

两个配方，一个引擎，同一个 763B。
```

```
中文4/
说实话的部分：462GB 硬盘不是消费级配置；长上下文下 24 tok/s 对 agent 循环来说很慢，那种场景你要读 diff、反复改。

"能在笔记本上跑"是真的，但它美化了这个结果。
```

```
中文5/
不过门槛确实降了。以前测前沿权重需要集群，现在需要一张 5090 加一块大 SSD。

"能评测"和"能部署"之间的这段距离，正是大多数 AI 观点被生产出来的地方。
```

```
中文6/
还有个细节：这个引擎是 fork 的 fork，但 README 把实测数字和机器配置一起写清楚了——冷启动 vs 热服务，短上下文 vs 256K。

比多数闭源模型的卡片披露得都多。

所以今年本地推理会走出极客圈吗？我的判断是不会，但理由变了：不再是能力问题，是硬盘和耐心问题。
```





