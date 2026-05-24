import { createClient } from '@/lib/supabase/server';
import { getAppContext } from '@/lib/context';
import ForecastClient from './ForecastClient';

export default async function ForecastPage() {
  await getAppContext();
  const supabase = createClient();
  const [snakesRes, feedingsRes] = await Promise.all([
    supabase.from('snakes').select('*').eq('archived', false),
    supabase.from('feedings').select('*').order('date', { ascending: false }),
  ]);

  return <ForecastClient snakes={snakesRes.data || []} feedings={feedingsRes.data || []} />;
}
