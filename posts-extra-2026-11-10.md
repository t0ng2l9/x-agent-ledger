# Fresh post draft — 2026-11-10

## OpenAI Control Room — a measurable stop boundary

**EN**

```
OpenAI says Control Room can halt model output within 35 seconds of a stop decision. Inference engines check one authorization service, so shutdown doesn’t depend on each research job behaving correctly. (OpenAI, Nov 9, 2026)
https://openai.com/index/control-room/
```

**中文改写**

```
AI 安全不能只靠模型任务“自己停下”。OpenAI 的 Control Room 在推理层统一拦截输出，收到停止指令后最多 35 秒生效。它还不是即时停止——这段延迟本身就该被当作安全指标。（OpenAI，2026-11-09）
https://openai.com/index/control-room/
```

- **Primary source:** OpenAI, *Control Room*, published 2026-11-09: https://openai.com/index/control-room/
- **Angle:** a kill switch is only as strong as its enforcement point and time-to-stop; OpenAI says the upper bound is 35 seconds and that it is working to reduce it.
- **Hashtag:** omitted; this is a concise engineering observation and a tag adds little.
- **Replaces:** the scheduled Genie 4 item sourced to 2026-10-27; that material is too old to present as today's news.
- **Publishing note:** EN first. Post the Chinese rewrite only in a later, separated slot if it still adds value and the current news context has not changed. Do not publish both versions back-to-back.

## Scheduled deep-dive: Spawn thread 02

The existing draft in `thread-02-spawn.md` remains a case-study thread, not breaking news. Its facts should keep attribution to Simon Willison's 2026-10-29 account and Spawn's own product/about pages. Re-check these sources and update the thread to include its source/date reference before publishing; otherwise defer it.
