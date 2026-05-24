'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Type } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, btnPrimary, btnSecondary, inputStyle } from '@/components/UI';
import { BRAND } from '@/lib/theme';

export default function ScanPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const scannerRef = useRef<any>(null);
  const containerId = 'qr-reader';

  useEffect(() => {
    if (mode !== 'camera') return;
    let mounted = true;

    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!mounted) return;
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            // QR encodes full URL — extract sticker code from end
            const match = decodedText.match(/\/s\/([A-Z0-9]+)$/) || decodedText.match(/^([A-Z0-9]{6})$/);
            if (match) {
              scanner.stop().then(() => router.push(`/s/${match[1]}`));
            }
          },
          () => {}
        );
      } catch (e: any) {
        setError(e.message || 'Camera not available. Use manual entry.');
        setMode('manual');
      }
    })();

    return () => {
      mounted = false;
      if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(() => {});
    };
  }, [mode, router]);

  const lookupManual = () => {
    if (code.length >= 4) router.push(`/s/${code.toUpperCase()}`);
  };

  return (
    <>
      <AppHeader title="Scan sticker" back />
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, background: 'white', padding: 4, borderRadius: 12 }}>
          <button onClick={() => setMode('camera')} style={{
            flex: 1, padding: 10, borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer',
            background: mode === 'camera' ? BRAND.green : 'transparent',
            color: mode === 'camera' ? 'white' : BRAND.ink,
          }}>
            <Camera size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Camera
          </button>
          <button onClick={() => setMode('manual')} style={{
            flex: 1, padding: 10, borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer',
            background: mode === 'manual' ? BRAND.green : 'transparent',
            color: mode === 'manual' ? 'white' : BRAND.ink,
          }}>
            <Type size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Type code
          </button>
        </div>

        {mode === 'camera' ? (
          <div>
            <div id={containerId} style={{ width: '100%', borderRadius: 12, overflow: 'hidden', background: 'black' }} />
            {error && <div style={{ color: BRAND.danger, marginTop: 12, fontSize: 13 }}>{error}</div>}
            <div style={{ fontSize: 13, color: BRAND.ash, textAlign: 'center', marginTop: 12 }}>
              Point camera at the QR sticker
            </div>
          </div>
        ) : (
          <Card>
            <div style={{ fontSize: 13, color: BRAND.ash, marginBottom: 12 }}>
              Enter the 6-character code printed below the QR.
            </div>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              maxLength={6}
              placeholder="AB7K9X"
              autoFocus
              style={{
                ...inputStyle, fontSize: 24, letterSpacing: 4, textAlign: 'center',
                fontWeight: 700, marginBottom: 12, fontFamily: 'monospace',
              }}
            />
            <button onClick={lookupManual} disabled={code.length < 4} style={{
              ...btnPrimary, opacity: code.length < 4 ? 0.5 : 1,
            }}>
              Look up sticker
            </button>
          </Card>
        )}
      </div>
    </>
  );
}
