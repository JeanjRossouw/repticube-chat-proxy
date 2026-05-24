import { getAppContext } from '@/lib/context';
import { createClient } from '@/lib/supabase/server';
import NotificationsClient from './NotificationsClient';

export default async function NotificationsPage() {
  const ctx = await getAppContext();
  const supabase = createClient();
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, user_agent, created_at')
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: false });

  return <NotificationsClient ctx={ctx} subscriptions={subs || []} />;
}
