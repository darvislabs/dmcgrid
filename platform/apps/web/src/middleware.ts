import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/share/')
  ) {
    return NextResponse.next();
  }

  // 2. Fetch session and user role
  const { response, user } = await updateSession(request);

  // 3. Unauthenticated handling
  if (!user) {
    if (pathname === '/login') {
      return response;
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Authenticated user hitting /login
  if (pathname === '/login') {
    if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (user.role === 'dmc') {
      return NextResponse.redirect(new URL('/feed', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 5. Role-based route gating (PRD 4 Portals: Agent, DMC, Admin, Traveler)
  // Admin portal gate
  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL(user.role === 'dmc' ? '/feed' : '/', request.url));
  }

  // DMC portal gate (/feed, /briefs, /quotes, /dmc)
  const isDmcRoute =
    pathname.startsWith('/feed') ||
    pathname.startsWith('/briefs') ||
    pathname.startsWith('/quotes') ||
    pathname.startsWith('/dmc');

  if (isDmcRoute && user.role === 'agent') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Agent portal gate (/rfq, /wallet, /deals, /connections)
  const isAgentRoute =
    pathname.startsWith('/rfq') ||
    pathname.startsWith('/wallet') ||
    pathname.startsWith('/deals') ||
    pathname.startsWith('/connections');

  if (isAgentRoute && user.role === 'dmc') {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)'],
};
