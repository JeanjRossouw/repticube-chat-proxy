'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Printer, Check, ChevronLeft, X } from 'lucide-react';
import QRCode from 'qrcode';
import AppHeader from '@/components/AppHeader';
import { Card, FormRow, inputStyle, btnPrimary, btnSecondary } from '@/components/UI';
import PreyAutocomplete from '@/components/PreyAutocomplete';
import { getPreyTypesForCategory, getPreySizesForType } from '@/lib/prey';
import { BRAND } from '@/lib/theme';
import { Species, Snake } from '@/lib/types';
import { newStickerCode, today } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

type Step = 'species' | 'details' | 'done';

import { AppContext } from '@/lib/types';

export default function AddReptileClient({ ctx }: { ctx: AppContext }) {
  const router = useRouter();
  const supabase = createClient();
  const [facilityId, setFacilityId] = useState<string>(ctx.facilities[0]?.id || '');

  const [step, setStep] = useState<Step>('species');
  const [allSpecies, setAllSpecies] = useState<Species[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'snake' | 'lizard' | 'gecko' | 'tortoise'>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

  // Loaded for the details step
  const [form, setForm] = useState({
    name: '',
    morph: '',
    sex: '' as 'M' | 'F' | '',
    hatch_date: '',
    acquired_date: today(),
    source: '',
    notes: '',
    prey_type: 'Mouse',
    prey_size: 'Adult',
    feed_interval_days: 7,
  });

  const [creating, setCreating] = useState(false);
  const [createdSnake, setCreatedSnake] = useState<Snake | null>(null);
  const [stickerQr, setStickerQr] = useState<string>('');

  // Load species library once
  useEffect(() => {
    supabase.from('species').select('*').order('common_name').then(({ data }) => {
      if (data) setAllSpecies(data as Species[]);
    });
  }, []);

  const filteredSpecies = allSpecies.filter(s => {
    if (filter !== 'all' && s.category !== filter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return s.common_name.toLowerCase().includes(q) ||
           s.scientific_name.toLowerCase().includes(q);
  });

  const pickSpecies = (species: Species) => {
    setSelectedSpecies(species);
    // Pre-fill prey defaults based on category
    let preyType = 'Mice';
    let preySize = 'Adult';
    if (species.category === 'gecko') { preyType = 'Crickets'; preySize = 'Medium'; }
    else if (species.category === 'lizard') { preyType = 'Crickets'; preySize = 'Medium'; }
    else if (species.category === 'tortoise') { preyType = 'Greens'; preySize = 'Mixed'; }
    setForm(f => ({ ...f, prey_type: preyType, prey_size: preySize }));
    setStep('details');
  };

  const handleCreate = async () => {
    if (!selectedSpecies || !form.name) {
      alert('Name is required');
      return;
    }
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCreating(false); return; }

    // 1. Generate a sticker code
    const newCode = newStickerCode();

    // 2. Create sticker (unclaimed initially)
    const { error: stickerErr } = await supabase.from('stickers').insert({
      qr_code: newCode,
      owner_id: user.id,
      team_id: ctx.team.id,
    });
    if (stickerErr) {
      setCreating(false);
      alert('Sticker create failed: ' + stickerErr.message);
      return;
    }

    // 3. Create the snake
    const { data: snake, error: snakeErr } = await supabase
      .from('snakes')
      .insert({
        owner_id: user.id,
        team_id: ctx.team.id,
        facility_id: facilityId || null,
        species_id: selectedSpecies.id,
        species: selectedSpecies.common_name,
        sticker_qr: newCode,
        name: form.name,
        morph: form.morph || null,
        sex: form.sex || null,
        hatch_date: form.hatch_date || null,
        acquired_date: form.acquired_date || null,
        source: form.source || null,
        notes: form.notes || null,
        prey_type: form.prey_type,
        prey_size: form.prey_size,
        feed_interval_days: form.feed_interval_days,
      })
      .select()
      .single();

    if (snakeErr || !snake) {
      setCreating(false);
      alert('Reptile create failed: ' + (snakeErr?.message || 'unknown error'));
      return;
    }

    // 4. Link sticker to snake (mark as claimed)
    await supabase
      .from('stickers')
      .update({ snake_id: snake.id, claimed_at: new Date().toISOString() })
      .eq('qr_code', newCode);

    setCreatedSnake(snake);
    setStickerQr(newCode);
    setCreating(false);
    setStep('done');
  };

  // ============== STEP 1: SPECIES PICKER ==============
  if (step === 'species') {
    return (
      <>
        <AppHeader title="Find reptile" back />
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 14, color: BRAND.ash, marginBottom: 16 }}>
            Search the species library, then we'll set up this specific animal and print its sticker.
          </div>

          {/* Search input */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              placeholder="e.g. ball python, leopard gecko, bearded dragon..."
              style={{ ...inputStyle, padding: '14px 40px 14px 40px', fontSize: 16 }}
            />
            <Search size={18} color={BRAND.ash} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            }} />
            {query && (
              <button onClick={() => setQuery('')} style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', color: BRAND.ash, cursor: 'pointer',
                padding: 4, display: 'flex',
              }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category filter chips */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }} className="hide-scroll">
            {(['all', 'snake', 'lizard', 'gecko', 'tortoise'] as const).map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                padding: '6px 14px', borderRadius: 20,
                border: filter === cat ? 'none' : `1px solid ${BRAND.cream}`,
                background: filter === cat ? BRAND.green : 'white',
                color: filter === cat ? 'white' : BRAND.ink,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                textTransform: 'capitalize', whiteSpace: 'nowrap',
              }}>
                {cat === 'all' ? 'All' : cat + 's'}
              </button>
            ))}
          </div>

          {/* Results */}
          <div style={{ fontSize: 11, color: BRAND.ash, marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>
            {filteredSpecies.length} SPECIES
          </div>

          {filteredSpecies.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: BRAND.ash }}>
              No species match your search. Try a different word or pick "All".
            </div>
          ) : (
            filteredSpecies.map(species => (
              <Card key={species.id} onClick={() => pickSpecies(species)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{species.common_name}</div>
                    <div style={{ fontSize: 12, color: BRAND.ash, fontStyle: 'italic', marginTop: 2 }}>
                      {species.scientific_name}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 11 }}>
                      <span style={{
                        background: BRAND.cream, color: BRAND.ink,
                        padding: '2px 8px', borderRadius: 6,
                        textTransform: 'capitalize', fontWeight: 600,
                      }}>
                        {species.category}
                      </span>
                      {species.difficulty && (
                        <span style={{
                          background: species.difficulty === 'beginner' ? BRAND.ok :
                                     species.difficulty === 'intermediate' ? BRAND.gold :
                                     BRAND.danger,
                          color: 'white',
                          padding: '2px 8px', borderRadius: 6,
                          fontWeight: 600, textTransform: 'capitalize',
                        }}>
                          {species.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={20} color={BRAND.ash} style={{ flexShrink: 0, marginLeft: 8 }} />
                </div>
              </Card>
            ))
          )}
        </div>
      </>
    );
  }

  // ============== STEP 2: DETAILS FORM ==============
  if (step === 'details' && selectedSpecies) {
    return (
      <>
        <AppHeader title="Reptile details" back />
        <div style={{ padding: 20 }}>
          {/* Selected species banner */}
          <div style={{
            background: BRAND.dark, color: 'white', padding: 16, borderRadius: 12, marginBottom: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, color: BRAND.gold, letterSpacing: 1, fontWeight: 700 }}>
                SPECIES
              </div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{selectedSpecies.common_name}</div>
              <div style={{ fontSize: 12, color: '#A8C7B4', fontStyle: 'italic', marginTop: 2 }}>
                {selectedSpecies.scientific_name}
              </div>
            </div>
            <button onClick={() => { setSelectedSpecies(null); setStep('species'); }} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
            }}>
              Change
            </button>
          </div>

          <Card>
            <div style={{ fontSize: 13, color: BRAND.ash, marginBottom: 12 }}>
              Fill in details about <strong>this specific animal</strong>. A sticker will be auto-generated when you save.
            </div>

            <FormRow label="Name *">
              <input type="text" value={form.name}
                     onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                     style={inputStyle} placeholder="e.g. Khaleesi, Smaug, Boris" autoFocus />
            </FormRow>
            <FormRow label="Morph (if applicable)">
              <input type="text" value={form.morph}
                     onChange={e => setForm(f => ({ ...f, morph: e.target.value }))}
                     style={inputStyle} placeholder="e.g. Pastel Lesser" />
            </FormRow>
            <FormRow label="Sex">
              <select value={form.sex} onChange={e => setForm(f => ({ ...f, sex: e.target.value as any }))} style={inputStyle}>
                <option value="">Unknown</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </FormRow>
            <FormRow label="Hatch date">
              <input type="date" value={form.hatch_date}
                     onChange={e => setForm(f => ({ ...f, hatch_date: e.target.value }))}
                     style={inputStyle} />
            </FormRow>
            <FormRow label="Acquired date">
              <input type="date" value={form.acquired_date}
                     onChange={e => setForm(f => ({ ...f, acquired_date: e.target.value }))}
                     style={inputStyle} />
            </FormRow>
            <FormRow label="Source">
              <input type="text" value={form.source}
                     onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                     style={inputStyle} placeholder="Breeder name, expo, etc." />
            </FormRow>
            {ctx.facilities.length > 0 && (
              <FormRow label="Facility">
                <select value={facilityId} onChange={e => setFacilityId(e.target.value)} style={inputStyle}>
                  {ctx.facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </FormRow>
            )}
          </Card>

          <div style={{ fontSize: 11, color: BRAND.ash, marginTop: 16, marginBottom: 8, fontWeight: 700, letterSpacing: 1.5 }}>
            FEEDING SETUP
          </div>
          <Card>
            <FormRow label="Prey type">
              <PreyAutocomplete
                value={form.prey_type}
                onChange={(v) => setForm(f => ({ ...f, prey_type: v }))}
                options={getPreyTypesForCategory(selectedSpecies.category)}
                placeholder="Select prey type..."
              />
            </FormRow>
            <FormRow label="Prey size">
              <PreyAutocomplete
                value={form.prey_size}
                onChange={(v) => setForm(f => ({ ...f, prey_size: v }))}
                options={getPreySizesForType(form.prey_type)}
                placeholder="Select prey size..."
              />
            </FormRow>
            <FormRow label="Feed every (days)">
              <input type="number" value={form.feed_interval_days}
                     onChange={e => setForm(f => ({ ...f, feed_interval_days: parseInt(e.target.value) || 7 }))}
                     style={inputStyle} />
            </FormRow>
            <FormRow label="Notes">
              <input type="text" value={form.notes}
                     onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                     style={inputStyle} placeholder="Optional" />
            </FormRow>
          </Card>

          {selectedSpecies.feeding_schedule && (
            <div style={{
              marginTop: 12, padding: 10, background: BRAND.cream, borderRadius: 8,
              fontSize: 11, color: BRAND.ash, lineHeight: 1.5,
            }}>
              <strong>Care guide suggests:</strong> {selectedSpecies.feeding_schedule}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => setStep('species')} style={btnSecondary} disabled={creating}>
              <ChevronLeft size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Back
            </button>
            <button onClick={handleCreate} style={btnPrimary} disabled={creating || !form.name}>
              {creating ? 'Saving...' : 'Save & generate sticker →'}
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============== STEP 3: DONE + PRINT STICKER ==============
  if (step === 'done' && createdSnake && stickerQr) {
    return <DoneStep snake={createdSnake} qrCode={stickerQr} router={router} />;
  }

  return null;
}

// ============== DONE STEP COMPONENT ==============
function DoneStep({ snake, qrCode, router }: { snake: Snake; qrCode: string; router: any }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(`${APP_URL}/s/${qrCode}`, { width: 400, margin: 0 }).then(setQrDataUrl);
  }, [qrCode]);

  return (
    <>
      <AppHeader title="Done!" />
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 40, background: BRAND.green,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '20px auto', boxShadow: `0 8px 20px ${BRAND.green}40`,
        }}>
          <Check size={48} color="white" />
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
          {snake.name} added
        </div>
        <div style={{ fontSize: 14, color: BRAND.ash, marginBottom: 24 }}>
          Sticker generated. Print and stick on the enclosure.
        </div>

        {/* Sticker preview */}
        <div style={{
          background: 'white', border: `2px dashed ${BRAND.cream}`, borderRadius: 16,
          padding: 24, marginBottom: 20, maxWidth: 300, margin: '0 auto 20px',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{snake.name}</div>
          {qrDataUrl && <img src={qrDataUrl} alt={qrCode} style={{ width: '70%' }} />}
          <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, marginTop: 8, letterSpacing: 2 }}>
            {qrCode}
          </div>
        </div>

        <button onClick={() => setShowPrint(true)} style={{ ...btnPrimary, marginBottom: 8 }}>
          <Printer size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Print sticker now
        </button>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={() => router.push(`/snakes/${snake.id}`)} style={btnSecondary}>
            View profile
          </button>
          <button onClick={() => router.push('/add')} style={btnSecondary}>
            Add another
          </button>
        </div>
      </div>

      {showPrint && qrDataUrl && (
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
            <button onClick={() => setShowPrint(false)} style={btnSecondary}>Close</button>
            <button onClick={() => window.print()} style={btnPrimary}>Print</button>
          </div>
          <div style={{
            border: '1px dashed #ccc', padding: '20mm', textAlign: 'center', maxWidth: 400, margin: '0 auto',
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{snake.name}</div>
            <img src={qrDataUrl} alt={qrCode} style={{ width: '60%' }} />
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, marginTop: 8 }}>{qrCode}</div>
          </div>
        </div>
      )}
    </>
  );
}
