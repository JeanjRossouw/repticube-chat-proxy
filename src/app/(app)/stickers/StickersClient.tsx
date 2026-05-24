'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import AppHeader from '@/components/AppHeader';
import { Card, Section, inputStyle, btnPrimary, btnSecondary } from '@/components/UI';
import { BRAND } from '@/lib/theme';
import { Sticker } from '@/lib/types';
import { newStickerCode } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Printer, Check } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

import { AppContext } from '@/lib/types';

type PrintItem = { qr_code: string; name?: string };

export default function StickersClient({ stickers, snakes, ctx }: { stickers: Sticker[]; snakes: any[]; ctx: AppContext }) {
  const router = useRouter();
  const supabase = createClient();
  const [batchSize, setBatchSize] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [printItems, setPrintItems] = useState<PrintItem[] | null>(null);
  const [selectedReprints, setSelectedReprints] = useState<Set<string>>(new Set());

  const unclaimed = stickers.filter(s => !s.claimed_at);
  const claimed = stickers.filter(s => s.claimed_at);

  const generate = async () => {
    setGenerating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setGenerating(false); return; }
    const batch = Array.from({ length: batchSize }, () => ({
      qr_code: newStickerCode(),
      owner_id: user.id,
      team_id: ctx.team.id,
    }));
    const { error } = await supabase.from('stickers').insert(batch);
    setGenerating(false);
    if (error) alert(error.message);
    else router.refresh();
  };

  const printUnclaimed = () => {
    setPrintItems(unclaimed.map(s => ({ qr_code: s.qr_code })));
  };

  const toggleReprint = (qr_code: string) => {
    setSelectedReprints(prev => {
      const next = new Set(prev);
      if (next.has(qr_code)) next.delete(qr_code);
      else next.add(qr_code);
      return next;
    });
  };

  const printSelectedReprints = () => {
    const items = claimed
      .filter(s => selectedReprints.has(s.qr_code))
      .map(s => ({
        qr_code: s.qr_code,
        name: snakes.find(sn => sn.id === s.snake_id)?.name,
      }));
    setPrintItems(items);
  };

  const selectAllClaimed = () => {
    if (selectedReprints.size === claimed.length) {
      setSelectedReprints(new Set());
    } else {
      setSelectedReprints(new Set(claimed.map(s => s.qr_code)));
    }
  };

  return (
    <>
      <AppHeader title="QR stickers" back />
      <div style={{ padding: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Generate batch</div>
          <div style={{ fontSize: 13, color: BRAND.ash, marginBottom: 12 }}>
            Each sticker gets a unique 6-character code. Print with QR codes pointing to {APP_URL || 'your app URL'}/s/CODE.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" value={batchSize}
                   onChange={e => setBatchSize(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
                   style={{ ...inputStyle, width: 100 }} min={1} max={200} />
            <button onClick={generate} style={btnPrimary} disabled={generating}>
              {generating ? 'Generating...' : `Generate ${batchSize}`}
            </button>
          </div>
        </Card>

        {unclaimed.length > 0 && (
          <button onClick={printUnclaimed} style={{ ...btnSecondary, marginTop: 12 }}>
            <Printer size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Print all unclaimed ({unclaimed.length})
          </button>
        )}

        <Section title={`Unclaimed (${unclaimed.length})`}>
          {unclaimed.length === 0 ? (
            <div style={{ color: BRAND.ash, padding: 20, textAlign: 'center' }}>No unclaimed stickers</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {unclaimed.slice(0, 30).map(s => (
                <StickerPreview key={s.qr_code} qr_code={s.qr_code} />
              ))}
            </div>
          )}
        </Section>

        <Section title={`Claimed (${claimed.length})`}>
          {claimed.length > 0 && (
            <Card style={{ background: BRAND.cream }}>
              <div style={{ fontSize: 13, marginBottom: 10 }}>
                <strong>Reprint stickers:</strong> Select damaged or lost stickers below to reprint with the same code — the assigned reptile stays linked.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={selectAllClaimed} style={{
                  ...btnSecondary, padding: '10px 12px', fontSize: 13, flex: 1,
                }}>
                  {selectedReprints.size === claimed.length ? 'Deselect all' : 'Select all'}
                </button>
                <button
                  onClick={printSelectedReprints}
                  disabled={selectedReprints.size === 0}
                  style={{
                    ...btnPrimary, padding: '10px 12px', fontSize: 13, flex: 2,
                    opacity: selectedReprints.size === 0 ? 0.5 : 1,
                  }}
                >
                  <Printer size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Reprint {selectedReprints.size > 0 ? `${selectedReprints.size} selected` : ''}
                </button>
              </div>
            </Card>
          )}

          {claimed.map(s => {
            const snake = snakes.find(sn => sn.id === s.snake_id);
            const isSelected = selectedReprints.has(s.qr_code);
            return (
              <Card key={s.qr_code} style={{
                border: isSelected ? `2px solid ${BRAND.green}` : `1px solid ${BRAND.cream}`,
                background: isSelected ? '#F0F7F2' : 'white',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => toggleReprint(s.qr_code)} style={{
                    width: 28, height: 28, borderRadius: 6,
                    border: isSelected ? 'none' : `2px solid ${BRAND.cream}`,
                    background: isSelected ? BRAND.green : 'white',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isSelected && <Check size={16} color="white" />}
                  </button>
                  <div
                    onClick={() => snake && router.push(`/snakes/${s.snake_id}`)}
                    style={{ flex: 1, cursor: snake ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between' }}
                  >
                    <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{s.qr_code}</div>
                    <div>{snake?.name || '(deleted)'}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </Section>
      </div>

      {printItems && (
        <PrintSheet items={printItems} onClose={() => { setPrintItems(null); setSelectedReprints(new Set()); }} />
      )}
    </>
  );
}

function StickerPreview({ qr_code }: { qr_code: string }) {
  const [dataUrl, setDataUrl] = useState('');
  useEffect(() => {
    const url = `${APP_URL}/s/${qr_code}`;
    QRCode.toDataURL(url, { width: 200, margin: 1 }).then(setDataUrl);
  }, [qr_code]);
  return (
    <div style={{ background: 'white', padding: 12, borderRadius: 10, textAlign: 'center' }}>
      {dataUrl && <img src={dataUrl} alt={qr_code} style={{ width: '100%', maxWidth: 100 }} />}
      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, marginTop: 6 }}>{qr_code}</div>
    </div>
  );
}

function PrintSheet({ items, onClose }: { items: PrintItem[]; onClose: () => void }) {
  const [qrs, setQrs] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all(
      items.map(item =>
        QRCode.toDataURL(`${APP_URL}/s/${item.qr_code}`, { width: 300, margin: 0 })
          .then(url => [item.qr_code, url] as [string, string])
      )
    ).then(results => setQrs(Object.fromEntries(results)));
  }, [items]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'white', overflow: 'auto', zIndex: 1000, padding: 20,
    }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 10mm; }
        }
        .sticker-sheet { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8mm; }
        .sticker-cell {
          border: 1px dashed #ccc; padding: 4mm; text-align: center;
          break-inside: avoid; aspect-ratio: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .sticker-name {
          font-size: 10px; font-weight: 600; margin-bottom: 2mm; color: #333;
        }
      `}</style>
      <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 16, maxWidth: 600 }}>
        <button onClick={onClose} style={btnSecondary}>Close</button>
        <button onClick={() => window.print()} style={btnPrimary}>Print {items.length} sticker{items.length === 1 ? '' : 's'}</button>
      </div>
      <div className="sticker-sheet">
        {items.map(item => (
          <div key={item.qr_code} className="sticker-cell">
            {item.name && <div className="sticker-name">{item.name}</div>}
            {qrs[item.qr_code] && <img src={qrs[item.qr_code]} alt={item.qr_code} style={{ width: '70%' }} />}
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, marginTop: 4 }}>{item.qr_code}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
