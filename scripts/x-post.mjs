#!/usr/bin/env node
/**
 * Publish to X. One post, a thread, or a row straight out of board.csv.
 *
 *   node scripts\x-post.mjs --whoami
 *   node scripts\x-post.mjs --board 2026-11-06 --slot am            (preview)
 *   node scripts\x-post.mjs --board 2026-11-06 --slot am --yes      (publish)
 *   node scripts\x-post.mjs --text "test" --image assets\card-webgpu.png
 *   node scripts\x-post.mjs --thread thread-01-octoverse.md
 *   node scripts\x-post.mjs --thread thread-01-octoverse.md --lang zh --yes
 *
 * Dry run is the default. Nothing publishes unless you pass --yes.
 *
 * Auth: OAuth 2.0 user context (scripts\x-auth.mjs). App-only bearer tokens
 * cannot post. Token refreshes itself when it expires.
 *
 * Cost, per X's published pay-per-use rates (docs.x.com/x-api/getting-started/pricing):
 *   Post: Create              $0.015 / request
 *   Post: Create (with URL)   $0.200 / request   <-- keep links out of the body
 *   Media Metadata            $0.005 / request
 * A 9-post thread with no URLs is about $0.14. A single post with a link is $0.20.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokenFile = join(root, "secrets", "x-token.json");
const clientFile = join(root, "secrets", "x-client.json");

const LIMIT = 280;
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : null;
};

const dry = !has("--yes");
const lang = (val("--lang") || "en").toLowerCase();

// ---------------------------------------------------------------- token ----
function loadClient() {
  if (!existsSync(clientFile)) return {};
  return JSON.parse(readFileSync(clientFile, "utf8"));
}

function saveToken(t) {
  writeFileSync(tokenFile, JSON.stringify(t, null, 2), "utf8");
}

async function refresh(t) {
  if (!t.refresh_token) throw new Error("token expired and there is no refresh_token — re-run scripts\\x-auth.mjs");
  const client = loadClient();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: t.refresh_token,
    client_id: client.client_id,
  });
  const headers = { "content-type": "application/x-www-form-urlencoded" };
  if (client.client_secret) {
    headers.authorization = "Basic " + Buffer.from(`${client.client_id}:${client.client_secret}`).toString("base64");
  }
  const r = await fetch("https://api.x.com/2/oauth2/token", { method: "POST", headers, body });
  const txt = await r.text();
  if (!r.ok) throw new Error(`refresh failed (${r.status}): ${txt}`);
  const j = JSON.parse(txt);
  const next = {
    access_token: j.access_token,
    refresh_token: j.refresh_token ?? t.refresh_token,
    scope: j.scope ?? t.scope,
    token_type: j.token_type ?? "bearer",
    expires_at: j.expires_in ? Date.now() + j.expires_in * 1000 : null,
    obtained_at: new Date().toISOString(),
  };
  saveToken(next);
  return next;
}

async function token() {
  if (!existsSync(tokenFile)) throw new Error("no secrets\\x-token.json — run: node scripts\\x-auth.mjs");
  let t = JSON.parse(readFileSync(tokenFile, "utf8"));
  if (t.expires_at && Date.now() > t.expires_at - 60_000) {
    process.stderr.write("token expired, refreshing…\n");
    t = await refresh(t);
  }
  return t;
}

async function api(path, { method = "GET", body, auth = true } = {}) {
  let t = auth ? await token() : null;
  for (let attempt = 0; ; attempt++) {
    const headers = {};
    if (auth) headers.authorization = `Bearer ${t.access_token}`;
    if (body) headers["content-type"] = "application/json";
    const r = await fetch(`https://api.x.com${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const txt = await r.text();
    let json = null;
    try { json = txt ? JSON.parse(txt) : null; } catch {}

    // The stored expiry is an estimate; a 401 means refresh and retry once.
    if (r.status === 401 && auth && attempt === 0) {
      t = await refresh(t);
      continue;
    }
    if (!r.ok) {
      const detail = json?.detail || json?.title || txt.slice(0, 400);
      const e = new Error(`X API ${r.status}: ${detail}`);
      e.status = r.status;
      e.payload = json;
      throw e;
    }
    return json;
  }
}

// ------------------------------------------------------------ counting ----
const URL_RE = /https?:\/\/\S+/g;
export function weighted(text) {
  let t = text.replace(URL_RE, "\u0000");
  let n = 0;
  for (const ch of t) {
    if (ch === "\u0000") { n += 23; continue; }
    const cp = ch.codePointAt(0);
    const wide =
      (cp >= 0x1100 && cp <= 0x115f) || (cp >= 0x2e80 && cp <= 0xa4cf) ||
      (cp >= 0xac00 && cp <= 0xd7a3) || (cp >= 0xf900 && cp <= 0xfaff) ||
      (cp >= 0xfe30 && cp <= 0xfe6f) || (cp >= 0xff00 && cp <= 0xff60) ||
      (cp >= 0xffe0 && cp <= 0xffe6) || (cp >= 0x1f300 && cp <= 0x1faff) ||
      (cp >= 0x20000 && cp <= 0x3fffd);
    n += wide ? 2 : 1;
  }
  return n;
}

const hasUrl = (t) => /https?:\/\//.test(t);

// -------------------------------------------------------------- parsing ----
/** Fenced blocks, with the nearest "**EN**"/"**中文**" label and the h2 heading. */
function parsePostFile(path) {
  const src = readFileSync(path, "utf8");
  const out = [];
  let heading = null, label = null, inFence = false, buf = [];
  for (const line of src.split(/\r?\n/)) {
    if (/^```/.test(line)) {
      if (!inFence) { inFence = true; buf = []; }
      else {
        inFence = false;
        const text = buf.join("\n").trim();
        if (text) out.push({ heading, label, text });
      }
      continue;
    }
    if (inFence) { buf.push(line); continue; }
    const h2 = line.match(/^##\s+(.*)$/);
    if (h2) { heading = h2[1].trim(); label = null; continue; }
    const l = line.match(/^\*\*(EN|中文)[^*]*\*\*/);
    if (l) label = l[1] === "EN" ? "en" : "zh";
  }
  return out;
}

/** Thread file: blocks grouped by the "## …thread…" section they sit under. */
function parseThreadFile(path) {
  const src = readFileSync(path, "utf8");
  const out = { en: [], zh: [] };
  let section = null, inFence = false, buf = [];
  for (const line of src.split(/\r?\n/)) {
    if (/^```/.test(line)) {
      if (!inFence) { inFence = true; buf = []; }
      else {
        inFence = false;
        const text = buf.join("\n").trim();
        if (text && section) out[section].push(text);
      }
      continue;
    }
    if (inFence) { buf.push(line); continue; }
    const h2 = line.match(/^##\s+(.*)$/);
    if (h2) {
      const t = h2[1];
      section = /中文/.test(t) ? "zh" : /EN thread|English thread/i.test(t) ? "en" : null;
    }
  }
  return out;
}

/** Minimal CSV reader that handles the quoting gen-board.mjs writes. */
function readBoard() {
  const raw = readFileSync(join(root, "board.csv"), "utf8").replace(/^\uFEFF/, "");
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (q) {
      if (c === '"' && raw[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

// --------------------------------------------------------------- upload ----
async function uploadImage(file) {
  const abs = resolve(root, file);
  if (!existsSync(abs)) throw new Error(`image not found: ${file}`);
  const b64 = readFileSync(abs).toString("base64");
  const j = await api("/2/media/upload", {
    method: "POST",
    body: { media: b64, media_category: "tweet_image" },
  });
  const id = j?.data?.id;
  if (!id) throw new Error(`upload returned no id: ${JSON.stringify(j).slice(0, 300)}`);
  return id;
}

// ---------------------------------------------------------------- create ----
async function createPost(text, { mediaIds = [], replyTo = null } = {}) {
  const w = weighted(text);
  if (w > LIMIT) throw new Error(`post is ${w} weighted units, limit ${LIMIT}`);
  if (!text.trim()) throw new Error("empty post");

  const body = { text };
  if (mediaIds.length) body.media = { media_ids: mediaIds };
  if (replyTo) body.reply = { in_reply_to_tweet_id: replyTo };

  const j = await api("/2/tweets", { method: "POST", body });
  const id = j?.data?.id;
  if (!id) throw new Error(`create returned no id: ${JSON.stringify(j).slice(0, 300)}`);
  return { id, text, weighted: w };
}

function show(text, extra = "") {
  const w = weighted(text);
  const flag = w > LIMIT ? "OVER" : w > 258 ? "tight" : "ok";
  console.log(`  [${String(w).padStart(3)} ${flag}] ${text.replace(/\n/g, "\n            ")}${extra}`);
}

// ------------------------------------------------------------------ main ----
async function main() {
  // whoami
  if (has("--whoami")) {
    const me = await api("/2/users/me?user.fields=username,name,public_metrics");
    console.log(JSON.stringify(me.data, null, 2));
    return;
  }

  // --- explicit text ---
  if (val("--text")) {
    const text = val("--text");
    const img = val("--image");
    console.log(dry ? "DRY RUN (add --yes to publish)\n" : "PUBLISHING\n");
    show(text);
    if (img) console.log(`  image: ${img}`);
    if (weighted(text) > LIMIT) throw new Error(`post is ${weighted(text)} weighted units, limit ${LIMIT}`);
    if (dry) {
      if (hasUrl(text)) console.log("\n  note: contains a URL — X bills this at $0.20, not $0.015");
      return;
    }
    const mediaIds = img ? [await uploadImage(img)] : [];
    const r = await createPost(text, { mediaIds });
    console.log(`\npublished https://x.com/i/status/${r.id}`);
    return;
  }

  // --- thread ---
  if (val("--thread")) {
    const file = val("--thread");
    const parsed = parseThreadFile(join(root, file));
    const blocks = parsed[lang];
    if (!blocks || !blocks.length) throw new Error(`no ${lang} blocks found in ${file}`);
    console.log(`${file} · ${lang} · ${blocks.length} posts`);
    console.log(dry ? "DRY RUN (add --yes to publish)\n" : "PUBLISHING\n");
    blocks.forEach((b) => show(b));
    const over = blocks.filter(b => weighted(b) > LIMIT);
    if (over.length) throw new Error(`${over.length} post(s) over ${LIMIT}`);
    if (hasUrl(blocks.join(" "))) console.log("\n  note: thread contains a URL — those posts bill at $0.20 each");
    if (dry) {
      console.log(`\n  estimated cost: ${(blocks.length * 0.015).toFixed(3)} USD (no URLs)`);
      return;
    }
    let prev = null, first = null;
    for (let i = 0; i < blocks.length; i++) {
      const r = await createPost(blocks[i], { replyTo: prev });
      if (i === 0) first = r.id;
      console.log(`  ${i + 1}/${blocks.length}  https://x.com/i/status/${r.id}`);
      prev = r.id;
      await new Promise(res => setTimeout(res, 900));
    }
    console.log(`\nthread root: https://x.com/i/status/${first}`);
    return;
  }

  // --- from board.csv ---
  if (val("--board")) {
    const date = val("--board");
    const slot = val("--slot");
    if (!slot) throw new Error("--board needs --slot (am / pm / pm2 / pm3 / eve)");
    const rows = readBoard();
    const wantType = val("--type");
    const matches = rows.filter(r => r.date === date && r.slot === slot && (!wantType || r.type === wantType));
    if (!matches.length) throw new Error(`no row for ${date} slot ${slot}${wantType ? ` type ${wantType}` : ""}`);
    if (matches.length > 1) {
      throw new Error(`multiple rows for ${date} ${slot}: ${matches.map(r => r.type).join(" / ")} — pass --type`);
    }
    const row = matches[0];
    console.log(`${row.date} · ${row.slot} · ${row.type}`);
    console.log(`topic  ${row.topic}`);

    if (row.type === "Thread" || row.type === "CN thread") {
      const m = row.notes.match(/draft:\s*(\S+\.md)/);
      if (!m) throw new Error(`row has no draft file in notes: "${row.notes}"`);
      const file = m[1];
      const wantLang = row.type === "CN thread" ? "zh" : "en";
      const parsed = parseThreadFile(join(root, file));
      const blocks = parsed[wantLang];
      console.log(`draft  ${file} (${wantLang}, ${blocks.length} posts)`);
      console.log(dry ? "\nDRY RUN (add --yes to publish)\n" : "\nPUBLISHING\n");
      blocks.forEach(b => show(b));
      const over = blocks.filter(b => weighted(b) > LIMIT);
      if (over.length) throw new Error(`${over.length} post(s) over ${LIMIT}`);
      if (dry) {
        const est = blocks.reduce((sum, b) => sum + (hasUrl(b) ? 0.2 : 0.015), 0);
        console.log(`\n  estimated cost: ${est.toFixed(3)} USD`);
        return;
      }
      let prev = null, first = null;
      for (let i = 0; i < blocks.length; i++) {
        const r = await createPost(blocks[i], { replyTo: prev });
        if (i === 0) first = r.id;
        console.log(`  ${i + 1}/${blocks.length}  https://x.com/i/status/${r.id}`);
        prev = r.id;
        await new Promise(res => setTimeout(res, 900));
      }
      console.log(`\nthread root: https://x.com/i/status/${first}`);
      return;
    }

    // single post
    const numbered = row.notes.match(/draft:\s*(\S+\.md)\s*#(\d+)/);
    const unnumbered = row.notes.match(/draft:\s*(\S+\.md)/);
    if (!unnumbered) throw new Error(`row has no "draft: file.md" in notes: "${row.notes}"`);
    const file = unnumbered[1];
    const num = numbered?.[2];
    const posts = parsePostFile(join(root, file));
    const wantLang = row.type.startsWith("CN") ? "zh" : "en";
    let block;
    if (num) {
      block = posts.find(p => p.heading?.startsWith(`${num} ·`) && p.label === wantLang);
      if (!block) throw new Error(`could not find #${num} (${wantLang}) in ${file}`);
    } else {
      const sameLang = posts.filter(p => p.label === wantLang);
      if (sameLang.length !== 1) {
        throw new Error(`${file} has ${sameLang.length} ${wantLang} blocks and the row has no #n — add "#n" to the notes`);
      }
      block = sameLang[0];
    }

    console.log(`draft  ${file}${num ? ` #${num}` : ""} (${wantLang})`);
    console.log(dry ? "\nDRY RUN (add --yes to publish)\n" : "\nPUBLISHING\n");
    show(block.text);
    if (row.asset) console.log(`  image: ${row.asset}`);
    if (dry) {
      const est = (hasUrl(block.text) ? 0.2 : 0.015) + (row.asset ? 0.005 : 0);
      console.log(`\n  estimated cost: ${est.toFixed(3)} USD`);
      return;
    }
    const mediaIds = row.asset ? [await uploadImage(row.asset.split(";")[0].trim())] : [];
    const r = await createPost(block.text, { mediaIds });
    console.log(`\npublished https://x.com/i/status/${r.id}`);
    console.log(`\nnow record it: set status=posted in board.csv for ${row.date} ${row.slot}`);
    return;
  }

  console.log(`Agent Dispatch · X publisher

  --whoami                     show the authenticated account
  --board <date> --slot <slot> publish the row's draft (am/pm/pm2/pm3/eve)
  --thread <file> [--lang en|zh]
  --text "..." [--image <file>]

  add --yes to actually publish; without it everything is a dry run
`);
}

main().catch((e) => {
  console.error(`\n${e.message}`);
  if (e.status === 429) console.error("rate limited — the 15-minute window will reset; check x-rate-limit-reset");
  if (e.status === 403) console.error("403 usually means a missing scope: tweet.write is required to post");
  process.exit(1);
});


