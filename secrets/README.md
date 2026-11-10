# secrets/

Everything in this folder is a credential. Nothing here is committed anywhere.

| File | What |
|---|---|
| `x-client.json` | `client_id`, and `client_secret` if your app is a confidential client |
| `x-token.json` | access + refresh token, written by `scripts\x-auth.mjs` |

## Where the values come from

1. https://developer.x.com → Projects & Apps → your app → **Keys and tokens**
2. Copy **OAuth 2.0 Client ID** (and Client Secret if the app type is Web App /
   Automated App).
3. In the app's **User authentication settings**, enable OAuth 2.0, set:
   - Type of App: **Native App** (public client, no secret needed)
   - Callback URI: `http://127.0.0.1:8788/callback`  ← exact match, no trailing slash
   - Website URL: anything valid
4. Save `client_id` into `x-client.json`:

```json
{ "client_id": "your-client-id-here" }
```

Then run `node scripts\x-auth.mjs` once.

## Do not

- Do not put a bearer token (app-only) here. App-only auth cannot post — posting
  requires a user context token.
- Do not commit `x-token.json`. If it leaks, revoke the app's access in
  https://x.com/settings/connected_apps and re-run the auth script.
