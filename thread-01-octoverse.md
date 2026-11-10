# Thread 01 · The 40% number, read properly

**Slot** `board.csv` 2026-11-06 · Day 5 · `pm2`. Same day as post 3, which
carries `assets\card-octoverse.png`. Do **not** attach the card again to post 1
of the thread — it is already in the timeline that morning and repeating it
reads as a repost.

**Primary source, read in full on 2026-11-02** — GitHub, *Octoverse: Commits,
pushes, reach new highs in 2026 as developers build with agents*, 2026-10-28:
https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/

**The argument in one line:** agents didn't make code review optional. They made
it the constraint, and the merge data is what proves it.

**Verified from the report body** — 17.9B pushes / 12 months, more than 2024 and
2025 combined · 1.3B merged PRs, 3.5M a day · 34.3B commits, 3x two years ago ·
>40% of PRs agent-started by September, 17% in March, 110M in September (~6x
March) · 87% of agent-started PRs touch multiple files vs 79% · merged within two
weeks: 83% vs ~86% in February, 90% vs 86% by September · 55% of Copilot MAU use
agentic features (35% a year ago) · cloud agent +230% YoY vs agent chat +85% ·
61% of Copilot users used more than one model in September (50% four months
earlier) · 264,000 developers used stacked PRs by September · repos created in
2026 with an agent config file logged 8x the commits of those without.

**Not claimed:** that agents write worse code, or that review quality has fallen.
GitHub publishes no review-depth metric. Post 8 is arithmetic on GitHub's own
number and is labelled as such.

---

## EN thread — 9 posts

```
1/
GitHub's Octoverse: by September, more than 40% of pull requests started with an agent's first draft. In March it was 17%.

That's 110M agent-started PRs in one month.

The number isn't the interesting part. What happens to them next is.
```

```
2/
Context, because the headline numbers are absurd:

17.9B pushes in 12 months, more than 2024 and 2025 combined. 1.3B merged PRs. 34.3B commits.

Every dashboard you use to judge a team is now inflated by something you can't separate out.
```

```
3/
Who: 55% of Copilot's monthly active users now use agentic features, up from 35% a year ago.

The fastest-growing mode is the most hands-off. Copilot cloud agent, where you assign a task and walk away, grew 230% year over year. Agent chat grew 85%.
```

```
4/
And it isn't a few power users.

Among repos created in 2026, the average one with an agent config file logged 8x the commits of the average new repo without one.

The file isn't causing the commits. Those repos already worked this way.
```

```
5/
Here's the part almost nobody quotes.

Agent-started PRs touch more files: 87% vs 79%.

And they merge faster. February: 83% within two weeks, against ~86% for the rest. September: 90% against 86%.

They aren't being rejected. They're getting through.
```

```
6/
That flips the risk.

The failure mode isn't an agent writing bad code that gets caught. It's an agent writing plausible code across seven files, and a reviewer approving it because CI is green and the diff is too long to read.

Review is the bottleneck now.
```

```
7/
Caveats: this is GitHub's report and GitHub sells Copilot.

"Started with an agent's draft" includes a one-line suggestion. Merging fast isn't being reviewed. The language splits may be reporting, not adoption.

The 17% to 40% curve survives all three.
```

```
8/
Arithmetic, not data: 110M agent-started PRs in September. Ten real minutes each is 18M hours — 106,000 people reviewing full-time for a month.

Nobody has them.

So most aren't read line by line. Not a prediction: the only way the numbers fit.
```

```
9/
Agents didn't make code review optional. They made it the constraint.

If you build for developers this year, attack the queue between "PR opened" and "PR understood" — not the one between "idea" and "PR".

What's your review time per PR, and do you measure it?
```

---

## 中文 thread — 6 posts（重写，不是翻译）

For readers who already saw the 40%. It skips the setup and leads with the
consequence. Published 11-07 `pm` as a standalone, not as a quote-thread.

```
中文1/
GitHub 年度报告：9 月已有超过 40% 的 PR 由 agent 起草第一版，3 月是 17%。单月 1.1 亿个，6 倍于 3 月。

但真正值得看的不是比例，是这些 PR 后来的下场。
```

```
中文2/
先看体量：12 个月 179 亿次 push，超过 2024 和 2025 之和；13 亿个 PR 被合并；343 亿次 commit。

问题在于：你现在用来衡量团队产出的每个数字，都被一个拆不出来的东西抬高了。
```

```
中文3/
再看是谁在干。Copilot 月活里 55% 已用上 agent 功能，一年前是 35%。

涨最快的是最"放手"的那档：cloud agent 同比 +230%，agent chat 只有 +85%。人正在从"提问"转向"交活"。
```

```
中文4/
关键数据在这里，而且几乎没人引用：

agent 起草的 PR 改的文件更多（87% vs 79%），合并还更快——2 月两周内合并率 83%（其他 86%），9 月反超成 90%（其他 86%）。

它们不是被拒了，是被放行了。
```

```
中文5/
所以风险方向变了。

不是"agent 写出烂代码被抓住"，而是"agent 在 7 个文件里写出看起来对的代码，CI 绿了，diff 太长没人读，于是过审"。

瓶颈从写移到了审。9 月已有 26.4 万开发者用过 stacked PRs。
```

```
中文6/
保留意见：报告是 GitHub 自己的，而它卖 Copilot。"由 agent 起草"包含一行补全；合并快不等于审过；不同语言的比例差可能只是上报差异。

但 17% → 40% 这条曲线，三种质疑都推不倒。

你们团队每个 PR 的 review 时间是多少？测不测？
```




