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
    // Session lookup failed — treat as unauthenticated. No role-cookie backdoors in production paths.
  }

  return { response, user: sessionUser };
}
