'use client';
import { Home, Search, Heart, Settings, Utensils } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { BRAND } from '@/lib/theme';

export default function BottomNav({ role = 'owner' }: { role?: 'owner' | 'staff' }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login' || pathname.startsWith('/auth') || pathname.startsWith('/invite')) return null;

  const items = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/snakes', icon: Search, label: 'Reptiles' },
    { href: '/feed', icon: Utensils, label: 'Feed', primary: true },
    ...(role === 'owner' ? [{ href: '/pairings', icon: Heart, label: 'Pairings' }] : []),
    { href: '/settings', icon: Settings, label: 'More' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      maxWidth: 480, margin: '0 auto',
      background: 'white', borderTop: `1px solid ${BRAND.cream}`,
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 0 max(12px, env(safe-area-inset-bottom))',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      zIndex: 50,
    }}>
      {items.map(item => {
        const Icon = item.icon;
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <button key={item.href} onClick={() => router.push(item.href)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: active ? BRAND.green : BRAND.ash,
            padding: item.primary ? '0 8px' : '4px 8px',
            flex: 1,
          }}>
            {item.primary ? (
              <div style={{
                background: BRAND.green, color: 'white',
                width: 48, height: 48, borderRadius: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: -20, boxShadow: '0 4px 12px rgba(31,107,58,0.4)',
              }}>
                <Icon size={22} />
              </div>
            ) : <Icon size={22} />}
            <span style={{ fontSize: 10, fontWeight: 600 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
