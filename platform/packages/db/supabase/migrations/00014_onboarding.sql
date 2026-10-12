-- 00014: Onboarding — self-serve application for Travel Agents and DMCs
-- Flow: phone sign-in (unregistered) → role + company + KYC form → pending → admin reviews.

-- ============================================================
-- 1. onboarding_submit_application: creates auth user + profile + KYC in one call.
--    Called by the hidden portal BEFORE any session exists → SECURITY DEFINER with
--    service-side validation. Rate/abuse protection: phone must be a fresh valid +91.
-- ============================================================
create or replace function public.onboarding_submit_application(
  p_role            text,              -- 'agent' | 'dmc'
  p_phone           text,              -- E.164 +91XXXXXXXXXX (must be confirmed-capable)
  p_company_name    text,
  p_contact_name    text,
  p_business_reg    text,
  p_tax_id_pan      text,
  p_email           text default null,
  p_bio             text default null,
  p_destinations    text[] default '{}',
  p_gst_number      text default null,
  p_document_urls   jsonb default '[]'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_id       uuid;
  v_role     user_role;
  v_existing uuid;
begin
  -- role gate: onboarding is for agents and DMCs only (admin is internal)
  if p_role not in ('agent','dmc') then
    raise exception 'Invalid role';
  end if;
  v_role := p_role::user_role;

  -- normalize + validate Indian phone
  if p_phone !~ '^\+91[6-9][0-9]{9}$' then
    raise exception 'Invalid Indian mobile number';
  end if;

  -- dedupe: phone already registered?
  select id into v_existing from auth.users where phone = p_phone;
  if v_existing is not null then
    raise exception 'This number is already registered';
  end if;

  -- company name + contact required
  if length(trim(p_company_name)) < 2 or length(trim(p_contact_name)) < 2 then
    raise exception 'Company and contact names are required';
  end if;
  if length(trim(p_business_reg)) < 2 or length(trim(p_tax_id_pan)) < 4 then
    raise exception 'Business registration and PAN are required';
  end if;

  -- create the auth user (phone-first; email optional secondary)
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change, phone, phone_confirmed_at
  ) values (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    nullif(trim(p_email), ''), crypt('oauth2-no-password-' || gen_random_uuid()::text, gen_salt('bf')),
    '{"provider":"phone","providers":["phone"]}'::jsonb,
    jsonb_build_object('role', v_role, 'full_name', trim(p_contact_name), 'company_name', trim(p_company_name)),
    now(), now(), '', '', '', '', p_phone, now()
  )
  returning id into v_id;

  -- profile row (kyc_status lives on profiles as a mirror for fast gating)
  insert into public.profiles (
    id, role, company_name, contact_name, email, phone,
    kyc_status, bio, operating_destinations
  ) values (
    v_id, v_role, trim(p_company_name), trim(p_contact_name), nullif(trim(p_email), ''), p_phone,
    'pending', nullif(trim(p_bio), ''), coalesce(p_destinations, '{}')
  )
  on conflict (id) do update set
    role = excluded.role,
    company_name = excluded.company_name,
    contact_name = excluded.contact_name,
    email = excluded.email,
    phone = excluded.phone,
    kyc_status = 'pending',
    bio = excluded.bio,
    operating_destinations = excluded.operating_destinations;

  -- KYC record (submitted, awaiting admin review)
  insert into public.kyc_records (
    profile_id, business_reg_number, tax_id_pan, gst_number,
    documents_urls, status, submitted_at
  ) values (
    v_id, trim(p_business_reg), upper(trim(p_tax_id_pan)), nullif(trim(p_gst_number), ''),
    coalesce(p_document_urls, '[]'::jsonb), 'pending', now()
  );

  insert into public.audit_log (actor_id, action, entity_type, entity_id, new_state)
  values (v_id, 'ONBOARDING_SUBMITTED', 'profile', v_id::text,
          jsonb_build_object('role', v_role, 'phone', p_phone, 'company', trim(p_company_name)));

  return v_id;
end;
$$;

-- ============================================================
-- helper (defined first — the policy below references it)
-- helper: is the caller KYC-verified?
create or replace function public.kyc_verified()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_active = true
      and kyc_status in ('verified')
  );
$$;

-- 2. KYC gate on transactions: only KYC-verified (or admin) partners transact.
--    Patch rfqs_insert_agent to require verified KYC.
-- ============================================================
drop policy if exists rfqs_insert_agent on public.rfqs;
create policy rfqs_insert_agent on public.rfqs
  for insert to authenticated
  with check (
    (agent_id = auth.uid() and is_agent() and kyc_verified()) 
    or is_admin()
  );


grant execute on function public.kyc_verified() to authenticated;
grant execute on function public.onboarding_submit_application(text, text, text, text, text, text, text, text, text[], text, jsonb) to anon, authenticated;

-- Seed partners with completed KYC are demo-verified (their reviews happened in wave-1 seed)
update public.profiles set kyc_status = 'verified'
  where id in ('a1111111-1111-1111-1111-111111111111','d1111111-1111-1111-1111-111111111111');
update public.kyc_records set status = 'verified', reviewed_at = now()
  where profile_id in ('a1111111-1111-1111-1111-111111111111','d1111111-1111-1111-1111-111111111111')
    and status in ('pending','draft');
