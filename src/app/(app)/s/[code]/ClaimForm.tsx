'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import SnakeForm, { SnakeFormData } from '@/components/SnakeForm';
import { BRAND } from '@/lib/theme';
import { today } from '@/lib/utils';

export default function ClaimForm({ qr_code }: { qr_code: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async (data: SnakeFormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Insert snake
    const { data: snake, error: snakeErr } = await supabase
      .from('snakes')
      .insert({ ...data, sticker_qr: qr_code, owner_id: user.id })
      .select()
      .single();

    if (snakeErr) {
      alert('Failed to create reptile: ' + snakeErr.message);
      return;
    }

    // Link sticker
    const { error: stickerErr } = await supabase
      .from('stickers')
      .update({ snake_id: snake.id, claimed_at: new Date().toISOString() })
      .eq('qr_code', qr_code);

    if (stickerErr) {
      alert('Reptile created but sticker link failed: ' + stickerErr.message);
    }

    router.push(`/snakes/${snake.id}`);
    router.refresh();
  };

  return (
    <>
      <div style={{ padding: 20, paddingBottom: 0 }}>
        <div style={{
          background: BRAND.gold, color: BRAND.dark, padding: 12, borderRadius: 12,
          fontWeight: 700, textAlign: 'center', fontFamily: 'monospace', letterSpacing: 2,
        }}>
          New sticker: {qr_code}
        </div>
      </div>
      <SnakeForm
        initial={{ acquired_date: today() }}
        onSave={handleSave}
        onCancel={() => router.push('/')}
      />
    </>
  );
}
