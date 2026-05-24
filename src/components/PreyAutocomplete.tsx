'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { BRAND } from '@/lib/theme';
import { inputStyle } from './UI';

export default function PreyAutocomplete({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (opt: string) => {
    if (opt === 'Other...') {
      setCustomMode(true);
      onChange('');
      setOpen(false);
    } else {
      onChange(opt);
      setCustomMode(false);
      setOpen(false);
    }
  };

  // If the current value isn't in options, treat as custom
  const isCustomValue = value && !options.includes(value);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {customMode || isCustomValue ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || 'Type custom...'}
            style={{ ...inputStyle, flex: 1 }}
            autoFocus={customMode}
          />
          <button
            type="button"
            onClick={() => { setCustomMode(false); onChange(''); setOpen(true); }}
            style={{
              background: BRAND.cream, border: 'none', borderRadius: 8,
              padding: '0 12px', fontSize: 12, fontWeight: 600,
              color: BRAND.ink, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            ← List
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            ...inputStyle, textAlign: 'left', cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            color: value ? BRAND.ink : BRAND.ash,
          }}
        >
          <span>{value || placeholder || 'Select...'}</span>
          <ChevronDown size={16} color={BRAND.ash} />
        </button>
      )}

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'white', border: `1px solid ${BRAND.cream}`, borderRadius: 10,
          maxHeight: 240, overflowY: 'auto', zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}>
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => pick(opt)}
              style={{
                width: '100%', padding: '10px 12px', background: 'transparent', border: 'none',
                borderBottom: `1px solid ${BRAND.cream}`, textAlign: 'left',
                cursor: 'pointer', fontSize: 14,
                color: opt === 'Other...' ? BRAND.green : BRAND.ink,
                fontWeight: opt === 'Other...' ? 600 : 500,
                fontStyle: opt === 'Other...' ? 'italic' : 'normal',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
