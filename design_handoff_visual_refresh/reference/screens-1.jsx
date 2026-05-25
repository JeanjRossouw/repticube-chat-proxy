/* eslint-disable */
// Repti-track screens — Home, Reptiles list, Reptile detail

// ─── Sample data ──────────────────────────────────────────────────
const SAMPLE_REPTILES = [
  { id: 1, name: 'Ferdinand', species: 'Ball python', morph: 'Pastel het Pied', sex: 'M', grams: 1240, lastFed: 6, due: -1, qr: 'A7K3-Q9', palette: 'royal', facility: 'Rack A' },
  { id: 2, name: 'Saffron',   species: 'Corn snake', morph: 'Amelanistic', sex: 'F', grams: 410, lastFed: 9, due: 2, qr: 'B2H8-L1', palette: 'corn', facility: 'Rack A' },
  { id: 3, name: 'Sage',      species: 'Leopard gecko', morph: 'Tangerine', sex: 'F', grams: 68, lastFed: 3, due: -2, qr: 'C9M4-T7', palette: 'leo', facility: 'Bioactive' },
  { id: 4, name: 'Bramble',   species: 'Western hognose', morph: 'Anaconda', sex: 'M', grams: 88, lastFed: 11, due: 4, qr: 'D5W2-N3', palette: 'hognose', facility: 'Rack B' },
  { id: 5, name: 'Juno',      species: 'Crested gecko', morph: 'Harlequin', sex: 'F', grams: 42, lastFed: 4, due: -1, qr: 'E1R6-K8', palette: 'crested', facility: 'Bioactive' },
  { id: 6, name: 'Orin',      species: 'Boa constrictor', morph: 'Hypo motley', sex: 'M', grams: 2380, lastFed: 14, due: 7, qr: 'F8P5-V2', palette: 'boa', facility: 'Rack B' },
];

// ─── HOME ─────────────────────────────────────────────────────────
function HomeScreen() {
  const due = SAMPLE_REPTILES.filter(r => r.due <= 1).sort((a,b) => a.due - b.due);
  const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
  const fedToday = 3, totalDue = 5;
  return (
    <div className="phone-screen" style={{ paddingBottom: 110, height: '100%', overflow: 'auto', position: 'relative' }}>
      <div style={{ padding: '56px 22px 0' }}>
        <div className="eyebrow" style={{ color: 'var(--moss)' }}>Sunday · {today.split(',')[0]}</div>
        <div className="display" style={{ fontSize: 40, marginTop: 6, lineHeight: 1.02, color: 'var(--ink)' }}>
          <span>Twelve animals</span><br/>
          <span className="display-italic" style={{ color: 'var(--moss)' }}>in your care.</span>
        </div>
      </div>

      {/* Today card */}
      <div style={{ padding: '20px 22px 0' }}>
        <div className="card" style={{ padding: 18, background: 'var(--moss)', color: 'var(--ink-on-moss)', border: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="eyebrow" style={{ color: 'var(--moss-soft)' }}>Today's feed</div>
              <div className="display" style={{ fontSize: 32, marginTop: 4 }}>
                {fedToday}<span className="display-italic" style={{ color: 'var(--moss-soft)' }}>/{totalDue}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--moss-soft)', marginTop: 2 }}>{totalDue - fedToday} more to feed today</div>
            </div>
            {/* progress ring */}
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--moss-soft)" strokeWidth="4" opacity="0.3"/>
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--ink-on-moss)" strokeWidth="4"
                strokeDasharray={`${(fedToday/totalDue)*163} 163`} strokeLinecap="round"
                transform="rotate(-90 32 32)" />
              <text x="32" y="38" textAnchor="middle" fontFamily="var(--font-display)" fontSize="18" fill="var(--ink-on-moss)">{Math.round(fedToday/totalDue*100)}%</text>
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '10px 12px', background: 'rgba(255,255,255,0.08)', borderRadius: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Start batch feed</span>
            <Icon.chev size={16}/>
          </div>
        </div>
      </div>

      {/* Feeding due section */}
      <div style={{ padding: '24px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div className="eyebrow">Due now</div>
          <div className="eyebrow" style={{ color: 'var(--rust)' }}>{due.filter(d=>d.due<0).length} overdue</div>
        </div>
        {due.slice(0,3).map(r => <DueRow key={r.id} r={r} />)}
      </div>

      {/* Quick actions */}
      <div style={{ padding: '24px 22px 0' }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Shortcuts</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ActionTile icon={Icon.qr} title="Scan sticker" sub="Open camera"/>
          <ActionTile icon={Icon.cart} title="Prey forecast" sub="14-day order"/>
          <ActionTile icon={Icon.search} title="Find reptile" sub="Search all"/>
          <ActionTile icon={Icon.printer} title="Stickers" sub="6 unclaimed"/>
        </div>
      </div>

      {/* Recent weight */}
      <div style={{ padding: '24px 22px 0' }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Recent growth</div>
        <GrowthCard/>
      </div>

      <BottomNav active="home"/>
    </div>
  );
}

function DueRow({ r }) {
  const pillClass = r.due < 0 ? 'due-pill--over' : r.due === 0 ? 'due-pill--today' : 'due-pill--soon';
  const pillText = r.due < 0 ? `${-r.due}d over` : r.due === 0 ? 'Today' : `${r.due}d`;
  return (
    <div className="card" style={{ padding: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
      <SpeciesThumb palette={r.palette} size={44}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{r.name}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>·  {r.species}</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{r.morph} · {r.grams}g</div>
      </div>
      <div className={"due-pill " + pillClass}>{pillText}</div>
    </div>
  );
}

function ActionTile({ icon, title, sub }) {
  const I = icon;
  return (
    <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'var(--moss-soft)', color: 'var(--moss-deep)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I size={16}/></div>
        <Icon.chev size={14} />
      </div>
      <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>
    </div>
  );
}

function GrowthCard() {
  // sparkline: weight over 8 entries
  const data = [820, 880, 940, 1020, 1080, 1120, 1190, 1240];
  const max = Math.max(...data), min = Math.min(...data);
  const w = 320, h = 64, pad = 4;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - 2*pad);
    const y = h - pad - ((v - min) / (max - min)) * (h - 2*pad);
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`)).join(' ');
  const area = d + ` L${w-pad} ${h} L${pad} ${h} Z`;
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Ferdinand</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Ball python · 8 weights</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="display" style={{ fontSize: 22, color: 'var(--moss)' }}>1240<span className="display-italic" style={{ fontSize: 14, color: 'var(--muted)' }}>g</span></div>
          <div style={{ fontSize: 10, color: 'var(--moss)', fontWeight: 600 }}>+51%  ↗</div>
        </div>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--moss)" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="var(--moss)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill="url(#growth)"/>
        <path d={d} fill="none" stroke="var(--moss)" strokeWidth="2" strokeLinejoin="round"/>
        {pts.map((p,i) => <circle key={i} cx={p[0]} cy={p[1]} r="2" fill="var(--moss)" />)}
      </svg>
    </div>
  );
}

// ─── REPTILES LIST ────────────────────────────────────────────────
function ReptilesScreen() {
  return (
    <div className="phone-screen" style={{ paddingBottom: 110, height: '100%', overflow: 'auto', position: 'relative' }}>
      <div style={{ padding: '56px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--moss)' }}>Collection</div>
          <div className="display" style={{ fontSize: 36, marginTop: 4 }}>
            All <span className="display-italic" style={{ color: 'var(--moss)' }}>reptiles</span>
          </div>
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: 12, border: 'none',
          background: 'var(--moss)', color: 'var(--ink-on-moss)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon.plus size={20}/></button>
      </div>

      {/* Search */}
      <div style={{ padding: '18px 22px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', background: 'var(--card)',
          border: '1px solid var(--line)', borderRadius: 12,
        }}>
          <Icon.search size={16}/>
          <span style={{ flex: 1, fontSize: 14, color: 'var(--muted)' }}>Name, species, morph…</span>
          <span className="qr-badge">⌘K</span>
        </div>
      </div>

      {/* Facility chips */}
      <div style={{ padding: '14px 22px 0', display: 'flex', gap: 8, overflowX: 'auto' }} className="no-scrollbar">
        <Chip label="All" count="12" active/>
        <Chip label="Rack A" count="4"/>
        <Chip label="Rack B" count="3"/>
        <Chip label="Bioactive" count="3"/>
        <Chip label="Quarantine" count="2"/>
      </div>

      {/* Cards */}
      <div style={{ padding: '14px 22px 0' }}>
        {SAMPLE_REPTILES.map(r => <ReptileCard key={r.id} r={r}/>)}
      </div>

      <BottomNav active="reptiles"/>
    </div>
  );
}

function Chip({ label, count, active }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
      padding: '8px 14px', borderRadius: 999,
      background: active ? 'var(--moss)' : 'var(--card)',
      color: active ? 'var(--ink-on-moss)' : 'var(--ink)',
      border: '1px solid ' + (active ? 'var(--moss)' : 'var(--line)'),
      fontSize: 13, fontWeight: 500,
    }}>
      <span>{label}</span>
      <span style={{ opacity: 0.7, fontFeatureSettings: '"tnum"' }}>{count}</span>
    </div>
  );
}

function ReptileCard({ r }) {
  const dueDays = r.due;
  const sexGlyph = r.sex === 'M' ? '♂' : r.sex === 'F' ? '♀' : '?';
  return (
    <div className="card" style={{ padding: 14, marginBottom: 10, display: 'flex', gap: 14, alignItems: 'center' }}>
      <SpeciesThumb palette={r.palette} size={56}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div className="display" style={{ fontSize: 22, color: 'var(--ink)' }}>{r.name}</div>
          <span className="qr-badge">{r.qr}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>
          {r.species} · <span style={{ fontStyle: 'italic' }}>{r.morph}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--ink-2)', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              display: 'inline-block', width: 14, height: 14, borderRadius: 4,
              background: 'var(--card-2)', color: 'var(--moss)', textAlign: 'center', lineHeight: '14px', fontSize: 11, fontWeight: 700,
            }}>{sexGlyph}</span>
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-2)' }}>{r.grams}g</span>
          <span style={{ color: 'var(--muted)' }}>Fed {r.lastFed}d ago</span>
          <span style={{ flex: 1 }}/>
          {dueDays < 0 && <span className="due-pill due-pill--over">{-dueDays}d over</span>}
          {dueDays === 0 && <span className="due-pill due-pill--today">Today</span>}
          {dueDays > 0 && <span style={{ fontSize: 10, color: 'var(--muted)' }}>Next in {dueDays}d</span>}
        </div>
      </div>
    </div>
  );
}

// ─── REPTILE DETAIL ───────────────────────────────────────────────
function ReptileDetailScreen() {
  const r = SAMPLE_REPTILES[0]; // Ferdinand
  return (
    <div className="phone-screen" style={{ paddingBottom: 110, height: '100%', overflow: 'auto', position: 'relative' }}>
      {/* Top bar */}
      <div style={{ padding: '56px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="app-header__icon" style={{ background: 'transparent', cursor: 'pointer' }}>
          <Icon.chevL/>
        </button>
        <div className="eyebrow" style={{ color: 'var(--moss)' }}>Reptile · 02 / 12</div>
        <button className="app-header__icon" style={{ background: 'transparent', cursor: 'pointer' }}>
          <Icon.edit/>
        </button>
      </div>

      {/* Hero */}
      <div style={{ padding: '0 22px' }}>
        <div style={{
          background: 'var(--moss)', color: 'var(--ink-on-moss)',
          borderRadius: 20, padding: 22, position: 'relative', overflow: 'hidden',
        }}>
          {/* decorative scales */}
          <svg style={{ position: 'absolute', right: -20, top: -10, opacity: 0.18 }} width="180" height="180" viewBox="0 0 180 180">
            {Array.from({length: 12}).map((_, y) =>
              Array.from({length: 12}).map((_, x) => {
                const off = (x % 2 === 0) ? 0 : 7;
                return <circle key={`${x}-${y}`} cx={x*14+7} cy={y*14+off+7} r={6} fill="none" stroke="currentColor" strokeWidth="1"/>;
              })
            )}
          </svg>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="qr-badge" style={{ background: 'rgba(255,255,255,0.12)', color: 'var(--ink-on-moss)', borderColor: 'rgba(255,255,255,0.2)' }}>
                {r.qr}
              </span>
              <span className="eyebrow" style={{ color: 'var(--moss-soft)' }}>{r.facility}</span>
            </div>
            <div className="display" style={{ fontSize: 44, lineHeight: 1 }}>
              {r.name}
            </div>
            <div className="display-italic" style={{ fontSize: 18, color: 'var(--moss-soft)', marginTop: 4 }}>
              {r.morph}
            </div>
            <div style={{ fontSize: 13, color: 'var(--moss-soft)', marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span>{r.sex === 'M' ? '♂ Male' : '♀ Female'}</span>
              <span>·</span>
              <span>{r.species}</span>
              <span>·</span>
              <span>Hatched 12 Mar 2023</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '14px 22px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <StatCell label="Last fed" value="6d" sub="ago"/>
        <StatCell label="Weight" value="1240" sub="g"/>
        <StatCell label="Next due" value="Mon" sub="Apr 14"/>
      </div>

      {/* Tabs */}
      <div style={{ padding: '18px 22px 0', display: 'flex', gap: 4, overflowX: 'auto' }} className="no-scrollbar">
        {['Overview','Feeding','Weight','Breeding','Care'].map((t,i) => (
          <div key={t} style={{
            padding: '8px 14px', borderRadius: 10,
            background: i===0 ? 'var(--ink)' : 'transparent',
            color: i===0 ? 'var(--bg)' : 'var(--muted)',
            fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
          }}>{t}</div>
        ))}
      </div>

      {/* Detail rows */}
      <div style={{ padding: '14px 22px 0' }}>
        <div className="card" style={{ padding: 0 }}>
          <DetailRow label="Prey" value="Medium mouse"/>
          <DetailRow label="Schedule" value="Every 7 days"/>
          <DetailRow label="Acquired" value="Mar 12, 2023"/>
          <DetailRow label="Source" value="Ophidian Exotics"/>
          <DetailRow label="Notes" value="Mild head wobble first week — resolved." last/>
        </div>
      </div>

      {/* Recent feedings timeline */}
      <div style={{ padding: '20px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div className="eyebrow">Last 4 feedings</div>
          <div className="eyebrow" style={{ color: 'var(--moss)' }}>See all →</div>
        </div>
        {[
          { d: 'Apr 7',  prey: 'Med mouse', ok: true },
          { d: 'Mar 31', prey: 'Med mouse', ok: true },
          { d: 'Mar 24', prey: 'Med mouse', ok: false, note: 'In shed' },
          { d: 'Mar 17', prey: 'Sm rat',    ok: true },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i<3 ? '1px solid var(--line)' : 'none' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', minWidth: 48 }}>{f.d}</div>
            <div style={{ flex: 1, fontSize: 13, color: 'var(--ink)' }}>
              {f.prey}
              {f.note && <span style={{ marginLeft: 8, fontStyle: 'italic', color: 'var(--muted)', fontSize: 12 }}>· {f.note}</span>}
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: 999,
              background: f.ok ? 'var(--moss)' : 'var(--rust)',
              color: f.ok ? 'var(--ink-on-moss)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {f.ok ? <Icon.check size={14}/> : <Icon.x size={14}/>}
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="reptiles"/>
    </div>
  );
}

function StatCell({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="eyebrow" style={{ fontSize: 9 }}>{label}</div>
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="display" style={{ fontSize: 26, color: 'var(--ink)' }}>{value}</span>
        <span className="display-italic" style={{ fontSize: 13, color: 'var(--muted)' }}>{sub}</span>
      </div>
    </div>
  );
}

function DetailRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderBottom: last ? 'none' : '1px solid var(--line)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

Object.assign(window, { HomeScreen, ReptilesScreen, ReptileDetailScreen, SAMPLE_REPTILES });
