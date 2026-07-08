# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this repository is

Despite the name (`repticube-chat-proxy`), this repo now contains two things:

1. **A static storefront website for U&G Lifestyle** — a South African luxury
   linens & home décor brand (uglifestyle.com), family-owned since 1980. This is
   the bulk of the repo: hand-written HTML pages plus a shared data/rendering
   script.
2. **A tiny serverless Anthropic API proxy** (`api/chat.js`) — the original
   purpose the repo was named for. It forwards requests to the Anthropic
   Messages API while adding CORS headers, so a browser-based chat widget can
   call Claude without exposing an API key.

The site is deployed on **Vercel** (see `vercel.json`). There is **no build
step, no framework, and no dependencies** — pages are static HTML served
directly, and the only server-side code is the serverless function under `api/`.

## Repository layout

```
/
├── index.html          # Homepage (hero, category grid, feature bands, footer)
├── shop.html           # "Shop All" — full catalogue grid (PAGECAT="ALL")
├── new-arrivals.html   # New Arrivals   (PAGECAT="NEW")
├── bedding.html        # Bedroom linen  (PAGECAT="B")
├── scatters.html       # Scatter cushions (PAGECAT="S")
├── throws.html         # Bed throws     (PAGECAT="T")
├── rugs.html           # Rugs           (PAGECAT="R")
├── wallpapers.html     # Wallpapers     (PAGECAT="W")
├── curtains.html       # Curtains       (PAGECAT="C")
├── towels.html         # Towels         (PAGECAT="TW")
├── decor.html          # Décor (scatters + throws) (PAGECAT="DECOR")
├── furniture.html      # Furniture (placeholder, empty grid) (PAGECAT="FURN")
├── sale.html           # Sale items     (PAGECAT="SALE")
├── trade.html          # Trade Account page (login + application + pricing preview)
├── preview.html        # Redirect stub → "/"
├── catalog.js          # THE data + rendering engine (shared by all shop pages)
├── package.json        # name/version only; type: module (for the ESM api/ fn)
├── vercel.json         # Vercel serverless config for api/*.js
├── api/
│   └── chat.js         # Anthropic Messages API proxy (adds CORS)
└── design/             # Earlier self-contained concept mockups (see below)
```

## How the storefront works

### Data-driven catalogue (`catalog.js`)

`catalog.js` is the heart of the site. All shop pages (`index.html`,
`shop.html`, and every category page) include it with `<script src="catalog.js"></script>`
and select their view by setting a global **before** the script loads:

```html
<script>window.PAGECAT="B";</script>   <!-- bedding page -->
<script src="catalog.js"></script>
```

Key pieces inside `catalog.js` (wrapped in an IIFE, `'use strict'`, plain ES5-ish
browser JS — no modules, no bundler):

- **`IMG`** — base URL for the Shopify CDN
  (`https://cdn.shopify.com/s/files/1/0622/2351/5757/files/`). Real product
  imagery is served from Shopify; images are requested with `?width=540`.
- **`CATS`** — category code → display name map:
  `S`=Scatter Cushions, `T`=Bed Throws, `R`=Rugs, `W`=Wallpapers,
  `C`=Curtains, `TW`=Towels, `B`=Bedding, `O`=Accessories.
- **`P`** — the product array. **This is the single source of truth for the
  whole catalogue.** Each row is a positional tuple:
  ```js
  [ name, categoryCode, price, comparePrice, inStock, handle, imageFile ]
  //  0      1            2      3            4        5       6
  ```
  - `name` — product title (string)
  - `categoryCode` — one of the `CATS` keys
  - `price` — current ZAR price (number)
  - `comparePrice` — original/was price; `0` means no compare price. A product
    is **on sale** when `comparePrice > price` (see `isSale`).
  - `inStock` — truthy = available, falsy(`0`) = renders a "Sold Out" tag
  - `handle` — Shopify product handle; cards link to
    `https://uglifestyle.com/products/<handle>`
  - `imageFile` — filename appended to `IMG`
- **`PAGECAT` filtering** — `filtered()` maps the page's `window.PAGECAT` to a
  product subset: `ALL`/`NEW` = everything, `SALE` = `isSale` items,
  `DECOR` = scatters + throws, `FURN` = empty list, otherwise exact category
  match on `p[1]`.
- **Rendering hooks** — the script only touches elements that exist on the
  current page (all lookups are null-guarded), so one script safely serves every
  page. Relevant element IDs a page can provide:
  - `#grid` — main product grid (`render()`)
  - `#filters` — category filter buttons (`buildFilters()`, shop page only)
  - `#sort` — sort `<select>` (`feat` | `asc` | `desc`)
  - `#more` — "load more" button (pages 24 at a time via `shown`)
  - `#prod-count` — live product count
  - `#new-grid` / `#rug-grid` — homepage rails
- **`cardHTML()`** — builds a product card: image, sale/new/sold-out tag,
  category, name, price (with "From " prefix for variant-priced categories via
  `varies()`), struck-through compare price, and auto-generated keyword tags
  (`tagsFor()` / `CATTAGS`).
- **`fmt()`** — formats prices as `R 1,234.56` (`en-ZA`, 2 decimals).
- The script also builds the **mobile nav drawer** at the bottom, cloning the
  desktop `.nav-list` + mega-menus into a slide-in panel.

**To change catalogue content, edit the `P` array in `catalog.js`** — the grids,
filters, counts, sale badges and sorting all update automatically. Do not
hard-code products into individual HTML pages.

### Shared page chrome

Every storefront page is a **complete, standalone HTML file** with its own
inlined `<style>` block. They intentionally duplicate a large amount of shared
markup and CSS:

- The same `:root` CSS custom properties (brand tokens): `--ink`, `--grey`,
  `--line`, `--cream`, `--white`, `--serif` (`Lora`), `--sans` (`Poppins`).
  Fonts load from **Google Fonts**.
- The same announcement bar, sticky tri-part nav with hover mega-menus, and
  footer (three showrooms: Durban · Johannesburg · Cape Town).
- Category pages share a near-identical structure; the line numbers line up
  closely across files (e.g. `window.PAGECAT` on line 323, `catalog.js` include
  on line 324).

**Because chrome is duplicated, a change to the nav, footer, announcement bar,
or brand tokens must be applied to every HTML file** (root pages: `index.html`
and all category pages + `shop.html`, `sale.html`, `new-arrivals.html`,
`trade.html`). There is no templating/include mechanism — keep them in sync by
hand. When making such a change, grep for the markup across all `*.html` at the
repo root and edit each consistently.

### `trade.html`

Standalone Trade Account page: a login form, a trade-account application form,
and an illustrative trade-pricing preview. Pricing shown there is **for
illustration only** — there is no real auth or pricing backend wired up.

### `design/` — concept mockups (historical)

`design/` holds an **earlier, self-contained design concept** for the site
(see `design/README.md`). These files differ from the production root pages:

- Fonts (**Fraunces** / **Jost**) are **embedded as base64 `@font-face`** so the
  files render with **no network calls**.
- Product imagery is **CSS-woven linen swatches** (placeholders), not real
  Shopify photos.
- They carry their own smaller demo `CATALOG` array inline.

Treat `design/` as reference/mockups. The **live site is the root-level pages
driven by `catalog.js`** with real Shopify imagery. Don't confuse the two — new
storefront work goes in the root pages, not `design/`.

## The chat proxy (`api/chat.js`)

A Vercel serverless function (ESM — the repo is `"type": "module"`). It:

- Sets permissive CORS headers (`Access-Control-Allow-Origin: *`) on all
  responses and short-circuits `OPTIONS` preflight with `200`.
- Rejects non-`POST` with `405`.
- Forwards the **raw request body** to `https://api.anthropic.com/v1/messages`,
  injecting `x-api-key` from `process.env.ANTHROPIC_API_KEY` and
  `anthropic-version: 2023-06-01`, then relays the upstream status + JSON back.

Deployment config lives in `vercel.json`: `api/*.js` functions get 1024 MB and a
30 s max duration.

**The `ANTHROPIC_API_KEY` env var must be set in the Vercel project** for the
proxy to work. Never commit the key. There is currently no chat widget wired
into the storefront HTML — the proxy is a standalone endpoint.

When touching this file, keep in mind it is a thin pass-through by design: it
does not validate or reshape the payload. If you add validation, rate limiting,
or model pinning, do it here.

## Conventions

- **No build, no dependencies, no framework.** Do not introduce npm packages, a
  bundler, or a framework unless explicitly asked. `package.json` has no
  dependencies and no scripts.
- **Vanilla browser JS** in `catalog.js` — ES5/early-ES6 style, IIFE-wrapped,
  null-guarded DOM lookups so one script serves all pages. Match that style.
- **Prices are ZAR**, formatted `R 1,234.56` via `fmt()`. Sale logic is purely
  `comparePrice > price`.
- **Product links go to the real Shopify store** (`uglifestyle.com/products/<handle>`),
  opened in a new tab.
- **Catalogue edits happen in `catalog.js`'s `P` array only.**
- **Shared chrome edits must be replicated across all root `*.html` files.**
- **Keep pages standalone** — each HTML file must render on its own with its
  inlined styles.
- **Accessibility/motion**: the design respects `prefers-reduced-motion`; keep
  reveal/hover motion optional.

## Git & workflow

- Development branch for current work: **`claude/claude-md-docs-mrb01o`**
  (branch off `main`; the repo's default branch is `main`).
- Commit with clear, descriptive messages. Push with
  `git push -u origin <branch>`. Open a **draft PR** against `main` after pushing
  if one doesn't already exist.
- Recent history shows a recurring pattern of **hosting a "shoppable theme" zip
  temporarily and then removing it after re-import** — these are large binary
  artifacts intentionally added then deleted. Do not re-commit such zips unless
  that is the explicit task; keep the working tree free of large temporary
  binaries.

## Quick verification

There are no automated tests. To sanity-check storefront changes, open the
relevant HTML file(s) in a browser (or `python3 -m http.server` from the repo
root) and confirm:

- The correct product subset renders for the page's `PAGECAT`.
- Filters, sort, "load more", counts, and the mobile drawer behave.
- Prices, sale badges, and "Sold Out"/"New"/"From" tags are correct.
- Nav mega-menus and footer match across pages after any chrome change.

For `api/chat.js`, verify against a Vercel deploy (or `vercel dev`) with
`ANTHROPIC_API_KEY` set, POSTing a Messages-API-shaped body.
