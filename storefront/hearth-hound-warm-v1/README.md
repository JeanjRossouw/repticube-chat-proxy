# Hearth & Hound — Warm v1 theme customisation

Theme override files for the **Hearth & Hound Warm v1** theme (unpublished duplicate of
Horizon) on `kha3is-mk.myshopify.com`. These files were deployed to theme ID
`160868761731` via the Admin API (`themeFilesUpsert`); this directory is the source
record of what changed relative to stock Horizon.

## Brand system (`config/settings_data.json`)

| Token | Value |
|---|---|
| Background (ivory) | `#F7F3EC` |
| Sand | `#D8C9A8` / section tint `#EFE7D6` |
| Sage | `#7C8B6F` |
| Deep navy | `#1F2A44` |
| Charcoal | `#3A3A3A` |
| Tan leather accent | `#B5713F` |
| Headings | Playfair Display (serif) |
| Body / subheadings | Nunito Sans (humanist sans) |

Colour scheme mapping: scheme-1 ivory (default), scheme-2 sand, scheme-3 sage,
scheme-4 navy (newsletter / sale badges), scheme-5 charcoal (footer), scheme-6
transparent-over-media (hero). Cards use 16px radius with lift-on-hover; buttons,
inputs and product media use 10–12px radii.

## Homepage (`templates/index.json`)

1. Full-width hero — "Where comfort comes home", warm gradient overlay, Shop Beds CTA
   (image: `July_2025-19.jpg`, mobile: `KolettoQueen-Lifestyle1.png`)
2. Shop by range — Suburban, Kalahari, Koletto, Genuine Leather, Pad Range cards
   (image + one-line description pulled from collection data)
3. Shop by sleeper — Curl-Up / Stretch-Out / Calm & Cosy / Senior & Joint Support
4. Featured product spotlight — Suburban Bolster Bed on sand scheme with swatches
5. Trust bar (sage) — Proudly South African · Machine-washable covers ·
   Zip-removable covers · 1-year factory warranty
6. Brand story — "Hearth & Hound" editorial block on sand with lifestyle image
7. Newsletter — navy "Stay close to the hearth" signup
8. Footer — charcoal with cream text (see `sections/footer-group.json`)

## Product pages (`templates/product.json`)

- Colour swatches enabled (backed by `shopify--color-pattern` metaobjects created via
  Admin API and linked to every product's Color option)
- Feature icon row: waterproof base · zip-removable cover · machine washable
- Accordions: size guide (breed-based), care & cleaning, warranty & delivery
- Sticky add-to-cart enabled (mobile + desktop), serif titles, rounded media

## Store data changes (Admin API, not theme files)

- All 27 products categorised as `Pet Beds` (taxonomy `ap-2-9`)
- 14 colour-pattern metaobjects created (Sage, Sand, Navy, Charcoal, Chai, Picante…)
- 24 product Color options linked to those metaobjects → real colour swatches
- 8 existing collections given hero images (reused product/lifestyle imagery) and
  warm 1–2 sentence descriptions
- 4 new smart collections: `curl-up-sleepers`, `stretch-out-sleepers`,
  `calm-and-cosy`, `senior-and-joint-support` (tag-based rules)

## Deploying again

The live theme was never modified. To iterate: edit these files, then upsert to the
unpublished theme via `themeFilesUpsert` (or `shopify theme push --theme 160868761731`
once CLI auth is available). Publish from Admin → Online Store → Themes when happy.
