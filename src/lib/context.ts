import { createClient } from '@/lib/supabase/server';
import { AppContext, Team, Facility } from '@/lib/types';
import { redirect } from 'next/navigation';

/**
 * Loads the current user's app context (team, role, facilities).
 * Use in every server component that needs team-scoped data.
 * Redirects to login if not authenticated.
 */
export async function getAppContext(): Promise<AppContext> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: member } = await supabase
    .from('team_members')
    .select('team_id, role, teams!inner(id, owner_id, name, created_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!member) {
    // Shouldn't happen — trigger creates team on signup
    redirect('/login');
  }

  const team = member.teams as unknown as Team;

  const { data: facilities } = await supabase
    .from('facilities')
    .select('*')
    .eq('team_id', team.id)
    .order('display_order');

  return {
    userId: user.id,
    email: user.email || '',
    team,
    role: member.role as 'owner' | 'staff',
    facilities: (facilities || []) as Facility[],
  };
}

/** Owner-only guard. Redirects staff to home. */
export async function requireOwner(): Promise<AppContext> {
  const ctx = await getAppContext();
  if (ctx.role !== 'owner') redirect('/');
  return ctx;
}
