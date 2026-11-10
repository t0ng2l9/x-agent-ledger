#!/usr/bin/env node
/**
 * Idle-safe wrapper for Windows Task Scheduler.
 *
 * Runs `x-schedule.mjs --due --yes --grace 90` only when OAuth is configured, takes a
 * lock so overlapping ticks cannot double-post, and appends every real run to
 * logs\publish-YYYY-MM.log.
 *
 *   node scripts\x-runner.mjs
 */

import { appendFileSync, existsSync, mkdirSync, openSync, closeSync, statSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clientFile = join(root, "secrets", "x-client.json");
const tokenFile = join(root, "secrets", "x-token.json");
const logDir = join(root, "logs");
const lockFile = join(logDir, "publish.lock");
const logFile = join(logDir, `publish-${new Date().toISOString().slice(0, 7)}.log`);

// Not authorised yet: stay quiet, the scheduler is safe to leave installed.
if (!existsSync(clientFile) || !existsSync(tokenFile)) process.exit(0);

mkdirSync(logDir, { recursive: true });

let lockFd;
try {
  lockFd = openSync(lockFile, "wx");
} catch {
  // A previous run crashed: clear the lock after 30 minutes.
  if (existsSync(lockFile) && Date.now() - statSync(lockFile).mtimeMs > 30 * 60_000) {
    unlinkSync(lockFile);
    lockFd = openSync(lockFile, "wx");
  } else {
    process.exit(0);
  }
}

const log = (line) => appendFileSync(logFile, line + "\n", "utf8");
const started = new Date().toISOString();

try {
  const r = spawnSync(process.execPath, [join(root, "scripts", "x-schedule.mjs"), "--due", "--yes", "--grace", "90"], {
    cwd: root,
    encoding: "utf8",
  });
  const out = `${r.stdout || ""}${r.stderr || ""}`.trim();
  // Keep the log useful: skip the "nothing due" ticks.
  if (!/nothing due/.test(out)) {
    log(`\n===== ${started} exit=${r.status} =====\n${out}`);
  }
  if (r.status !== 0) log(`FAILED ${started}: ${out || "(no output)"}`);
  process.exitCode = r.status ?? 1;
} finally {
  try { closeSync(lockFd); } catch {}
  try { unlinkSync(lockFile); } catch {}
}
