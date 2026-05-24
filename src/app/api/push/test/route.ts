import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPushToSub } from '@/lib/push';

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: 'not signed in' }, { status: 401 });

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', user.id);

    if (!subs || subs.length === 0) {
      return NextResponse.json({ ok: false, error: 'no subscriptions for this user' });
    }

    let sent = 0;
    const deadIds: string[] = [];
    for (const sub of subs) {
      const result = await sendPushToSub(sub, {
        title: 'Repti-Track test',
        body: 'Push notifications are working! 🎉',
        url: '/',
        tag: 'repticube-test',
      });
      if (result.ok) sent++;
      if (result.gone) deadIds.push(sub.id);
    }

    if (deadIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', deadIds);
    }

    return NextResponse.json({ ok: true, sent, removed: deadIds.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'unknown' }, { status: 500 });
  }
}
