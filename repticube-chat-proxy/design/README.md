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

## Notes for handoff

- Replace `.swatch` blocks with real imagery (`<img>` / `<picture>`), keeping the aspect
  ratios already set on each slot.
- Fonts use system stacks so the file stays dependency-free; swap in the brand's licensed
  display + body faces via `@font-face` when wiring into the real site.
- Copy, product names, prices and showroom details are illustrative placeholders.
