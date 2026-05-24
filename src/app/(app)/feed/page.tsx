import { createClient } from '@/lib/supabase/server';
import { getAppContext } from '@/lib/context';
import FeedClient from './FeedClient';

export default async function FeedPage() {
  const ctx = await getAppContext();
  const supabase = createClient();
  const [snakesRes, feedingsRes, speciesRes] = await Promise.all([
    supabase.from('snakes').select('*').eq('archived', false).order('name'),
    supabase.from('feedings').select('*').order('date', { ascending: false }),
    supabase.from('species').select('id, category'),
  ]);

  const categoryBySpeciesId: Record<string, string> = {};
  (speciesRes.data || []).forEach(s => { categoryBySpeciesId[s.id] = s.category; });

  return (
    <FeedClient
      snakes={snakesRes.data || []}
      feedings={feedingsRes.data || []}
      categoryBySpeciesId={categoryBySpeciesId}
      ctx={ctx}
    />
  );
}
