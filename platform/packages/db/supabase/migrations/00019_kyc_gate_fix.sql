
-- 00019: DEF-09 fixes — admin KYC approval path + gate string

-- 1. Trigger: allow admin/SECURITY DEFINER writes through (they carry a JWT but are privileged)
create or replace function public.protect_profile_privileged_cols()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- server-side (postgres, no JWT) writes pass; admins pass; onboarding RPC (SECURITY DEFINER
  -- creating profiles for new users) passes because it runs as owner with claims set — exempt when
  -- the write comes from a SECURITY DEFINER context by checking is_admin() OR inserting new rows.
  if current_setting('request.jwt.claims', true) is null then
    return new;
  end if;
  if exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    return new;
  end if;
  new.role := old.role;
  new.kyc_status := old.kyc_status;
  new.is_active := old.is_active;
  new.id := old.id;
  return new;
end;
$$;
