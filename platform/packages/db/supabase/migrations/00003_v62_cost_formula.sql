-- ==============================================================================
-- DMCGrid Database Migration: 00003_v62_cost_formula.sql
-- Binding V62 Cost Formula as DB Function & Trigger on Deals Table
-- Rule R8: selling = (net * markup) + ancillary; agent margin = 12% default, configurable
-- GST: 18% default; TCS: 2% flat (w.e.f. 01.04.2026 §394(1) ITA 2025)
-- ==============================================================================

-- 1. Pure DB Function for V62 Cost Build-up
CREATE OR REPLACE FUNCTION calculate_v62_cost(
    p_net_rate NUMERIC,
    p_margin_pct NUMERIC DEFAULT 12.00,
    p_ancillary_total NUMERIC DEFAULT 0.00,
    p_gst_rate_pct NUMERIC DEFAULT 18.00,
    p_tcs_rate_pct NUMERIC DEFAULT 2.00
) RETURNS TABLE (
    net_rate NUMERIC,
    margin_pct NUMERIC,
    margin_amount NUMERIC,
    ancillary_total NUMERIC,
    selling_subtotal NUMERIC,
    gst_rate_pct NUMERIC,
    gst_amount NUMERIC,
    tcs_rate_pct NUMERIC,
    tcs_amount NUMERIC,
    total_customer_price NUMERIC
) AS $$
DECLARE
    v_net NUMERIC := COALESCE(p_net_rate, 0.00);
    v_margin_pct NUMERIC := COALESCE(p_margin_pct, 12.00);
    v_ancillary NUMERIC := COALESCE(p_ancillary_total, 0.00);
    v_gst_pct NUMERIC := COALESCE(p_gst_rate_pct, 18.00);
    v_tcs_pct NUMERIC := COALESCE(p_tcs_rate_pct, 2.00);

    v_margin_amt NUMERIC;
    v_subtotal NUMERIC;
    v_gst_amt NUMERIC;
    v_tcs_amt NUMERIC;
    v_customer_price NUMERIC;
BEGIN
    -- 1. Calculate margin amount on DMC net rate
    v_margin_amt := ROUND((v_net * (v_margin_pct / 100.0)), 2);

    -- 2. Subtotal = net + margin + sum of ancillary services
    v_subtotal := v_net + v_margin_amt + v_ancillary;

    -- 3. Taxes applied to subtotal (order of operations: +GST, +TCS)
    v_gst_amt := ROUND((v_subtotal * (v_gst_pct / 100.0)), 2);
    v_tcs_amt := ROUND((v_subtotal * (v_tcs_pct / 100.0)), 2);

    -- 4. Customer price = subtotal + GST + TCS
    v_customer_price := v_subtotal + v_gst_amt + v_tcs_amt;

    RETURN QUERY SELECT
        v_net,
        v_margin_pct,
        v_margin_amt,
        v_ancillary,
        v_subtotal,
        v_gst_pct,
        v_gst_amt,
        v_tcs_pct,
        v_tcs_amt,
        v_customer_price;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Trigger on deals table to auto-apply V62 calculations
CREATE OR REPLACE FUNCTION trg_apply_deal_v62_formula()
RETURNS TRIGGER AS $$
DECLARE
    calc_record RECORD;
BEGIN
    -- Sum up ancillary items from JSONB if provided
    IF NEW.ancillary_charges IS NOT NULL AND jsonb_array_length(NEW.ancillary_charges) > 0 THEN
        SELECT COALESCE(SUM((item->>'charge')::numeric), 0.00)
        INTO NEW.ancillary_total
        FROM jsonb_array_elements(NEW.ancillary_charges) AS item;
    ELSE
        NEW.ancillary_total := COALESCE(NEW.ancillary_total, 0.00);
    END IF;

    -- Run calculation
    SELECT * INTO calc_record FROM calculate_v62_cost(
        NEW.net_rate,
        NEW.agent_margin_pct,
        NEW.ancillary_total,
        NEW.gst_rate_pct,
        NEW.tcs_rate_pct
    );

    NEW.agent_margin_amount := calc_record.margin_amount;
    NEW.selling_subtotal := calc_record.selling_subtotal;
    NEW.gst_amount := calc_record.gst_amount;
    NEW.tcs_amount := calc_record.tcs_amount;
    NEW.total_customer_price := calc_record.total_customer_price;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deals_v62_calculation
BEFORE INSERT OR UPDATE ON deals
FOR EACH ROW EXECUTE FUNCTION trg_apply_deal_v62_formula();
