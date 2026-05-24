'use client';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { Card, Section, DetailRow, btnSecondary, btnDanger } from '@/components/UI';
import { BRAND } from '@/lib/theme';
import { createClient } from '@/lib/supabase/client';
import { today } from '@/lib/utils';
import { Profile, AppContext } from '@/lib/types';
import { Users, Bell, Printer, Download, LogOut } from 'lucide-react';

export default function SettingsClient({ counts, profile, ctx }: {
  counts: any;
  profile: Profile | null;
  ctx: AppContext;
}) {
  const router = useRouter();
  const supabase = createClient();
  const isOwner = ctx.role === 'owner';

  const exportData = async () => {
    const [snakes, stickers, feedings, weights, pairings] = await Promise.all([
      supabase.from('snakes').select('*'),
      supabase.from('stickers').select('*'),
      supabase.from('feedings').select('*'),
      supabase.from('weights').select('*'),
      isOwner ? supabase.from('pairings').select('*') : Promise.resolve({ data: [] }),
    ]);
    const backup = {
      snakes: snakes.data, stickers: stickers.data,
      feedings: feedings.data, weights: weights.data, pairings: pairings.data,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repticube-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <AppHeader title="Settings" />
      <div style={{ padding: 20 }}>
        <Section title="Account">
          <Card>
            <DetailRow label="Email" value={profile?.email} />
            <DetailRow label="Role" value={isOwner ? 'Owner' : `Staff · ${ctx.team.name}`} last />
          </Card>
        </Section>

        <Section title="Notifications">
          <button onClick={() => router.push('/settings/notifications')} style={{ ...btnSecondary, marginBottom: 8 }}>
            <Bell size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Manage feeding reminders
          </button>
        </Section>

        {isOwner && (
          <Section title="Team">
            <button onClick={() => router.push('/team')} style={{ ...btnSecondary, marginBottom: 8 }}>
              <Users size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Manage staff &amp; facilities
            </button>
          </Section>
        )}

        <Section title="Your collection">
          <Card>
            <DetailRow label="Reptiles" value={counts.snakes} />
            <DetailRow label="Stickers (total)" value={counts.stickersTotal} />
            <DetailRow label="Stickers (unclaimed)" value={counts.stickersUnclaimed} />
            <DetailRow label="Feedings logged" value={counts.feedings} />
            <DetailRow label="Weights logged" value={counts.weights} />
            {isOwner && <DetailRow label="Pairings" value={counts.pairings} last />}
          </Card>
        </Section>

        <Section title="Data">
          {isOwner && (
            <button onClick={() => router.push('/stickers')} style={{ ...btnSecondary, marginBottom: 8 }}>
              <Printer size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Manage stickers
            </button>
          )}
          <button onClick={exportData} style={{ ...btnSecondary, marginBottom: 8 }}>
            <Download size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Export backup (JSON)
          </button>
        </Section>

        <Section title="Session">
          <button onClick={signOut} style={btnDanger}>
            <LogOut size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Sign out
          </button>
        </Section>

        <div style={{ textAlign: 'center', color: BRAND.ash, fontSize: 12, marginTop: 32 }}>
          Repti-Track v0.4<br/>
          Built for Jean
        </div>
      </div>
    </>
  );
}
