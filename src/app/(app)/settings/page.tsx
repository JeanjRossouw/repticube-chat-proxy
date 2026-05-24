import { createClient } from '@/lib/supabase/server';
import { getAppContext } from '@/lib/context';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const ctx = await getAppContext();
  const supabase = createClient();
  const [snakesRes, stickersRes, feedingsRes, weightsRes, pairingsRes, profileRes] = await Promise.all([
    supabase.from('snakes').select('id').eq('archived', false),
    supabase.from('stickers').select('claimed_at'),
    supabase.from('feedings').select('id'),
    supabase.from('weights').select('id'),
    ctx.role === 'owner' ? supabase.from('pairings').select('id') : Promise.resolve({ data: [] }),
    supabase.from('profiles').select('*').eq('id', ctx.userId).maybeSingle(),
  ]);

  return (
    <SettingsClient
      counts={{
        snakes: snakesRes.data?.length || 0,
        stickersTotal: stickersRes.data?.length || 0,
        stickersUnclaimed: stickersRes.data?.filter(s => !s.claimed_at).length || 0,
        feedings: feedingsRes.data?.length || 0,
        weights: weightsRes.data?.length || 0,
        pairings: pairingsRes.data?.length || 0,
      }}
      profile={profileRes.data}
      ctx={ctx}
    />
  );
}
