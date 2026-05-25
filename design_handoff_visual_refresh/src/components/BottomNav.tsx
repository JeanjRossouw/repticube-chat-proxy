// src/components/BottomNav.tsx
// Repti-track visual refresh — drop in over the existing BottomNav.tsx.
// Same layout (5 items, center FAB) but uses CSS vars for theme support
// and refines spacing/shadows.
'use client';
import { Home, Search, Heart, Utensils, MoreHorizontal } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

type NavRole = 'owner' | 'staff';

export default function BottomNav({ role = 'owner' }: { role?: NavRole }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login' || pathname.startsWith('/auth') || pathname.startsWith('/invite')) {
    return null;
  }

  const items = [
    { href: '/',         icon: Home,            label: 'Home' },
    { href: '/snakes',   icon: Search,          label: 'Reptiles' },
    { href: '/feed',     icon: Utensils,        label: 'Feed', primary: true },
    ...(role === 'owner' ? [{ href: '/pairings', icon: Heart, label: 'Pairings' }] : []),
    { href: '/settings', icon: MoreHorizontal,  label: 'More' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      maxWidth: 480, margin: '0 auto',
      background: 'var(--card)',
      borderTop: '1px solid var(--line)',
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 max(14px, env(safe-area-inset-bottom))',
      boxShadow: '0 -2px 10px rgba(23,51,33,0.04)',
      zIndex: 50,
    }}>
      {items.map(item => {
        const Icon = item.icon;
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: active ? 'var(--moss)' : 'var(--muted)',
              padding: item.primary ? '0 8px' : '4px 8px',
              flex: 1,
            }}
          >
            {item.primary ? (
              <div style={{
                background: 'var(--moss)', color: 'var(--ink-on-moss)',
                width: 52, height: 52, borderRadius: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: -20,
                boxShadow: '0 8px 18px -6px rgba(42,82,56,0.5), 0 1px 0 rgba(255,255,255,0.15) inset',
              }}>
                <Icon size={22} />
              </div>
            ) : (
              <Icon size={20} strokeWidth={1.6} />
            )}
            <span style={{ fontSize: 10, fontWeight: 500, color: active ? 'var(--moss)' : 'var(--muted)' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
