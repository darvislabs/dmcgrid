-- FIX: helper functions used in RLS policies must be SECURITY DEFINER to avoid
-- policy recursion (is_admin reads profiles; profiles policy calls is_admin).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon, service_role;
