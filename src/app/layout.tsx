import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Repti-Track',
  description: 'Reptile collection manager — feeding, weights, breeding',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Repti-Track',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E2A1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#F4EFE3', position: 'relative' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
