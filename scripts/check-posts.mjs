#!/usr/bin/env node
/**
 * Character checker for the post drafts.
 *
 * X counts length in "weighted" units:
 *   - Latin/Cyrillic/Greek etc.  -> 1 per character
 *   - CJK, Hangul, fullwidth      -> 2 per character
 *   - every URL                   -> 23 (t.co), regardless of real length
 *
 * Reads markdown, takes each ``` fenced block as one post, and reports the
 * weighted length against the 280 limit.
 *
 *   node scripts\check-posts.mjs posts-01-10.md
 */

import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const file = process.argv[2] || "posts-01-10.md";
const src = await readFile(file, "utf8");

// --- extract fenced blocks, remembering which heading they sit under ---------
const blocks = [];
let heading = "(no heading)";
let inFence = false;
let buf = [];

for (const line of src.split(/\r?\n/)) {
  if (/^```/.test(line)) {
    if (!inFence) {
      inFence = true;
      buf = [];
    } else {
      inFence = false;
      const text = buf.join("\n").trim();
      if (text) blocks.push({ heading, text });
    }
    continue;
  }
  if (inFence) buf.push(line);
  else {
    const h = line.match(/^#{2,3}\s+(.*)$/);
    if (h) heading = h[1].trim();
  }
}

// --- X weighted length -------------------------------------------------------
const URL_RE = /https?:\/\/\S+/g;

function weightedLength(text) {
  // Replace URLs first: each counts as 23.
  let t = text.replace(URL_RE, "\u0000");
  let n = 0;
  for (const ch of t) {
    if (ch === "\u0000") { n += 23; continue; }
    const cp = ch.codePointAt(0);
    const isWide =
      (cp >= 0x1100 && cp <= 0x115f) ||        // Hangul Jamo
      (cp >= 0x2e80 && cp <= 0xa4cf) ||        // CJK radicals .. Yi
      (cp >= 0xac00 && cp <= 0xd7a3) ||        // Hangul syllables
      (cp >= 0xf900 && cp <= 0xfaff) ||        // CJK compat
      (cp >= 0xfe30 && cp <= 0xfe6f) ||        // CJK compat forms
      (cp >= 0xff00 && cp <= 0xff60) ||        // fullwidth forms
      (cp >= 0xffe0 && cp <= 0xffe6) ||
      (cp >= 0x1f300 && cp <= 0x1faff) ||      // emoji
      (cp >= 0x20000 && cp <= 0x3fffd);        // CJK ext B+
    n += isWide ? 2 : 1;
  }
  return n;
}

const LIMIT = 280;
let over = 0;
const rows = [];

blocks.forEach((b, i) => {
  const w = weightedLength(b.text);
  const chars = [...b.text].length;
  const kind = /[\u4e00-\u9fff]/.test(b.text) ? "CJK" : "EN";
  const flag = w > LIMIT ? "OVER" : w > LIMIT * 0.92 ? "tight" : "ok";
  if (w > LIMIT) over++;
  rows.push({ n: i + 1, kind, w, chars, flag, heading: b.heading });
});

const pad = (s, n) => String(s).padEnd(n);
const padl = (s, n) => String(s).padStart(n);

console.log(`\n${basename(file)} — ${blocks.length} posts, limit ${LIMIT} weighted units\n`);
console.log(pad("#", 4) + pad("kind", 6) + padl("weighted", 10) + padl("chars", 8) + "  status  heading");
console.log("-".repeat(78));
for (const r of rows) {
  console.log(
    pad(r.n, 4) + pad(r.kind, 6) + padl(r.w, 10) + padl(r.chars, 8) +
    "  " + pad(r.flag, 8) + r.heading
  );
}
console.log("-".repeat(78));
console.log(over === 0 ? "All posts fit.\n" : `${over} post(s) over the limit.\n`);
process.exitCode = over === 0 ? 0 : 1;
