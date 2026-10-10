-- ═══════════════════════════════════════════════════════════
-- DMCGrid Platform Database Migration 00005
-- Seed Data: Credit Packs and Platform Subscription Plans
-- ═══════════════════════════════════════════════════════════

-- Seed Credit Packs
insert into public.credit_packs (id, name, credits, price_inr, gst_rate, is_active)
values
    ('10000000-0000-0000-0000-000000000001'::uuid, 'Starter Pack', 5, 999.00, 18.00, true),
    ('10000000-0000-0000-0000-000000000002'::uuid, 'Growth Pack', 20, 2499.00, 18.00, true),
    ('10000000-0000-0000-0000-000000000003'::uuid, 'Scale Pack', 50, 4999.00, 18.00, true)
on conflict (id) do update set
    name = excluded.name,
    credits = excluded.credits,
    price_inr = excluded.price_inr;

-- Seed Plans
insert into public.plans (id, plan_code, name, monthly_leads_included, price_inr, description, features, is_active)
values
    ('20000000-0000-0000-0000-000000000001'::uuid, 'STARTER', 'Starter Plan', 5, 999.00, 'Ideal for independent travel advisors sourcing curated itineraries.', '["5 verified DMC connections / month", "Standard AI extraction copilot", "Traveler proposal share links", "48h SLA response guarantee"]'::jsonb, true),
    ('20000000-0000-0000-0000-000000000002'::uuid, 'GROWTH', 'Growth Plan', 20, 2499.00, 'For boutique agencies managing high-volume outbound inquiries.', '["20 verified DMC connections / month", "Priority AI brief builder", "Multi-option comparison matrix", "Direct WhatsApp & Slack bridge", "Manager approval workflows"]'::jsonb, true),
    ('20000000-0000-0000-0000-000000000003'::uuid, 'SCALE', 'Scale Enterprise', 100, 9999.00, 'Custom travel infrastructure for high-scale tour operators.', '["Unlimited verified DMC matches", "Dedicated destination account manager", "Custom ERP / CRM API webhooks", "Tailored credit rollover", "24/7 VIP desk SLA"]'::jsonb, true)
on conflict (id) do update set
    name = excluded.name,
    monthly_leads_included = excluded.monthly_leads_included,
    price_inr = excluded.price_inr,
    features = excluded.features;
