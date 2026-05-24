import { createClient } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/context';
import StickersClient from './StickersClient';

export default async function StickersPage() {
  const ctx = await requireOwner();
  const supabase = createClient();
  const [stickersRes, snakesRes] = await Promise.all([
    supabase.from('stickers').select('*').order('created_at', { ascending: false }),
    supabase.from('snakes').select('id, name'),
  ]);

  return <StickersClient stickers={stickersRes.data || []} snakes={snakesRes.data || []} ctx={ctx} />;
}
