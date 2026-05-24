export const today = () => new Date().toISOString().slice(0, 10);

export const daysBetween = (d1: string, d2: string) => {
  const a = new Date(d1), b = new Date(d2);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
};

export const daysAgo = (d: string) => daysBetween(d, today());

export const addDays = (d: string, n: number) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
};

export const formatDate = (d: string | null | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

// Generate sticker code: 6 chars, no ambiguous (0/O/I/1)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const newStickerCode = () => {
  let s = '';
  for (let i = 0; i < 6; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
};
