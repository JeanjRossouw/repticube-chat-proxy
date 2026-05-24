import { createClient } from '@/lib/supabase/server';
import { getAppContext } from '@/lib/context';
import SnakesListClient from './SnakesListClient';

export default async function SnakesPage() {
  const ctx = await getAppContext();
  const supabase = createClient();
  const [snakesRes, feedingsRes, weightsRes] = await Promise.all([
    supabase.from('snakes').select('*').eq('archived', false).order('name'),
    supabase.from('feedings').select('snake_id, date').order('date', { ascending: false }),
    supabase.from('weights').select('snake_id, grams, date').order('date', { ascending: false }),
  ]);

  return (
    <SnakesListClient
      snakes={snakesRes.data || []}
      feedings={feedingsRes.data || []}
      weights={weightsRes.data || []}
      ctx={ctx}
    />
  );
}
