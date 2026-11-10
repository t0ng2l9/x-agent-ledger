// Serve a folder over http://127.0.0.1:<random> and drive headless Chrome over CDP.
// WebGPU needs a secure context, which file:// is not reliable for, and
// --dump-dom returns before async work finishes. Hence the tiny server + CDP.
//
//   node tests\run-headless.mjs <project-root> <page-path> [timeout-ms]
//   node tests\run-headless.mjs . /tests/webgpu-repeat.html 300000
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { extname, join } from "node:path";

const ROOT = process.argv[2];
const PAGE = process.argv[3] || "/_scratch/bench.html";
const WAIT_MS = Number(process.argv[4] || 240000);

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript" };
const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(req.url.split("?")[0]));
    const body = await readFile(p);
    res.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const url = `http://127.0.0.1:${port}${PAGE}`;
console.log("serving", url);

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profile = join(process.env.TEMP, "cdp-" + Math.random().toString(36).slice(2));
const proc = spawn(chrome, [
  "--headless", "--remote-debugging-port=0", "--user-data-dir=" + profile,
  "--enable-unsafe-webgpu", "--enable-features=Vulkan", "--ignore-gpu-blocklist",
  "--disable-extensions", "--no-first-run", "--no-default-browser-check",
  "--window-size=1200,900", url,
], { stdio: "ignore" });

// find the devtools port from the profile's DevToolsActivePort file
let wsUrl = null;
for (let i = 0; i < 100 && !wsUrl; i++) {
  await new Promise((r) => setTimeout(r, 200));
  try {
    const txt = await readFile(join(profile, "DevToolsActivePort"), "utf8");
    const [p] = txt.split("\n");
    if (p) wsUrl = `http://127.0.0.1:${p.trim()}/json/version`;
  } catch {}
}
if (!wsUrl) { console.error("no devtools port"); proc.kill(); process.exit(1); }

const version = await (await fetch(wsUrl)).json();
const ws = new WebSocket(version.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
};
await new Promise((r) => (ws.onopen = r));
const send = (method, params = {}, sessionId) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });

const targets = await send("Target.getTargets");
const page = targets.result.targetInfos.find((t) => t.type === "page");
const att = await send("Target.attachToTarget", { targetId: page.targetId, flatten: true });
const sid = att.result.sessionId;

const t0 = Date.now();
let last = "";
let done = false;
while (Date.now() - t0 < WAIT_MS && !done) {
  await new Promise((r) => setTimeout(r, 2000));
  const r = await send("Runtime.evaluate", { expression: "document.getElementById('o')?.textContent || ''", returnByValue: true }, sid);
  const txt = r.result?.result?.value ?? "";
  if (txt !== last) {
    const added = txt.slice(last.length);
    process.stdout.write(added);
    last = txt;
  }
  if (txt.includes("DONE") || txt.includes("FAILED")) done = true;
}
console.log("\n--- elapsed " + ((Date.now() - t0) / 1000).toFixed(1) + "s ---");
ws.close(); proc.kill(); server.close();
process.exit(0);


