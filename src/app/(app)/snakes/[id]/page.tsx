import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getAppContext } from '@/lib/context';
import SnakeDetailClient from './SnakeDetailClient';

export default async function SnakeDetailPage({ params }: { params: { id: string } }) {
  const ctx = await getAppContext();
  const supabase = createClient();
  const [snakeRes, feedingsRes, weightsRes, pairingsRes, allSnakesRes, membersRes] = await Promise.all([
    supabase.from('snakes').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('feedings').select('*').eq('snake_id', params.id).order('date', { ascending: false }),
    supabase.from('weights').select('*').eq('snake_id', params.id).order('date', { ascending: false }),
    ctx.role === 'owner'
      ? supabase.from('pairings').select('*').or(`male_id.eq.${params.id},female_id.eq.${params.id}`)
      : Promise.resolve({ data: [] }),
    supabase.from('snakes').select('id, name, species, morph'),
    supabase.from('team_members').select('user_id, role, profiles!inner(id, email, display_name, created_at)').eq('team_id', ctx.team.id),
  ]);

  if (!snakeRes.data) notFound();

  let species = null;
  if (snakeRes.data.species_id) {
    const { data } = await supabase
      .from('species')
      .select('*')
      .eq('id', snakeRes.data.species_id)
      .maybeSingle();
    species = data;
  }

  // Build a map of user_id -> display name for audit trail
  const memberNames: Record<string, string> = {};
  (membersRes.data || []).forEach((m: any) => {
    const p = m.profiles;
    memberNames[m.user_id] = p?.display_name || p?.email?.split('@')[0] || 'Unknown';
  });

  return (
    <SnakeDetailClient
      snake={snakeRes.data}
      species={species}
      feedings={feedingsRes.data || []}
      weights={weightsRes.data || []}
      pairings={pairingsRes.data || []}
      allSnakes={allSnakesRes.data || []}
      ctx={ctx}
      memberNames={memberNames}
    />
  );
}
