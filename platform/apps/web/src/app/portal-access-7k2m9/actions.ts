'use server';

import { createClient } from '@supabase/supabase-js';

/**
 * Phone OTP sign-in (server-side only).
 *
 * Stage 1 (now, no SMS provider): we generate + verify the 6-digit code ourselves and
 * sign the user in with a real Supabase session via the admin API. The code is surfaced
 * in the server response (shown on screen) and logged — swap `deliverCode` for Twilio
 * when a provider is wired; nothing else changes.
 *
 * Phone format: India (+91) locked.
 */

function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, '');
  let national = digits;
  if (national.length === 12 && national.startsWith('91')) national = national.slice(2);
  if (national.length === 11 && national.startsWith('0')) national = national.slice(1);
  if (national.length !== 10 || !/^[6-9]/.test(national)) return null;
  return `+91${national}`;
}

type PhoneOtpResult =
  | { ok: true; devCode?: string }
  | { ok: false; error: string };

// In-memory OTP store (single-box dev). TTL 5 min, max 5 attempts.
const otpStore = new Map<string, { code: string; expires: number; attempts: number }>();

function getClient(roleKey: 'anon' | 'service') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    roleKey === 'service'
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Swap this when wiring Twilio: send `code` to `phoneE164` via SMS. */
async function deliverCode(phoneE164: string, code: string): Promise<{ devCode?: string }> {
  // No SMS provider configured yet — surface the code to the UI and log it.
  console.log(`[phone-otp] SMS (dev mode) -> ${phoneE164}: ${code}`);
  return { devCode: code };
}

/** Step 1: request an OTP for an Indian phone number. */
export async function requestPhoneOtp(rawPhone: string): Promise<PhoneOtpResult> {
  const phoneE164 = normalizeIndianPhone(rawPhone || '');
  if (!phoneE164) {
    return { ok: false, error: 'Enter a valid Indian mobile number (10 digits, starting 6-9).' };
  }

  const service = getClient('service');
  if (!service) return { ok: false, error: 'Server auth is not configured.' };

  // Only known (registered) phones may sign in — no self-signup via this gate.
  const { data: users, error: lookupError } = await service.auth.admin.listUsers();
  if (lookupError) return { ok: false, error: 'Could not verify number.' };

  const match = users.users.find((u) => u.phone === phoneE164);
  if (!match) {
    return { ok: false, error: 'This number is not registered. Ask the operations team to onboard you.' };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phoneE164, { code, expires: Date.now() + 5 * 60 * 1000, attempts: 0 });

  const { devCode } = await deliverCode(phoneE164, code);
  return { ok: true, devCode };
}

/** Step 2: verify the OTP and return a real session for the client to adopt. */
export async function verifyPhoneOtp(
  rawPhone: string,
  code: string
): Promise<
  | { ok: true; session: { access_token: string; refresh_token: string } }
  | { ok: false; error: string }
> {
  const phoneE164 = normalizeIndianPhone(rawPhone || '');
  if (!phoneE164) return { ok: false, error: 'Invalid number.' };

  const entry = otpStore.get(phoneE164);
  if (!entry) return { ok: false, error: 'No code requested. Request a new one.' };
  if (Date.now() > entry.expires) {
    otpStore.delete(phoneE164);
    return { ok: false, error: 'Code expired. Request a new one.' };
  }
  if (entry.attempts >= 5) {
    otpStore.delete(phoneE164);
    return { ok: false, error: 'Too many attempts. Request a new code.' };
  }
  entry.attempts += 1;

  if (entry.code !== code.trim()) {
    return { ok: false, error: 'Incorrect code.' };
  }
  otpStore.delete(phoneE164);

  // Mint a real session: admin magic-link OTP for the matched user, verified server-side.
  const service = getClient('service');
  const anon = getClient('anon');
  if (!service || !anon) return { ok: false, error: 'Server auth is not configured.' };

  const { data: users } = await service.auth.admin.listUsers();
  const match = users?.users.find((u) => u.phone === phoneE164);
  if (!match?.email) return { ok: false, error: 'Account misconfigured (no fallback identity).' };

  const linkRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/generate_link`,
    {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'magiclink', email: match.email }),
    }
  );
  if (!linkRes.ok) return { ok: false, error: 'Could not mint sign-in session.' };
  const linkData = (await linkRes.json()) as {
    email_otp?: string;
    properties?: { email_otp?: string };
  };
  const emailOtp = linkData.email_otp || linkData.properties?.email_otp;
  if (!emailOtp) return { ok: false, error: 'Sign-in link had no OTP.' };

  const { data: sessData, error: sessError } = await anon.auth.verifyOtp({
    email: match.email,
    token: emailOtp,
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


/** Step 0: is this phone registered? (used to branch to onboarding) */
export async function checkPhoneRegistered(rawPhone: string): Promise<
  { registered: true } | { registered: false } | { error: string }
> {
  const phoneE164 = normalizeIndianPhone(rawPhone || '');
  if (!phoneE164) return { error: 'Enter a valid Indian mobile number.' };
  const service = getClient('service');
  if (!service) return { error: 'Server auth is not configured.' };
  const { data: users, error } = await service.auth.admin.listUsers();
  if (error) return { error: 'Could not verify number.' };
  return { registered: users.users.some((u) => u.phone === phoneE164) };
}

export type OnboardingResult =
  | { ok: true }
  | { ok: false; error: string };

/** Submit a partner application (agent or DMC). Creates a pending account. */
export async function submitOnboarding(input: {
  role: 'agent' | 'dmc';
  phone: string;
  companyName: string;
  contactName: string;
  email?: string;
  bio?: string;
  destinations?: string[];
  businessReg: string;
  taxIdPan: string;
  gstNumber?: string;
  documentUrls?: string[];
}): Promise<OnboardingResult> {
  const phoneE164 = normalizeIndianPhone(input.phone || '');
  if (!phoneE164) return { ok: false, error: 'Enter a valid Indian mobile number (10 digits).' };
  if (!input.companyName?.trim() || !input.contactName?.trim()) {
    return { ok: false, error: 'Company and contact name are required.' };
  }
  if (!input.businessReg?.trim() || !input.taxIdPan?.trim()) {
    return { ok: false, error: 'Business registration number and PAN are required.' };
  }
  if (input.taxIdPan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(input.taxIdPan.trim().toUpperCase())) {
    return { ok: false, error: 'PAN must look like ABCDE1234F.' };
  }

  const service = getClient('service');
  if (!service) return { ok: false, error: 'Server auth is not configured.' };

  const { error } = await service.rpc('onboarding_submit_application', {
    p_role: input.role,
    p_phone: phoneE164,
    p_company_name: input.companyName.trim(),
    p_contact_name: input.contactName.trim(),
    p_business_reg: input.businessReg.trim(),
    p_tax_id_pan: input.taxIdPan.trim().toUpperCase(),
    p_email: input.email?.trim() || null,
    p_bio: input.bio?.trim() || null,
    p_destinations: input.destinations?.length ? input.destinations : null,
    p_gst_number: input.gstNumber?.trim() || null,
    p_document_urls: input.documentUrls?.length ? input.documentUrls : null,
  });
  if (error) {
    const msg = error.message || 'Could not submit application.';
    return { ok: false, error: msg.includes('already registered') ? 'This number is already registered — sign in instead.' : msg };
  }
  return { ok: true };
}
