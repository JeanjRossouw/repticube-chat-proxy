'use client';
import { useRouter } from 'next/navigation';
import { Snake, Feeding, Sticker, AppContext } from '@/lib/types';
import { Card, Section, btnPrimary } from '@/components/UI';
import AppHeader from '@/components/AppHeader';
import { BRAND } from '@/lib/theme';
import { daysAgo } from '@/lib/utils';
import { QrCode, Search, Heart, Printer, Utensils, ShoppingCart, Plus, Users } from 'lucide-react';

export default function HomeClient({ snakes, feedings, stickers, ctx }: {
  snakes: Snake[]; feedings: Feeding[]; stickers: Sticker[]; ctx: AppContext;
}) {
  const router = useRouter();
  const isOwner = ctx.role === 'owner';
  const unclaimedStickers = stickers.filter(s => !s.claimed_at).length;

  const dueSnakes = snakes.map(snake => {
    const lastFeed = feedings.find(f => f.snake_id === snake.id);
    if (!lastFeed?.next_due) return null;
    const days = daysAgo(lastFeed.next_due);
    return { snake, days };
  }).filter((x): x is { snake: Snake; days: number } => x !== null && x.days >= -2)
    .sort((a, b) => b.days - a.days);

  return (
    <>
      <AppHeader title="Home" />
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: BRAND.ash, marginBottom: 4 }}>
            {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: BRAND.dark }}>
            {snakes.length === 0 ? "Let's add your first reptile" : `${snakes.length} reptile${snakes.length === 1 ? '' : 's'} in your care`}
          </div>
          {!isOwner && (
            <div style={{ marginTop: 8, fontSize: 13, color: BRAND.ash, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} /> Staff member · {ctx.team.name}
            </div>
          )}
        </div>

        {snakes.length === 0 && isOwner ? (
          <Card>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Getting started</div>
            <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
              Search the species library, fill in this animal's details, print the auto-generated sticker, and stick it on the enclosure. Done in 60 seconds.
            </div>
            <button onClick={() => router.push('/add')} style={btnPrimary}>
              <Plus size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Add your first reptile
            </button>
          </Card>
        ) : isOwner ? (
          <button onClick={() => router.push('/add')} style={{
            width: '100%', padding: 16, background: BRAND.green, color: 'white',
            border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 8, boxShadow: `0 4px 12px ${BRAND.green}40`,
          }}>
            <Plus size={20} />
            Add reptile
          </button>
        ) : null}

        {dueSnakes.length > 0 && (
          <Section title="Feeding due">
            {dueSnakes.map(({ snake, days }) => (
              <Card key={snake.id} onClick={() => router.push(`/snakes/${snake.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{snake.name}</div>
                    <div style={{ fontSize: 13, color: BRAND.ash }}>{snake.species}</div>
                  </div>
                  <div style={{
                    background: days > 0 ? BRAND.danger : days === 0 ? BRAND.gold : BRAND.ok,
                    color: 'white', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                  }}>
                    {days > 0 ? `${days}d overdue` : days === 0 ? 'Today' : `In ${-days}d`}
                  </div>
                </div>
              </Card>
            ))}
          </Section>
        )}

        <Section title="Quick actions">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ActionTile icon={Utensils} label={`Batch feed (${dueSnakes.length} due)`} onClick={() => router.push('/feed')} />
            <ActionTile icon={ShoppingCart} label="Prey forecast" onClick={() => router.push('/forecast')} />
            <ActionTile icon={QrCode} label="Scan sticker" onClick={() => router.push('/scan')} />
            <ActionTile icon={Search} label="Find reptile" onClick={() => router.push('/snakes')} />
            {isOwner && <ActionTile icon={Heart} label="Pairings" onClick={() => router.push('/pairings')} />}
            {isOwner && <ActionTile icon={Printer} label={`${unclaimedStickers} stickers`} onClick={() => router.push('/stickers')} />}
          </div>
        </Section>
      </div>
    </>
  );
}

function ActionTile({ icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} style={{
      background: 'white', border: `1px solid ${BRAND.cream}`, borderRadius: 12,
      padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column',
      alignItems: 'flex-start', gap: 8, textAlign: 'left',
    }}>
      <Icon size={20} color={BRAND.green} />
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
    </button>
  );
}
