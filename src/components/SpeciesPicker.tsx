'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Species } from '@/lib/types';
import { BRAND } from '@/lib/theme';
import { inputStyle } from '@/components/UI';
import { Check, Search } from 'lucide-react';

export default function SpeciesPicker({
  value, onChange, onSpeciesSelected,
}: {
  value: string;
  onChange: (text: string) => void;
  onSpeciesSelected?: (species: Species) => void;
}) {
  const supabase = createClient();
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Species[]>([]);
  const [allSpecies, setAllSpecies] = useState<Species[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [linked, setLinked] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load species library once
  useEffect(() => {
    supabase.from('species').select('*').order('common_name').then(({ data }) => {
      if (data) setAllSpecies(data as Species[]);
    });
  }, []);

  // Filter on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = allSpecies.filter(s =>
      s.common_name.toLowerCase().includes(q) ||
      s.scientific_name.toLowerCase().includes(q)
    ).slice(0, 8);
    setResults(filtered);
  }, [query, allSpecies]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (species: Species) => {
    setQuery(species.common_name);
    onChange(species.common_name);
    onSpeciesSelected?.(species);
    setLinked(true);
    setShowResults(false);
  };

  const handleType = (text: string) => {
    setQuery(text);
    onChange(text);
    setLinked(false);
    setShowResults(true);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={e => handleType(e.target.value)}
          onFocus={() => query.trim() && setShowResults(true)}
          placeholder="Start typing... e.g. Ball Python"
          style={{ ...inputStyle, paddingRight: linked ? 36 : 36 }}
        />
        <div style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          color: linked ? BRAND.green : BRAND.ash, pointerEvents: 'none',
        }}>
          {linked ? <Check size={18} /> : <Search size={16} />}
        </div>
      </div>

      {linked && (
        <div style={{ fontSize: 11, color: BRAND.green, marginTop: 4, fontWeight: 600 }}>
          ✓ Care guide linked
        </div>
      )}

      {showResults && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'white', border: `1px solid ${BRAND.cream}`, borderRadius: 10,
          maxHeight: 280, overflowY: 'auto', zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}>
          {results.map(species => (
            <button
              key={species.id}
              type="button"
              onClick={() => handleSelect(species)}
              style={{
                width: '100%', padding: 12, background: 'transparent', border: 'none',
                borderBottom: `1px solid ${BRAND.cream}`, textAlign: 'left',
                cursor: 'pointer', display: 'block',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{species.common_name}</div>
              <div style={{ fontSize: 11, color: BRAND.ash, fontStyle: 'italic', marginTop: 2 }}>
                {species.scientific_name} • {species.category}
                {species.difficulty && ` • ${species.difficulty}`}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && query.trim() && results.length === 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'white', border: `1px solid ${BRAND.cream}`, borderRadius: 10,
          padding: 12, fontSize: 13, color: BRAND.ash, zIndex: 100,
        }}>
          No matching species in library. You can still type it manually — care guide just won't be linked.
        </div>
      )}
    </div>
  );
}
