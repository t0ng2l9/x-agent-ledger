#!/usr/bin/env node
/**
 * One-time OAuth 2.0 (PKCE) authorisation for the Agent Dispatch account.
 *
 *   node scripts\x-auth.mjs
 *
 * Opens the X consent screen, catches the redirect on 127.0.0.1:8788, exchanges
 * the code for an access token, and writes secrets\x-token.json.
 *
 * Requires secrets\x-client.json:  { "client_id": "...", "client_secret": "..." }
 * client_secret is optional (Native App = public client).
 *
 * Scopes: tweet.read tweet.write users.read offline.access
 *   - tweet.write is required to post
 *   - offline.access is what gets you a refresh token; without it the access
 *     token dies in 2 hours and this script has to be re-run every time.
 */

import { createServer } from "node:http";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clientFile = join(root, "secrets", "x-client.json");
const tokenFile = join(root, "secrets", "x-token.json");

const PORT = 8788;
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = ["tweet.read", "tweet.write", "users.read", "offline.access"];

// Optional shortcut: node scripts\x-auth.mjs --client-id <id>
const cliArgs = process.argv.slice(2);
const idFlag = cliArgs.indexOf("--client-id");
if (idFlag >= 0) {
  const id = (cliArgs[idFlag + 1] || "").trim();
  if (!id) {
    console.error("--client-id needs a value");
    process.exit(1);
  }
  writeFileSync(clientFile, JSON.stringify({ client_id: id }, null, 2), "utf8");
  console.log(`Saved client_id to ${clientFile}`);
}

if (!existsSync(clientFile)) {
  console.error(`Missing ${clientFile}`);
  console.error(`Create it with: { "client_id": "..." }  (see secrets\\README.md)`);
  process.exit(1);
}

const client = JSON.parse(readFileSync(clientFile, "utf8"));
if (!client.client_id) {
  console.error("secrets\\x-client.json has no client_id");
  process.exit(1);
}

// --- PKCE ------------------------------------------------------------------
const verifier = randomBytes(32).toString("base64url");
const challenge = createHash("sha256").update(verifier).digest("base64url");
const state = randomUUID();

const authUrl = new URL("https://x.com/i/oauth2/authorize");
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("client_id", client.client_id);
authUrl.searchParams.set("redirect_uri", REDIRECT);
authUrl.searchParams.set("scope", SCOPES.join(" "));
authUrl.searchParams.set("state", state);
authUrl.searchParams.set("code_challenge", challenge);
authUrl.searchParams.set("code_challenge_method", "S256");

// X rejects some clients when the space-delimited scope arrives as "+".
const authHref = authUrl.toString().replace(/\+/g, "%20");

console.log("\nAgent Dispatch · X authorisation");
console.log("─".repeat(60));
console.log(`redirect_uri  ${REDIRECT}`);
console.log(`scopes        ${SCOPES.join(" ")}`);
console.log("\nIf the browser does not open, paste this URL yourself:\n");
console.log(authHref);
console.log("");

// --- catch the redirect ----------------------------------------------------
const codePromise = new Promise((resolve, reject) => {
  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    if (url.pathname !== "/callback") {
      res.writeHead(404).end("not here");
      return;
    }
    const err = url.searchParams.get("error");
    const code = url.searchParams.get("code");
    const gotState = url.searchParams.get("state");

    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    if (err) {
      res.end(`<body style="font:16px system-ui;padding:40px">Denied: ${err}<br>You can close this tab.</body>`);
      server.close();
      reject(new Error(`authorisation denied: ${err}`));
      return;
    }
    if (gotState !== state) {
      res.end(`<body style="font:16px system-ui;padding:40px">State mismatch. Close this tab and retry.</body>`);
      server.close();
      reject(new Error("state mismatch — possible CSRF, retrying is the fix"));
      return;
    }
    res.end(`<body style="font:16px system-ui;padding:40px">
      <h2>Authorised</h2><p>Token saved. You can close this tab.</p></body>`);
    server.close();
    resolve(code);
  });
  server.on("error", reject);
  server.listen(PORT, "127.0.0.1", () => {
    const cmd =
      process.platform === "win32"
        ? `start "" "${authHref.replace(/&/g, "^&")}"`
        : process.platform === "darwin"
          ? `open "${authHref}"`
          : `xdg-open "${authHref}"`;
    exec(cmd, () => {});
  });
  setTimeout(() => {
    server.close();
    reject(new Error("timed out after 5 minutes waiting for the callback"));
  }, 300_000).unref();
});

const code = await codePromise;

// --- exchange code for tokens ---------------------------------------------
const body = new URLSearchParams({
  grant_type: "authorization_code",
  code,
  redirect_uri: REDIRECT,
  code_verifier: verifier,
  client_id: client.client_id,
});

const headers = { "content-type": "application/x-www-form-urlencoded" };
if (client.client_secret) {
  headers.authorization =
    "Basic " + Buffer.from(`${client.client_id}:${client.client_secret}`).toString("base64");
}

const res = await fetch("https://api.x.com/2/oauth2/token", {
  method: "POST",
  headers,
  body,
});

const text = await res.text();
if (!res.ok) {
  console.error(`\nToken exchange failed (${res.status}):\n${text}`);
  process.exit(1);
}

const tok = JSON.parse(text);
const record = {
  access_token: tok.access_token,
  refresh_token: tok.refresh_token ?? null,
  scope: tok.scope,
  token_type: tok.token_type,
  expires_at: tok.expires_in ? Date.now() + tok.expires_in * 1000 : null,
  obtained_at: new Date().toISOString(),
};
writeFileSync(tokenFile, JSON.stringify(record, null, 2), "utf8");

console.log("\nSaved secrets\\x-token.json");
console.log(`  scope       ${record.scope}`);
console.log(`  refresh     ${record.refresh_token ? "yes" : "NO — offline.access was not granted"}`);
console.log(`  expires     ${record.expires_at ? new Date(record.expires_at).toISOString() : "n/a"}`);
console.log("\nNext: node scripts\\x-post.mjs --whoami\n");
