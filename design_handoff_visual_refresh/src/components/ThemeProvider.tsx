// src/components/ThemeProvider.tsx
// NEW — applies the user's theme preference and exposes a setter.
// Drop into app/(app)/layout.tsx (client boundary) to wrap children.
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'terrarium' | 'moonlight' | 'linen';

const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: 'terrarium',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('terrarium');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem('rt-theme')) as Theme | null;
    if (stored && ['terrarium', 'moonlight', 'linen'].includes(stored)) {
      setTheme(stored);
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('moonlight');
    }
  }, []);

  // Reflect to <html data-theme="...">
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('rt-theme', theme); } catch {}
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
