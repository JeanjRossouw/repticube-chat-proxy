// src/components/UI.tsx
// Repti-track visual refresh — drop in over the existing UI.tsx.
// Keeps the same exports so existing imports keep working.
'use client';
import { ReactNode, CSSProperties } from 'react';
import { BRAND, RADIUS } from '@/lib/theme';

export function Card({ children, onClick, style }: { children: ReactNode; onClick?: () => void; style?: CSSProperties }) {
  return (
    <div onClick={onClick} className="card" style={{
      padding: 14, marginBottom: 8,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

// Section header — now uses .eyebrow class for consistent type ramp
export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div className="eyebrow">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

// Stat tile — now uses the display serif for the value, italic for the unit
export function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="eyebrow" style={{ fontSize: 9 }}>{label}</div>
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="display" style={{ fontSize: 24, color: 'var(--ink)' }}>{value}</span>
        {sub && <span className="display-italic" style={{ fontSize: 13, color: 'var(--muted)' }}>{sub}</span>}
      </div>
    </div>
  );
}

export function DetailRow({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderBottom: last ? 'none' : '1px solid var(--line)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink)', textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );
}

export function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

export const inputStyle: CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: `1px solid var(--line)`, fontSize: 15, background: 'var(--card)',
  color: 'var(--ink)', boxSizing: 'border-box', fontFamily: 'inherit',
  outline: 'none',
};

export const btnPrimary: CSSProperties = {
  width: '100%', padding: 14, background: 'var(--moss)', color: 'var(--ink-on-moss)',
  border: 'none', borderRadius: RADIUS.button, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};

export const btnSecondary: CSSProperties = {
  width: '100%', padding: 14, background: 'transparent', color: 'var(--ink)',
  border: `1px solid var(--line-strong)`, borderRadius: RADIUS.button, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};

export const btnDanger: CSSProperties = {
  width: '100%', padding: 14, background: 'transparent', color: 'var(--rust)',
  border: `1px solid var(--rust)`, borderRadius: RADIUS.button, fontSize: 14, fontWeight: 600, cursor: 'pointer',
};

// ─── New: <DuePill /> helper ──────────────────────────────────────
// Replaces the inline "days overdue" pill scattered through the screens.
export function DuePill({ days }: { days: number }) {
  if (days > 0) {
    return <span className="due-pill due-pill--over">{days}d over</span>;
  }
  if (days === 0) {
    return <span className="due-pill due-pill--today">Today</span>;
  }
  return <span style={{ fontSize: 11, color: 'var(--muted)' }}>In {-days}d</span>;
}

// ─── New: <QRBadge /> helper ──────────────────────────────────────
export function QRBadge({ code }: { code: string | null | undefined }) {
  return <span className="qr-badge">{code || '— —'}</span>;
}
