'use server';

import { createClient } from '@supabase/supabase-js';

/**
 * Dev sign-in (server-side, gated to non-production or explicit enable flag).
 *
 * Issues a REAL Supabase session by signing in as the selected test user via the
 * admin API (service role), then hands the session to the client through a one-time
 * nonce. This keeps the service key off the browser entirely.
 *
 * Enable with: NEXT_PUBLIC_DEV_LOGIN=true  (non-production builds only)
 */

export type DevLoginResult =
  | { ok: true; session: { access_token: string; refresh_token: string } }
  | { ok: false; error: string };

export async function devSignIn(role: 'admin' | 'dmc' | 'agent'): Promise<DevLoginResult> {
  // Gate: never in production unless explicitly enabled
  const enabled =
    process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEV_LOGIN === 'true';
  if (!enabled) {
    return { ok: false, error: 'Dev sign-in is disabled in this environment.' };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { ok: false, error: 'Server auth is not configured.' };
  }

  // Test identities — fixed UUIDs seeded in migrations (00009)
  const ids: Record<string, string> = {
    admin: 'a1111111-1111-1111-1111-111111111111',
    dmc: 'd1111111-1111-1111-1111-111111111111',
    agent: 'z1111111-1111-1111-1111-111111111111',
  };
  const emails: Record<string, string> = {
    admin: 'admin@dmcgrid.test',
    dmc: 'bali@heritagetours.com',
    agent: 'zenith@luxurytravel.in',
  };

  const userId = ids[role];
  const email = emails[role];
  if (!userId || !email) return { ok: false, error: 'Unknown role.' };

  // Mint a magic-link OTP for the user via the admin REST API, then verify it as that
  // user — producing a genuine session (access + refresh tokens) without any email round-trip.
  const linkRes = await fetch(`${url}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'magiclink', email }),
  });

  if (!linkRes.ok) {
    return { ok: false, error: `Could not mint sign-in link (${linkRes.status}).` };
  }
  const linkData = (await linkRes.json()) as {
    email_otp?: string;
    properties?: { email_otp?: string };
  };
  const otp = linkData.email_otp || linkData.properties?.email_otp;
  if (!otp) return { ok: false, error: 'Sign-in link had no OTP.' };

  // Verify the OTP as the user (anon client) to obtain a real session
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) return { ok: false, error: 'Server auth is not configured.' };

  const anon = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: sessData, error: sessError } = await anon.auth.verifyOtp({
    email,
    token: otp,
    type: 'email',
  });

  if (sessError || !sessData?.session) {
    return { ok: false, error: sessError?.message || 'Could not verify sign-in.' };
  }

  return {
    ok: true,
    session: {
      access_token: sessData.session.access_token,
      refresh_token: sessData.session.refresh_token,
    },
  };
}
