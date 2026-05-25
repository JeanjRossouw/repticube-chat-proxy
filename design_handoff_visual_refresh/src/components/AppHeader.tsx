// src/components/AppHeader.tsx
// Repti-track visual refresh — drop in over the existing AppHeader.tsx.
//
// Big change: dark-banner header replaced with a *page-level* light header
// using display serif title + eyebrow. This frees the dark green for hero
// moments (the reptile detail card, the FAB, the bottom-nav center button).
'use client';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export default function AppHeader({
  title,
  back,
  eyebrow = 'REPTI-TRACK',
  action,
}: {
  title: string;
  back?: boolean;
  eyebrow?: string;
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '16px 20px 12px',
      background: 'var(--bg)',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      {back && (
        <button
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'transparent', border: '1px solid var(--line)',
            color: 'var(--ink)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="eyebrow" style={{ color: 'var(--moss)' }}>{eyebrow}</div>
        <div className="display" style={{ fontSize: 28, color: 'var(--ink)', marginTop: 2 }}>
          {title}
        </div>
      </div>
      {action}
    </div>
  );
}
