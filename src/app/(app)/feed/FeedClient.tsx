'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, FastForward, RotateCcw, Edit3, Save, ChevronRight, Square, CheckSquare } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, FormRow, inputStyle, btnPrimary, btnSecondary } from '@/components/UI';
import PreyAutocomplete from '@/components/PreyAutocomplete';
import { getPreyTypesForCategory, getPreySizesForType, isCGDFeeding } from '@/lib/prey';
import { BRAND } from '@/lib/theme';
import { Snake, Feeding, AppContext } from '@/lib/types';
import { today, addDays, daysAgo, formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

type Decision = {
  snake_id: string;
  status: 'ate' | 'refused' | 'skip';
  prey_type: string;
  prey_size: string;
  notes: string;
};

type Stage = 'select' | 'feeding' | 'review';

export default function FeedClient({ snakes, feedings, categoryBySpeciesId, ctx }: {
  snakes: Snake[];
  feedings: Feeding[];
  categoryBySpeciesId: Record<string, string>;
  ctx: AppContext;
}) {
  const router = useRouter();
  const supabase = createClient();

  // Compute due reptiles with category info
  const dueWithMeta = useMemo(() => {
    return snakes
      .map(snake => {
        const lastFeed = feedings.find(f => f.snake_id === snake.id);
        let days = 999;
        if (lastFeed?.next_due) days = daysAgo(lastFeed.next_due);
        else if (lastFeed) days = daysAgo(lastFeed.date) - snake.feed_interval_days;
        const category = snake.species_id ? (categoryBySpeciesId[snake.species_id] || 'other') : 'other';
        return { snake, lastFeed, days, category };
      })
      .filter(x => x.days >= 0)
      .sort((a, b) => b.days - a.days);
  }, [snakes, feedings, categoryBySpeciesId]);

  // Selection step state
  const [filter, setFilter] = useState<'all' | string>('all');
  const [selected, setSelected] = useState<Set<string>>(() => new Set(dueWithMeta.map(d => d.snake.id)));
  const [stage, setStage] = useState<Stage>('select');

  // Feeding step state
  const [queue, setQueue] = useState<typeof dueWithMeta>([]);
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [showOverride, setShowOverride] = useState(false);

  // Review step state
  const [saving, setSaving] = useState(false);
  const [feedDate, setFeedDate] = useState(today());

  if (dueWithMeta.length === 0) {
    return (
      <>
        <AppHeader title="Batch feed" back />
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>All caught up</div>
          <div style={{ color: BRAND.ash, marginBottom: 24 }}>
            Nothing is due to feed right now. Come back when something is overdue.
          </div>
          <button onClick={() => router.push('/')} style={btnPrimary}>Back to home</button>
        </div>
      </>
    );
  }

  // ============== STAGE 1: SELECT ==============
  if (stage === 'select') {
    // Categories present in due list
    const cats = Array.from(new Set(dueWithMeta.map(d => d.category)));
    const filtered = filter === 'all' ? dueWithMeta : dueWithMeta.filter(d => d.category === filter);
    const visibleIds = filtered.map(d => d.snake.id);
    const allVisibleSelected = visibleIds.every(id => selected.has(id));

    const toggle = (id: string) => {
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    const toggleAllVisible = () => {
      setSelected(prev => {
        const next = new Set(prev);
        if (allVisibleSelected) visibleIds.forEach(id => next.delete(id));
        else visibleIds.forEach(id => next.add(id));
        return next;
      });
    };

    const startFeeding = () => {
      const filteredQueue = dueWithMeta.filter(d => selected.has(d.snake.id));
      if (filteredQueue.length === 0) {
        alert('Select at least one reptile to feed');
        return;
      }
      setQueue(filteredQueue);
      setIndex(0);
      setDecisions({});
      setStage('feeding');
    };

    return (
      <>
        <AppHeader title={`Batch feed (${selected.size})`} back />
        <div style={{ padding: 20 }}>
          {/* Category filter chips */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }} className="hide-scroll">
            <button onClick={() => setFilter('all')} style={chipStyle(filter === 'all')}>
              All ({dueWithMeta.length})
            </button>
            {cats.map(cat => {
              const count = dueWithMeta.filter(d => d.category === cat).length;
              return (
                <button key={cat} onClick={() => setFilter(cat)} style={chipStyle(filter === cat)}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}s ({count})
                </button>
              );
            })}
          </div>

          {/* Select all toggle */}
          <button onClick={toggleAllVisible} style={{
            width: '100%', padding: 12, background: 'white', border: `1px solid ${BRAND.cream}`,
            borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginBottom: 12, color: BRAND.ink,
          }}>
            {allVisibleSelected ? <CheckSquare size={16} /> : <Square size={16} />}
            {allVisibleSelected ? 'Deselect all visible' : 'Select all visible'}
          </button>

          {/* List of due reptiles */}
          {filtered.map(({ snake, days, category }) => {
            const checked = selected.has(snake.id);
            return (
              <Card key={snake.id} style={{
                border: checked ? `2px solid ${BRAND.green}` : `1px solid ${BRAND.cream}`,
                background: checked ? '#F0F7F2' : 'white',
              }}>
                <div onClick={() => toggle(snake.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    border: checked ? 'none' : `2px solid ${BRAND.cream}`,
                    background: checked ? BRAND.green : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {checked && <Check size={16} color="white" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{snake.name}</div>
                    <div style={{ fontSize: 12, color: BRAND.ash, marginTop: 2 }}>
                      {snake.species}{snake.morph ? ` • ${snake.morph}` : ''}
                    </div>
                    <div style={{ fontSize: 11, color: BRAND.ash, marginTop: 4 }}>
                      {snake.prey_size} {snake.prey_type}
                    </div>
                  </div>
                  <div style={{
                    background: days > 7 ? BRAND.danger : days > 0 ? BRAND.gold : BRAND.ok,
                    color: 'white', padding: '4px 10px', borderRadius: 10,
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {days > 0 ? `${days}d` : 'Today'}
                  </div>
                </div>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: BRAND.ash }}>
              No {filter} reptiles due to feed.
            </div>
          )}

          {/* Sticky bottom action */}
          <div style={{ position: 'sticky', bottom: 80, marginTop: 16, marginBottom: -16 }}>
            <button onClick={startFeeding} disabled={selected.size === 0} style={{
              ...btnPrimary, opacity: selected.size === 0 ? 0.5 : 1,
              boxShadow: `0 4px 20px ${BRAND.green}40`,
            }}>
              Start feeding {selected.size > 0 ? `${selected.size} reptile${selected.size === 1 ? '' : 's'}` : ''}
              <ChevronRight size={16} style={{ verticalAlign: 'middle', marginLeft: 4 }} />
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============== STAGE 3: REVIEW ==============
  if (stage === 'review') {
    const ate = Object.values(decisions).filter(d => d.status === 'ate').length;
    const refused = Object.values(decisions).filter(d => d.status === 'refused').length;
    const skipped = Object.values(decisions).filter(d => d.status === 'skip').length;
    const toLog = Object.values(decisions).filter(d => d.status !== 'skip');

    const saveAll = async () => {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaving(false); return; }

      const rows = toLog.map(d => {
        const snake = snakes.find(s => s.id === d.snake_id)!;
        const next_due = d.status === 'ate' ? addDays(feedDate, snake.feed_interval_days) : null;
        return {
          snake_id: d.snake_id,
          owner_id: snake.owner_id,
          team_id: ctx.team.id,
          logged_by: user.id,
          date: feedDate,
          prey_type: d.prey_type,
          prey_size: d.prey_size,
          accepted: d.status === 'ate',
          notes: d.notes || null,
          next_due,
        };
      });

      const { error } = await supabase.from('feedings').insert(rows);
      setSaving(false);
      if (error) { alert('Failed to save: ' + error.message); return; }
      router.push('/');
      router.refresh();
    };

    return (
      <>
        <AppHeader title="Review & save" back />
        <div style={{ padding: 20 }}>
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              <Tally label="Ate" value={ate} color={BRAND.ok} />
              <Tally label="Refused" value={refused} color={BRAND.danger} />
              <Tally label="Skipped" value={skipped} color={BRAND.ash} />
            </div>
            <FormRow label="Feeding date">
              <input type="date" value={feedDate} onChange={e => setFeedDate(e.target.value)} style={inputStyle} />
            </FormRow>
          </Card>

          <div style={{ marginTop: 16, marginBottom: 8, fontSize: 11, color: BRAND.ash, fontWeight: 700, letterSpacing: 1.5 }}>
            WILL BE LOGGED ({toLog.length})
          </div>
          {toLog.map(d => {
            const snake = snakes.find(s => s.id === d.snake_id)!;
            return (
              <Card key={d.snake_id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{snake.name}</div>
                    <div style={{ fontSize: 12, color: BRAND.ash }}>
                      {d.prey_size} {d.prey_type}{d.notes ? ` • ${d.notes}` : ''}
                    </div>
                  </div>
                  <div style={{
                    background: d.status === 'ate' ? BRAND.ok : BRAND.danger,
                    color: 'white', padding: '4px 10px', borderRadius: 10,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {d.status === 'ate' ? 'Accepted' : 'Refused'}
                  </div>
                </div>
              </Card>
            );
          })}

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => { setIndex(0); setStage('feeding'); }} style={btnSecondary} disabled={saving}>
              <RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Back to feeding
            </button>
            <button onClick={saveAll} style={btnPrimary} disabled={saving || toLog.length === 0}>
              <Save size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {saving ? 'Saving...' : `Save ${toLog.length} feedings`}
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============== STAGE 2: FEEDING (speed mode) ==============
  // After all decisions made, advance to review
  if (index >= queue.length) {
    // Auto-advance to review
    setStage('review');
    return null;
  }

  const current = queue[index];
  const { snake, days, category } = current;
  const decision = decisions[snake.id];
  const preyTypes = getPreyTypesForCategory(category);

  const decide = (status: Decision['status']) => {
    setDecisions(d => ({
      ...d,
      [snake.id]: {
        snake_id: snake.id,
        status,
        prey_type: decisions[snake.id]?.prey_type || snake.prey_type,
        prey_size: decisions[snake.id]?.prey_size || snake.prey_size,
        notes: decisions[snake.id]?.notes || '',
      },
    }));
    setIndex(i => i + 1);
  };

  const overrideAnd = (patch: Partial<Decision>) => {
    setDecisions(d => {
      const existing = d[snake.id] || {
        snake_id: snake.id,
        status: 'ate' as const,
        prey_type: snake.prey_type,
        prey_size: snake.prey_size,
        notes: '',
      };
      return { ...d, [snake.id]: { ...existing, ...patch } };
    });
  };

  const progress = (index / queue.length) * 100;

  return (
    <>
      <AppHeader title={`Feed ${index + 1} of ${queue.length}`} back />
      <div style={{ padding: 20 }}>
        <div style={{ height: 4, background: BRAND.cream, borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: BRAND.green, transition: 'width .3s' }} />
        </div>

        <div style={{
          background: 'white', borderRadius: 20, padding: 24, marginBottom: 24,
          border: `1px solid ${BRAND.cream}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{
              fontFamily: 'monospace', fontWeight: 700, fontSize: 12,
              color: BRAND.green, letterSpacing: 1,
              background: BRAND.cream, padding: '4px 8px', borderRadius: 6,
            }}>
              {snake.sticker_qr || 'NO STICKER'}
            </div>
            <div style={{
              background: days > 7 ? BRAND.danger : days > 0 ? BRAND.gold : BRAND.ok,
              color: 'white', padding: '4px 10px', borderRadius: 10,
              fontSize: 11, fontWeight: 700,
            }}>
              {days > 0 ? `${days}d overdue` : 'Due today'}
            </div>
          </div>

          <div style={{ fontSize: 28, fontWeight: 800, color: BRAND.dark, marginBottom: 4 }}>{snake.name}</div>
          <div style={{ fontSize: 15, color: BRAND.ash, marginBottom: 16 }}>
            {snake.species}{snake.morph ? ` • ${snake.morph}` : ''}
          </div>

          <div style={{ background: BRAND.cream, padding: 14, borderRadius: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: BRAND.ash, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
              DEFAULT PREY
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {decision?.prey_size || snake.prey_size} {decision?.prey_type || snake.prey_type}
            </div>
            <div style={{ fontSize: 12, color: BRAND.ash, marginTop: 4 }}>
              Last fed {current.lastFeed ? `${daysAgo(current.lastFeed.date)}d ago` : 'never'}
            </div>
          </div>

          <button onClick={() => setShowOverride(true)} style={{
            background: 'transparent', border: 'none', color: BRAND.green,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Edit3 size={12} /> Change prey or add note
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <button onClick={() => decide('refused')} style={{
            padding: '20px 12px', background: 'white', color: BRAND.danger,
            border: `2px solid ${BRAND.danger}`, borderRadius: 16,
            fontSize: 17, fontWeight: 700, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <X size={28} />
            Refused
          </button>
          <button onClick={() => decide('ate')} style={{
            padding: '20px 12px', background: BRAND.green, color: 'white',
            border: 'none', borderRadius: 16,
            fontSize: 17, fontWeight: 700, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            boxShadow: `0 4px 12px ${BRAND.green}40`,
          }}>
            <Check size={28} />
            Ate
          </button>
        </div>

        <button onClick={() => decide('skip')} style={{
          width: '100%', padding: 14, background: 'transparent', color: BRAND.ash,
          border: `1px dashed ${BRAND.ash}`, borderRadius: 12,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          <FastForward size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Skip this one (don't log)
        </button>

        {index > 0 && (
          <button onClick={() => setIndex(i => i - 1)} style={{
            width: '100%', padding: 12, background: 'transparent', color: BRAND.ash,
            border: 'none', fontSize: 12, marginTop: 8, cursor: 'pointer',
          }}>
            ← Previous reptile
          </button>
        )}
      </div>

      {showOverride && (
        <OverrideModal
          snake={snake}
          preyTypes={preyTypes}
          current={decisions[snake.id]}
          onSave={(patch) => { overrideAnd(patch); setShowOverride(false); }}
          onClose={() => setShowOverride(false)}
        />
      )}
    </>
  );
}

function Tally({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: BRAND.cream, padding: 12, borderRadius: 10, textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: BRAND.ash, letterSpacing: 1, marginTop: 2 }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px', borderRadius: 20,
    border: active ? 'none' : `1px solid ${BRAND.cream}`,
    background: active ? BRAND.green : 'white',
    color: active ? 'white' : BRAND.ink,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}

function OverrideModal({ snake, preyTypes, current, onSave, onClose }: {
  snake: Snake;
  preyTypes: string[];
  current?: Decision;
  onSave: (patch: Partial<Decision>) => void;
  onClose: () => void;
}) {
  const [preyType, setPreyType] = useState(current?.prey_type || snake.prey_type);
  const [preySize, setPreySize] = useState(current?.prey_size || snake.prey_size);
  const [notes, setNotes] = useState(current?.notes || '');

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: '20px 20px 0 0', padding: 20,
        width: '100%', maxWidth: 480, maxHeight: '80vh', overflow: 'auto',
      }}>
        <div style={{ width: 40, height: 4, background: BRAND.cream, borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Customise for {snake.name}</div>
        <FormRow label="Prey type">
          <PreyAutocomplete value={preyType} onChange={setPreyType} options={preyTypes} />
        </FormRow>
        <FormRow label="Prey size">
          <PreyAutocomplete value={preySize} onChange={setPreySize} options={getPreySizesForType(preyType)} />
        </FormRow>
        <FormRow label="Note">
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} style={inputStyle}
                 placeholder="Optional - e.g. tail tip injury, in shed" />
        </FormRow>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button onClick={() => onSave({ prey_type: preyType, prey_size: preySize, notes })} style={btnPrimary}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
