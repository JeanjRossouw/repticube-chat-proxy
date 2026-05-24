import { createClient } from '@/lib/supabase/server';
import AcceptInviteClient from './AcceptInviteClient';

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data: invite } = await supabase
    .from('team_invitations')
    .select('*, teams!inner(name)')
    .eq('token', params.token)
    .maybeSingle();

  return <AcceptInviteClient token={params.token} invite={invite} />;
}
