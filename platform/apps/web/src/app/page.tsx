import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  let role = (user.user_metadata?.role as string) || 'agent';
  try {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const profileRole = (profile as { role?: string } | null)?.role;
    if (profileRole) role = profileRole;
  } catch {
    // keep metadata role
  }
  if (role === 'admin') redirect('/admin');
  if (role === 'dmc') redirect('/feed');
  redirect('/rfq/new');
}
