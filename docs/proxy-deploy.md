# Deploy the chat proxy to Vercel

The chat widget (`theme-snippets/aquacube-chat.liquid`) calls a serverless
function in this repo: `repticube-chat-proxy/api/chat.js`. The function
forwards the request to `api.anthropic.com` using a server-side API key,
so the key never reaches the browser. To make the widget work in
production, this function needs a public URL — that comes from Vercel.

---

## Prerequisites

- A GitHub account with this repo pushed (already done).
- A Vercel account (free tier is enough). Sign up at
  <https://vercel.com/signup> using "Continue with GitHub".
- An Anthropic API key. Generate one at
  <https://console.anthropic.com/settings/keys>.

## One-time setup

1. **Import the repo into Vercel.**
   - Vercel dashboard → **Add New… → Project**.
   - Find **JeanjRossouw/repticube-chat-proxy** and click **Import**.
   - When asked for the **Root Directory**, browse and pick
     `repticube-chat-proxy/` (the inner folder where `package.json` and
     `vercel.json` live). This is important — Vercel needs the folder
     that contains `api/chat.js`, not the repo root.
   - Framework preset: **Other**. Leave build/output settings empty.
   - Click **Deploy** but expect the first deploy to fail until step 2.

2. **Add the API key as an environment variable.**
   - Project → **Settings → Environment Variables**.
   - Add `ANTHROPIC_API_KEY` = *(your key)*. Apply to **Production**
     and **Preview** (not Development unless you'll run `vercel dev`).
   - Save.

3. **Redeploy.**
   - Project → **Deployments** → latest one → **Redeploy** (or push
     any commit to the branch and Vercel will auto-deploy).

4. **Note the production URL.**
   - After deploy succeeds, copy the URL. It looks like
     `https://repticube-chat-proxy.vercel.app`.
   - The chat endpoint is therefore
     `https://repticube-chat-proxy.vercel.app/api/chat`.

## Wire the widget to the proxy

In `theme-snippets/aquacube-chat.liquid`, change:

```js
const PROXY_URL = 'https://REPLACE_ME.vercel.app/api/chat';
```

to your real Vercel URL (e.g. `https://repticube-chat-proxy.vercel.app/api/chat`).
Re-upload the snippet to your Shopify theme (Online Store → Themes → ⋯ →
Edit code → snippets/aquacube-chat.liquid).

## Smoke test

```bash
# Should respond with a small JSON body containing "content".
curl -i -X POST https://repticube-chat-proxy.vercel.app/api/chat \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://www.aquacubesa.co.za' \
  -d '{
    "model": "claude-haiku-4-5-20251001",
    "max_tokens": 100,
    "messages": [{"role":"user","content":"Say hi in one word."}]
  }'
```

- HTTP 200 + JSON `content` field → working.
- HTTP 403 *Forbidden origin* → the Origin header isn't in the
  allowlist in `api/chat.js`. Confirm you're sending the right
  `Origin`. From a real browser on aquacubesa.co.za this is automatic.
- HTTP 401 from Anthropic upstream → `ANTHROPIC_API_KEY` env var
  missing or wrong. Check Vercel → Settings → Environment Variables.

## Custom domain (optional)

If you'd rather host the proxy under your own domain (e.g.
`chat.aquacubesa.co.za`):

1. Vercel → Project → **Settings → Domains** → add the subdomain.
2. In your DNS provider, add the CNAME record Vercel shows you.
3. Wait for DNS to propagate (usually <10 min).
4. Update `PROXY_URL` in the widget snippet to the new URL.

Custom domains are free on Vercel's hobby tier; the only cost is the DNS.

## What it costs

- Vercel hobby tier: **R0** for traffic volumes this widget will see.
- Anthropic API: pay-per-token. Claude Haiku 4.5 (what the widget uses)
  is the cheapest current model. Budget roughly **R10–R30 per 1,000
  customer questions** at typical lengths. Add billing alerts at
  <https://console.anthropic.com/settings/billing> to avoid surprises.

## Security checklist before going live

- [ ] `ANTHROPIC_API_KEY` is set on Vercel and **not** committed to git
      (`grep -r "sk-ant" .` should return nothing).
- [ ] CORS allowlist in `api/chat.js` contains only your real domains
      (already locked to `aquacubesa.co.za` and `www.aquacubesa.co.za`).
- [ ] You've placed at least one test message from the live storefront
      and confirmed it returns a sane response.
- [ ] Anthropic billing alerts are configured.
