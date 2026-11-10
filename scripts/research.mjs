#!/usr/bin/env node
/**
 * Agent Dispatch — Research Radar
 * Scans the feeds in feeds.json, scores every item against the four coverage
 * areas, and writes a dated markdown digest + JSON to work/digests/.
 *
 * Zero dependencies. Requires Node 18+ (uses global fetch).
 *
 *   node research.mjs                 # today
 *   node research.mjs --days 3        # look back 3 days
 *   node research.mjs --top 15        # keep 15 items
 *   node research.mjs --json          # also print machine-readable JSON
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");                        // -> kit root (C:\Users\刘\Desktop\X)
const DIGEST_DIR = join(ROOT, "digests");
const FEEDS_PATH = join(HERE, "feeds.json");

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(name);
  return i === -1 ? dflt : args[i + 1] ?? dflt;
};
const LOOKBACK_DAYS = Number(flag("--days", 3));
const TOP_N = Number(flag("--top", 20));
const PER_SOURCE = Number(flag("--per-source", 3));   // stop one feed from eating the list
const EMIT_JSON = args.includes("--json");

/* ---------------------------------------------------------------- scoring */

// Four coverage areas from the editorial brief. Weights are per-keyword;
// a title match counts full, a summary-only match counts 40%.
const AREAS = [
  {
    id: "agents",
    label: "AI agents & autonomous workflows",
    terms: ["agent", "agentic", "autonomous", "workflow", "orchestration", "mcp", "tool use",
            "multi-agent", "browser use", "computer use", "sandbox", "long-running", "harness"],
  },
  {
    id: "coding",
    label: "AI coding & vibe coding",
    terms: ["coding", "code", "coder", "copilot", "ide", "vibe", "vibe-coding", "swe-bench",
            "refactor", "cli", "developer", "pull request", "typescript", "python", "compiler",
            "codex", "claude code", "cursor", "devin", "terminal"],
  },
  {
    id: "models",
    label: "New models & products",
    terms: ["model", "release", "launch", "gpt", "claude", "gemini", "llama", "qwen", "deepseek",
            "mistral", "grok", "weights", "open-source", "open source", "benchmark", "context window",
            "reasoning", "multimodal", "video", "image", "voice", "speech", "embedding"],
  },
  {
    id: "business",
    label: "AI business models & monetization",
    terms: ["revenue", "pricing", "price", "monetiz", "business", "startup", "funding", "raise",
            "acquire", "acquisition", "ipo", "enterprise", "arr", "subscription", "cost",
            "margin", "customer", "market", "billion", "million", "valuation"],
  },
];

// Signals that a story is *talkable* on X, independent of topic.
const HOOK_TERMS = ["first", "launch", "now available", "free", "open source", "open-source",
  "benchmark", "beats", "faster", "cheaper", "10x", "killed", "shut down", "leak", "rumor",
  "controversy", "lawsuit", "ban", "security", "vulnerability", "breaks", "deprecat"];

// Noise we do not want on the timeline.
const NOISE = ["webinar", "podcast episode", "register now", "sponsored", "hire", "job",
  "we are hiring", "join our team", "coupon", "black friday", "giveaway"];

// Substring matching on short terms is a trap: "code" hits "decode", "barcode",
// "encoder". Terms of 5 chars or fewer must match on a word boundary.
const matcherCache = new Map();
function matcher(term) {
  let re = matcherCache.get(term);
  if (!re) {
    re = term.length <= 5
      ? new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
      : null;
    matcherCache.set(term, re);
  }
  return re;
}

const has = (text, term) => {
  const re = matcher(term);
  return re ? re.test(text) : text.includes(term);
};

function scoreItem(item) {
  const title = (item.title || "").toLowerCase();
  const body = (item.summary || "").toLowerCase();
  const hits = [];
  let base = 0;

  for (const area of AREAS) {
    let n = 0;
    for (const t of area.terms) {
      if (has(title, t)) n += 2;
      else if (has(body, t)) n += 0.8;
    }
    if (n > 0) {
      base += Math.min(n, 6);
      hits.push(area.id);
    }
  }

  const hook = HOOK_TERMS.filter((t) => has(title, t)).length;
  const noise = NOISE.filter((t) => has(title, t)).length;

  // Recency: today = 1.0, decays to 0.55 at the lookback edge.
  const ageDays = (Date.now() - item.ts) / 86_400_000;
  const recency = Math.max(0.55, 1 - ageDays / (LOOKBACK_DAYS * 2));

  // Two or more distinct coverage areas = genuinely cross-cutting story.
  const breadth = hits.length >= 2 ? 1.25 : 1.0;

  const raw = (base * item.weight + hook * 0.9) * recency * breadth - noise * 2.5;

  return {
    ...item,
    areas: hits,
    score: Math.round(Math.max(0, raw) * 100) / 100,
  };
}

/* ----------------------------------------------------------------- parsing */

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };
const decode = (s) =>
  s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, k) => {
    if (k[0] === "#") {
      const code = k[1].toLowerCase() === "x" ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENT[k] ?? m;
  });

// Feeds double-encode HTML often enough that one pass is not enough: strip,
// decode entities, then strip again, until the string stops changing.
const stripOnce = (s) =>
  String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");

const stripTags = (input) => {
  let s = String(input || "");
  for (let i = 0; i < 3; i++) {
    const next = stripOnce(decode(s));
    if (next === s) break;
    s = next;
  }
  return s.replace(/\s+/g, " ").trim();
};

function pick(block, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  return m ? m[1] : "";
}

function pickAttr(block, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}=["']([^"']+)["']`, "i");
  const m = block.match(re);
  return m ? m[1] : "";
}

function parseFeed(xml, feed) {
  const isAtom = /<entry[\s>]/i.test(xml);
  const chunks = isAtom
    ? xml.split(/<entry[\s>]/i).slice(1).map((c) => "<entry " + c)
    : xml.split(/<item[\s>]/i).slice(1).map((c) => "<item " + c);

  const out = [];
  for (const chunk of chunks) {
    const title = stripTags(pick(chunk, "title"));
    if (!title) continue;

    let link = "";
    if (isAtom) {
      link = pickAttr(chunk, "link", "href");
      if (!link) link = stripTags(pick(chunk, "id"));
    } else {
      link = stripTags(pick(chunk, "link"));
      if (!link) link = stripTags(pick(chunk, "guid"));
    }

    const dateStr =
      stripTags(pick(chunk, "pubDate")) ||
      stripTags(pick(chunk, "published")) ||
      stripTags(pick(chunk, "updated")) ||
      stripTags(pick(chunk, "dc:date"));

    const ts = Date.parse(dateStr);
    const summary = stripTags(
      pick(chunk, "description") || pick(chunk, "summary") || pick(chunk, "content:encoded")
    ).slice(0, 700);

    out.push({
      title,
      url: link.trim(),
      source: feed.name,
      tag: feed.tag,
      weight: feed.weight ?? 1,
      ts: Number.isFinite(ts) ? ts : Date.now(),
      date: Number.isFinite(ts) ? new Date(ts).toISOString().slice(0, 10) : "unknown",
      summary,
    });
  }
  return out;
}

/* -------------------------------------------------------------------- main */

async function fetchFeed(feed) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(feed.url, {
      signal: ctrl.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AgentDispatchResearch/1.0",
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });
    if (!res.ok) return { feed, items: [], error: `HTTP ${res.status}` };
    const xml = await res.text();
    return { feed, items: parseFeed(xml, feed), error: null };
  } catch (e) {
    return { feed, items: [], error: e.name === "AbortError" ? "timeout" : e.message };
  } finally {
    clearTimeout(timer);
  }
}

const cfg = JSON.parse(await readFile(FEEDS_PATH, "utf8"));
const feeds = cfg.feeds;

console.log(`Scanning ${feeds.length} feeds (lookback ${LOOKBACK_DAYS}d)...\n`);

const results = await Promise.all(feeds.map(fetchFeed));

const cutoff = Date.now() - LOOKBACK_DAYS * 86_400_000;
const all = [];
const problems = [];

for (const { feed, items, error } of results) {
  if (error) {
    problems.push(`${feed.name}: ${error}`);
    console.log(`  x  ${feed.name.padEnd(20)} ${error}`);
    continue;
  }
  const fresh = items.filter((i) => i.ts >= cutoff);
  all.push(...fresh);
  console.log(`  ok ${feed.name.padEnd(20)} ${String(fresh.length).padStart(3)} fresh / ${items.length} total`);
}

// De-dupe by normalised title.
const seen = new Set();
const scored = all
  .map(scoreItem)
  .filter((i) => {
    const key = i.title.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 70);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .filter((i) => i.score > 0)
  .sort((a, b) => b.score - a.score);

// Diversity pass: walk the ranking, take at most PER_SOURCE items per feed.
// A subreddit or a high-volume blog should not fill the whole digest.
const perSourceCount = new Map();
const selected = [];
for (const item of scored) {
  const used = perSourceCount.get(item.source) ?? 0;
  if (used >= PER_SOURCE) continue;
  perSourceCount.set(item.source, used + 1);
  selected.push(item);
  if (selected.length >= TOP_N) break;
}

/* ------------------------------------------------------------------ output */

const today = new Date().toISOString().slice(0, 10);
await mkdir(DIGEST_DIR, { recursive: true });

const AREA_LABEL = Object.fromEntries(AREAS.map((a) => [a.id, a.label]));

const md = [];
md.push(`# Research radar — ${today}`);
md.push("");
md.push(`Sources scanned: ${feeds.length} · items in window: ${all.length} · kept: ${selected.length} (max ${PER_SOURCE}/source)`);
if (problems.length) md.push(`\nUnavailable: ${problems.join("; ")}`);
md.push("");
md.push("Ranked candidates. Pick 1-3, then hand the full brief to Grok for the");
md.push("editorial angle, the counterargument, and a testable experiment.");
md.push("");

selected.forEach((item, idx) => {
  md.push(`## ${idx + 1}. ${item.title}`);
  md.push("");
  md.push(`- **Score** ${item.score} · **Areas** ${item.areas.map((a) => AREA_LABEL[a]).join(" / ") || "—"}`);
  md.push(`- **Source** ${item.source} · ${item.date}`);
  md.push(`- **Link** ${item.url || "(no link)"}`);
  if (item.summary) md.push(`- **Summary** ${item.summary.slice(0, 320)}`);
  md.push("");
});

md.push("---");
md.push("");
md.push("### Paste-ready handoff to Grok");
md.push("");
md.push("```");
md.push("Below are candidate stories from my radar. For the three highest-potential");
md.push("ones, give me: English editorial angle, Chinese editorial angle, the");
md.push("strongest counterargument, and one experiment I could actually run this");
md.push("week. Flag anything you cannot verify against a primary source.");
md.push("");
selected.slice(0, 8).forEach((i) => md.push(`- ${i.title} (${i.source}, ${i.date}) ${i.url}`));
md.push("```");
md.push("");

const mdPath = join(DIGEST_DIR, `radar-${today}.md`);
await writeFile(mdPath, md.join("\n"), "utf8");

const jsonPath = join(DIGEST_DIR, `radar-${today}.json`);
await writeFile(jsonPath, JSON.stringify({ generated: new Date().toISOString(), items: selected }, null, 2), "utf8");

console.log(`\nKept ${selected.length} candidates.`);
console.log(`  ${mdPath}`);
console.log(`  ${jsonPath}`);

if (EMIT_JSON) console.log(JSON.stringify(selected, null, 2));
