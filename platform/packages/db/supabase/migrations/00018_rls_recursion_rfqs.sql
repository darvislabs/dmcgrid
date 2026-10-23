-- 00018: DEF-08 fix — RLS infinite recursion on rfqs via cross-table policy.
-- Replace inline cross-table EXISTS with SECURITY DEFINER helper functions.

-- Helper: can the caller SEE this rfq? (agent owner | admin | matched dmc | published-open)
create or replace function public.rfq_visible_to(rfq_row public.rfqs)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    rfq_row.agent_id = auth.uid()
    or is_admin()
    or (
      rfq_row.status in ('published','quoted','connected')
      and exists (
        select 1 from public.rfq_matches m
        where m.rfq_id = rfq_row.id and m.dmc_id = auth.uid()
      )
    );
$$;

grant execute on function public.rfq_visible_to(public.rfqs) to authenticated;

-- Helper: DMC matched to rfq?
create or replace function public.rfq_matched_to_dmc(p_rfq_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.rfq_matches m
    where m.rfq_id = p_rfq_id and m.dmc_id = auth.uid()
  );
$$;

grant execute on function public.rfq_matched_to_dmc(uuid) to authenticated;

-- Replace the recursive SELECT policy
drop policy if exists rfqs_select_agent_matched_or_admin on public.rfqs;
create policy rfqs_select_agent_matched_or_admin on public.rfqs
  for select to authenticated
  using (rfq_visible_to(rfq_row := rfqs));

-- Fix rfq_matches_select similarly (it referenced rfqs back)
drop policy if exists rfq_matches_select on public.rfq_matches;
create policy rfq_matches_select on public.rfq_matches
  for select to authenticated
  using (
    dmc_id = auth.uid()
    or is_admin()
    or exists (
      select 1 from public.rfqs r
      where r.id = rfq_matches.rfq_id
        and r.agent_id = auth.uid()
    )
  );
