'use client';
import { ReactNode, CSSProperties } from 'react';
import { BRAND } from '@/lib/theme';

export function Card({ children, onClick, style }: { children: ReactNode; onClick?: () => void; style?: CSSProperties }) {
  return (
    <div onClick={onClick} style={{
      background: 'white', borderRadius: 12, padding: 16, marginBottom: 8,
      cursor: onClick ? 'pointer' : 'default',
      border: `1px solid ${BRAND.cream}`,
      ...style,
    }}>{children}</div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.ash, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>{title}</div>
      {children}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: 'white', padding: 12, borderRadius: 10, textAlign: 'center', border: `1px solid ${BRAND.cream}` }}>
      <div style={{ fontSize: 10, color: BRAND.ash, fontWeight: 700, letterSpacing: 1 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}

export function DetailRow({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '10px 0',
      borderBottom: last ? 'none' : `1px solid ${BRAND.cream}`,
    }}>
      <span style={{ color: BRAND.ash, fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 14, textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );
}

export function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.ash, marginBottom: 4, letterSpacing: 0.5 }}>{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

export const inputStyle: CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: `1px solid ${BRAND.cream}`, fontSize: 15, background: 'white',
  boxSizing: 'border-box', fontFamily: 'inherit',
};

export const btnPrimary: CSSProperties = {
  width: '100%', padding: 14, background: BRAND.green, color: 'white',
  border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
};

export const btnSecondary: CSSProperties = {
  width: '100%', padding: 14, background: 'transparent', color: BRAND.ink,
  border: `1px solid ${BRAND.cream}`, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
};

export const btnDanger: CSSProperties = {
  width: '100%', padding: 14, background: 'transparent', color: BRAND.danger,
  border: `1px solid ${BRAND.danger}`, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
};
