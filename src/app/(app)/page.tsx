import { createClient } from '@/lib/supabase/server';
import { getAppContext } from '@/lib/context';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const ctx = await getAppContext();
  const supabase = createClient();

  const [snakesRes, feedingsRes, stickersRes] = await Promise.all([
    supabase.from('snakes').select('*').eq('archived', false).order('name'),
    supabase.from('feedings').select('*').order('date', { ascending: false }),
    supabase.from('stickers').select('*'),
  ]);

  return (
    <HomeClient
      snakes={snakesRes.data || []}
      feedings={feedingsRes.data || []}
      stickers={stickersRes.data || []}
      ctx={ctx}
    />
  );
}
