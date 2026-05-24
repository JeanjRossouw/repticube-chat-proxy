'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, inputStyle } from '@/components/UI';
import { BRAND } from '@/lib/theme';
import { Snake, AppContext } from '@/lib/types';
import { daysAgo } from '@/lib/utils';

export default function SnakesListClient({ snakes, feedings, weights, ctx }: {
  snakes: Snake[]; feedings: any[]; weights: any[]; ctx: AppContext;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [facilityFilter, setFacilityFilter] = useState<string | 'all'>('all');
  const isOwner = ctx.role === 'owner';

  const facilityById: Record<string, string> = {};
  ctx.facilities.forEach(f => { facilityById[f.id] = f.name; });

  const filtered = snakes.filter(s => {
    if (facilityFilter !== 'all' && s.facility_id !== facilityFilter) return false;
    if (!search) return true;
    return s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.species.toLowerCase().includes(search.toLowerCase()) ||
      s.morph?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <AppHeader title="All reptiles" />
      <div style={{ padding: 20 }}>
        {isOwner && (
          <button onClick={() => router.push('/add')} style={{
            width: '100%', padding: 14, background: BRAND.green, color: 'white',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginBottom: 12,
          }}>
            <Plus size={18} />
            Add reptile
          </button>
        )}
        <input
          type="text"
          placeholder="Search by name, species, morph..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, padding: '12px 16px', fontSize: 15, marginBottom: 12 }}
        />
        {ctx.facilities.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            <FacilityChip label="All" active={facilityFilter === 'all'} onClick={() => setFacilityFilter('all')} />
            {ctx.facilities.map(f => (
              <FacilityChip key={f.id} label={f.name} active={facilityFilter === f.id} onClick={() => setFacilityFilter(f.id)} />
            ))}
          </div>
        )}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: BRAND.ash, padding: 40 }}>
            {snakes.length === 0 ? (isOwner ? 'No reptiles yet. Tap "Add reptile" above to start.' : 'No reptiles in this team yet.') : 'No matches'}
          </div>
        ) : filtered.map(snake => {
          const lastFeed = feedings.find(f => f.snake_id === snake.id);
          const lastWeight = weights.find(w => w.snake_id === snake.id);
          const facilityName = snake.facility_id ? facilityById[snake.facility_id] : null;
          return (
            <Card key={snake.id} onClick={() => router.push(`/snakes/${snake.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{snake.name}</div>
                  <div style={{ fontSize: 13, color: BRAND.ash, marginTop: 2 }}>
                    {snake.species}{snake.morph ? ` • ${snake.morph}` : ''}
                  </div>
                  <div style={{ fontSize: 12, color: BRAND.ash, marginTop: 6, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>{snake.sex === 'M' ? '♂' : snake.sex === 'F' ? '♀' : '?'}</span>
                    {lastWeight && <span>{lastWeight.grams}g</span>}
                    {lastFeed && <span>Fed {daysAgo(lastFeed.date)}d ago</span>}
                    {facilityName && (
                      <span style={{
                        background: BRAND.cream, color: BRAND.green, padding: '2px 8px',
                        borderRadius: 8, fontSize: 11, fontWeight: 700,
                      }}>{facilityName}</span>
                    )}
                  </div>
                </div>
                <div style={{
                  background: BRAND.cream, padding: '4px 8px', borderRadius: 8,
                  fontSize: 10, fontWeight: 700, color: BRAND.green, letterSpacing: 0.5,
                  fontFamily: 'monospace',
                }}>
                  {snake.sticker_qr || '—'}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function FacilityChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: active ? BRAND.green : 'white',
      color: active ? 'white' : BRAND.ink,
      border: `1px solid ${active ? BRAND.green : BRAND.cream}`,
      padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
      cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{label}</button>
  );
}
