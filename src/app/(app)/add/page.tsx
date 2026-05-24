import { requireOwner } from '@/lib/context';
import AddReptileClient from './AddReptileClient';

export default async function AddReptilePage() {
  const ctx = await requireOwner();
  return <AddReptileClient ctx={ctx} />;
}
