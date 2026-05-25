/* eslint-disable */
// Repti-track — shared atoms & icons

// ─── inline icons (stroked, minimal) ──────────────────────────────
const Icon = {
  home: (p) => (<svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14V10.5"/></svg>),
  list: (p) => (<svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>),
  utensils: (p) => (<svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2"/><path d="M16 3c-1.5 1.5-2.5 3.5-2.5 6.5S15 14 16 14v7"/></svg>),
  heart: (p) => (<svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 7a5.5 5.5 0 0 0-9.8-2.4A5.5 5.5 0 0 0 3.2 12L12 21l8.8-9c.8-1.5 1.1-3.4 0-5z"/></svg>),
  more: (p) => (<svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>),
  qr: (p) => (<svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 21v-3M21 14h-3M14 21h3"/></svg>),
  search: (p) => (<svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>),
  plus: (p) => (<svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>),
  chev: (p) => (<svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>),
  chevL: (p) => (<svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>),
  scale: (p) => (<svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M8 6h8l3 13H5z"/><circle cx="12" cy="12" r="2"/></svg>),
  cart: (p) => (<svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/><path d="M3 4h2l2.4 11.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6"/></svg>),
  printer: (p) => (<svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>),
  bell: (p) => (<svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>),
  edit: (p) => (<svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>),
  check: (p) => (<svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7"/></svg>),
  x: (p) => (<svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>),
  ff: (p) => (<svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m4 5 8 7-8 7zM13 5l8 7-8 7z"/></svg>),
  thermo: (p) => (<svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14V4a2 2 0 1 0-4 0v10a4 4 0 1 0 4 0z"/></svg>),
  drop: (p) => (<svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z"/></svg>),
  flash: (p) => (<svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>),
  book: (p) => (<svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M4 17h14"/></svg>),
};

// ─── App header ───────────────────────────────────────────────────
function AppHeader({ eyebrow="REPTI-TRACK", title, back, action }) {
  return (
    <div className="app-header" style={{ paddingTop: 56 }}>
      {back && (
        <button className="app-header__icon" style={{ background: 'transparent', cursor: 'pointer' }}>
          <Icon.chevL />
        </button>
      )}
      <div className="app-header__title-block">
        <div className="eyebrow" style={{ color: 'var(--moss)' }}>{eyebrow}</div>
        <div className="display" style={{ fontSize: 32, marginTop: 2, color: 'var(--ink)' }}>{title}</div>
      </div>
      {action}
    </div>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────────
function BottomNav({ active = 'home' }) {
  const items = [
    { id: 'home', icon: Icon.home, label: 'Home' },
    { id: 'reptiles', icon: Icon.list, label: 'Reptiles' },
    { id: 'feed', icon: Icon.utensils, label: 'Feed', fab: true },
    { id: 'pair', icon: Icon.heart, label: 'Pairings' },
    { id: 'more', icon: Icon.more, label: 'More' },
  ];
  return (
    <div className="bottom-nav">
      {items.map(it => {
        const Ic = it.icon;
        const isActive = active === it.id;
        if (it.fab) return (
          <div key={it.id} className="bottom-nav__item">
            <div className="bottom-nav__item--fab"><Ic size={22}/></div>
            <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--moss)' }}>{it.label}</span>
          </div>
        );
        return (
          <div key={it.id} className={"bottom-nav__item" + (isActive ? ' bottom-nav__item--active' : '')}>
            <Ic size={20}/>
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Faux QR Code (SVG) ───────────────────────────────────────────
function FauxQR({ size = 96, seed = 7 }) {
  // deterministic pseudo-random based on seed
  const rng = (i) => {
    const x = Math.sin((i+1) * (seed*13+7)) * 10000;
    return x - Math.floor(x);
  };
  const cells = 21;
  const cs = size / cells;
  const dots = [];
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const inFinder = (
        (x < 7 && y < 7) || (x > cells - 8 && y < 7) || (x < 7 && y > cells - 8)
      );
      if (inFinder) continue;
      if (rng(y*cells+x) > 0.55) dots.push(<rect key={`${x}-${y}`} x={x*cs} y={y*cs} width={cs} height={cs} />);
    }
  }
  const finder = (fx, fy) => (
    <g transform={`translate(${fx*cs} ${fy*cs})`}>
      <rect x="0" y="0" width={cs*7} height={cs*7} fill="currentColor" />
      <rect x={cs} y={cs} width={cs*5} height={cs*5} fill="var(--card)" />
      <rect x={cs*2} y={cs*2} width={cs*3} height={cs*3} fill="currentColor" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', color: 'var(--ink)' }}>
      <g fill="currentColor">{dots}</g>
      {finder(0,0)}
      {finder(cells-7,0)}
      {finder(0,cells-7)}
    </svg>
  );
}

// ─── Species placeholder thumbnail (abstract pattern) ─────────────
function SpeciesThumb({ palette = 'corn', size = 56 }) {
  // each "morph" gets a unique abstract pattern that hints at scales
  const palettes = {
    corn:    { a: '#C26B2A', b: '#7A3216', c: '#F2C57F' },
    royal:   { a: '#5B4F30', b: '#1F2018', c: '#A89263' },
    leo:     { a: '#D9A84A', b: '#8E6320', c: '#F3DC9B' },
    boa:     { a: '#9C6F3E', b: '#3B2814', c: '#D8B080' },
    hognose: { a: '#A38450', b: '#4E3B1F', c: '#D7BA7E' },
    crested: { a: '#E6A35E', b: '#7E4A20', c: '#FFD9A8' },
    bp:      { a: '#3F3727', b: '#0F0E0A', c: '#8E7B53' },
    bearded: { a: '#C18C4C', b: '#6E4818', c: '#F3CC8C' },
    rosy:    { a: '#B07868', b: '#6A3A2C', c: '#E1B6A4' },
    western: { a: '#7A6E48', b: '#2A2418', c: '#B5A472' },
  };
  const p = palettes[palette] || palettes.corn;
  const r = (i) => {
    const x = Math.sin((i+1) * (palette.length+13)) * 10000;
    return x - Math.floor(x);
  };
  // scale pattern
  const scales = [];
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 6; x++) {
      const offY = (x % 2 === 0) ? 0 : 5;
      const px = x * 10 + 2;
      const py = y * 10 + offY + 2;
      const tone = r(y*6+x) > 0.5 ? p.c : p.b;
      scales.push(<circle key={`${x}-${y}`} cx={px+5} cy={py+5} r={5.5} fill={tone} opacity={0.85}/>);
    }
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: p.a, overflow: 'hidden', position: 'relative',
      border: '1px solid var(--line)', flexShrink: 0,
    }}>
      <svg width={size} height={size} viewBox="0 0 60 60" preserveAspectRatio="xMidYMid slice">
        <rect width="60" height="60" fill={p.a}/>
        {scales}
      </svg>
    </div>
  );
}

// Expose
Object.assign(window, { Icon, AppHeader, BottomNav, FauxQR, SpeciesThumb });
