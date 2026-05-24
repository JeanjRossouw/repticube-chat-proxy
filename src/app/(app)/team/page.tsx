import { createClient } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/context';
import TeamClient from './TeamClient';

export default async function TeamPage() {
  const ctx = await requireOwner();
  const supabase = createClient();

  const [membersRes, invitesRes] = await Promise.all([
    supabase.from('team_members')
      .select('id, user_id, role, created_at, profiles!inner(id, email, display_name, created_at)')
      .eq('team_id', ctx.team.id)
      .order('created_at'),
    supabase.from('team_invitations')
      .select('*')
      .eq('team_id', ctx.team.id)
      .is('accepted_at', null)
      .order('created_at', { ascending: false }),
  ]);

  const members = (membersRes.data || []).map((m: any) => ({
    id: m.id,
    user_id: m.user_id,
    role: m.role,
    created_at: m.created_at,
    email: m.profiles?.email,
    display_name: m.profiles?.display_name,
  }));

  return <TeamClient ctx={ctx} members={members} invites={invitesRes.data || []} />;
}
