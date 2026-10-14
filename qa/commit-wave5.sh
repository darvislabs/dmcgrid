cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "Wave 5: FinFly-style RFQ wizard + 2-credit publish fee" -m "- /rfq/new rebuilt: 8-step single-column questionnaire (AI paste step, trip type cards, traveler steppers, city-nights route rows, dates+pace cards, stays chips, experience chips, budget + FinFly review card with pill summary)
- all current fields preserved; children persisted properly (rfq_destinations/rfq_stays/rfq_experiences)
- migration 00015: agent_create_rfq SECURITY DEFINER — KYC gate, wallet lock, 2-credit publish fee with double-entry ledger, auto-match verified DMCs, notifications, audit
- INSUFFICIENT_CREDITS -> upsell state (plans + top-up CTA)
- verified: e2e-wave5 full flow PASS (publish -> RFQ-2026-0009 -> detail page), fee debits confirmed in ledger, insufficient-balance upsell confirmed live, mobile sticky-CTA overlap fixed (viewport-verified), prod E2E 12/12" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1
git ls-remote origin master | cut -c1-7
