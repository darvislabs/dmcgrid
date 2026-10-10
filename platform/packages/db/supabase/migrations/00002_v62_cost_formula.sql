-- ═══════════════════════════════════════════════════════════
-- DMCGrid Platform Database Migration 00002
-- V62 Cost Formula: DB Function and Deals Trigger
-- PRD Rule R8: selling = (net × markup) + ancillary; agent margin 12% default
-- ═══════════════════════════════════════════════════════════

-- Type for V62 calculation result
create type v62_cost_breakdown as (
    net numeric(12, 2),
    markup_amount numeric(12, 2),
    ancillary_cost numeric(12, 2),
    ancillary_charge numeric(12, 2),
    ancillary_margin numeric(12, 2),
    subtotal numeric(12, 2),
    gst_amount numeric(12, 2),
    tcs_amount numeric(12, 2),
    customer_selling_price numeric(12, 2),
    gross_profit numeric(12, 2),
    cash_profit numeric(12, 2)
);

-- Core V62 Formula Function
create or replace function public.calculate_v62_deal_cost(
    p_net numeric,
    p_markup_value numeric default 12.00,
    p_markup_type markup_calc_type default 'percentage',
    p_ancillary_cost numeric default 0.00,
    p_ancillary_charge numeric default 0.00,
    p_gst_percentage numeric default 5.00,
    p_tcs_percentage numeric default 5.00,
    p_tds_paid numeric default 0.00,
    p_tds_payable numeric default 0.00
)
returns v62_cost_breakdown
language plpgsql
immutable
as $$
declare
    v_net numeric(12, 2) := coalesce(p_net, 0.00);
    v_markup_val numeric(12, 2) := coalesce(p_markup_value, 12.00);
    v_markup_amount numeric(12, 2);
    v_anc_cost numeric(12, 2) := coalesce(p_ancillary_cost, 0.00);
    v_anc_charge numeric(12, 2) := coalesce(p_ancillary_charge, 0.00);
    v_anc_margin numeric(12, 2);
    v_subtotal numeric(12, 2);
    v_gst_pct numeric(5, 2) := coalesce(p_gst_percentage, 5.00);
    v_gst_amt numeric(12, 2);
    v_tcs_pct numeric(5, 2) := coalesce(p_tcs_percentage, 5.00);
    v_tcs_amt numeric(12, 2);
    v_selling_price numeric(12, 2);
    v_gross_profit numeric(12, 2);
    v_cash_profit numeric(12, 2);
    v_result v62_cost_breakdown;
begin
    -- 1. Determine markup amount based on type
    if p_markup_type = 'fixed' then
        v_markup_amount := round(v_markup_val, 2);
    else
        v_markup_amount := round(v_net * (v_markup_val / 100.00), 2);
    end if;

    -- 2. Ancillary margin (difference between charge to customer and agent's direct cost)
    v_anc_margin := round(v_anc_charge - v_anc_cost, 2);

    -- 3. Pre-tax subtotal = net + agent margin + extra services charged
    v_subtotal := round(v_net + v_markup_amount + v_anc_charge, 2);

    -- 4. Statutory Taxes (GST on subtotal; TCS on subtotal + GST)
    v_gst_amt := round(v_subtotal * (v_gst_pct / 100.00), 2);
    v_tcs_amt := round((v_subtotal + v_gst_amt) * (v_tcs_pct / 100.00), 2);

    -- 5. Final selling price to traveler
    v_selling_price := round(v_subtotal + v_gst_amt + v_tcs_amt, 2);

    -- 6. Deal Profitability (gross & net after tracked TDS)
    v_gross_profit := round(v_markup_amount + v_anc_margin, 2);
    v_cash_profit := round(v_gross_profit - coalesce(p_tds_paid, 0.00) - coalesce(p_tds_payable, 0.00), 2);

    -- Populate composite type
    v_result.net := v_net;
    v_result.markup_amount := v_markup_amount;
    v_result.ancillary_cost := v_anc_cost;
    v_result.ancillary_charge := v_anc_charge;
    v_result.ancillary_margin := v_anc_margin;
    v_result.subtotal := v_subtotal;
    v_result.gst_amount := v_gst_amt;
    v_result.tcs_amount := v_tcs_amt;
    v_result.customer_selling_price := v_selling_price;
    v_result.gross_profit := v_gross_profit;
    v_result.cash_profit := v_cash_profit;

    return v_result;
end;
$$;

-- Trigger function to enforce and auto-compute V62 formula on deals table
create or replace function public.fn_deals_apply_v62_formula()
returns trigger
language plpgsql
as $$
declare
    v_calc v62_cost_breakdown;
    v_markup_input numeric(12, 2);
begin
    if new.markup_type = 'fixed' then
        v_markup_input := new.markup_fixed;
    else
        v_markup_input := new.markup_percentage;
    end if;

    v_calc := public.calculate_v62_deal_cost(
        p_net := new.net_cost,
        p_markup_value := v_markup_input,
        p_markup_type := new.markup_type,
        p_ancillary_cost := new.ancillary_cost,
        p_ancillary_charge := new.ancillary_charge,
        p_gst_percentage := new.gst_percentage,
        p_tcs_percentage := new.tcs_percentage,
        p_tds_paid := new.tds_paid,
        p_tds_payable := new.tds_payable
    );

    new.gross_margin := v_calc.gross_profit;
    new.gst_amount := v_calc.gst_amount;
    new.tcs_amount := v_calc.tcs_amount;
    new.customer_selling_price := v_calc.customer_selling_price;
    new.cash_profit := v_calc.cash_profit;
    new.updated_at := now();

    return new;
end;
$$;

create trigger trg_deals_before_save_v62
    before insert or update on public.deals
    for each row execute function public.fn_deals_apply_v62_formula();
