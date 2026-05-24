import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ClaimForm from './ClaimForm';
import AppHeader from '@/components/AppHeader';
import { BRAND } from '@/lib/theme';

export default async function StickerPage({ params }: { params: { code: string } }) {
  const supabase = createClient();
  const code = params.code.toUpperCase();

  const { data: sticker } = await supabase
    .from('stickers')
    .select('*')
    .eq('qr_code', code)
    .maybeSingle();

  if (!sticker) {
    return (
      <>
        <AppHeader title="Sticker not found" back />
        <div style={{ padding: 20 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Code {code} not found</div>
            <div style={{ fontSize: 14, color: BRAND.ash }}>
              Generate this sticker batch in Settings → Manage stickers first.
            </div>
          </div>
        </div>
      </>
    );
  }

  if (sticker.claimed_at && sticker.snake_id) {
    redirect(`/snakes/${sticker.snake_id}`);
  }

  return (
    <>
      <AppHeader title="Assign sticker" back />
      <ClaimForm qr_code={code} />
    </>
  );
}
