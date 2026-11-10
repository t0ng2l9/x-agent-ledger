# Tool test 01 — WebGPU inference degrades on reuse

**Run** 2026-11-02, on the machine this project lives on.
**Hardware** NVIDIA GeForce RTX 5060 Laptop GPU, 8,151 MiB, driver 592.25.
**Software** Chrome 156.0.8078.76 (headless), transformers.js 3.5.2, model
`onnx-community/Qwen2.5-0.5B-Instruct`, `device: "webgpu"`, `dtype: "q4"`.
**Reproduce** `node tests\run-headless.mjs . /tests/webgpu-repeat.html 300000`

---

## The result

One pipeline, one page, one model in memory. Same prompt, `do_sample: false`
(greedy — the output should be identical every time), `max_new_tokens: 30`,
three consecutive calls:

```
call 1  3.93s  30 tok
  > 2 + 2 equals 4. This is the basic arithmetic operation of addition. When you add two numbers together, their sum is calculated by

call 2  1.18s  30 tok
  > 2 + = 2 +/2 ThisThis means means that that the this means equals equals sign sign. 2+2=4

call 3  1.24s  30 tok
  > 2 + = 2 +/2 ThisThis means means that that the this means equals equals to to two two plus two equals two.
```

Call 1 is correct. Calls 2 and 3 are degraded — and they are *faster*, which is
the part that matters. 3.93s → 1.18s is not a warm cache; it is less work
being done.

Same pattern with a different prompt, five runs, tokens compared as token IDs
rather than text:

```
distinct token sequences: 2 / 5
run 1: 39814,11,1588,525,2326,4185,323,5411,7987,1447,16,13   (sensible)
run 2-5: 39814,11,358,646,1492,498,1140,2326,2326,2326,...   (2326 repeated)
```

Runs 2–5 are byte-identical to each other and wrong. Run 1 is the outlier.

---

## What it is not

**Not a memory leak that throws.** No exception, no OOM, no console error. It
returns 200-equivalent results — well-formed text — just wrong.

**Not quantisation in general.** `dtype: "q4"` gave correct output on call 1
every time, and 23.4–26.2 tok/s across three measured runs. `dtype: "fp16"`
loaded (180s) and produced one short correct answer, then the harness ran out of
time; `dtype: "q8"` produced multilingual garbage on the *first* call (Japanese,
Cyrillic, Chinese fragments interleaved) at 2.5 tok/s. So q8 is worse than q4
here, and fp16 is the only one that did not visibly degrade in the time tested.

**Not fixed by recreating the pipeline.** Disposing and rebuilding the pipeline
between calls did not restore determinism — three fresh pipelines gave three
different answers, one of them `2 + + 1 = = 33`. So the corruption is not scoped
to the pipeline object; it survives in something the pipeline does not own
(buffer pool, command-queue state, or the ONNX Runtime WebGPU arena).

**Not the tokenizer.** The prompts tokenise correctly (42 tokens for the chat
template), and call 1 uses the same code path.

---

## Why this is a real finding and not a bad harness

- `do_sample: false` means greedy argmax. Identical logits must produce
  identical tokens. Two different outputs from one input is a numerical bug,
  not a sampling artefact.
- The degradation direction is consistent across two different prompts and two
  different token budgets: first call coherent, subsequent calls degenerate into
  token repetition (`2326` ×30, `ThisThis`, `sign sign`).
- The speedup correlates with the degradation. That is the signature of a
  kernel reading a stale or partially-initialised buffer: less correct work,
  more speed.
- A warm-up call before measuring did not prevent it. In the 5-run test the
  warm-up was call 0; run 1 was still correct and runs 2–5 were not.

---

## What I could not establish

- Whether the fault is in transformers.js's KV-cache handling, in ONNX Runtime
  Web (the WASM/WebGPU EP), or in the Chrome/Dawn driver stack on this GPU.
  Separating those three needs a build of onnxruntime-web with the same model
  and no transformers.js wrapper — I did not do that.
- Whether it reproduces on a discrete desktop GPU or on other Chrome versions.
  n=1 machine.
- Whether it affects longer contexts differently. The 1.4k-token prompt I ran
  in an earlier iteration returned coherent text once, then the harness timed
  out before a second measurement.
- Absolute tok/s numbers: cold load ranged 92.8s–192.4s across runs, which is
  CDN variance and disk cache, not the model.

---

## The control experiment — attempted, did not complete

The comparison this result needs is the **same model, same prompts, `device:
"wasm"`** instead of `"webgpu"`, five runs each, compared by token IDs. If WASM
is deterministic across all five, the defect is in the WebGPU path; if it
degrades the same way, the bug sits above both backends.

I ran it (`tests/wasm-control.html`, same driver). It did not finish:

- Started 18:18, killed 19:05 — **47 minutes**, no first token, no exception.
- The page printed the load banner and then nothing. No JS error reached the
  console, the tab stayed alive (~430MB resident across three Chrome
  processes), and no output ever arrived.
- Likely cause: the q4 ONNX graph is 750MB and ORT-Web's WASM backend has to
  fetch, compile and allocate it without a GPU arena. Under headless with the
  default heap that either thrashes or stalls.

This is recorded as a **negative result**. The claim in post 18 stays at
"greedy decoding is not deterministic in this WebGPU configuration". It does
**not** become "the WebGPU execution provider is broken", because I could not
run the comparison that would earn that sentence.

The cheaper control, if I pick this up again: a 135M model, where WASM loads in
seconds. Different model, but it would separate "generate loop" from "backend".

---

## What this means for the post

## What this means for the post

The honest claim is narrow:

> Greedy decoding is not deterministic in transformers.js on WebGPU here. The
> first call is correct, later calls on the same pipeline return different
> tokens and run 3x faster.

That is a reproducible defect, and it is the kind of thing a "we tested it"
account should publish. It is **not** "WebGPU inference is broken" and not
"local models are unreliable" — one model, one GPU, one browser build.

**The post that comes out of this** is in `posts-18-20.md`, as #18. It leads with
the speed number, because "3x faster and wrong" is the part a practitioner
recognises immediately.

---

## Files

| File | What |
|---|---|
| `tests/webgpu-repeat.html` | the 3-call reproduction, self-contained |
| `tests/run-headless.mjs` | local http server + CDP driver for headless Chrome |
| `_scratch/bench*.html` | the exploratory runs (q4/q8/fp16, dispose test) |

`_scratch` is disposable; `tests/` is the part worth keeping, because the
reproduction has to survive the post.


