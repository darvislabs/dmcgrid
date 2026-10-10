-- profiles sync: every new auth user gets a profile row (role from metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, contact_name, company_name, email, kyc_status)
  values (new.id,
          coalesce((new.raw_user_meta_data->>'role')::user_role, 'agent'),
          coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
          coalesce(new.raw_user_meta_data->>'company_name', '—'),
          new.email,
          'pending')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- backfill existing users
insert into public.profiles (id, role, contact_name, company_name, email, kyc_status)
select u.id,
       coalesce((u.raw_user_meta_data->>'role')::user_role, 'agent'),
       coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
       coalesce(u.raw_user_meta_data->>'company_name', '—'),
       u.email,
       'pending'
from auth.users u
on conflict (id) do nothing;
