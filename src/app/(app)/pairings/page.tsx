import { createClient } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/context';
import PairingsClient from './PairingsClient';

export default async function PairingsPage() {
  const ctx = await requireOwner();
  const supabase = createClient();
  const [pairingsRes, snakesRes] = await Promise.all([
    supabase.from('pairings').select('*').order('date', { ascending: false }),
    supabase.from('snakes').select('id, name, species, morph, sex').eq('archived', false),
  ]);

  return <PairingsClient pairings={pairingsRes.data || []} snakes={snakesRes.data || []} ctx={ctx} />;
}
