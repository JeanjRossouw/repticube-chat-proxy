'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3, Plus, Trash2, Weight as WeightIcon, Printer, BookOpen, AlertCircle, MoveRight, DollarSign, Home, Coffee, X } from 'lucide-react';
import QRCode from 'qrcode';
import AppHeader from '@/components/AppHeader';
import { Card, Section, Stat, DetailRow, FormRow, inputStyle, btnPrimary, btnSecondary, btnDanger } from '@/components/UI';
import SnakeForm, { SnakeFormData } from '@/components/SnakeForm';
import PreyAutocomplete from '@/components/PreyAutocomplete';
import { getPreyTypesForCategory, getPreySizesForType, isCGDFeeding, CGD_BRANDS } from '@/lib/prey';
import { BRAND } from '@/lib/theme';
import { Snake, Feeding, WeightLog, Pairing, Species, AppContext } from '@/lib/types';
import { daysAgo, formatDate, today, addDays } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function SnakeDetailClient({ snake, species, feedings, weights, pairings, allSnakes, ctx, memberNames }: {
  snake: Snake;
  species: Species | null;
  feedings: Feeding[];
  weights: WeightLog[];
  pairings: Pairing[];
  allSnakes: Pick<Snake, 'id' | 'name' | 'species' | 'morph'>[];
  ctx: AppContext;
  memberNames: Record<string, string>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const isOwner = ctx.role === 'owner';
  const [tab, setTab] = useState<'overview' | 'feeding' | 'weight' | 'breeding' | 'care' | 'food'>('overview');
  const [editing, setEditing] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const showFoodTab = species?.category === 'gecko' || species?.category === 'lizard';
  const lastFeed = feedings[0];
  const lastWeight = weights[0];

  const handleEditSave = async (data: SnakeFormData) => {
    const { error } = await supabase.from('snakes').update(data).eq('id', snake.id);
    if (error) alert(error.message);
    else {
      setEditing(false);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${snake.name} and all records? This cannot be undone.`)) return;
    const { error } = await supabase.from('snakes').delete().eq('id', snake.id);
    if (error) alert(error.message);
    else router.push('/snakes');
  };

  if (editing) {
    return (
      <>
        <AppHeader title="Edit reptile" back />
        <SnakeForm initial={snake} onSave={handleEditSave} onCancel={() => setEditing(false)} />
      </>
    );
  }

  return (
    <>
      <AppHeader title="Reptile" back />
      <div style={{ padding: 20 }}>
        {/* Header card */}
        <div style={{
          background: BRAND.dark, color: 'white', borderRadius: 16, padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: BRAND.gold, letterSpacing: 1, fontWeight: 700, marginBottom: 4, fontFamily: 'monospace' }}>
                {snake.sticker_qr || 'NO STICKER'}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{snake.name}</div>
              <div style={{ fontSize: 14, color: '#A8C7B4', marginTop: 4 }}>
                {snake.species}{snake.morph ? ` • ${snake.morph}` : ''}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13 }}>
                <span>{snake.sex === 'M' ? '♂ Male' : snake.sex === 'F' ? '♀ Female' : 'Unsexed'}</span>
                {snake.hatch_date && <span>Hatched {formatDate(snake.hatch_date)}</span>}
              </div>
            </div>
            <button onClick={() => setEditing(true)} style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
              padding: 8, borderRadius: 8, cursor: 'pointer',
            }}>
              <Edit3 size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          <Stat label="Last fed" value={lastFeed ? `${daysAgo(lastFeed.date)}d ago` : '—'} />
          <Stat label="Weight" value={lastWeight ? `${lastWeight.grams}g` : '—'} />
          <Stat label="Next due" value={lastFeed?.next_due ? formatDate(lastFeed.next_due) : '—'} />
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: 'white', padding: 4, borderRadius: 12, overflowX: 'auto' }}>
          {(['overview', 'feeding', 'food', 'weight', 'breeding', 'care'] as const)
            .filter(t => !(t === 'breeding' && !isOwner))
            .filter(t => !(t === 'food' && !showFoodTab))
            .map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: '1 1 auto', background: tab === t ? BRAND.green : 'transparent',
              color: tab === t ? 'white' : BRAND.ink, border: 'none',
              padding: '10px 6px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              textTransform: 'capitalize', minWidth: 64,
            }}>{t}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <Section title="Details">
              <Card>
                <DetailRow label="Facility" value={ctx.facilities.find(f => f.id === snake.facility_id)?.name || '—'} />
                <DetailRow label="Prey type" value={snake.prey_type} />
                <DetailRow label="Prey size" value={snake.prey_size} />
                <DetailRow label="Feed interval" value={`${snake.feed_interval_days} days`} />
                <DetailRow label="Acquired" value={formatDate(snake.acquired_date)} />
                <DetailRow label="Source" value={snake.source} />
                <DetailRow label="Notes" value={snake.notes} last />
              </Card>
            </Section>

            {snake.sold_at && (
              <Section title="Sold">
                <Card>
                  <DetailRow label="Sold on" value={formatDate(snake.sold_at)} />
                  {snake.sold_price && <DetailRow label="Price" value={`R ${Number(snake.sold_price).toLocaleString('en-ZA')}`} />}
                  {snake.sold_to && <DetailRow label="Buyer" value={snake.sold_to} />}
                  <DetailRow label="Notes" value={snake.sold_notes || '—'} last />
                </Card>
              </Section>
            )}

            <Section title="Actions">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button onClick={() => setShowMove(true)} style={btnSecondary}>
                  <MoveRight size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Move facility
                </button>
                {!snake.sold_at && (
                  <button onClick={() => setShowSell(true)} style={btnSecondary}>
                    <DollarSign size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Mark sold
                  </button>
                )}
                {snake.sticker_qr && (
                  <ReprintStickerButton qr_code={snake.sticker_qr} name={snake.name} />
                )}
                <button onClick={handleDelete} style={btnDanger}>
                  <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Delete
                </button>
              </div>
            </Section>
          </>
        )}

        {tab === 'feeding' && <FeedingTab snake={snake} feedings={feedings} category={species?.category || 'other'} ctx={ctx} memberNames={memberNames} />}
        {tab === 'food' && <FoodTab snake={snake} feedings={feedings} ctx={ctx} memberNames={memberNames} />}
        {tab === 'weight' && <WeightTab snake={snake} weights={weights} ctx={ctx} memberNames={memberNames} />}
        {tab === 'breeding' && isOwner && <BreedingTab pairings={pairings} allSnakes={allSnakes} thisSnakeId={snake.id} />}
        {tab === 'care' && <CareTab species={species} />}
      </div>

      {showMove && (
        <MoveModal
          snake={snake}
          ctx={ctx}
          onClose={() => setShowMove(false)}
          onSaved={() => { setShowMove(false); router.refresh(); }}
        />
      )}
      {showSell && (
        <SellModal
          snake={snake}
          onClose={() => setShowSell(false)}
          onSaved={() => { setShowSell(false); router.refresh(); }}
        />
      )}
    </>
  );
}

// ============================================
// Move facility modal
// ============================================
function MoveModal({ snake, ctx, onClose, onSaved }: {
  snake: Snake; ctx: AppContext; onClose: () => void; onSaved: () => void;
}) {
  const supabase = createClient();
  const [facilityId, setFacilityId] = useState(snake.facility_id || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('snakes')
      .update({ facility_id: facilityId || null })
      .eq('id', snake.id);
    setSaving(false);
    if (error) { alert(error.message); return; }
    onSaved();
  };

  return (
    <ModalShell onClose={onClose} title={`Move ${snake.name}`}>
      <div style={{ fontSize: 14, color: BRAND.ash, marginBottom: 16 }}>
        Pick a new facility. The reptile stays in your team — only its location changes.
      </div>
      <FormRow label="Facility">
        <select value={facilityId} onChange={e => setFacilityId(e.target.value)} style={inputStyle}>
          <option value="">— Unassigned —</option>
          {ctx.facilities.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </FormRow>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={onClose} style={btnSecondary}>Cancel</button>
        <button onClick={save} disabled={saving} style={btnPrimary}>
          {saving ? 'Moving...' : 'Move'}
        </button>
      </div>
    </ModalShell>
  );
}

// ============================================
// Mark as sold modal
// ============================================
function SellModal({ snake, onClose, onSaved }: {
  snake: Snake; onClose: () => void; onSaved: () => void;
}) {
  const supabase = createClient();
  const [date, setDate] = useState(today());
  const [price, setPrice] = useState('');
  const [buyer, setBuyer] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('snakes')
      .update({
        sold_at: new Date(date).toISOString(),
        sold_price: price ? parseFloat(price) : null,
        sold_to: buyer || null,
        sold_notes: notes || null,
        archived: true,
      })
      .eq('id', snake.id);
    setSaving(false);
    if (error) { alert(error.message); return; }
    onSaved();
  };

  return (
    <ModalShell onClose={onClose} title={`Mark ${snake.name} sold`}>
      <div style={{ fontSize: 14, color: BRAND.ash, marginBottom: 16 }}>
        The reptile will be archived (removed from active lists) but the full history stays in your records.
      </div>
      <FormRow label="Sale date">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
      </FormRow>
      <FormRow label="Price (R)">
        <input type="number" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)}
               style={inputStyle} placeholder="Optional" />
      </FormRow>
      <FormRow label="Buyer / customer">
        <input type="text" value={buyer} onChange={e => setBuyer(e.target.value)}
               style={inputStyle} placeholder="Optional - name, contact" />
      </FormRow>
      <FormRow label="Notes">
        <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
               style={inputStyle} placeholder="Optional" />
      </FormRow>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={onClose} style={btnSecondary}>Cancel</button>
        <button onClick={save} disabled={saving} style={btnPrimary}>
          {saving ? 'Saving...' : 'Confirm sale'}
        </button>
      </div>
    </ModalShell>
  );
}

// ============================================
// Generic modal shell
// ============================================
function ModalShell({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(14, 42, 26, 0.6)',
      zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', width: '100%', maxWidth: 480, padding: 20,
        borderRadius: '16px 16px 0 0', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color={BRAND.ash} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FeedingTab({ snake, feedings, category, ctx, memberNames }: { snake: Snake; feedings: Feeding[]; category: string; ctx: AppContext; memberNames: Record<string, string> }) {
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: today(),
    prey_type: snake.prey_type,
    prey_size: snake.prey_size,
    accepted: true,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const preyTypes = getPreyTypesForCategory(category);

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const next_due = addDays(form.date, snake.feed_interval_days);
    const { error } = await supabase.from('feedings').insert({
      snake_id: snake.id,
      owner_id: snake.owner_id,
      team_id: ctx.team.id,
      logged_by: user.id,
      ...form, next_due,
    });
    setSaving(false);
    if (error) alert(error.message);
    else {
      setShowForm(false);
      router.refresh();
    }
  };

  return (
    <>
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={btnPrimary}>
          <Plus size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Log feeding
        </button>
      ) : (
        <Card>
          <FormRow label="Date">
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
          </FormRow>
          <FormRow label="Prey type">
            <PreyAutocomplete
              value={form.prey_type}
              onChange={(v) => setForm({ ...form, prey_type: v })}
              options={preyTypes}
            />
          </FormRow>
          <FormRow label="Prey size">
            <PreyAutocomplete
              value={form.prey_size}
              onChange={(v) => setForm({ ...form, prey_size: v })}
              options={getPreySizesForType(form.prey_type)}
            />
          </FormRow>
          <FormRow label="Accepted">
            <select value={form.accepted ? 'yes' : 'no'} onChange={e => setForm({ ...form, accepted: e.target.value === 'yes' })} style={inputStyle}>
              <option value="yes">Yes</option>
              <option value="no">Refused</option>
            </select>
          </FormRow>
          <FormRow label="Notes">
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inputStyle} />
          </FormRow>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => setShowForm(false)} style={btnSecondary} disabled={saving}>Cancel</button>
            <button onClick={save} style={btnPrimary} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Card>
      )}

      <Section title={`History (${feedings.length})`}>
        {feedings.length === 0 ? (
          <div style={{ color: BRAND.ash, padding: 20, textAlign: 'center' }}>No feedings logged yet</div>
        ) : feedings.map(f => (
          <Card key={f.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{f.prey_size} {f.prey_type}</div>
                <div style={{ fontSize: 13, color: BRAND.ash, marginTop: 2 }}>
                  {formatDate(f.date)}
                  {f.logged_by && memberNames[f.logged_by] && (
                    <span style={{ marginLeft: 8 }}>· by {memberNames[f.logged_by]}</span>
                  )}
                </div>
                {f.notes && <div style={{ fontSize: 13, marginTop: 4, fontStyle: 'italic' }}>{f.notes}</div>}
              </div>
              <div style={{
                background: f.accepted ? BRAND.ok : BRAND.danger, color: 'white',
                padding: '4px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, height: 'fit-content',
              }}>
                {f.accepted ? 'Accepted' : 'Refused'}
              </div>
            </div>
          </Card>
        ))}
      </Section>
    </>
  );
}

// ============================================
// Food tab — CGD / commercial gecko diet
// Logs feedings of porridge-style food (Pangea, Ultimate Exotics, Urban Gecko).
// Counts as a feeding, resets next_due using the snake's feed_interval_days.
// ============================================
function FoodTab({ snake, feedings, ctx, memberNames }: {
  snake: Snake; feedings: Feeding[]; ctx: AppContext; memberNames: Record<string, string>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [brand, setBrand] = useState<string>('Pangea');
  const [flavour, setFlavour] = useState('');
  const [date, setDate] = useState(today());
  const [accepted, setAccepted] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter feedings to only show CGD-type entries (prey_type matches a known brand)
  const cgdFeedings = feedings.filter(f => isCGDFeeding(f.prey_type));

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const next_due = accepted ? addDays(date, snake.feed_interval_days) : null;
    const preyTypeLabel = flavour ? `${brand} (${flavour})` : brand;

    const { error } = await supabase.from('feedings').insert({
      snake_id: snake.id,
      owner_id: snake.owner_id,
      team_id: ctx.team.id,
      logged_by: user.id,
      date,
      prey_type: preyTypeLabel,
      prey_size: 'Portion',
      accepted,
      notes: notes || null,
      next_due,
    });
    setSaving(false);
    if (error) { alert(error.message); return; }
    setShowForm(false);
    setFlavour('');
    setNotes('');
    router.refresh();
  };

  return (
    <>
      <Section title="Commercial gecko diet">
        <Card>
          <div style={{ fontSize: 13, color: BRAND.ash, marginBottom: 12, lineHeight: 1.5 }}>
            Track CGD / porridge feedings (Pangea, Ultimate Exotics, Urban Gecko). These count as feedings and update the next-due date.
          </div>
          {!showForm ? (
            <button onClick={() => setShowForm(true)} style={btnPrimary}>
              <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Log food
            </button>
          ) : (
            <div>
              <FormRow label="Brand">
                <select value={brand} onChange={e => setBrand(e.target.value)} style={inputStyle}>
                  {CGD_BRANDS.filter(b => b !== 'Other...').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </FormRow>
              <FormRow label="Flavour (optional)">
                <input type="text" value={flavour} onChange={e => setFlavour(e.target.value)}
                       style={inputStyle} placeholder="e.g. Watermelon, Banana Cream Pie" />
              </FormRow>
              <FormRow label="Date">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
              </FormRow>
              <FormRow label="Accepted">
                <select value={accepted ? 'yes' : 'no'} onChange={e => setAccepted(e.target.value === 'yes')} style={inputStyle}>
                  <option value="yes">Yes — ate normally</option>
                  <option value="no">Refused / left it</option>
                </select>
              </FormRow>
              <FormRow label="Notes">
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                       style={inputStyle} placeholder="Optional" />
              </FormRow>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
                <button onClick={save} disabled={saving} style={btnPrimary}>
                  {saving ? 'Saving...' : 'Log food'}
                </button>
              </div>
            </div>
          )}
        </Card>
      </Section>

      <Section title={`History (${cgdFeedings.length})`}>
        {cgdFeedings.length === 0 ? (
          <div style={{ color: BRAND.ash, padding: 20, textAlign: 'center' }}>No food logged yet</div>
        ) : cgdFeedings.map(f => (
          <Card key={f.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Coffee size={14} color={BRAND.green} />
                  {f.prey_type}
                </div>
                <div style={{ fontSize: 13, color: BRAND.ash, marginTop: 2 }}>
                  {formatDate(f.date)}
                  {f.logged_by && memberNames[f.logged_by] && (
                    <span style={{ marginLeft: 8 }}>· by {memberNames[f.logged_by]}</span>
                  )}
                </div>
                {f.notes && <div style={{ fontSize: 13, marginTop: 4, fontStyle: 'italic' }}>{f.notes}</div>}
              </div>
              <div style={{
                background: f.accepted ? BRAND.ok : BRAND.danger, color: 'white',
                padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              }}>
                {f.accepted ? 'Ate' : 'Refused'}
              </div>
            </div>
          </Card>
        ))}
      </Section>
    </>
  );
}

function WeightTab({ snake, weights, ctx, memberNames }: { snake: Snake; weights: WeightLog[]; ctx: AppContext; memberNames: Record<string, string> }) {
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: today(), grams: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.grams) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('weights').insert({
      snake_id: snake.id,
      owner_id: snake.owner_id,
      team_id: ctx.team.id,
      logged_by: user.id,
      date: form.date, grams: parseFloat(form.grams), notes: form.notes,
    });
    setSaving(false);
    if (error) alert(error.message);
    else {
      setShowForm(false);
      setForm({ date: today(), grams: '', notes: '' });
      router.refresh();
    }
  };

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const grams = sorted.map(w => Number(w.grams));
  const maxG = Math.max(...grams, 100);
  const minG = Math.min(...grams, 0);

  return (
    <>
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={btnPrimary}>
          <WeightIcon size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Log weight
        </button>
      ) : (
        <Card>
          <FormRow label="Date">
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
          </FormRow>
          <FormRow label="Weight (g)">
            <input type="number" inputMode="decimal" value={form.grams}
                   onChange={e => setForm({ ...form, grams: e.target.value })}
                   style={inputStyle} placeholder="e.g. 850" />
          </FormRow>
          <FormRow label="Notes">
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                   style={inputStyle} placeholder="Pre-feed, in shed..." />
          </FormRow>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => setShowForm(false)} style={btnSecondary} disabled={saving}>Cancel</button>
            <button onClick={save} style={btnPrimary} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Card>
      )}

      {sorted.length >= 2 && (
        <Section title="Growth chart">
          <Card>
            <svg viewBox="0 0 400 160" style={{ width: '100%' }}>
              {sorted.map((w, i) => {
                const x = (i / (sorted.length - 1)) * 380 + 10;
                const y = 150 - ((Number(w.grams) - minG) / (maxG - minG || 1)) * 130;
                const next = sorted[i + 1];
                return (
                  <g key={w.id}>
                    {next && (
                      <line
                        x1={x} y1={y}
                        x2={((i + 1) / (sorted.length - 1)) * 380 + 10}
                        y2={150 - ((Number(next.grams) - minG) / (maxG - minG || 1)) * 130}
                        stroke={BRAND.green} strokeWidth="2"
                      />
                    )}
                    <circle cx={x} cy={y} r="4" fill={BRAND.green} />
                  </g>
                );
              })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: BRAND.ash, marginTop: 8 }}>
              <span>{formatDate(sorted[0].date)}</span>
              <span>{formatDate(sorted[sorted.length - 1].date)}</span>
            </div>
          </Card>
        </Section>
      )}

      <Section title={`History (${weights.length})`}>
        {weights.length === 0 ? (
          <div style={{ color: BRAND.ash, padding: 20, textAlign: 'center' }}>No weights logged yet</div>
        ) : weights.map(w => (
          <Card key={w.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{w.grams}g</div>
                <div style={{ fontSize: 13, color: BRAND.ash }}>
                  {formatDate(w.date)}
                  {w.logged_by && memberNames[w.logged_by] && (
                    <span style={{ marginLeft: 8 }}>· by {memberNames[w.logged_by]}</span>
                  )}
                </div>
                {w.notes && <div style={{ fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>{w.notes}</div>}
              </div>
            </div>
          </Card>
        ))}
      </Section>
    </>
  );
}

function BreedingTab({ pairings, allSnakes, thisSnakeId }: {
  pairings: Pairing[];
  allSnakes: Pick<Snake, 'id' | 'name' | 'species' | 'morph'>[];
  thisSnakeId: string;
}) {
  return (
    <Section title={`Pairings (${pairings.length})`}>
      {pairings.length === 0 ? (
        <div style={{ color: BRAND.ash, padding: 20, textAlign: 'center' }}>
          No pairings yet. Use the Pairings tab to log one.
        </div>
      ) : pairings.map(p => {
        const male = allSnakes.find(s => s.id === p.male_id);
        const female = allSnakes.find(s => s.id === p.female_id);
        return (
          <Card key={p.id}>
            <div style={{ fontWeight: 700 }}>♂ {male?.name || '?'} × ♀ {female?.name || '?'}</div>
            <div style={{ fontSize: 13, color: BRAND.ash, marginTop: 4 }}>
              {formatDate(p.date)} • {p.lock_observed ? '🔒 Lock observed' : 'No lock'}
            </div>
            {p.notes && <div style={{ fontSize: 13, marginTop: 6, fontStyle: 'italic' }}>{p.notes}</div>}
          </Card>
        );
      })}
    </Section>
  );
}

function CareTab({ species }: { species: Species | null }) {
  if (!species) {
    return (
      <Card style={{ background: '#FFF8E5', borderColor: BRAND.gold }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <AlertCircle size={18} color={BRAND.gold} style={{ marginTop: 2 }} />
          <div style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>No care guide linked</div>
            <div style={{ color: BRAND.ash }}>
              Edit this reptile and search for the species in the picker to link a care guide.
              The species library has ~80 common species.
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{species.common_name}</div>
            <div style={{ fontSize: 12, color: BRAND.ash, fontStyle: 'italic', marginTop: 2 }}>
              {species.scientific_name}
            </div>
          </div>
          {species.difficulty && (
            <div style={{
              background: species.difficulty === 'beginner' ? BRAND.ok :
                          species.difficulty === 'intermediate' ? BRAND.gold :
                          BRAND.danger,
              color: 'white', padding: '4px 10px', borderRadius: 10,
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            }}>
              {species.difficulty}
            </div>
          )}
        </div>
        <DetailRow label="Origin" value={species.origin} />
        <DetailRow label="Adult size" value={species.adult_size} />
        <DetailRow label="Lifespan" value={species.lifespan} last />
      </Card>

      <Section title="Temperature">
        <Card>
          <DetailRow label="Basking" value={species.temp_basking} />
          <DetailRow label="Warm side" value={species.temp_warm} />
          <DetailRow label="Cool side" value={species.temp_cool} />
          <DetailRow label="Night" value={species.temp_night} last />
        </Card>
      </Section>

      <Section title="Environment">
        <Card>
          <DetailRow label="Humidity" value={species.humidity} />
          <DetailRow label="Enclosure size" value={species.enclosure_size} />
          <DetailRow label="Substrate" value={species.substrate} />
          <DetailRow label="Lighting / UVB" value={species.lighting} last />
        </Card>
      </Section>

      <Section title="Diet & feeding">
        <Card>
          <DetailRow label="Diet" value={species.diet} />
          <DetailRow label="Schedule" value={species.feeding_schedule} />
          <DetailRow label="Prey size" value={species.prey_size_guide} last />
        </Card>
      </Section>

      <Section title="Behaviour">
        <Card>
          <DetailRow label="Temperament" value={species.temperament} />
          <DetailRow label="Handling" value={species.handling} last />
        </Card>
      </Section>

      <Section title="Health">
        <Card>
          <DetailRow label="Health notes" value={species.health_notes} />
          <DetailRow label="Common issues" value={species.common_issues} last />
        </Card>
      </Section>

      <div style={{
        marginTop: 16, padding: 12, background: BRAND.cream, borderRadius: 10,
        fontSize: 11, color: BRAND.ash, lineHeight: 1.5,
      }}>
        <strong>Disclaimer:</strong> Care info is compiled from general husbandry knowledge, not vet-verified. Always cross-reference with experienced keepers and a reptile vet for your specific animal.
      </div>
    </>
  );
}

function ReprintStickerButton({ qr_code, name }: { qr_code: string; name: string }) {
  const [showPrint, setShowPrint] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

  useEffect(() => {
    if (!showPrint) return;
    QRCode.toDataURL(`${APP_URL}/s/${qr_code}`, { width: 400, margin: 0 }).then(setQrDataUrl);
  }, [showPrint, qr_code, APP_URL]);

  return (
    <>
      <button onClick={() => setShowPrint(true)} style={{
        width: '100%', padding: 14, background: 'white', color: BRAND.green,
        border: `1px solid ${BRAND.green}`, borderRadius: 12,
        fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 16,
      }}>
        <Printer size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        Reprint sticker
      </button>

      {showPrint && (
        <div style={{
          position: 'fixed', inset: 0, background: 'white', overflow: 'auto', zIndex: 1000, padding: 20,
        }}>
          <style>{`
            @media print {
              .no-print-area { display: none !important; }
              @page { margin: 20mm; }
            }
          `}</style>
          <div className="no-print-area" style={{ display: 'flex', gap: 8, marginBottom: 24, maxWidth: 480 }}>
            <button onClick={() => setShowPrint(false)} style={{
              width: '100%', padding: 14, background: 'transparent', color: BRAND.ink,
              border: `1px solid ${BRAND.cream}`, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}>Close</button>
            <button onClick={() => window.print()} style={{
              width: '100%', padding: 14, background: BRAND.green, color: 'white',
              border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>Print</button>
          </div>
          <div style={{
            border: '1px dashed #ccc', padding: '20mm', textAlign: 'center', maxWidth: 400, margin: '0 auto',
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#333' }}>{name}</div>
            {qrDataUrl && <img src={qrDataUrl} alt={qr_code} style={{ width: '60%' }} />}
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, marginTop: 8 }}>{qr_code}</div>
          </div>
        </div>
      )}
    </>
  );
}
