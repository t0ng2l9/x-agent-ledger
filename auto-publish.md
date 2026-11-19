# 自动发布到 X — 怎么跑，以及它和这个项目原规则冲突在哪

2026-11-02 建。以下每条 API 事实都来自当天打开的 X 官方文档
（`docs.x.com`），链接在每节末尾。**没有一条是从记忆里写的。**

---

## 0. 先说结论：能自动发，但这个项目原本写着不要自动发

`AGENTS.md` 的硬性规则第 3 条：

> 第一个月手动发帖，不用排程工具。X 的奖励计划排除自动发布内容。

工具我已经做好了（下面全部可用），但这条冲突必须你自己拍板，我不能替你决定：

| | 手动发 | API 自动发 |
|---|---|---|
| 每条成本 | 0 | $0.015 / 条（带链接 $0.20） |
| 9 条 Thread | 0 | $0.135 |
| 奖励计划资格 | 按原方案保留 | **按 `AGENTS.md` 的说法会失去** |
| 首月学习 | 看得到时间线实时反馈 | 看不到 |

关于「奖励计划排除自动发布」这一条：我**今天没能验证**。`help.x.com` 的
automation 与 creator 页面都返回 403（反爬），`docs.x.com` 只覆盖开发者政策，
不覆盖创作者奖励条款。所以这句话目前只是本项目的既有记录，不是我今天核实的事实。
发第一条自动帖之前，值得你自己去 `x.com/settings` 的奖励页面确认一次。

**X 开发者政策里我确实核实到的**（`docs.x.com/developer-guidelines`）：

- 自动化账号**必须**开启 profile 上的 "Automated" 标签
- 自动化账号的 bio 必须写明是 bot、由谁运营
- 自动化账号必须关联一个真人管理的账号
- 「Automated account posts scheduled content (news, weather, quotes)」→ 允许
- 「AI-powered app generates and posts replies」→ **需要 X 事先批准**
- 「App posts identical content across multiple accounts」→ 垃圾信息，禁止

所以：**发原创帖可以自动化，自动回复不行。** 这和 `AGENTS.md` 里
「不做自动回复 / 自动关注」是一致的，那两条不要碰。

### 0.1 一个政策灰区，你得知道

政策原文是「**All automated accounts using the X API** must meet these
requirements」，第一条就是开 profile 上的 "Automated" 标签。它对「bot 账号」
写得毫无余地，但对「真人运营、只是用 API 当发布工具」这种情形**没有明说** ——
Buffer / Typefully 这类排程工具的用户并不开这个标签，而它们走的也是官方 API。

三种做法，按保守程度排：

1. 不开标签，当作排程工具用（和 Buffer 用户一样）
2. 开标签，bio 写明 "Automated account managed by …"（最安全，但读者会当成 bot）
3. 发邮件问 X Policy Support，把答案存档

我不替你选。但如果哪天账号因为 automation 被限流，第 3 条是唯一能拿出来的凭证。

---

## 1. 一次性设置（约 5 分钟）

### 1.1 建 App 并拿 Client ID

1. https://developer.x.com → Projects & Apps → 你的 app → **Keys and tokens**
2. 抄下 **OAuth 2.0 Client ID**（Web App / Automated App 还有 Client Secret）
3. 同页 **User authentication settings** → Set up：
   - **Type of App: Native App** ← 选这个就不需要 client secret，最简单
   - **Callback URI: `http://127.0.0.1:8788/callback`** ← 必须一字不差，结尾不要斜杠
   - Website URL 随便填一个合法地址
4. 存进 `secrets\x-client.json`：

```json
{ "client_id": "你的-client-id" }
```

### 1.2 授权一次

```powershell
cd <repo>
node scripts\x-auth.mjs --client-id 你的-client-id
# 等价于先把 client_id 写进 secrets\x-client.json，再跑 node scripts\x-auth.mjs
```

浏览器会打开授权页，点 Authorize 后回调到本地 8788 端口，脚本把 token 写进
`secrets\x-token.json`。

申请的是 4 个 scope：`tweet.read tweet.write users.read offline.access`。
`offline.access` 是拿到 refresh token 的关键 —— 没有它 access token 两小时就失效，
每次发帖都得重新授权。

**如果浏览器授权页直接返回 `HTTP ERROR 400`**（本机 2026-11-10 实测过一次），
绕过办法是在 Console → **Keys & Tokens → OAuth 2.0 Keys → Access Token → Generate**
直接给自己的账号生成 token：勾 `tweet.write`、取消 `dm.read` / `dm.write`、保留
`Include refresh token`。把返回的 access + refresh 写进 `secrets\x-token.json`，
把 `expires_at` 设为 1 跑一次 `--whoami`，脚本会自动 refresh 并写入真实 scope。
以后用 `node -e` 只打印 `scope` 字段，确认里面有 `tweet.write`。

### 1.3 确认身份

```powershell
node scripts\x-post.mjs --whoami
```

打印 username / name / 公开指标。**这一步先跑**，确认发的是哪个账号。

---

## 2. 日常用法

三个脚本，全部默认 dry run。**不加 `--yes` 绝不会发出去。**

### 2.1 发一条（从排期表取稿）

```powershell
node scripts\x-post.mjs --board 2026-11-06 --slot am        # 预览
node scripts\x-post.mjs --board 2026-11-06 --slot am --yes  # 真发
```

它会自己读 `board.csv` 那一行的 `notes`（形如 `draft: posts-01-10.md #3`），
从对应文件里取出那一条的 EN 或中文段，按 `asset` 列挂图，发之前再核一次字数。

### 2.2 发 Thread

```powershell
node scripts\x-post.mjs --thread thread-01-octoverse.md            # 预览 9 条
node scripts\x-post.mjs --thread thread-01-octoverse.md --yes
node scripts\x-post.mjs --thread thread-01-octoverse.md --lang zh --yes
```

按顺序发，后一条 `reply.in_reply_to_tweet_id` 指向前一条，间隔 0.9 秒，
最后打印 thread 根链接。

### 2.3 发排期表里「今天到点的全部」

```powershell
node scripts\x-schedule.mjs --due                      # 看今天该发什么
node scripts\x-schedule.mjs --due --date 2026-11-06    # 预演某一天
node scripts\x-schedule.mjs --due --yes                # 真发
```

规则：只发 `date` 等于今天、slot 时间已到、`status` 严格等于 `todo` 的
EN post / CN post / Thread / CN thread 行。`deferred` / `posted` / `skipped`
都不会被自动发出去。同一天同一 slot 有多行时，调度器会把行类型传给
`x-post.mjs --type`，不会取错稿。发成功后：

- `board.csv` 那一行 `status` 改成 `posted`，`notes` 追加帖子 URL
- 追加一行到 `posting-log.tsv`

不会重复发同一条。某一行失败时（尤其是 Thread 发到一半），脚本会把
`status` 改成 `failed` 并在 `notes` 里写入首行错误，**不会每 5 分钟重试**；
修好原因后手动改回 `todo`：

```powershell
node scripts\x-schedule.mjs --mark 2026-11-10 pm --type Thread --status todo
```

slot 对应时间：`am` 10:00 · `pm` 14:00 · `pm2` 18:00 · `pm3` 20:00 ·
`eve` 22:00 —— **但这是发布时区的时间，不是这台电脑的时钟。**

这台机器是 China Standard Time，账号面向英国读者。如果直接用系统时钟，
`am`（10:00）会在伦敦时间凌晨 02:00 发出去。所以时区写死在
`scripts/publish-config.json`：

```json
{ "timezone": "Europe/London" }
```

优先级：`--tz <IANA>` > 环境变量 `TZ` > `publish-config.json` > 系统时区。
脚本会把这行打出来，发之前看一眼：

```
date 2026-11-06 10:xx Europe/London   due: 3
```

英国夏令时会在 2027-03-28 切回 GMT，`Europe/London` 会自动跟着变，
不需要你改配置。要是你搬到别的时区，改这一个字段。

### 2.4 手动改状态 / 看历史

```powershell
node scripts\x-schedule.mjs --mark 2026-11-06 am --status posted --note "https://x.com/i/status/123"
node scripts\x-schedule.mjs --log
```

### 2.5 图片与 Thread 的限制

- 单帖挂图：`board.csv` 的 `asset` 列有文件就自动上传，多张用 `;` 分隔
  （脚本目前只取第一张）。图片走 `POST /2/media/upload`，JSON body、
  base64、`media_category: tweet_image`。
- **Thread 目前不发图。** `--thread` 只发文字；要挂图得先发一条单帖，
  或者手动在第一条上补。这是已知缺口，不是 bug。

### 2.6 自动跑（已配置）

Windows 任务计划程序里的任务名是 **`AgentLedgerPublish`**，每 5 分钟跑一次：

```powershell
schtasks /query /tn "AgentLedgerPublish" /v /fo LIST
schtasks /run   /tn "AgentLedgerPublish"      # 手动触发一次
schtasks /change /tn "AgentLedgerPublish" /disable
```

它调用 `scripts\x-runner.mjs`，不是直接调 `x-schedule.mjs`。runner 做三件事：

- **未授权就静默退出**：没有 `secrets\x-client.json` 或 `x-token.json` 时不报错、不写日志
- **加锁**：同一时间只允许一个实例，避免两个 tick 重复发
- **90 分钟宽限**：只发 slot 开始后 90 分钟内的行；电脑睡到下午才醒，不会把
  10:00 和 14:00 两个 slot 一起补发出去

每次真正有动作时，输出追加到 `logs\publish-YYYY-MM.log`。

**还差最后一步授权**：把 X App 的 OAuth 2.0 Client ID 写进
`secrets\x-client.json`，跑一次 `node scripts\x-auth.mjs`。授权完成后不需要再动
任务计划，它会在下一个 5 分钟 tick 自动开始工作。

---

## 3. 花钱：X 现在是按次计费

`docs.x.com/x-api/getting-started/pricing`，2026-11-02 抄的：

| 动作 | 单价 |
|---|---|
| Post: Create | **$0.015** / 请求 |
| Post: Create **（含 URL）** | **$0.200** / 请求 |
| Post: Create (summoned) | $0.010 / 请求 |
| Media Metadata | $0.005 / 请求 |
| Media Upload | 价目表**没有单列**，按上面的 Metadata 计 |
| 读自己的帖子（Owned Reads） | $0.001 / 资源 |

图片帖的 `estimated cost: 0.020` 是保守估算（Create $0.015 + Media Metadata
$0.005）。上传本身在价目表里没有单独一行，实际可能更低。

**含链接的帖子贵 13 倍。** 我逐条查过：现在 8 个稿子文件里的 94 条正文
**一条 URL 都没有**（来源都写在 markdown 的 Source 行里，不在 fenced block 内）。
所以按当前稿子发，全部走 $0.015 这一档。一旦你在正文里加来源链接，
成本立刻按 $0.20 算 —— 27 条就是 $5.40，而不是 $0.41。

省钱的做法（也符合平台习惯）：正文不带链接，来源放在**第一条回复**里。
回复同样是 Post: Create，所以还是 $0.015，总共 $0.03，比 $0.20 省 85%。

按 30 天排期全量自动发（27 EN + 27 中文单帖 + 8 个 EN Thread + 4 个中文
Thread，Thread 按每条 6–9 算，合计约 **142 次 Post: Create**）：

- 全部不带链接：约 **$2.1**
- 全部带链接：约 **$28**
- 图片帖另外每条加 $0.005（当前排期只有 4 张卡，约 $0.02）

已经写好的 94 条（20 + 6 + 8 + 6 单帖，54 条 Thread）按不带链接算只要
**$1.41**。

没有订阅费，先充 credits，花完就停。新账号有两个一次性激励
（`docs.x.com/x-api/getting-started/free-credits`，2026-11-02 抄）：

- 绑第一张合格的卡并完成**第一次购买** → 送 **$20**
- 打开 auto-recharge → 首次自动充值**等额**返还，最多 **$50**
- 两项都拿到是 **$70**，**发放后 3 个月过期**，且先于你买的 credits 被消耗

也就是说：如果只打算跑一个月、成本 $1–13，$20 那一档就够，别开 auto-recharge。

---

## 4. 频率上限

`docs.x.com/fundamentals/rate-limits`：

| 端点 | 每 App | 每用户 |
|---|---|---|
| `POST /2/tweets` | 10,000 / 24h | **100 / 15min** |

100/15min 对每天 3–4 条完全够。真正会拦你的是账号本身的新号限流，
不是 API 配额。

---

## 5. 出错时看哪里

| 现象 | 原因 |
|---|---|
| `no secrets\x-token.json` | 没跑 `node scripts\x-auth.mjs` |
| `403 ... missing scope` | 授权时没勾 `tweet.write`，重跑 auth |
| `401` | token 失效且 refresh 失败，重跑 auth |
| `429` | 撞 15 分钟窗口，脚本会打印 reset 时间 |
| `token expired, refreshing…` | 正常，脚本自动换 |
| 图传上去但帖子没图 | 媒体还在 processing；图片通常即时，视频要轮询 |

---

## 6. 文件清单

| 文件 | 作用 |
|---|---|
| `scripts\x-auth.mjs` | OAuth 2.0 PKCE 授权，写 `secrets\x-token.json` |
| `scripts\x-post.mjs` | 发单条 / Thread / 按 board 行发；默认 dry run |
| `scripts\x-schedule.mjs` | 按 `board.csv` 找今天到点的行，发完回写状态 |
| `scripts\x-runner.mjs` | 定时任务入口：未授权静默退出、加锁、90 分钟宽限、写日志 |
| `secrets\x-client.json` | 你的 client_id（自己填，别提交） |
| `secrets\x-token.json` | 授权后生成（别提交） |
| `secrets\README.md` | 上面这些的说明 |
| `posting-log.tsv` | 每次发布的流水 |
| `logs\publish-YYYY-MM.log` | 定时任务每次真正发布/失败的输出 |
| `scripts\publish-config.json` | 发布时区（默认 `Europe/London`） |

`secrets\` 下已有 `.gitignore`，内容是 `*`，只保留 README 和它自己。

---

## 7. 我建议的实际用法

考虑到第 0 节那个冲突，我的建议是**混合**，而不是全自动：

- **Thread 用脚本发。** 9 条手动点 9 次、每次都要等上一条发完才有 reply id，
  这是最容易出错、也最没有学习价值的部分。自动发它省的是机械劳动。
- **每天第一帖手动发。** 你需要在时间线上看到它长什么样、谁先回、
  算法怎么推。这部分信息自动化拿不到。
- **回复永远手动。** 政策上「AI 生成并自动发回复」需要 X 事先批准，
  而 `AGENTS.md` 也已经把自动回复列为红线。

这样每天的 API 成本大约是 $0.10–0.14（一个 Thread），而不是全量的 $2.1。

### 7.1 先跑一周 dry run

任何一条都别直接 `--yes`。顺序是：

1. `node scripts\x-schedule.mjs --due` 每天跑，只看输出对不对
2. 对上了，再挑一个 Thread 手动 `--yes`（Thread 最机械、错得最明显）
3. 最后才考虑 `schtasks` 全自动

第 1 步能抓到 90% 的问题：取错稿、字数超、图片路径错、时区偏。

---

## 参考

- Create or Edit Post — https://docs.x.com/x-api/posts/create-post
- Upload Media — https://docs.x.com/x-api/media/upload-media
- OAuth 2.0 PKCE — https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code
- Rate limits — https://docs.x.com/fundamentals/rate-limits
- Pricing — https://docs.x.com/x-api/getting-started/pricing
- Developer Guidelines（自动化账号规则）— https://docs.x.com/developer-guidelines
- 以上链接 2026-11-02 全部返回 HTTP 200（`help.x.com` 仍 403，见 §0）
