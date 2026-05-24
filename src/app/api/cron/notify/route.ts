import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushToSub } from '@/lib/push';

// Daily feeding reminder cron.
// Scheduled by vercel.json: 0 6 * * * (06:00 UTC = 08:00 SAST)
// Uses service role to read across teams.

export async function GET(req: NextRequest) {
  // Verify the request is from Vercel cron
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ ok: false, error: 'service role key not set' }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Get all push subscriptions grouped by team
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('id, user_id, team_id, endpoint, p256dh, auth');

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'no subscriptions' });
  }

  // For each unique team, compute due/overdue counts
  const teamIds = Array.from(new Set(subs.map(s => s.team_id)));
  const dueCountByTeam: Record<string, { due: number; overdue: number }> = {};

  const today = new Date().toISOString().slice(0, 10);

  for (const teamId of teamIds) {
    // Get snakes for this team
    const { data: snakes } = await admin
      .from('snakes')
      .select('id')
      .eq('team_id', teamId)
      .eq('archived', false);

    if (!snakes || snakes.length === 0) {
      dueCountByTeam[teamId] = { due: 0, overdue: 0 };
      continue;
    }

    let due = 0, overdue = 0;
    for (const snake of snakes) {
      // Latest feeding for this snake
      const { data: feed } = await admin
        .from('feedings')
        .select('next_due')
        .eq('snake_id', snake.id)
        .not('next_due', 'is', null)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!feed?.next_due) continue;
      if (feed.next_due < today) overdue++;
      else if (feed.next_due === today) due++;
    }

    dueCountByTeam[teamId] = { due, overdue };
  }

  // Send notifications
  let sent = 0;
  const deadIds: string[] = [];

  for (const sub of subs) {
    const counts = dueCountByTeam[sub.team_id];
    if (!counts) continue;
    if (counts.due === 0 && counts.overdue === 0) continue; // skip if nothing due

    const parts: string[] = [];
    if (counts.due > 0) parts.push(`${counts.due} due today`);
    if (counts.overdue > 0) parts.push(`${counts.overdue} overdue`);

    const result = await sendPushToSub(sub, {
      title: 'Feeding reminder',
      body: parts.join(' • '),
      url: '/feed',
      tag: 'repticube-daily',
    });

    if (result.ok) sent++;
    if (result.gone) deadIds.push(sub.id);
  }

  // Clean up dead subscriptions
  if (deadIds.length > 0) {
    await admin.from('push_subscriptions').delete().in('id', deadIds);
  }

  return NextResponse.json({
    ok: true,
    sent,
    removed: deadIds.length,
    teams_checked: teamIds.length,
  });
}
