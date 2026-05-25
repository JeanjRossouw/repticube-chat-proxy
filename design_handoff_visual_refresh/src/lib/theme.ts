// src/lib/theme.ts
// Repti-track visual refresh — extended palette w/ theme support.
// Drop in over the existing theme.ts. The old BRAND keys are preserved so
// nothing breaks; new tokens are added alongside.

export const BRAND = {
  // ─── legacy keys (preserved so existing imports keep working) ─────
  dark:   '#173321', // was #0E2A1A — slightly warmer
  green:  '#2A5238', // was #1F6B3A — deeper moss
  gold:   '#B47A2C', // was #C9A24B — warmer amber
  cream:  '#EFE9D6', // was #F4EFE3 — richer cream
  ink:    '#161A17', // was #2A2A2A — softer near-black
  ash:    '#6F7368', // was #8A8A85 — warmer mid grey
  card:   '#FFFCF4',
  danger: '#A4422E',
  ok:     '#2A5238',

  // ─── extended palette (new) ───────────────────────────────────────
  bg:         '#EFE9D6',
  bgSub:      '#E5DEC6',
  card2:      '#F7F1E0',
  ink2:       '#2D332E',
  line:       '#DDD3B5',
  lineStrong: '#C9BD9B',
  moss:       '#2A5238',
  mossDeep:   '#173321',
  mossSoft:   '#B7C9B9',
  amber:      '#B47A2C',
  amberSoft:  '#E8D5A8',
  rust:       '#A4422E',
  bone:       '#FFFFFF',
  inkOnMoss:  '#F4EFE0',
} as const;

// ─── Type ramp ─────────────────────────────────────────────────────
// Wire these into next/font in app/layout.tsx (see globals.css notes).
export const FONT = {
  display: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
  ui:      '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
  mono:    '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
} as const;

// ─── Shadows ───────────────────────────────────────────────────────
export const SHADOW = {
  card:    '0 1px 2px rgba(23,51,33,0.04), 0 1px 0 rgba(255,255,255,0.6) inset',
  pop:     '0 10px 24px -8px rgba(42,82,56,0.5)',
  modal:   '0 30px 60px -20px rgba(23,51,33,0.25)',
} as const;

// ─── Radii ─────────────────────────────────────────────────────────
export const RADIUS = {
  chip:    999,
  pill:    12,
  card:    16,
  hero:    20,
  button:  12,
} as const;
