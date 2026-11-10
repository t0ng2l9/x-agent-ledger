# Thread 03 · Three incidents, one pattern

**Slot** `board.csv` 2026-11-24 · Day 23 · `pm2`; 中文版 11-25 `pm3`. Uses post 2 (Cursor), post 15
(ChatGPT) and post 16 (Cloudflare) as raw material — so publish it *after* all
three have run.

**Sources, all opened on 2026-11-02:**

- Ars Technica, Cursor extension backdoor, 2026-10-30 —
  https://arstechnica.com/security/2026/10/anthropic-vs-code-extension-on-cursor-backdoored-for-nearly-12-hours/
- Parameter Labs, *Do the Math: How We Took Over ChatGPT Accounts*, 2026-10-28 —
  https://www.parameter.ai/labs/we-found-a-gap-at-openai
- Cloudflare, *Cross-request KV cache exposure in the GLM-5.3 Workers AI model*,
  2026-10-26 — https://blog.cloudflare.com/kv-cache-exposure-remediation/

**The argument in one line:** none of these three was a model failure; each was
a trust boundary that nobody tested, and two of the three were documented by the
vendor in language close to an admission.

**Why this thread is worth the slot:** it is the only one so far that links
stories the account already published, instead of introducing a new topic. For a
cold account that is the thing that makes a timeline read as a body of work
rather than a feed.

**Facts not repeated here** — they are in posts 2, 15, 16 with full sourcing.
The thread only uses the three numbers that survive compression: 5,000 machines
/ 12 hours, five-step chain / one link, 155 responses / 681,280 tokens.

**Not claimed:** that any of these caused harm at scale. Cursor's blast radius
was at most 5,000; Parameter's was a chain that needed a click; Cloudflare found
no evidence of deliberate exploitation. The thread says "cheap to fix once
known", which is what the three disclosures actually support.

---

## EN thread — 7 posts
```
1/
Three incidents in five weeks, and none were a model problem.

A Cursor extension backdoored through a verified account. A shared ChatGPT link that took over accounts. 155 Cloudflare responses carrying another customer's prompt.

The pattern is where the bugs live.
```

```
2/
The Cursor one: version 2.1.313 of Anthropic's official Claude extension, posted to a verified account, up to 5,000 machines, about 12 hours.

It tried to install a persistent SSH backdoor and collect cloud credential names.

Not a jailbreak. A distribution channel.
```

```
3/
The ChatGPT one is a chain. No app, no paste, no dev tools — you opened a shared conversation.

A Preview iframe called MathLive's keyboard listener, which took postMessage from any origin. HTML into innerHTML, an unsandboxed iframe, JS as chatgpt.com.

Five steps, one link.
```

```
4/
Cloudflare's is the quietest. GLM 5.3 had a 1,048,576-token context; the KV pool held 681,280.

Over-length prompts became a one-token placeholder instead of erroring, so decode attended over the previous request's cache.

155 responses, all over 681,280 tokens.
```

```
5/
What they share: all three were found outside the company, and all three were cheap to fix once known.

Cloudflare wrote the honest version themselves — they validated status codes at long context, not output.

A test that passes while the system is wrong.
```

```
6/
So the boundary moved.

The question isn't "is the model safe". It's: which component is trusted with the session, and does anyone test what happens when it's wrong?

An extension, an iframe, a KV pool. Three trust boundaries, three teams.
```

```
7/
What I'd check this week:

1. Which extensions can read your env vars?
2. Does your product trust postMessage without an origin check?
3. Do you test output at max context, or just status 200?

Pick one. Report back what you find.
```

---

## 中文 thread — 6 posts（重写，不是翻译）

```
中文1/
五周内三起事故，没有一起是"模型不安全"。

Cursor 插件被投毒、ChatGPT 分享链接接管账号、Cloudflare 155 个响应带出别人的 prompt。

问题不在模型，在信任边界画在哪儿。
```

```
中文2/
Cursor 那起：Anthropic 官方 Claude 插件 2.1.313，走认证账号发布，最多 5000 台机器，约 12 小时。它试图装 SSH 后门、收集云凭证变量名。

这不是越狱，是分发渠道被劫持。
```

```
中文3/
ChatGPT 那起更完整：不装 App、不粘代码、不开开发者工具，点开一个分享对话就够了。

Preview iframe 调用 MathLive 键盘监听器，它接受任意来源的 postMessage；布局 HTML 经 innerHTML 进父页面，再注入无 sandbox 的 iframe，最后 JS 以 chatgpt.com 身份执行。

五步，一个链接。
```

```
中文4/
Cloudflare 那起最安静。GLM 5.3 配 1,048,576 token 上下文，KV 池只装 681,280。

超长请求被换成一个 token 占位符而不是报错，decode 直接读到上一个请求的缓存。

155 个响应，全部超过 681,280。
```

```
中文5/
共同点：三起都是外部发现的，知道原因后都很便宜就能修。

Cloudflare 自己写了实话——他们只验了长上下文下的状态码，没验输出内容。

一种"系统已经错了，测试却通过"的测试。
```

```
中文6/
边界变了。问题不再是"模型安不安全"，而是：哪个组件被授予会话权限，有没有人测过它出错时的行为？

插件、iframe、KV 池——三条边界，三个团队。

这周挑一条查：谁能读你的环境变量？你信任 postMessage 时查来源吗？长上下文测试验的是输出还是 200？
```



