-- ============================================================================
-- DMCGrid Platform Migration: 00003_v62_cost_formula.sql
-- V62 Binding Cost Formula & Deal Profitability Calculations
-- PRD Compliance: R8 V62 cost formula binding:
-- selling = (net × markup) + ancillary; agent margin = 12% default, configurable
-- ============================================================================

-- Function to compute full financial breakdown per V62 formula
create or replace function public.calculate_v62_breakdown(
  p_net numeric,
  p_margin_rate numeric default 12.00,
  p_margin_type text default 'percentage',
  p_ancillary_costs numeric default 0,
  p_ancillary_charges numeric default 0,
  p_gst_pct numeric default 5.00,
  p_tcs_pct numeric default 5.00,
  p_tds_paid numeric default 0,
  p_tds_payable numeric default 0
)
returns table (
  net numeric,
  margin_amount numeric,
  ancillary_costs numeric,
  ancillary_charges numeric,
  ancillary_margin numeric,
  subtotal numeric,
  gst_amount numeric,
  tcs_amount numeric,
  total_customer_price numeric,
  gross_profit numeric,
  cash_profit numeric
) as $$
declare
  v_net numeric := coalesce(p_net, 0);
  v_margin_rate numeric := coalesce(p_margin_rate, 12.00);
  v_margin_amount numeric;
  v_anc_cost numeric := coalesce(p_ancillary_costs, 0);
  v_anc_charge numeric := coalesce(p_ancillary_charges, 0);
  v_anc_margin numeric;
  v_sub numeric;
  v_gst_pct numeric := coalesce(p_gst_pct, 5.00);
  v_gst numeric;
  v_tcs_pct numeric := coalesce(p_tcs_pct, 5.00);
  v_tcs numeric;
  v_total numeric;
  v_gross numeric;
  v_cash numeric;
begin
  -- 1. Compute Package Margin (Fixed or Percentage)
  if lower(p_margin_type) = 'fixed' then
    v_margin_amount := round(v_margin_rate, 2);
  else
    v_margin_amount := round((v_net * v_margin_rate / 100.0), 2);
  end if;

  -- 2. Ancillary Margin
  v_anc_margin := round((v_anc_charge - v_anc_cost), 2);

  -- 3. Subtotal = DMC Net + Agent Margin + Ancillary Customer Charge
  v_sub := round((v_net + v_margin_amount + v_anc_charge), 2);

  -- 4. Statutory Taxes (GST on Subtotal, TCS on Subtotal + GST)
  v_gst := round((v_sub * v_gst_pct / 100.0), 2);
  v_tcs := round(((v_sub + v_gst) * v_tcs_pct / 100.0), 2);

  -- 5. Final Customer Selling Price
  v_total := round((v_sub + v_gst + v_tcs), 2);

  -- 6. Profitability Engine
  v_gross := round((v_margin_amount + v_anc_margin), 2);
  v_cash := round((v_gross - coalesce(p_tds_paid, 0) - coalesce(p_tds_payable, 0)), 2);

  return query select
    v_net,
    v_margin_amount,
    v_anc_cost,
    v_anc_charge,
    v_anc_margin,
    v_sub,
    v_gst,
    v_tcs,
    v_total,
    v_gross,
    v_cash;
end;
$$ language plpgsql immutable;

-- Trigger to automatically enforce V62 formula on all deals
create or replace function public.apply_v62_deal_formula()
returns trigger as $$
declare
  r record;
begin
  select * into r from public.calculate_v62_breakdown(
    new.net_cost,
    new.margin_rate,
    new.margin_type,
    new.ancillary_costs,
    new.ancillary_charges,
    new.gst_pct,
    new.tcs_pct,
    new.tds_paid,
    new.tds_payable
  );

  new.margin_amount := r.margin_amount;
  new.ancillary_margin := r.ancillary_margin;
  new.subtotal := r.subtotal;
  new.gst_amount := r.gst_amount;
  new.tcs_amount := r.tcs_amount;
  new.total_customer_price := r.total_customer_price;
  new.gross_profit := r.gross_profit;
  new.cash_profit := r.cash_profit;
  new.updated_at := now();

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_apply_v62_deal_formula on public.deals;
create trigger trg_apply_v62_deal_formula
  before insert or update on public.deals
  for each row execute function public.apply_v62_deal_formula();
