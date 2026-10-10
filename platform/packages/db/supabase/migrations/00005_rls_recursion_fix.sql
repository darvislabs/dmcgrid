-- FIX 2: break rfqs <-> rfq_matches policy recursion with a definer helper
create or replace function public.rfq_owned_by(rfq_id uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.rfqs where id = rfq_id and agent_id = uid);
$$;

create or replace function public.rfq_match_for_dmc(rfq_id uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.rfqs where id = rfq_id and agent_id = uid);
$$;

-- rewrite rfqs select policy to use the definer helper for the match branch
drop policy if exists rfqs_select_agent_matched_or_admin on public.rfqs;
create policy rfqs_select_agent_matched_or_admin on public.rfqs
  for select to authenticated
  using (
    agent_id = auth.uid()
    or is_admin()
    or (
      status in ('published','quoted','connected')
      and exists (
        select 1 from public.rfq_matches m
        where m.rfq_id = rfqs.id
          and m.dmc_id = auth.uid()
      )
    )
  );

-- rewrite rfq_matches select policy: definer helper instead of querying rfqs under RLS
drop policy if exists rfq_matches_select on public.rfq_matches;
create policy rfq_matches_select on public.rfq_matches
  for select to authenticated
  using (
    dmc_id = auth.uid()
    or is_admin()
    or exists (select 1 from public.rfqs r where r.id = rfq_matches.rfq_id and r.agent_id = auth.uid())
  );
