# U&G Lifestyle — New Website Layout Concept

A sleek, modern homepage layout concept for **U&G Lifestyle** (uglifestyle.com) —
South Africa's luxury linens & home décor house, family-owned since 1980.

**View it:** open [`design/index.html`](./index.html) in any browser. It's a single,
self-contained file — no build step, no dependencies, no network calls.

## Direction

An editorial, fashion-house treatment rather than a generic e-commerce template.

- **Palette** — warm chalk ground (`#F7F4EE`), flax panels (`#E7DECF`), warm near-black
  ink (`#211E19`), muted taupe secondary (`#6B6355`), and a restrained aged-brass accent
  (`#9C7C43`). One deep dark band ("Egyptian Cotton") for contrast.
- **Type** — a high-contrast serif display set large at light weight, Helvetica-Neue sans
  for body, and tiny wide-tracked uppercase labels. ZAR prices use tabular figures.
- **Imagery** — every image slot is a CSS-woven **linen swatch** (layered gradients that
  mimic weave + sheen). These are honest placeholders for a layout mockup and are meant to
  be swapped for real product/lifestyle photography.

## Sections

Announcement bar → sticky tri-part nav → full-height hero → heritage marquee →
shop-by-category grid → Egyptian-cotton feature band → new arrivals rail → the U&G story →
wallpaper lookbook → Instagram strip → newsletter → footer with the three showrooms.

Includes tasteful motion (scroll reveals, hover states, marquee) that respects
`prefers-reduced-motion`, and is fully responsive down to mobile.

## Applying real U&G branding

The layout is built to be rebranded from **one place**. Open `index.html` and find the
`U&G LIFESTYLE — BRAND TOKENS` block at the top of the `<style>`:

1. **Colours** — replace the six placeholder hex values (`--chalk`, `--flax`, `--ink`,
   `--stone`, `--line`, `--brass`) with U&G's real palette. Every colour on the page
   derives from these, so this recolours the whole site.
2. **Fonts** — uncomment the `@font-face` scaffolding, point it at U&G's licensed WOFF2
   files (self-hosted or inlined as `data:` URIs), and the family names are already wired
   into `--serif` / `--sans` (`'UG Display'`, `'UG Sans'`). Fallback stacks stay in place.
3. **Photography** — each image slot is a `<div class="swatch">` (a CSS-woven placeholder).
   Replace it with real imagery and keep the parent's aspect ratio:
   ```html
   <img src="/img/amara-duvet.jpg" alt="Amara sateen duvet set" class="ph" loading="lazy">
   ```
   The `.ph` helper (`object-fit:cover`) makes any image fill its slot cleanly.

Copy, product names, prices and showroom details are illustrative placeholders — swap for
real catalogue content.

### What to hand over for a full-fidelity pass

To wire in true branding I'll need: U&G's **hex palette** (or logo/brand-guide),
the **display + body fonts** (WOFF2 or names if it's a Google/Adobe font), the **logo**
(SVG preferred), and a set of **product / lifestyle photos**.
