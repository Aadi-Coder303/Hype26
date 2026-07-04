import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { OWNER_EMAILS } from '@/lib/constants';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const isOwner = session?.user?.email && OWNER_EMAILS.includes(session.user.email);

  if (!isOwner) {
    redirect('/');
  }

  return <DashboardClient />;
}
