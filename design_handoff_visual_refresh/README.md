# Handoff: Repti-track Visual Refresh

## Overview

A visual redesign of the existing **repticube-tracker** Next.js app — same features, same routes, same data model, refreshed look. The goal is to elevate the aesthetic from "functional MVP" to a polished, premium reptile-keeper tool that feels like a field journal crossed with a modern mobile app.

**No feature changes.** Every screen still does what it does today — feeding logs, weight tracking, QR sticker workflow, pairings, team accounts. Only the visual layer changes.

## About the Design Files

The files in `reference/` are **HTML design references** created as a prototype — they show the intended look, type ramp, color usage, and interaction patterns. They are NOT meant to be copied into the codebase directly.

The task is to **recreate the visual language defined in these prototypes in the existing Next.js 14 / React 18 / TypeScript app**, using the codebase's existing patterns: Supabase data fetching, client components in `src/app/(app)/...`, the `BRAND` color tokens in `src/lib/theme.ts`, the `Card`/`Section`/`Stat` primitives in `src/components/UI.tsx`, and so on.

The `src/` folder in this handoff contains **drop-in replacements** for several existing files — those can be applied directly. Then the page-level client components (HomeClient.tsx, SnakesListClient.tsx, etc.) need to be updated to use the new primitives and apply the new patterns documented below.

## Fidelity

**High-fidelity.** Exact colors, font sizes, spacing, and radii are specified. Recreate pixel-perfectly using the codebase's existing structure (inline styles + CSS vars are fine — that's already the pattern).

## What changes — the headline

1. **Type ramp gets a serif.** Add **Instrument Serif** (display) alongside **IBM Plex Sans** (UI) and **JetBrains Mono** (QR codes, dates, numeric badges). System fonts are out. Display serif lands on screen titles, hero numbers, and italic accent words ("in your care", "eating", "fresh batch").
2. **The dark green header banner is gone.** It dominated every screen. Replaced with a light page-level header (eyebrow label in moss green + serif display title). The dark green is now reserved for hero moments: the reptile detail header card, the FAB, accent buttons, dark theme bg.
3. **3-theme system** via CSS custom properties on `:root[data-theme="..."]`:
   - `terrarium` — the default warm earthy palette (slightly richer than current)
   - `moonlight` — true dark mode, deep teal-charcoal, sage-tinted moss
   - `linen` — minimal, near-black on warm off-white, no green chrome
4. **Species thumbnails everywhere.** Abstract scale-pattern SVGs colored by species (corn = warm orange, ball python = dark olive, leopard gecko = tangerine, etc.). Drawn programmatically — no asset pipeline. Lives in `src/components/SpeciesThumb.tsx` (provided).
5. **Refined card system.** Cards are slightly warmer (`#FFFCF4` not pure white), get a subtle inset highlight, and use 16px radius (was 12). Borders soften to `var(--line)`.
6. **Pill / badge polish.** "Days overdue" pills get JetBrains Mono numerals. QR codes get their own monospace badge style.
7. **Sparkline growth chart.** A tiny inline growth viz on Home for the most recently weighed reptile. Replaces nothing — it's an addition that gives Home more soul.

## Files in this handoff

```
design_handoff_visual_refresh/
├── README.md                                ← you are here
├── reference/                               ← HTML prototype (open in browser)
│   ├── Repti-track Redesign.html            ← entry point — open this
│   ├── tokens.css                           ← all CSS custom properties
│   ├── atoms.jsx                            ← icons, AppHeader, BottomNav, SpeciesThumb, FauxQR
│   ├── screens-1.jsx                        ← Home, ReptilesList, ReptileDetail
│   ├── screens-2.jsx                        ← Batch Feed (select + speed), Scan, Stickers
│   ├── app.jsx                              ← canvas composition + tweaks wiring
│   ├── ios-frame.jsx                        ← (starter — just bezel chrome)
│   ├── design-canvas.jsx                    ← (starter — pan/zoom container)
│   └── tweaks-panel.jsx                     ← (starter — tweak UI)
└── src/                                     ← drop-in replacements for the real codebase
    ├── lib/
    │   └── theme.ts                         ← extended palette + font/shadow/radius tokens
    ├── app/
    │   └── globals.css                      ← Google Fonts + CSS vars + utility classes
    └── components/
        ├── UI.tsx                           ← updated Card/Section/Stat/DetailRow/FormRow + new DuePill, QRBadge
        ├── AppHeader.tsx                    ← light-bg version with serif display title
        ├── BottomNav.tsx                    ← refreshed colors/shadows via CSS vars
        ├── SpeciesThumb.tsx                 ← NEW — generative scale-pattern thumbnail
        └── ThemeProvider.tsx                ← NEW — wraps app, manages data-theme + localStorage
```

## How to apply

### 1. Drop in the new files (5 minutes, mechanical)

Replace these files in the repo with the versions in `src/`:

| Existing file | Action |
|---|---|
| `src/lib/theme.ts` | **Replace.** New file preserves all old `BRAND.*` keys so nothing breaks. |
| `src/app/globals.css` | **Replace.** Adds Google Fonts import + all CSS custom properties. |
| `src/components/UI.tsx` | **Replace.** Same exports + 2 new ones (`DuePill`, `QRBadge`). |
| `src/components/AppHeader.tsx` | **Replace.** New light-bg header with serif title. |
| `src/components/BottomNav.tsx` | **Replace.** Now CSS-var driven. |

Add these new files:

| Path | Purpose |
|---|---|
| `src/components/SpeciesThumb.tsx` | Thumbnail component used in lists. |
| `src/components/ThemeProvider.tsx` | Wrap the app shell to enable theme switching. |

Then in `src/app/(app)/layout.tsx`, wrap the children with `<ThemeProvider>` so the `data-theme` attribute lands on `<html>`:

```tsx
// src/app/(app)/layout.tsx
import { ThemeProvider } from '@/components/ThemeProvider';
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

After this, every screen will already look better (new fonts, refined cards, refined nav, theme system live). The remaining work is screen-by-screen polish.

### 2. Update the page-level clients (the longer part)

For each `*Client.tsx`, apply the patterns below. The reference HTML is the source of truth — open it side-by-side. Focus on the documented screens in this order: **HomeClient → SnakesListClient → SnakeDetailClient → FeedClient → ScanPage → StickersClient.**

---

## Screen-by-screen spec

### 1. `HomeClient.tsx` → reference `home` artboard

**Layout** (top-to-bottom, all inside `padding: '0 22px'`):

1. **Date eyebrow + serif greeting** (top of page, no header banner)
   - Eyebrow: `Sunday · {dayName}` — class `eyebrow`, color `var(--moss)`
   - Two-line title using `display` and `display-italic`:
     ```tsx
     <div className="display" style={{ fontSize: 40, marginTop: 6, lineHeight: 1.02 }}>
       Twelve animals<br/>
       <span className="display-italic" style={{ color: 'var(--moss)' }}>in your care.</span>
     </div>
     ```
     Substitute the count and word ("One animal" / "{n} animals"). For empty state, swap to: `Let's start your<br/><i>collection</i>.`

2. **Today's feed hero card** (moss-green filled card, 18px padding, 16px radius)
   - Left: eyebrow "TODAY'S FEED" in `--moss-soft`, then big serif `{fedCount}/{dueCount}` (italic /N), then small caption "{remaining} more to feed today"
   - Right: 64px circular progress ring (stroke `--ink-on-moss`, track `--moss-soft @ 0.3`)
   - Bottom: a translucent inset row "Start batch feed →" with `rgba(255,255,255,0.08)` bg, links to `/feed`

3. **Due now section** (only if `dueSnakes.length > 0`)
   - Eyebrow "DUE NOW" left, right-aligned "{N} overdue" in `--rust` if any are overdue
   - List of cards — see `DueRow` below

4. **Shortcuts grid** (eyebrow "SHORTCUTS")
   - 2-column grid, 10px gap
   - Each tile: 14px padding, top row = 32px square icon-chip (bg `--moss-soft`, color `--moss-deep`, 10px radius) + tiny chevron right
   - Below: 14px semibold title, 11px muted subtitle
   - Tiles: Scan sticker / Prey forecast / Find reptile / Stickers ({unclaimed})

5. **Recent growth** (eyebrow "RECENT GROWTH")
   - Card containing: top row = name + species (left) + serif weight + delta % (right)
   - Below: SVG sparkline with `--moss` stroke + 25% opacity area gradient fill
   - Show the most recently-weighed reptile

**DueRow:**
```
[ SpeciesThumb 44px ] [ Name 15px semi + species mono 10px muted ] [ DuePill ]
                     [ morph 12px muted · weight ]
```
- card padding 12, 8 margin-bottom
- `display: flex; align-items: center; gap: 12px`

### 2. `SnakesListClient.tsx` → reference `list` artboard

**Header row**: serif title "All reptiles" with `reptiles` italic in moss + right-aligned `+` button (40x40, moss bg, white icon, 12px radius).

**Search**: card with left search icon, placeholder "Name, species, morph…", right-aligned `⌘K` qr-badge.

**Facility chips** (use `.chip` class):
- Horizontal scroll, `gap: 8`, `padding: '14px 22px 0'`
- Each chip shows `{name} {count}` — count in `opacity: 0.7`
- Active chip = `.chip--active` (moss bg, ink-on-moss text)

**ReptileCard**:
```
[ SpeciesThumb 56 ] [ Display 22 name             ] [ QRBadge ]
                     [ species · italic morph     ]
                     [ ♂ chip · {g}g · Fed {d}d   ] [ DuePill ]
```
- card padding 14, gap 14, margin-bottom 10
- Sex glyph in a 14x14 chip: bg `--card-2`, color `--moss`, centered
- Weight in `.mono` 10px
- "Fed {n}d ago" or "Next in {n}d" right-aligned with `flex: 1` spacer

### 3. `SnakeDetailClient.tsx` → reference `detail` artboard

**Top bar** (not the existing AppHeader — custom for this screen):
- 3-column: back button | center eyebrow "Reptile · 02 / 12" | edit button
- All buttons are 36x36 transparent with chevron/edit icon at 20px

**Hero card** — the focal point of the screen:
- `var(--moss)` background, `--ink-on-moss` text, 20px radius, 22px padding
- Decorative scale-pattern SVG in top-right at opacity 0.18 (12x12 grid of stroked circles, 14px spacing, brick-offset rows — see reference)
- Inside:
  - Row 1: QRBadge (translucent variant: `bg: rgba(255,255,255,0.12)`) + eyebrow facility name in `--moss-soft`
  - Row 2: `display` 44px name
  - Row 3: `display-italic` 18px morph in `--moss-soft`
  - Row 4: meta line — sex · species · "Hatched {date}", separated by `·`, in `--moss-soft` 13px

**Stat row** (3 columns, 8px gap, below hero):
- Use the new `<Stat label value sub />` — value is serif 24px, sub is serif italic 13px muted
- Last fed | Weight | Next due

**Tabs**:
- 4px gap, horizontal scroll, `padding: '18px 22px 0'`
- Each tab: `padding: '8px 14px'`, 10px radius
- Active: bg `--ink`, color `--bg`
- Inactive: transparent, color `--muted`
- Tabs: Overview, Feeding, (Food), Weight, Breeding, Care — same rules as today

**Overview tab body**: card containing `<DetailRow>` for Prey / Schedule / Acquired / Source / Notes (no internal padding on Card — DetailRow handles its own).

**Last 4 feedings** (new — replaces the long feeding history that today only shows on the Feeding tab):
- Eyebrow "LAST 4 FEEDINGS" left, "See all →" in `--moss` right
- Rows: `[date mono 11 muted] [prey 13 ink + italic note muted] [22px circle: moss check or rust X]`
- 10px vertical padding, `1px solid var(--line)` between rows

### 4. `FeedClient.tsx` → reference `feed-select` + `feed-speed` artboards

The existing 3-stage flow (select → speed → review) is preserved. Apply these specifically:

**Stage 1 (select):**
- Replace dark AppHeader with: custom top bar (back btn left + center eyebrow "Batch feed · {selected} of {total}" + invisible spacer right)
- Big serif intro after: `Pick who's <i>eating</i> today.` 30px display, italic on "eating", muted subtitle below ("{N} reptiles are due or overdue. Tap to deselect any you're skipping.")
- Filter chips identical to list — but with category counts
- Reptile rows: when selected, bg = `var(--moss-soft)`, border = `var(--moss)`; checkbox is 24x24, 7px radius, `var(--moss)` filled with check when on, otherwise 2px `--line-strong` border, transparent
- Bottom sticky button (`position: absolute; bottom: 0`) with gradient fade behind: "Start feeding {N} reptiles →"

**Stage 2 (speed):**
- Top bar: back left, center column (eyebrow "Batch feed" + mono "{nn} / {NN}"), invisible right
- **Progress dots, not bar**: `display: flex; gap: 4` of N slim 4px-tall pills, one per queued reptile.
  - Past index: `--moss` if ate, `--rust` if refused
  - Current index: `--ink`
  - Future: `--line`
- Big card with hero band on top:
  - Hero band (`var(--card-2)` bg, 22px padding, border-bottom `--line`):
    - Left: 64px SpeciesThumb + (QRBadge + facility eyebrow) + 30px serif name + italic 14px species·morph
    - Right: DuePill (`due-pill--today` or `due-pill--over`)
  - Body (18px padding):
    - Eyebrow "DEFAULT PREY"
    - Big serif: `Medium` 30px + ` mouse` 24px display-italic moss
    - 12px muted "Last fed Nd ago · Refeeds every Nd"
    - Small inline button "✏ Change prey or add note" — 12px, `--moss` text, transparent bg, `--line` border
- Action buttons (2-col grid, 10px gap):
  - Refused: `padding: 22px 12px`, transparent bg, 2px `--rust` border, 18px radius, big X icon + 16px "Refused"
  - Accepted: same shape, filled `--moss`, `--ink-on-moss` text, `box-shadow: 0 10px 24px -8px rgba(42,82,56,0.5)`, optional `linear-gradient(135deg, rgba(255,255,255,0.18), transparent 40%)` overlay for a subtle shine
- Skip button (dashed border) + small "← Previous reptile" footer below

### 5. `scan/page.tsx` → reference `scan` artboard

This screen is **always dark** regardless of theme. Override locally with inline styles using these hexes (don't introduce a 4th theme).

- Outer: `background: '#0A0F0C'`
- Radial gradient bg overlay: `radial-gradient(ellipse at center, #1A2520 0%, #0A0F0C 80%)`
- Faint scale pattern SVG at opacity 0.08 (use `<pattern>` with 22px tile of stroked circles, stroke `#8FB99A`)
- Top bar: back button + center column (eyebrow "SCAN" in `#8FB99A`, "Point at a sticker" white 15/600) + flash button. Buttons are 40x40 with `rgba(255,255,255,0.08)` bg, `rgba(255,255,255,0.12)` border, `#ECE6D2` icon.
- Viewfinder window: 260x260, centered, 60px top margin
  - 4 corner brackets: 36x36, 2px solid `#C9A24B` (amber), 6px radius, on 2 sides each
  - Faint QR ghost inside at 35% opacity (your actual camera feed will replace this in prod)
  - Horizontal scan line: `linear-gradient(90deg, transparent, #C9A24B, transparent)`, 2px tall, glowing
- Below: serif 22 "Hold steady — we'll do <i>the rest</i>." (italic on "the rest") + small `#8FB99A` "Or enter the code manually below"
- Manual entry input + GO button (`#C9A24B` bg, dark text)
- Recently scanned list (2 rows): translucent cards with mini-QR thumbnail (40x40 dark square) + name + species + amber QR code

### 6. `StickersClient.tsx` → reference `stickers` artboard

- Top bar: back left, eyebrow center "QR STICKERS", printer icon right
- Serif intro: `Print a <i>fresh batch</i>.` 30px + muted caption
- 3-column Stat row: Unclaimed / In use / Batch
- Eyebrow "SHEET PREVIEW" + right-side "3-up · A4 ↗" link in moss
- Sheet card: white bg, 14px radius, 14px padding, 2x3 grid of sticker cells
  - Each cell: 8px padding, dashed border 1px `--line-strong`, 8px radius, centers a QR + mono code
  - Selected cells get `--moss-soft` bg
- Primary "Print sheet" button + ghost "Generate 12 more codes"

### 7. AppLayout / `(app)/layout.tsx`

Wrap with `<ThemeProvider>`. That's it.

### 8. Settings — add theme picker

In `src/app/(app)/settings/SettingsClient.tsx`, add a section:

```tsx
import { useTheme } from '@/components/ThemeProvider';

// inside the component:
const { theme, setTheme } = useTheme();

<Section title="Appearance">
  <Card>
    <FormRow label="Theme">
      <select value={theme} onChange={e => setTheme(e.target.value as any)} style={inputStyle}>
        <option value="terrarium">Terrarium (default)</option>
        <option value="moonlight">Moonlight (dark)</option>
        <option value="linen">Linen (minimal)</option>
      </select>
    </FormRow>
  </Card>
</Section>
```

---

## Design Tokens (canonical)

### Colors — Terrarium (default theme)

| Token (CSS var) | Hex | Use |
|---|---|---|
| `--bg` | `#EFE9D6` | Page background |
| `--bg-sub` | `#E5DEC6` | Below-card divider areas |
| `--card` | `#FFFCF4` | Card surface |
| `--card-2` | `#F7F1E0` | Sub-surfaces (input bg, hero band) |
| `--ink` | `#161A17` | Primary text |
| `--ink-2` | `#2D332E` | Secondary text |
| `--muted` | `#6F7368` | Muted text, captions |
| `--line` | `#DDD3B5` | Card borders, dividers |
| `--line-strong` | `#C9BD9B` | Active dividers, dashed borders |
| `--moss` | `#2A5238` | Primary brand green |
| `--moss-deep` | `#173321` | Pressed/dark green |
| `--moss-soft` | `#B7C9B9` | Tinted bg for moss content |
| `--amber` | `#B47A2C` | "Today" pill, accent dots |
| `--amber-soft` | `#E8D5A8` | Amber tinted bg |
| `--rust` | `#A4422E` | Overdue pill, destructive |
| `--ink-on-moss` | `#F4EFE0` | Text on moss surfaces |
| `--bone` | `#FFFFFF` | Print sheet bg |

### Colors — Moonlight (dark theme)

| Token | Hex |
|---|---|
| `--bg` | `#0E1411` |
| `--card` | `#1A221D` |
| `--card-2` | `#232C26` |
| `--ink` | `#ECE6D2` |
| `--muted` | `#8A8F84` |
| `--line` | `#2A3530` |
| `--moss` | `#8AB58F` |
| `--moss-soft` | `#2A3F32` |
| `--amber` | `#D9B370` |
| `--rust` | `#D97A65` |
| `--ink-on-moss` | `#0E1411` |

### Colors — Linen (minimal theme)

| Token | Hex |
|---|---|
| `--bg` | `#F6F4EE` |
| `--card` | `#FFFFFF` |
| `--ink` | `#0A0A0A` |
| `--moss` | `#0A1A14` (near-black — no green chrome) |
| `--rust` | `#8A3A2C` |
| `--amber` | `#7A5A1F` |

### Typography

| Class | Font | Weight | Size range | Tracking |
|---|---|---|---|---|
| `.display` | Instrument Serif | 400 | 22–44px | -0.01em |
| `.display-italic` | Instrument Serif Italic | 400 | 14–24px | -0.01em |
| Body | IBM Plex Sans | 400/500/600 | 11–15px | -0.005em |
| `.eyebrow` | IBM Plex Sans | 600 | 10px | 0.16em uppercase |
| `.mono` | JetBrains Mono | 500/600 | 10–14px | — |

**Numeric features**: enable `font-feature-settings: "tnum"` on number-heavy cells (stat values, counts) for tabular alignment.

### Spacing

- Screen horizontal padding: **22px**
- Section vertical gap: **22–24px** between major sections
- Card padding: **14px** standard, **18–22px** on hero/spotlight cards
- Card margin-bottom: **8–10px** inside a list

### Radii

- Chip / pill: **999px**
- Button / input: **12px**
- Card: **16px**
- Hero card: **20px**
- Icon chip: **10–12px**

### Shadows

- Card: `0 1px 2px rgba(23,51,33,0.04), 0 1px 0 rgba(255,255,255,0.6) inset`
- Pop / FAB: `0 8px 18px -6px rgba(42,82,56,0.5)`
- Modal: `0 30px 60px -20px rgba(23,51,33,0.25)`

## Interactions

- **Tab + chip presses**: `transform: scale(0.98)` on `:active`, `transition: transform .12s`
- **Theme switch**: `data-theme` attribute change cascades through CSS vars — no JS animation needed, but consider a brief `transition: background 0.2s, color 0.2s` on `body` for a smoother feel
- **Card hover (desktop only)**: subtle `border-color: var(--line-strong)` — keep mobile clean
- **Selection state on batch feed rows**: when selected, bg fades to `--moss-soft` and border to `--moss` — keep instant for tap responsiveness

## State Management

No new global state. The only addition is the `theme` value managed by `ThemeProvider` and persisted to localStorage under `rt-theme`.

## Assets

- **Google Fonts**: Instrument Serif (regular + italic), IBM Plex Sans (400/500/600/700), JetBrains Mono (500/600/700) — loaded via `@import` in `globals.css`
- **Icons**: keep using `lucide-react` (already a dep)
- **Species thumbnails**: drawn programmatically by `<SpeciesThumb />` — no image assets needed
- **QR codes**: keep using `qrcode` for real codes; the prototype's `FauxQR` is just for the design — don't ship it

## Open questions / decisions for product

1. **Default theme on first launch**: respect `prefers-color-scheme` (currently does) or hard-default to `terrarium`?
2. **Species palette mapping**: the prototype's `pickPalette()` uses keyword matching ("ball python" → bp, "corn" → corn). Should this be data-driven from a future `species.palette` column instead?
3. **Sparkline on Home**: which reptile does it show — most recently weighed, or "biggest grower"?
4. **Empty states**: the spec covers populated screens. Empty states should use display serif for the prompt — `Let's start your<br/><i>collection</i>.` style.

## Files reference (one more time)

**Read the HTML prototype first** by opening `reference/Repti-track Redesign.html` in a browser. The Tweaks panel (bottom-right toggle in the toolbar of the design preview) lets you flip between the 3 themes live so you can sanity-check the look.

The `reference/screens-1.jsx` and `screens-2.jsx` files contain the literal JSX for each screen — they're the source of truth for layout structure and exact pixel values when in doubt.
