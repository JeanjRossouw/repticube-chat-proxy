// src/components/SpeciesThumb.tsx
// NEW — abstract scale-pattern thumbnail for each reptile.
// Used wherever a row would otherwise have just text (Reptiles list,
// Batch feed selection, due rows on Home, Reptile detail mini-summary).
//
// Pick a palette based on the snake's species or morph. A simple
// heuristic is fine — bias keepers toward the morph keyword.
'use client';
import { useMemo } from 'react';

type PaletteKey =
  | 'corn' | 'royal' | 'leo' | 'boa' | 'hognose'
  | 'crested' | 'bp' | 'bearded' | 'rosy' | 'western';

const PALETTES: Record<PaletteKey, { a: string; b: string; c: string }> = {
  corn:    { a: '#C26B2A', b: '#7A3216', c: '#F2C57F' },
  royal:   { a: '#5B4F30', b: '#1F2018', c: '#A89263' },
  leo:     { a: '#D9A84A', b: '#8E6320', c: '#F3DC9B' },
  boa:     { a: '#9C6F3E', b: '#3B2814', c: '#D8B080' },
  hognose: { a: '#A38450', b: '#4E3B1F', c: '#D7BA7E' },
  crested: { a: '#E6A35E', b: '#7E4A20', c: '#FFD9A8' },
  bp:      { a: '#3F3727', b: '#0F0E0A', c: '#8E7B53' },
  bearded: { a: '#C18C4C', b: '#6E4818', c: '#F3CC8C' },
  rosy:    { a: '#B07868', b: '#6A3A2C', c: '#E1B6A4' },
  western: { a: '#7A6E48', b: '#2A2418', c: '#B5A472' },
};

// Map species + morph → palette key. Falls back to corn if nothing matches.
export function pickPalette(species: string, morph?: string | null): PaletteKey {
  const s = (species + ' ' + (morph || '')).toLowerCase();
  if (s.includes('royal') || s.includes('ball python')) return 'bp';
  if (s.includes('corn')) return 'corn';
  if (s.includes('leopard gecko')) return 'leo';
  if (s.includes('boa')) return 'boa';
  if (s.includes('hognose')) return 'hognose';
  if (s.includes('crested')) return 'crested';
  if (s.includes('bearded')) return 'bearded';
  if (s.includes('rosy')) return 'rosy';
  if (s.includes('king')) return 'western';
  return 'corn';
}

export default function SpeciesThumb({
  species,
  morph,
  size = 48,
}: {
  species: string;
  morph?: string | null;
  size?: number;
}) {
  const key = pickPalette(species, morph);
  const p = PALETTES[key];

  // Deterministic scale pattern based on species+morph string
  const scales = useMemo(() => {
    const seed = (species + (morph || '')).length || 7;
    const r = (i: number) => {
      const x = Math.sin((i + 1) * (seed * 13 + 7)) * 10000;
      return x - Math.floor(x);
    };
    const dots: Array<{ cx: number; cy: number; fill: string }> = [];
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const offY = x % 2 === 0 ? 0 : 5;
        const tone = r(y * 6 + x) > 0.5 ? p.c : p.b;
        dots.push({ cx: x * 10 + 7, cy: y * 10 + offY + 7, fill: tone });
      }
    }
    return dots;
  }, [species, morph, p.b, p.c]);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: p.a,
        overflow: 'hidden',
        flexShrink: 0,
        border: '1px solid var(--line)',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 60 60" preserveAspectRatio="xMidYMid slice">
        <rect width="60" height="60" fill={p.a} />
        {scales.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={5.5} fill={d.fill} opacity={0.85} />
        ))}
      </svg>
    </div>
  );
}
