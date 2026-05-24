'use client';
import { useState, useEffect } from 'react';
import { Snake, Species } from '@/lib/types';
import { Card, FormRow, inputStyle, btnPrimary, btnSecondary } from '@/components/UI';
import SpeciesPicker from '@/components/SpeciesPicker';
import PreyAutocomplete from '@/components/PreyAutocomplete';
import { getPreyTypesForCategory, getPreySizesForType } from '@/lib/prey';
import { createClient } from '@/lib/supabase/client';
import { today } from '@/lib/utils';

export type SnakeFormData = Partial<Snake>;

export default function SnakeForm({
  initial = {}, onSave, onCancel,
}: {
  initial?: SnakeFormData;
  onSave: (data: SnakeFormData) => Promise<void> | void;
  onCancel: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState<SnakeFormData>({
    name: '', species: '', morph: '', sex: '' as any, hatch_date: '',
    prey_type: 'Mice', prey_size: 'Adult', feed_interval_days: 7,
    acquired_date: today(), source: '', notes: '',
    ...initial,
  });
  const [category, setCategory] = useState<string>('other');
  const [saving, setSaving] = useState(false);
  const set = (k: keyof SnakeFormData, v: any) => setForm(f => ({ ...f, [k]: v }));

  // When species_id changes, look up the category so we filter prey types
  useEffect(() => {
    if (!form.species_id) {
      setCategory('other');
      return;
    }
    supabase.from('species').select('category').eq('id', form.species_id).maybeSingle()
      .then(({ data }) => setCategory(data?.category || 'other'));
  }, [form.species_id]);

  const preyTypes = getPreyTypesForCategory(category);

  const handleSave = async () => {
    if (!form.name || !form.species) {
      alert('Name and species are required');
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <Card>
        <FormRow label="Name *">
          <input type="text" value={form.name || ''} onChange={e => set('name', e.target.value)}
                 style={inputStyle} placeholder="e.g. Khaleesi" />
        </FormRow>
        <FormRow label="Species *">
          <SpeciesPicker
            value={form.species || ''}
            onChange={(text) => set('species', text)}
            onSpeciesSelected={(species: Species) => {
              setForm(f => ({
                ...f,
                species: species.common_name,
                species_id: species.id,
              }));
            }}
          />
        </FormRow>
        <FormRow label="Morph">
          <input type="text" value={form.morph || ''} onChange={e => set('morph', e.target.value)}
                 style={inputStyle} placeholder="e.g. Pastel Lesser" />
        </FormRow>
        <FormRow label="Sex">
          <select value={form.sex || ''} onChange={e => set('sex', e.target.value)} style={inputStyle}>
            <option value="">Unknown</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </FormRow>
        <FormRow label="Hatch date">
          <input type="date" value={form.hatch_date || ''} onChange={e => set('hatch_date', e.target.value)} style={inputStyle} />
        </FormRow>
        <FormRow label="Prey type">
          <PreyAutocomplete
            value={form.prey_type || ''}
            onChange={(v) => set('prey_type', v)}
            options={preyTypes}
            placeholder="Select prey type..."
          />
        </FormRow>
        <FormRow label="Prey size">
          <PreyAutocomplete
            value={form.prey_size || ''}
            onChange={(v) => set('prey_size', v)}
            options={getPreySizesForType(form.prey_type)}
            placeholder="Select prey size..."
          />
        </FormRow>
        <FormRow label="Feed every (days)">
          <input type="number" value={form.feed_interval_days || 7}
                 onChange={e => set('feed_interval_days', parseInt(e.target.value) || 7)} style={inputStyle} />
        </FormRow>
        <FormRow label="Acquired">
          <input type="date" value={form.acquired_date || ''} onChange={e => set('acquired_date', e.target.value)} style={inputStyle} />
        </FormRow>
        <FormRow label="Source">
          <input type="text" value={form.source || ''} onChange={e => set('source', e.target.value)}
                 style={inputStyle} placeholder="Breeder name, expo..." />
        </FormRow>
        <FormRow label="Notes">
          <input type="text" value={form.notes || ''} onChange={e => set('notes', e.target.value)} style={inputStyle} />
        </FormRow>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={onCancel} style={btnSecondary} disabled={saving}>Cancel</button>
          <button onClick={handleSave} style={btnPrimary} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </Card>
    </div>
  );
}
