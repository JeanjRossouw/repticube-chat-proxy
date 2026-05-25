/* eslint-disable */
// Repti-track screens — Batch Feed (speed mode), Scan

// ─── BATCH FEED — main "speed" screen ─────────────────────────────
function BatchFeedScreen() {
  const queue = SAMPLE_REPTILES.filter(r => r.due <= 1);
  const index = 1; // showing 2nd of N
  const total = queue.length;
  const current = queue[index];
  const progress = (index / total) * 100;

  return (
    <div className="phone-screen" style={{ height: '100%', overflow: 'auto', position: 'relative' }}>
      {/* Top bar */}
      <div style={{ padding: '56px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="app-header__icon" style={{ background: 'transparent', cursor: 'pointer' }}>
          <Icon.chevL/>
        </button>
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'var(--moss)' }}>Batch feed</div>
          <div className="mono" style={{ fontSize: 13, color: 'var(--ink)', marginTop: 2, fontWeight: 600 }}>
            {String(index+1).padStart(2,'0')}
            <span style={{ color: 'var(--muted)' }}> / {String(total).padStart(2,'0')}</span>
          </div>
        </div>
        <div className="app-header__icon" style={{ background: 'transparent', visibility: 'hidden' }}/>
      </div>

      {/* Progress dots */}
      <div style={{ padding: '14px 22px 0', display: 'flex', gap: 4 }}>
        {queue.map((q, i) => {
          const state = i < index ? 'done' : i === index ? 'cur' : 'idle';
          const dec = i < index ? (i === 0 ? 'ate' : 'ate') : null; // pretend first two ate
          return (
            <div key={q.id} style={{ flex: 1, position: 'relative' }}>
              <div style={{
                height: 4, borderRadius: 2,
                background: state === 'done'
                  ? (dec === 'ate' ? 'var(--moss)' : 'var(--rust)')
                  : state === 'cur' ? 'var(--ink)'
                  : 'var(--line)',
              }}/>
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div style={{ padding: '22px 22px 0' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Hero band */}
          <div style={{
            padding: 22, background: 'var(--card-2)',
            borderBottom: '1px solid var(--line)',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <SpeciesThumb palette={current.palette} size={64}/>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="qr-badge">{current.qr}</span>
                    <span className="eyebrow">{current.facility}</span>
                  </div>
                  <div className="display" style={{ fontSize: 30, lineHeight: 1, color: 'var(--ink)' }}>{current.name}</div>
                  <div className="display-italic" style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>
                    {current.species} · {current.morph}
                  </div>
                </div>
              </div>
              <span className="due-pill due-pill--today">Today</span>
            </div>
          </div>

          {/* Prey block */}
          <div style={{ padding: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Default prey</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="display" style={{ fontSize: 30, color: 'var(--ink)' }}>Medium</span>
              <span className="display-italic" style={{ fontSize: 24, color: 'var(--moss)' }}>mouse</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
              Last fed 9d ago · Refeeds every 7d
            </div>
            <button style={{
              marginTop: 14, padding: '8px 12px', borderRadius: 8,
              background: 'transparent', border: '1px solid var(--line)',
              color: 'var(--moss)', fontSize: 12, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            }}>
              <Icon.edit size={12}/> Change prey or add note
            </button>
          </div>
        </div>
      </div>

      {/* Action buttons — the killer interaction */}
      <div style={{ padding: '18px 22px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button style={{
          padding: '22px 12px', borderRadius: 18,
          background: 'transparent', color: 'var(--rust)',
          border: '2px solid var(--rust)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          cursor: 'pointer',
        }}>
          <Icon.x size={28}/>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Refused</span>
        </button>
        <button style={{
          padding: '22px 12px', borderRadius: 18,
          background: 'var(--moss)', color: 'var(--ink-on-moss)',
          border: 'none', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          cursor: 'pointer',
          boxShadow: '0 10px 24px -8px rgba(42,82,56,0.5)',
        }}>
          {/* shine */}
          <div style={{ position:'absolute', inset:0, background: 'linear-gradient(135deg, rgba(255,255,255,0.18), transparent 40%)' }}/>
          <Icon.check size={28}/>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Accepted</span>
        </button>
      </div>

      {/* Skip / prev */}
      <div style={{ padding: '12px 22px 0' }}>
        <button style={{
          width: '100%', padding: 14, background: 'transparent', color: 'var(--muted)',
          border: '1px dashed var(--line-strong)', borderRadius: 14,
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon.ff size={14}/> Skip — don't log
        </button>
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon.chevL size={14}/> Previous reptile
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── BATCH FEED — selection (queue) screen ────────────────────────
function BatchFeedSelectScreen() {
  const due = SAMPLE_REPTILES.filter(r => r.due <= 4);
  const selected = new Set([1,2,3,5]);
  return (
    <div className="phone-screen" style={{ height: '100%', overflow: 'auto', position: 'relative' }}>
      <div style={{ padding: '56px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="app-header__icon" style={{ background: 'transparent', cursor: 'pointer' }}>
          <Icon.chevL/>
        </button>
        <div className="eyebrow" style={{ color: 'var(--moss)' }}>Batch feed · {selected.size} of {due.length}</div>
        <div className="app-header__icon" style={{ background: 'transparent', visibility: 'hidden' }}/>
      </div>

      <div style={{ padding: '18px 22px 0' }}>
        <div className="display" style={{ fontSize: 30, lineHeight: 1.05, color: 'var(--ink)' }}>
          Pick who's <span className="display-italic" style={{ color: 'var(--moss)' }}>eating</span> today.
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
          5 reptiles are due or overdue. Tap to deselect any you're skipping.
        </div>
      </div>

      <div style={{ padding: '16px 22px 0', display: 'flex', gap: 8, overflowX: 'auto' }} className="no-scrollbar">
        <Chip label="All" count="5" active/>
        <Chip label="Snakes" count="3"/>
        <Chip label="Geckos" count="2"/>
      </div>

      <div style={{ padding: '14px 22px 22px' }}>
        {due.map(r => {
          const isSel = selected.has(r.id);
          return (
            <div key={r.id} style={{
              padding: 12, marginBottom: 8,
              borderRadius: 14,
              background: isSel ? 'var(--moss-soft)' : 'var(--card)',
              border: '1px solid ' + (isSel ? 'var(--moss)' : 'var(--line)'),
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 7,
                background: isSel ? 'var(--moss)' : 'transparent',
                border: isSel ? 'none' : '2px solid var(--line-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ink-on-moss)', flexShrink: 0,
              }}>
                {isSel && <Icon.check size={14}/>}
              </div>
              <SpeciesThumb palette={r.palette} size={40}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{r.species} · {r.morph}</div>
              </div>
              {r.due < 0 && <span className="due-pill due-pill--over">{-r.due}d</span>}
              {r.due === 0 && <span className="due-pill due-pill--today">Today</span>}
              {r.due > 0 && <span style={{ fontSize: 11, color: 'var(--muted)' }}>+{r.due}d</span>}
            </div>
          );
        })}
      </div>

      {/* sticky bottom action */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 22px calc(env(safe-area-inset-bottom, 0px) + 28px)',
        background: 'linear-gradient(to top, var(--bg) 70%, transparent)',
      }}>
        <button className="btn btn--primary" style={{ width: '100%', padding: 16 }}>
          Start feeding {selected.size} reptiles <Icon.chev size={16}/>
        </button>
      </div>
    </div>
  );
}

// ─── SCAN ─────────────────────────────────────────────────────────
function ScanScreen() {
  return (
    <div className="phone-screen" style={{ height: '100%', overflow: 'hidden', position: 'relative', background: '#0A0F0C' }}>
      {/* dark viewfinder */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, #1A2520 0%, #0A0F0C 80%)',
      }}/>

      {/* faint scales overlay */}
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }} width="100%" height="100%">
        <defs>
          <pattern id="scales-pat" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="11" cy="11" r="9" fill="none" stroke="#8FB99A" strokeWidth="0.6"/>
            <circle cx="0" cy="22" r="9" fill="none" stroke="#8FB99A" strokeWidth="0.6"/>
            <circle cx="22" cy="22" r="9" fill="none" stroke="#8FB99A" strokeWidth="0.6"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scales-pat)"/>
      </svg>

      {/* top bar */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '56px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          color: '#ECE6D2', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon.chevL/></button>
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: '#8FB99A' }}>Scan</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#ECE6D2', marginTop: 2 }}>Point at a sticker</div>
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          color: '#ECE6D2', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon.flash size={16}/></button>
      </div>

      {/* viewfinder window */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: 60, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 260, height: 260 }}>
          {/* corner brackets */}
          {[
            { top: 0, left: 0, borderTop: 2, borderLeft: 2 },
            { top: 0, right: 0, borderTop: 2, borderRight: 2 },
            { bottom: 0, left: 0, borderBottom: 2, borderLeft: 2 },
            { bottom: 0, right: 0, borderBottom: 2, borderRight: 2 },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute', width: 36, height: 36,
              borderColor: '#C9A24B',
              borderTopWidth: c.borderTop || 0,
              borderRightWidth: c.borderRight || 0,
              borderBottomWidth: c.borderBottom || 0,
              borderLeftWidth: c.borderLeft || 0,
              borderStyle: 'solid', borderRadius: 6,
              top: c.top, left: c.left, right: c.right, bottom: c.bottom,
            }}/>
          ))}
          {/* sample QR drawn faintly inside */}
          <div style={{
            position: 'absolute', inset: 30, display: 'flex',
            alignItems: 'center', justifyContent: 'center', opacity: 0.35,
            color: '#ECE6D2',
          }}>
            <div style={{ color: '#ECE6D2', filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.4))' }}>
              <FauxQR size={180} seed={11}/>
            </div>
          </div>
          {/* scan line */}
          <div style={{
            position: 'absolute', left: 8, right: 8, top: '50%',
            height: 2, background: 'linear-gradient(90deg, transparent, #C9A24B, transparent)',
            boxShadow: '0 0 12px rgba(201,162,75,0.6)',
          }}/>
        </div>
      </div>

      {/* helper text */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: 36, padding: '0 22px', textAlign: 'center' }}>
        <div className="display" style={{ fontSize: 22, color: '#ECE6D2', lineHeight: 1.2 }}>
          Hold steady — we'll do <span className="display-italic" style={{ color: '#C9A24B' }}>the rest</span>.
        </div>
        <div style={{ fontSize: 13, color: '#8FB99A', marginTop: 8 }}>
          Or enter the code manually below
        </div>
      </div>

      {/* manual entry */}
      <div style={{ position: 'relative', zIndex: 2, padding: '22px 22px 0' }}>
        <div style={{
          padding: '14px 16px', borderRadius: 14,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div className="mono" style={{ fontSize: 14, color: '#ECE6D2', flex: 1, letterSpacing: '0.15em' }}>
            A7K3-<span style={{ color: '#8FB99A' }}>____</span>
          </div>
          <div style={{
            padding: '6px 12px', borderRadius: 8, background: '#C9A24B', color: '#0A0F0C',
            fontSize: 12, fontWeight: 700,
          }}>GO</div>
        </div>
      </div>

      {/* recent */}
      <div style={{ position: 'relative', zIndex: 2, padding: '24px 22px 0' }}>
        <div className="eyebrow" style={{ color: '#8FB99A', marginBottom: 10 }}>Recently scanned</div>
        {[
          { qr: 'B2H8-L1', name: 'Saffron', species: 'Corn snake' },
          { qr: 'E1R6-K8', name: 'Juno',    species: 'Crested gecko' },
        ].map(s => (
          <div key={s.qr} style={{
            padding: 12, marginBottom: 8, borderRadius: 12,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8, background: '#1A221D',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ECE6D2',
            }}>
              <FauxQR size={28} seed={s.qr.length}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#ECE6D2' }}>{s.name}</div>
              <div style={{ fontSize: 11, color: '#8FB99A', marginTop: 1 }}>{s.species}</div>
            </div>
            <span className="mono" style={{ fontSize: 11, color: '#C9A24B' }}>{s.qr}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STICKERS / PRINT SHEET ───────────────────────────────────────
function StickersScreen() {
  const codes = ['A7K3-Q9','B2H8-L1','C9M4-T7','D5W2-N3','E1R6-K8','F8P5-V2','G4D7-X5','H2J1-W9'];
  return (
    <div className="phone-screen" style={{ paddingBottom: 110, height: '100%', overflow: 'auto', position: 'relative' }}>
      {/* Top bar */}
      <div style={{ padding: '56px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="app-header__icon" style={{ background: 'transparent', cursor: 'pointer' }}>
          <Icon.chevL/>
        </button>
        <div className="eyebrow" style={{ color: 'var(--moss)' }}>QR stickers</div>
        <button className="app-header__icon" style={{ background: 'transparent', cursor: 'pointer' }}>
          <Icon.printer/>
        </button>
      </div>

      <div style={{ padding: '14px 22px 0' }}>
        <div className="display" style={{ fontSize: 30, lineHeight: 1.05, color: 'var(--ink)' }}>
          Print a <span className="display-italic" style={{ color: 'var(--moss)' }}>fresh batch</span>.
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
          Stick them on enclosures, scan to assign. Each code is permanent.
        </div>
      </div>

      <div style={{ padding: '18px 22px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <StatCell label="Unclaimed" value="6" sub="codes"/>
        <StatCell label="In use" value="12" sub="active"/>
        <StatCell label="Batch" value="03" sub="of 12"/>
      </div>

      {/* Sticker preview sheet */}
      <div style={{ padding: '20px 22px 0' }}>
        <div className="eyebrow" style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span>Sheet preview</span>
          <span style={{ color: 'var(--moss)' }}>3-up · A4 ↗</span>
        </div>
        <div style={{
          background: 'var(--bone)', borderRadius: 14, padding: 14,
          border: '1px solid var(--line)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        }}>
          {codes.slice(0,6).map((c, i) => (
            <div key={c} style={{
              padding: 8, borderRadius: 8, border: '1px dashed var(--line-strong)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: i === 2 ? 'var(--moss-soft)' : 'transparent',
            }}>
              <FauxQR size={52} seed={c.length+i}/>
              <div className="mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink)' }}>{c}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 22px 0' }}>
        <button className="btn btn--primary" style={{ width: '100%' }}>
          <Icon.printer size={16}/> Print sheet
        </button>
        <button className="btn btn--ghost" style={{ width: '100%', marginTop: 8 }}>
          <Icon.plus size={16}/> Generate 12 more codes
        </button>
      </div>

      <BottomNav active="more"/>
    </div>
  );
}

Object.assign(window, { BatchFeedScreen, BatchFeedSelectScreen, ScanScreen, StickersScreen });
