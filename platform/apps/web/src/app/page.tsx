import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Loop-breaker: if a session cookie is present but getUser() failed (stale/expired token),
  // do NOT redirect to /login — middleware would bounce authed-looking requests back here and
  // the / <-> /login ping-pong renders as ERR_TOO_MANY_REDIRECTS. Land on login with a marker.
  const cookieStore = await cookies();
  const hasSessionCookie = cookieStore.getAll().some(c => c.name.startsWith('sb-') && c.name.includes('auth-token'));

  if (!user) {
    redirect(hasSessionCookie ? '/login?stale=1' : '/login');
  }

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
  redirect('/dashboard');  // agent default: dashboard (wizard one click away)
}
