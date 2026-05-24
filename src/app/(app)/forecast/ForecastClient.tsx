'use client';
import { useMemo, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { Card, Section } from '@/components/UI';
import { BRAND } from '@/lib/theme';
import { Snake, Feeding } from '@/lib/types';
import { today, addDays, daysBetween } from '@/lib/utils';
import { ShoppingCart, AlertCircle } from 'lucide-react';

type ForecastRow = {
  key: string;
  prey_type: string;
  prey_size: string;
  count: number;
  snakes: { name: string; sticker: string | null }[];
};

function forecastFor(snakes: Snake[], feedings: Feeding[], days: number): ForecastRow[] {
  const buckets: Record<string, ForecastRow> = {};
  const horizon = addDays(today(), days);

  for (const snake of snakes) {
    if (!snake.feed_interval_days || snake.feed_interval_days <= 0) continue;

    // Determine next feed date for this snake
    const lastFeed = feedings.find(f => f.snake_id === snake.id);
    let nextDate: string;
    if (lastFeed?.next_due) {
      nextDate = lastFeed.next_due;
    } else if (lastFeed) {
      nextDate = addDays(lastFeed.date, snake.feed_interval_days);
    } else {
      // never fed - assume due today
      nextDate = today();
    }

    // If next is before today (overdue), shift forward to today
    if (daysBetween(nextDate, today()) > 0) {
      nextDate = today();
    }

    // Count how many feedings fall within the horizon
    let feedingDate = nextDate;
    while (daysBetween(feedingDate, horizon) >= 0) {
      const preyType = snake.prey_type || 'Unknown';
      const preySize = snake.prey_size || 'Unknown';
      const key = `${preySize}|${preyType}`;
      if (!buckets[key]) {
        buckets[key] = { key, prey_type: preyType, prey_size: preySize, count: 0, snakes: [] };
      }
      buckets[key].count++;
      // Only list each snake once per bucket
      if (!buckets[key].snakes.find(s => s.name === snake.name)) {
        buckets[key].snakes.push({ name: snake.name, sticker: snake.sticker_qr });
      }
      feedingDate = addDays(feedingDate, snake.feed_interval_days);
    }
  }

  return Object.values(buckets).sort((a, b) => b.count - a.count);
}

export default function ForecastClient({ snakes, feedings }: { snakes: Snake[]; feedings: Feeding[] }) {
  const [window, setWindow] = useState<7 | 30>(7);

  const rows = useMemo(() => forecastFor(snakes, feedings, window), [snakes, feedings, window]);
  const missing = snakes.filter(s => !s.prey_type || !s.prey_size || !s.feed_interval_days).length;
  const totalFeedings = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <>
      <AppHeader title="Prey forecast" back />
      <div style={{ padding: 20 }}>
        {/* window toggle */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'white', padding: 4, borderRadius: 12 }}>
          <button onClick={() => setWindow(7)} style={{
            flex: 1, padding: 10, borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer',
            background: window === 7 ? BRAND.green : 'transparent',
            color: window === 7 ? 'white' : BRAND.ink,
          }}>
            Next 7 days
          </button>
          <button onClick={() => setWindow(30)} style={{
            flex: 1, padding: 10, borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer',
            background: window === 30 ? BRAND.green : 'transparent',
            color: window === 30 ? 'white' : BRAND.ink,
          }}>
            Next 30 days
          </button>
        </div>

        {/* summary banner */}
        <div style={{
          background: BRAND.dark, color: 'white', padding: 20, borderRadius: 16, marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, color: BRAND.gold, letterSpacing: 1.5, fontWeight: 700 }}>
            SHOPPING LIST · NEXT {window} DAYS
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>
            {totalFeedings}
          </div>
          <div style={{ fontSize: 14, color: '#A8C7B4' }}>
            total feedings across {rows.length} prey type{rows.length === 1 ? '' : 's'}
          </div>
        </div>

        {missing > 0 && (
          <Card style={{ background: '#FFF8E5', borderColor: BRAND.gold }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <AlertCircle size={18} color={BRAND.gold} style={{ marginTop: 2 }} />
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{missing} reptile{missing === 1 ? '' : 's'} missing data</div>
                <div style={{ color: BRAND.ash }}>
                  Some animals don't have prey type, size, or feed interval set. They're excluded from this forecast. Edit each reptile's profile to include them.
                </div>
              </div>
            </div>
          </Card>
        )}

        {rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: BRAND.ash }}>
            <ShoppingCart size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div>No feedings forecast for this window.</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>
              Make sure each reptile has prey type, prey size, and feed interval set.
            </div>
          </div>
        ) : (
          <>
            <Section title="By prey type">
              {rows.map(row => (
                <Card key={row.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>
                        {row.prey_size} {row.prey_type}
                      </div>
                      <div style={{ fontSize: 12, color: BRAND.ash, marginTop: 2 }}>
                        for {row.snakes.length} reptile{row.snakes.length === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div style={{
                      background: BRAND.green, color: 'white',
                      padding: '6px 12px', borderRadius: 10,
                      fontSize: 18, fontWeight: 800, minWidth: 50, textAlign: 'center',
                    }}>
                      {row.count}
                    </div>
                  </div>
                  <details style={{ marginTop: 8 }}>
                    <summary style={{
                      fontSize: 12, color: BRAND.green, fontWeight: 600, cursor: 'pointer',
                      listStyle: 'none', userSelect: 'none',
                    }}>
                      Show reptiles ▾
                    </summary>
                    <div style={{ marginTop: 8, fontSize: 12, color: BRAND.ink }}>
                      {row.snakes.map((s, i) => (
                        <div key={i} style={{ padding: '4px 0', borderTop: i > 0 ? `1px solid ${BRAND.cream}` : 'none' }}>
                          {s.name}{s.sticker ? ` (${s.sticker})` : ''}
                        </div>
                      ))}
                    </div>
                  </details>
                </Card>
              ))}
            </Section>

            <div style={{
              marginTop: 16, padding: 12, background: BRAND.cream, borderRadius: 10,
              fontSize: 11, color: BRAND.ash, lineHeight: 1.5,
            }}>
              <strong>How this is calculated:</strong> For each reptile, we look at when they're next due to feed and project forward at their feed interval, counting all feedings that fall within {window} days. Add ~10% buffer when shopping to account for refused feeds and growth.
            </div>
          </>
        )}
      </div>
    </>
  );
}
