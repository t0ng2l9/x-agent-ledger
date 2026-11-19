# Agent Ledger — 项目工作记忆

> 本文件在每次新会话启动时自动加载。它代替「上一个对话的历史」。
> 修改项目状态后请同步更新本文件末尾的「进度」。

## 这是什么

用户在英国，运营一个中英双语的 AI 科技媒体账号 **Agent Ledger**（X 平台），
目标是通过 Grok + AI 生产内容，用联盟佣金 / 数字产品 / 商务合作 / X 官方奖励变现。

原始方案来自用户手机端 GPT，存档在 `source-plan-phone.md`。不要重新设计方案，
按它执行；需要偏离时先说明理由。

## 工作目录

`<repo>` —— 项目根目录，一切都在这里，不要往外写。

## 结构

| 路径 | 用途 |
|---|---|
| `README.md` | 上手说明、每日流程、英国合规说明 |
| `launch-checklist.md` | Day1–3：handle 抢注、bio、视觉、首次发布 |
| `reference-accounts.md` | 30 个参考账号与关注理由 |
| `visual-spec.md` | 配色/字号/版式规则，含实测出的硬性约束 |
| `posts-01-10.md` | 前 10 条（20 条中英），已核源 |
| `posts-11-13.md` | 第 11–13 条，从一手来源写 |
| `posts-14-17.md` | 第 14–17 条（nesformer / ChatGPT 账号接管 / Cloudflare KV / Boom） |
| `posts-18-20.md` | 第 18–20 条（WebGPU 实测 / LFM3 / 幽灵学生） |
| `posts-extra-2026-11-10.md` | 11-10 新鲜替换稿：OpenAI Control Room（EN + 中文草稿） |
| `manual-post-2026-11-10.md` | 11-10 零 API 成本发布包：网页手动/原生定时用，EN 帖 + Spawn Thread 7 条 |
| `thread-01-octoverse.md` | Thread 1（9 EN + 6 中文），Octoverse 深读 |
| `thread-02-spawn.md` | Thread 2（7 EN + 6 中文），Spawn |
| `thread-03-local-763b.md` | Thread 3（7 EN + 6 中文），763B 本地推理 |
| `thread-04-trust-boundaries.md` | Thread 4（7 EN + 6 中文），三起安全事故的共性 |
| `tool-test-01-webgpu.md` | Tool test 01 完整记录：方法、原始数字、不能证明什么 |
| `auto-publish.md` | X API 发布：设置、用法、价格、限流，以及与硬性规则第 3 条的冲突 |
| `tests/` | 可复现测试：webgpu-repeat.html + headless CDP 驱动 |
| `board.csv` | 30 天排期 + topic/asset/notes 列 + 指标回填列 |
| `assets/` | avatar / banner / 四张数据卡（SVG 为源，PNG 为产物） |
| `prompts/` | 6 个提示词：品牌、研究员、编辑、回复、Thread、周复盘 |
| `digests/` | 雷达每日输出（md + json） |
| `scripts/` | research.mjs（雷达）、check-posts.mjs（字数）、render-assets.ps1、gen-board.mjs |
| `scripts/x-*.mjs` | x-auth.mjs（OAuth PKCE）、x-post.mjs（单条/Thread/board 行，默认 dry run）、x-schedule.mjs（按 board 发当天到点的） |
| `scripts/x-runner.mjs` | 定时任务入口：未授权静默退出、加锁、90 分钟宽限 |
| `.agents/skills/agent-ledger-x/SKILL.md` | Agent Ledger X Skill：手动发布中英帖子、在同一条评论内写中英双语回复 |
| `secrets/` | client_id + OAuth token；`.gitignore` 已排除，只留 README |
| `_scratch/` | 临时脚本，可随时删 |

## 命令

```powershell
cd <repo>
.\run.ps1                                   # 跑雷达并打开结果
node scripts\research.mjs --days 7 --top 25 # 直接跑
node scripts\check-posts.mjs posts-01-10.md # 发帖前查字数
.\scripts\render-assets.ps1                 # SVG → PNG

# 自动发布（默认 dry run，加 --yes 才发）
node scripts\x-auth.mjs                     # 一次性授权
node scripts\x-post.mjs --whoami            # 确认发的是哪个账号
node scripts\x-schedule.mjs --due           # 今天该发什么
node scripts\x-schedule.mjs --due --yes     # 真发
schtasks /query /tn "AgentLedgerPublish" /v /fo LIST   # 自动发布任务状态
```

## 硬性规则（违反会出错，都是踩过的坑）

**内容**
- 每条帖子必须有可核验的一手来源链接 + 日期。只有标题的不写。
- 中文不是英文的翻译，是换角度重写：删铺垫，直接给判断。
- 英文 ≤280（CJK 按 2、URL 按 23 计算），发前跑 `check-posts.mjs`。
- 标签按需添加：仅当 1 个相关标签（最多 2 个）自然帮助主题检索时使用；不相关或显得堆砌就不加，不为蹭趋势硬加。
- 中英文同题帖不要紧挨着发布：确实都要发时错开数小时；起步期以英文为主，中文约每周 3 条，避免同一链接、图片和角度短时间重复出现。
- 选题优先新鲜的一手信息。旧闻必须明确标为回顾，或补充核实过的新进展，不要包装成刚发生的消息。
- 发后约 24 小时再记录和比较表现；记录展示/浏览、主页访问、回复、转发和新增关注。浏览量可能重复计数，不当作独立触达人数；不要凭单条早期数据改方向。
- 不编造数据、引述、来源。观点必须标明是观点。
- 帖子正文不要 "Great point" / "let's dive in" / 表情符号堆砌 / 标签堆砌。

**视觉**
- 配色只有 5 个：`#0B0D10` 底 / `#F2F4F7` 主文 / `#8A94A6` 次文 /
  `#5C6577` 元信息 / `#4ADE80` 强调。强调色只用一个元素。
- Banner 左下角 230×210 必须留空（X 会把头像压在那里）。
- 卡片两栏文字之间必须留空（三张卡实测 x940–978 区间 0 像素；右栏一律从 x=980 起）。
- 头像必须在 32×32 下可辨识（当前强调色占 7.91%，400×400 时 9.55%）。

**流程**
- 第一个月默认手动发帖。X 的奖励计划排除自动发布内容（此说法**未经当天核实**：
  `help.x.com` 403；见 `auto-publish.md` §0）。API 发布工具已做好且默认 dry run，
  是否启用由用户决定，不要替他打开。
- 不做自动回复 / 自动关注 —— 最快被限流的方式。
- 不开第二个账号。
- `agentdispatch` 和 `agent_dispatch` 两个 handle **已被占用**（2026-11-02 实测，
  后者是同类 AI 新闻号）。可用的是 `agentdispatchhq` / `agentdispatch_` /
  `agent_dispatch_` / `agentdispatchdaily` / `agentledger`。详见 `launch-checklist.md`。
- `board.csv` 的第一条帖子在 **2026-11-05（day 4）**，Day 1–3 是纯 build 行；
  `launch-checklist.md` 里的「day 3 就发一条」是彩排，两者不冲突，但别把
  11-05 当成冷启动后的第二帖。

## 环境事实

- Node v24，**没有 Python**（别写 .py）
- Chrome 和 Edge 都在；渲染用 headless Chrome
- `render-assets.ps1` 里对 Chrome 的 stderr 噪音做了处理（`$ErrorActionPreference`
  临时降级），否则会误判为失败
- **`--window-size=$w,$h` 在 PowerShell 里会被拆成两个参数**，Chrome 退回默认
  视口（762×484），PNG 尺寸全错但脚本仍报成功。必须写成
  `"--window-size=$w,$h"`。已修，且每次渲染后应核对 PNG 实际尺寸
- 渲染还要传一次性 `--user-data-dir`：本机已有 Chrome 在跑时，新 headless
  实例会挂到旧进程上并忽略窗口尺寸
- Chrome 需用 `--headless`（旧模式）；`--headless=new` 在本机同样退回 762×484
- Reddit / TechCrunch / VentureBeat / HN 抓不到（403 / 429 / 419，镜像站有
  Gandalf 验证）。这几家要么找一手来源，要么请用户手动粘贴
- computer-use（`sky.*`）在本会话不可用：`node_repl` MCP 工具没注册进来
- **本机时区是 China Standard Time（UTC+8），账号面向英国。** 排程的 slot
  时间一律按 `scripts/publish-config.json` 里的 `Europe/London` 解释；
  直接读系统时钟会让 `am`（10:00）在伦敦凌晨 02:00 发出去
- PowerShell 在这个环境里有时会退化：`Get-Content` / `Select-Object` /
  `Remove-Item` 偶发报 "not recognized"。多行脚本或删除操作用 `node -e` /
  `.mjs` 跑，比在 pwsh 里拼命令稳

## 用户偏好

- 直接给结果，不要反复确认
- 中文回答，术语保留英文
- 不喜欢「替代方案」式回避：方案里的东西就按方案做（例：英国可用，就按英国做）
- 会指出「没做的事」，期待被真正完成

---

## 进度

- [x] 手机方案移植为可执行项目（雷达 + 排期 + 提示词）
- [x] 视觉资产：avatar / banner / card-octoverse / card-763b / card-cursor
- [x] 帖子 1–10（EN + 中文，含来源、反驳、配图建议）
- [x] 帖子 11–13（GLB-3D-Coder / DeepSeek super-agent / Strata 763B，一手来源）
- [x] 排期表补 topic / asset / notes 列，13 条稿子全部落到具体日期
- [x] 第一篇 Thread：`thread-01-octoverse.md`（11-06）
- [x] 第二篇 Thread：`thread-02-spawn.md`（11-10；中文版 11-11）
- [x] 修 `render-assets.ps1` 的尺寸 bug（`--window-size` 被拆参 + 未校验尺寸），6 个 PNG 全部重渲染并逐个核对
- [x] 新卡 `card-cursor.png`（post 2 用，已过 gutter / 边距检查）
- [x] 帖子 14–17（11-18 → 11-21，四条一手来源）
- [x] Thread 3（11-17，763B 本地）与 Thread 4（11-24，信任边界）
- [x] 帖子 18–20（11-22 → 11-24；#18 是自己实测，不是转述）
- [x] 自动发布工具：`x-auth.mjs` / `x-post.mjs` / `x-schedule.mjs` + `auto-publish.md`（已实测 dry run，未连真实账号）
- [x] 自动发布定时任务：`AgentLedgerPublish` 每 5 分钟跑 `x-runner.mjs`（已安装、Last Result 0）
- [x] X OAuth 授权：`secrets\x-token.json` 已写入，账号确认 `@agentledger_`，refresh 可用，scope 含 `tweet.write`。浏览器 PKCE 授权返回 400，改用 Console 的 OAuth 2.0 Access Token `Generate` 绕过
- [ ] X API credits：当前余额 $0，写接口返回 `402 credits depleted`；充值前 runner 不会把行标成 failed，会保持 todo 等下一 tick
- [x] 2026-11-10：因 X API 无免费档，`AgentLedgerPublish` 已 **Disabled**，改走网页手动/原生定时；发布包 `manual-post-2026-11-10.md`。恢复自动发布：`schtasks /change /tn "AgentLedgerPublish" /enable`（充值后）
- [x] Agent Ledger X Skill：帖子发布与中英双语评论流程，位于 `.agents/skills/agent-ledger-x/SKILL.md`
- [x] 11-10 新鲜替换选题：Genie 4 旧稿换为 OpenAI Control Room（11-09 一手来源）；EN/CN 字数检查通过，英文待伦敦时段发布，中文已暂缓错开
- [x] 11-10 Spawn Thread 02 opening source/date attribution refreshed and all 13 EN/CN posts pass the character checker; moved the English thread to London 14:00, Chinese thread deferred
- [ ] 帖子 21–27（Day 25–30 的 7 条 EN，选题未定）
- [ ] Thread 5–8（11-13 / 11-20 / 11-27 / 12-01）
- [ ] Tool test 7 条 → **已完成 1 条**（WebGPU 复现，见 `tool-test-01-webgpu.md`），余 6 条
- [ ] Visual 6 条（11-12 / 11-19 / 11-22 / 11-26 / 11-29 等）
- [x] X 账号注册与资料设置：用户确认已完成 `@agentledger`（2026-11-02）；状态见 `launch-checklist.md`
- [ ] Day 15 免费 PDF、Day 22 付费 pack（README 建议推到 Day 35）








**发布工具的实测覆盖**：66 个 post 行里 48 个 dry run 通过；失败的 18 个全部是
「稿子还没写」（帖子 21–27、Thread 5–8），不是脚本问题。

**下一步**：帖子 21–27（Day 25–30，7 条 EN）—— 选题从 `digests/` 挑，每条仍要一手来源。
Tool test 还剩 6 条。WebGPU vs WASM 的对照试过了，WASM 后端在 headless 里 47 分钟没出第一个 token（见 `tool-test-01-webgpu.md`），别重复；要补就换 135M 模型。


