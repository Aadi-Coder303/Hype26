import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import OrdersPageClient from './OrdersPageClient';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?next=/orders');
  }

  return <OrdersPageClient />;
}
