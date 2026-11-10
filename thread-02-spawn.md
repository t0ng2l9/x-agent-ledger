# Thread 02 · Hourly shipping, and the one rule that makes it safe

**Slot** `board.csv` 2026-11-10 · Day 9 · `pm` (English, 14:00 Europe/London) · 中文版 deferred for a later review

**Primary sources, both opened on 2026-11-02:**

- Simon Willison, *Building a multiplayer game world with autonomous Fable-class
  models*, 2026-10-29 —
  https://simonwillison.net/2026/Oct/29/how-i-built-the-most-ai-pilled-company-in-the-world/
- https://spawn.co and https://spawn.co/about (product page + engine changelog)

**Quoted vs. checked**

- Quoted, attributed to the founder via Willison: 30x payroll on tokens, hourly
  shipping, the SEV-0 rule, 60% of work starting from breakage, Savi filing her
  own bugs, the 30-second rollback, the GPT-6 Astra security pass disabling
  features. I could not open Sansbury's original X post (the link in Willison's
  entry is a tweet I can't fetch), so every one of these is attributed out loud
  in the thread — "by the founder's account", "Sansbury's reasoning".
- Checked myself on `spawn.co/about`: a world is a git repository; `git push` to
  main updates every open room with no build or deploy; most pushes land in
  seconds and a large push can take a minute or more; `AGENTS.md` sits at the
  root of the clone; team is under 10 people; beta since February 2026.

**Why this is thread 2, not thread 1:** the strongest claims are the founder's
own numbers, relayed secondhand. Fine to publish with attribution. Not fine as
the first thing a cold account posts.

**Reply to expect:** "a game isn't production software." That is post 6, already
conceded on purpose. Don't argue it — point at post 6.

---

## EN thread — 7 posts
```
1/
Spawn is a multiplayer world changed by chatting to in-game agent Savi.

Founder Jacob Sansbury says agents ship its code hourly, at 30x payroll in tokens.

Why it works matters more than speed.

Source: Sansbury via Simon Willison (29 Oct 2026): https://simonwillison.net/2026/Oct/29/how-i-built-the-most-ai-pilled-company-in-the-world/
```

```
2/
An hour without a ship is a SEV-0, their most severe incident class.

Sansbury's reasoning: unshipped changes pile up, every bug in production lasts longer, and "an agent can only keep a few hours of work in its head."

Shipping faster keeps it coherent.
```

```
3/
About 60% of their work starts from something breaking: a production error, a bug Savi filed on herself, an odd log line, a user request.

Savi files it. An agent decides real bug / won't fix / intended. Usually it becomes a change within the hour.
```

```
4/
The detail that makes hourly shipping possible: a Spawn world is a git repo.

Push to main, every open room gets it. No build, no deploy. Most pushes land in seconds. Rollback is 30 seconds, scoped to the broken thing.

Deploy stopped being an event.
```

```
5/
Now the failure.

They ran GPT-6 Astra over the product for a security review. It "made the insecure things secure by turning them off." Every feature disabled, queued for re-enable.

The agent did exactly what was asked. That is the problem with asking.
```

```
6/
Willison says plainly he has trouble imagining this on software where being wrong is expensive. I agree.

A game is a place where a bad hour is recoverable and users forgive. That's the precondition, not the model.
```

```
7/
What transfers even if you never ship hourly:

1. Hand the agent the error, not the ticket.
2. Make rollback cheap before making shipping fast.
3. Write "don't act unless asked" into the repo, not into someone's head.

How many does your team have?
```

---

## 中文 thread — 6 posts（重写，不是翻译）

```
中文1/
在 Spawn，玩家和游戏代理 Savi 对话就能改写世界。创始人称，agent 每小时上线，token 开销约为工资的 30 倍。

关键不只快，而是怎样让这种做法可控。（来源：Sansbury 经 Simon Willison 转述，2026-10-29）

https://simonwillison.net/2026/Oct/29/how-i-built-the-most-ai-pilled-company-in-the-world/
```

```
中文2/
"一小时没上线"被定义成 SEV-0，最高级别事故。

理由：没发的改动会堆积，线上的 bug 活得更久，而且"一个 agent 脑子里只装得下几个小时的工作量"。发得越快，它反而越连贯。
```

```
中文3/
约 60% 的工作始于"出问题"：线上报错、Savi 自己提的 bug、日志异常、用户请求。

Savi 自己提 bug，另一个 agent 判断：真 bug、不修、还是设计如此。通常一小时内变成改动，回在同一条对话里。
```

```
中文4/
让"每小时上线"成立的基础设施细节：一个 Spawn 世界就是一个 git 仓库。

push 到 main，所有开着的房间立刻拿到。没有 build，没有 deploy，多数几秒生效。回滚 30 秒，只回滚坏的那一处。

部署不再是一个事件。
```

```
中文5/
然后是翻车。他们让 GPT-6 Astra 过一遍安全整改，结果它"把不安全的东西变安全的方式，是把它们全关掉"。所有功能被禁用，排队等修复后重开。

agent 完全按要求执行了。这正是"提要求"本身的问题。
```

```
中文6/
Willison 说他很难想象这套东西用在出错代价高的软件上。我同意：游戏能承受坏掉的一小时，这才是前提，不是模型。

即使你永远不做到每小时上线，能带走的就三条：给 agent 报错别给工单；先让回滚便宜再让上线快；把"没被要求就别动"写进仓库。

你们有几条？
```



