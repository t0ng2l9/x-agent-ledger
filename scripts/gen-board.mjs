import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const start = new Date("2026-11-02T00:00:00Z"); // day 1
const rows = [];
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

const phase = (day) =>
  day <= 3 ? "P1 build" : day <= 7 ? "P2 test" : day <= 14 ? "P3 system" : day <= 21 ? "P4 validate" : "P5 convert";

const header = [
  "date","day","phase","slot","type","deliverable","topic","asset","est_min","status",
  "impressions","likes","profile_clicks","link_clicks","notes",
];

// day -> written post. Order is the publishing order in posts-01-10.md / posts-11-13.md
const POSTS = {
  4:  { n: 1,  title: "Gemini 4 Carbon — 发布但不可用", file: "posts-01-10.md", asset: "" },
  // 3 before 2 on purpose: thread 01 (11-06) expands the Octoverse story, so the
  // single post has to land the same day, not the day after.
  5:  { n: 3,  title: "Octoverse：40% 的 PR 由 agent 起草", file: "posts-01-10.md", asset: "assets/card-octoverse.png" },
  6:  { n: 2,  title: "Claude 插件在 Cursor 被投毒", file: "posts-01-10.md", asset: "assets/card-cursor.png" },
  7:  { n: 4,  title: "Vibe coding 做游戏跨线", file: "posts-01-10.md", asset: "" },
  8:  { n: 5,  title: "GPT-6.1 Terra：中间档才是落地档", file: "posts-01-10.md", asset: "" },
  9:  { n: 6,  title: "Genie 4 渲染世界，不是游戏", file: "posts-01-10.md", asset: "" },
  10: { n: 7,  title: "Mistral Large 4 与「开源」的新含义", file: "posts-01-10.md", asset: "" },
  11: { n: 8,  title: "Apple Intelligence 进中国（部分功能）", file: "posts-01-10.md", asset: "" },
  12: { n: 9,  title: "轨道上的 TPU", file: "posts-01-10.md", asset: "" },
  13: { n: 10, title: "不起眼的那条：datasette-llm 0.1a9", file: "posts-01-10.md", asset: "" },
  14: { n: 11, title: "4B 模型直接产出 3D 资产（GLB-3D-Coder）", file: "posts-11-13.md", asset: "" },
  15: { n: 12, title: "DeepSeek super-agent 原型与它的那条规则", file: "posts-11-13.md", asset: "" },
  16: { n: 13, title: "763B 参数跑在笔记本上（Strata）", file: "posts-11-13.md", asset: "assets/card-763b.png" },
  17: { n: 14, title: "NES CPU 编译进模型权重（nesformer）", file: "posts-14-17.md", asset: "" },
  18: { n: 15, title: "一个分享链接接管 ChatGPT 账号", file: "posts-14-17.md", asset: "" },
  19: { n: 16, title: "155 个响应带出别人的 prompt（Cloudflare）", file: "posts-14-17.md", asset: "" },
  20: { n: 17, title: "超音速客机，还是给 GPU 供电的燃气轮机", file: "posts-14-17.md", asset: "" },
  21: { n: 18, title: "greedy 解码在 WebGPU 上不确定（我实测）", file: "posts-18-20.md", asset: "assets/card-webgpu.png" },
  22: { n: 19, title: "LFM3：一个骨干，六个 2B 模型", file: "posts-18-20.md", asset: "" },
  23: { n: 20, title: "83 万个被标记的助学金账户", file: "posts-18-20.md", asset: "" },
};

// day -> English thread. pm2 slots only.
const THREADS = {
  5:  { name: "thread-01-octoverse.md", title: "The 40% number, read properly（Octoverse 深读）" },
  9:  { name: "thread-02-spawn.md",     title: "Spawn：每小时上线、token 比工资贵" },
  16: { name: "thread-03-local-763b.md", title: "763B 跑在笔记本上，门槛到底降在哪" },
  23: { name: "thread-04-trust-boundaries.md", title: "三起事故，一个模式：信任边界" },
};

// day -> Chinese thread (rewritten, not translated). Uses pm2 where it is free.
const CN_THREADS = {
  6:  { name: "thread-01-octoverse.md",      title: "Octoverse 深读（中文版，6 条）" },
  10: { name: "thread-02-spawn.md",          title: "Spawn（中文版，6 条）" },
  17: { name: "thread-03-local-763b.md",     title: "763B 本地推理（中文版，6 条）" },
  24: { name: "thread-04-trust-boundaries.md", title: "信任边界（中文版，6 条）" },
};

// day -> tool test. Only where the subject is actually runnable here.
const TESTS = {
  6:  { title: "WebGPU 复现：同一 prompt 连跑 3 次（已完成）", note: "见 tool-test-01-webgpu.md；tests/webgpu-repeat.html 可重跑" },
  7:  { title: "实测 Spawn：浏览器里建一个小游戏，计时 + 数 prompt 次数", note: "为 11-10 的 thread-02 供料；需真实操作截图" },
};

// day -> visual. These are the two visuals the written posts actually call for.
const VISUALS = {
  4:  { title: "post 2 时间线卡", note: "已完成：assets/card-cursor.png，gutter 0px / 边距 120" },
  7:  { title: "Battle Drones 截图（裁掉浏览器边框）", note: "post 4 用；必须自己截，不用别人的图" },
  14: { title: "GLB-3D-Coder 卡片：4B → GLB → Godot", note: "post 11 用；模型卡里的渲染图不可直接商用" },
  18: { title: "WebGPU 卡（post 18 用）", note: "已完成：assets/card-webgpu.png，gutter 0px / 边距 120" },
};

const pending = "待定（当日选题未定）";

for (let day = 1; day <= 30; day++) {
  const d = new Date(start.getTime() + (day - 1) * 86400000);
  const dow = d.getUTCDay(); // 0 Sun .. 6 Sat
  const date = iso(d);
  const ph = phase(day);
  const add = (slot, type, deliverable, topic, asset, est, notes = "") =>
    rows.push([date, day, ph, slot, type, deliverable, topic, asset, est, "todo", "", "", "", "", notes]);

  if (day >= 4) {
    const p = POSTS[day];
    const topic = p ? p.title : pending;
    const notes = p ? `draft: ${p.file} #${p.n}` : "";
    add("am", "EN post", "English short post", topic, p ? p.asset : "", 15, notes);
    add("pm", "CN post", "中文短帖 — 同一主题，换角度重写（不翻译）", topic, "", 15,
        p ? `draft: ${p.file} #${p.n}（中文段）` : "");

    if (dow === 2 || dow === 5) {
      const t = THREADS[day];
      add("pm2", "Thread", "英文深度 Thread（6–10 条）", t ? t.title : pending, "",
          60, t ? `draft: ${t.name}` : "未写");
    }
    if (dow === 3 || dow === 6) {
      const t = TESTS[day];
      add("pm2", "Tool test", "实际工具测试 + 截图/数据", t ? t.title : pending, "",
          45, t ? t.note : "未定主题；需可复现的测试对象");
    }
    if (dow === 4 || dow === 0) {
      const v = VISUALS[day];
      add("pm2", "Visual", "信息图 / 数据卡片", v ? v.title : pending, "",
          40, v ? v.note : "等当日 EN 帖定稿后再定");
    }
    const cnThread = CN_THREADS[day];
    if (cnThread) add("pm3", "CN thread", "中文 Thread（重写，不是翻译）", cnThread.title, "", 40, `draft: ${cnThread.name}`);

    if (dow === 0) add("eve", "Review", "周复盘：跑 05-analyst-weekly", "本周数据", "", 30);
  }

  if (day === 1) {
    add("block", "Brand", "注册 X 主账号；定名 Agent Dispatch；头像/Banner/简介", "Agent Dispatch", "assets/avatar.png; assets/banner.png", 90,
        "handle 候选顺序见 launch-checklist.md");
    add("block", "Research", "找 30 个参考账号，建 Notion 库", "8 lab / 8 indie / 8 reviewer / 6 agent", "", 60);
  }
  if (day === 2) add("block", "Research", "20 个备选选题入库（用 radar 跑 3 天）", "选题库", "", 60, "digests/radar-*.md 累积");
  if (day === 3) add("block", "Brand", "视觉规范定稿（见 launch-checklist.md）", "视觉系统", "visual-spec.md", 45);
  if (day === 8) add("block", "System", "Grok 研究工作流固定下来（01-researcher 每天跑）", "研究工作流", "", 45);
  if (day === 9) add("block", "System", "board.csv 数据回填习惯建立", "数据回填", "", 20);
  if (day === 15) add("block", "Product", "免费 PDF：50 Practical AI Workflows", "免费 PDF", "", 180);
  if (day === 16) add("block", "Product", "落地页 / 资源页上线（收集邮箱）", "落地页", "", 90);
  if (day === 17) add("block", "Revenue", "研究 5 个联盟计划，选 2 个申请", "联盟计划", "", 60);
  if (day === 22) add("block", "Product", "付费 Workflow Pack 制作（$9–19）", "付费 pack", "", 180, "README 建议推到 day 35（第 2 个月）");
  if (day === 23) add("block", "Revenue", "发布产品介绍帖 + 定价测试", "产品发布", "", 60);
  if (day === 29) add("block", "Review", "30 天数据总复盘，决定是否复制系统", "总复盘", "", 90);
}

const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "board.csv"), "\ufeff" + csv, "utf8");
console.log(`rows: ${rows.length}`);
console.log(`cols: ${header.length}`);














