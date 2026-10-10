import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database, UserRole } from '@dmcgrid/db';

export interface AuthSessionResult {
  response: NextResponse;
  user: {
    id: string;
    email: string;
    role: UserRole;
  } | null;
}

interface MiddlewareCookieToSet {
  name: string;
  value: string;
  options?: Parameters<NextResponse['cookies']['set']>[2];
}

export async function updateSession(request: NextRequest): Promise<AuthSessionResult> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: MiddlewareCookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let sessionUser: { id: string; email: string; role: UserRole } | null = null;

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      let authoritativeRole = (user.user_metadata?.role as UserRole) || 'agent';
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        const profileData = profile as { role?: UserRole } | null;
        if (profileData?.role) {
          authoritativeRole = profileData.role;
        }
      } catch {
        // Fallback to metadata
      }

      sessionUser = {
        id: user.id,
        email: user.email || '',
        role: authoritativeRole,
      };
    }
  } catch {
    // Session lookup failed — treat as unauthenticated in strict mode.
  }

  // Support demo / development testing when NEXT_PUBLIC_DEMO_MODE is true
  if (!sessionUser && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    const roleCookie = request.cookies.get('dmc_role')?.value as UserRole | undefined;
    if (roleCookie) {
      sessionUser = {
        id:
          roleCookie === 'dmc'
            ? 'd1111111-1111-1111-1111-111111111111'
            : roleCookie === 'admin'
            ? '0c634d73-1a35-409f-a6b3-f1f3e21ec822'
            : 'a1111111-1111-1111-1111-111111111111',
        email:
          roleCookie === 'dmc'
            ? 'bali@heritagetours.com'
            : roleCookie === 'admin'
            ? 'admin@dmcgrid.test'
            : 'zenith@luxurytravel.in',
        role: roleCookie,
      };
    }
  }

  return { response, user: sessionUser };
}
