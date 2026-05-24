import BottomNav from '@/components/BottomNav';
import { getAppContext } from '@/lib/context';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAppContext();
  return (
    <>
      <div style={{ paddingBottom: 90 }}>{children}</div>
      <BottomNav role={ctx.role} />
    </>
  );
}
