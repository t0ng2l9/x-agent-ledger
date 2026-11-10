#!/usr/bin/env node
/**
 * Board-aware publishing: which rows are due, mark them posted, keep a log.
 *
 *   node scripts\x-schedule.mjs --due
 *   node scripts\x-schedule.mjs --due --date 2026-11-06     (preview a day)
 *   node scripts\x-schedule.mjs --due --yes
 *   node scripts\x-schedule.mjs --mark 2026-11-06 am --status posted --note "https://x.com/i/status/123"
 *   node scripts\x-schedule.mjs --log
 *
 * `--due` publishes every row whose date is today in the publish timezone and
 * whose slot time has passed, and whose status is still `todo`. It never
 * touches a row twice: after publishing it writes status=posted and the post
 * URL into notes.
 *
 * Slot times are the ones in README's daily loop, in the PUBLISH timezone:
 *   am 10:00   pm 14:00   pm2 18:00   pm3 20:00   eve 22:00
 *
 * Timezone resolution: --tz <IANA>  >  $env:TZ  >  scripts/publish-config.json
 * ("timezone")  >  system timezone. This machine runs on China Standard Time
 * while the account is aimed at a UK audience, so the config pins
 * Europe/London; without it "10:00" would mean 02:00 in London.
 *
 * Blocks (Brand/Research/System/Product/Revenue/Review) are skipped — they are
 * not posts.
 *
 * Deliberately no daemon. Run it when you sit down, or leave the
 * `AgentLedgerPublish` Windows task installed (every 5 min -> x-runner.mjs).
 * --grace <minutes> limits auto-publish to a window after the slot starts.
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const boardFile = join(root, "board.csv");
const logFile = join(root, "posting-log.tsv");
const configFile = join(root, "scripts", "publish-config.json");

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : null;
};

const SLOT_HOUR = { am: 10, pm: 14, pm2: 18, pm3: 20, eve: 22 };
const POST_TYPES = new Set(["EN post", "CN post", "Thread", "CN thread"]);

// --- timezone ---------------------------------------------------------------
function resolveZone() {
  const explicit = val("--tz") || process.env.TZ || null;
  if (explicit) return explicit;
  if (existsSync(configFile)) {
    let cfg;
    try {
      cfg = JSON.parse(readFileSync(configFile, "utf8"));
    } catch (e) {
      console.error(`cannot read ${configFile}: ${e.message}`);
      process.exit(1);
    }
    if (cfg.timezone) return cfg.timezone;
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const ZONE = resolveZone();
try {
  new Intl.DateTimeFormat("en-CA", { timeZone: ZONE });
} catch {
  console.error(`unknown timezone: ${ZONE} (use an IANA name like Europe/London)`);
  process.exit(1);
}

/** Calendar date and hour in ZONE, independent of this machine's clock. */
function zoneNow(when = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(when);
  const get = (t) => parts.find((x) => x.type === t)?.value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")) % 24,
    minute: Number(get("minute")),
  };
}

// --- CSV in / out, preserving the BOM and CRLF that gen-board.mjs writes ----
function readBoard() {
  const raw = readFileSync(boardFile, "utf8").replace(/^\uFEFF/, "");
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
  const objects = rows.filter(r => r.length > 1).map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
  return { header, objects };
}

const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function writeBoard(header, objects) {
  const csv = [header, ...objects.map(o => header.map(h => o[h] ?? ""))]
    .map(r => r.map(esc).join(","))
    .join("\r\n");
  writeFileSync(boardFile, "\uFEFF" + csv, "utf8");
}

function dueRows(objects, overrideDate) {
  const now = zoneNow();
  const today = overrideDate || now.date;
  // --date also ignores the clock, so you can preview a whole day in the morning.
  const ignoreClock = Boolean(overrideDate);
  // Auto-publishing uses a grace window so waking the PC at 15:00 does not
  // suddenly publish both the 10:00 and 14:00 slots.
  const graceMinutes = Number(val("--grace") ?? 24 * 60);
  const nowMinutes = now.hour * 60 + now.minute;
  return objects.filter((o) => {
    if (o.date !== today) return false;
    if (!POST_TYPES.has(o.type)) return false;
    if (o.status !== "todo") return false;
    const h = SLOT_HOUR[o.slot];
    if (h === undefined) return false;
    if (ignoreClock) return true;
    const start = h * 60;
    return nowMinutes >= start && nowMinutes < start + graceMinutes;
  });
}

// --- main ------------------------------------------------------------------
if (has("--log")) {
  if (!existsSync(logFile)) { console.log("no posts logged yet"); process.exit(0); }
  console.log(readFileSync(logFile, "utf8"));
  process.exit(0);
}

if (has("--mark")) {
  const date = val("--mark");
  const slot = args[args.indexOf("--mark") + 2];
  const status = val("--status") || "posted";
  const note = val("--note") || "";
  const wantType = val("--type");
  const { header, objects } = readBoard();
  const row = objects.find(o => o.date === date && o.slot === slot && (!wantType || o.type === wantType));
  if (!row) { console.error(`no row for ${date} ${slot}${wantType ? ` type ${wantType}` : ""}`); process.exit(1); }
  row.status = status;
  if (note) row.notes = (row.notes ? row.notes + " | " : "") + note;
  writeBoard(header, objects);
  console.log(`${date} ${slot} -> ${status}`);
  process.exit(0);
}

const dry = !has("--yes");
const { header, objects } = readBoard();
const overrideDate = val("--date");
const due = dueRows(objects, overrideDate);
const now = zoneNow();

console.log(`Agent Dispatch · scheduler   ${new Date().toISOString()}`);
console.log(`date ${now.date} ${String(now.hour).padStart(2, "0")}:xx ${ZONE}${overrideDate ? `   previewing ${overrideDate}` : ""}   due: ${due.length}`);
if (!due.length) {
  console.log("\nnothing due. (`--mark` to fix a row by hand, `--log` to see history)");
  process.exit(0);
}

let published = 0, failed = 0;
for (const row of due) {
  console.log(`\n── ${row.date} ${row.slot} · ${row.type} · ${row.topic}`);
  const r = spawnSync(
    process.execPath,
    [join(root, "scripts", "x-post.mjs"), "--board", row.date, "--slot", row.slot, "--type", row.type, ...(dry ? [] : ["--yes"])],
    { encoding: "utf8" }
  );
  process.stdout.write(r.stdout || "");
  if (r.stderr) process.stderr.write(r.stderr);

  if (r.status !== 0) {
    failed++;
    if (!dry) {
      // Fail closed: stop retrying a row (especially a partly posted thread)
      // and leave a visible reason. Reset to todo after fixing the cause.
      const reason = `${r.stderr || r.stdout || "unknown error"}`.trim().split(/\r?\n/)[0].slice(0, 300);
      // No credits is temporary: keep the row todo so the next tick can post
      // after a top-up, instead of forcing a manual reset.
      if (!/\b402\b|credits depleted/i.test(reason)) {
        row.status = "failed";
        row.notes = (row.notes ? row.notes + " | " : "") + `auto-failed ${new Date().toISOString()}: ${reason}`;
        writeBoard(header, objects);
      }
    }
    continue;
  }

  if (!dry) {
    const m = (r.stdout || "").match(/https:\/\/x\.com\/i\/status\/(\d+)/);
    const url = m ? m[0] : "";
    row.status = "posted";
    row.notes = (row.notes ? row.notes + " | " : "") + (url || `posted ${new Date().toISOString()}`);
    appendFileSync(
      logFile,
      [new Date().toISOString(), row.date, row.slot, row.type, url, row.topic].join("\t") + "\n",
      "utf8"
    );
    // Persist immediately: a crash on the next row must not cause a re-post.
    writeBoard(header, objects);
    published++;
  }
}

if (!dry) {
  writeBoard(header, objects);
  console.log(`\npublished ${published}, failed ${failed}`);
  console.log(`board.csv updated; history in posting-log.tsv`);
} else {
  console.log(`\nDRY RUN — add --yes to publish these ${due.length} row(s)`);
}
