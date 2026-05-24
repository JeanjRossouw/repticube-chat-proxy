'use client';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/theme';

export default function AppHeader({ title, back }: { title: string; back?: boolean }) {
  const router = useRouter();
  return (
    <div style={{
      background: BRAND.dark, color: 'white', padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
      position: 'sticky', top: 0, zIndex: 40,
      borderBottom: `3px solid ${BRAND.gold}`,
    }}>
      {back && (
        <button onClick={() => router.back()} style={{
          background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 4,
          display: 'flex', alignItems: 'center',
        }}>
          <ChevronLeft size={24} />
        </button>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: BRAND.gold, letterSpacing: 1.5, fontWeight: 700 }}>REPTI-TRACK</div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>{title}</div>
      </div>
    </div>
  );
}
