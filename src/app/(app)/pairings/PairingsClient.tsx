'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, Section, FormRow, inputStyle, btnPrimary, btnSecondary } from '@/components/UI';
import { BRAND } from '@/lib/theme';
import { Pairing, Snake } from '@/lib/types';
import { today, formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

import { AppContext } from '@/lib/types';

export default function PairingsClient({ pairings, snakes, ctx }: { pairings: Pairing[]; snakes: any[]; ctx: AppContext }) {
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ male_id: '', female_id: '', date: today(), lock_observed: false, notes: '' });
  const [saving, setSaving] = useState(false);

  const males = snakes.filter(s => s.sex === 'M');
  const females = snakes.filter(s => s.sex === 'F');

  const save = async () => {
    if (!form.male_id || !form.female_id) {
      alert('Select both male and female');
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('pairings').insert({ ...form, owner_id: user.id, team_id: ctx.team.id });
    setSaving(false);
    if (error) alert(error.message);
    else {
      setShowForm(false);
      setForm({ male_id: '', female_id: '', date: today(), lock_observed: false, notes: '' });
      router.refresh();
    }
  };

  return (
    <>
      <AppHeader title="Pairings" />
      <div style={{ padding: 20 }}>
        {!showForm ? (
          <button onClick={() => setShowForm(true)} style={btnPrimary}>
            <Plus size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            New pairing
          </button>
        ) : (
          <Card>
            <FormRow label="Male">
              <select value={form.male_id} onChange={e => setForm({ ...form, male_id: e.target.value })} style={inputStyle}>
                <option value="">Select male</option>
                {males.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.species}{m.morph ? ` (${m.morph})` : ''}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="Female">
              <select value={form.female_id} onChange={e => setForm({ ...form, female_id: e.target.value })} style={inputStyle}>
                <option value="">Select female</option>
                {females.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.species}{f.morph ? ` (${f.morph})` : ''}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="Date">
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
            </FormRow>
            <FormRow label="Lock observed">
              <select value={form.lock_observed ? 'yes' : 'no'}
                      onChange={e => setForm({ ...form, lock_observed: e.target.value === 'yes' })}
                      style={inputStyle}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </FormRow>
            <FormRow label="Notes">
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                     style={inputStyle} placeholder="Duration, behaviour..." />
            </FormRow>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowForm(false)} style={btnSecondary} disabled={saving}>Cancel</button>
              <button onClick={save} style={btnPrimary} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </Card>
        )}

        <Section title={`All pairings (${pairings.length})`}>
          {pairings.length === 0 ? (
            <div style={{ color: BRAND.ash, padding: 20, textAlign: 'center' }}>No pairings yet</div>
          ) : pairings.map(p => {
            const male = snakes.find(s => s.id === p.male_id);
            const female = snakes.find(s => s.id === p.female_id);
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
      </div>
    </>
  );
}
