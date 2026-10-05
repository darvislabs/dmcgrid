# DMCGrid — Operations + Unit Economics Blueprint
**Research date:** 5 October 2026 · **Scope:** India B2B travel trade · **Decision supported:** unit economics + ops design before committing ~6 weeks of build (concierge MVP, DMC matching run manually by ops)

---

## Executive summary

1. **₹999/connect is cheap-to-fair for agents, and it is the right entry price.** A ₹999 connect that yields one booked package with a ₹15k–40k margin returns 15–40x. Break-even close rates are 6.7% (₹15k margin) / 4.0% (₹25k) / 2.5% (₹40k) — far below the 20–25% conversion rates platforms themselves claim on verified leads. Even at a pessimistic 1-in-10 close, the agent pays ₹9,990 per booking against a ₹15–40k margin (1.5–4x ROI). Market comparison: JustDial-style shared leads ≈₹100/lead → ₹400–2,000/booking at claimed-vs-realistic close rates; TravelTriangle takes a reported 5–8% of package value per booking (₹2,500–8,000 on a ₹50k–100k package, and it stacks on every booking). DMCGrid's per-connect fee is cheaper than TT's commission load at ≥2 connects/booking and never compounds on booking value.
2. **The subscription tiers are the real business; the wallet is the on-ramp.** Effective per-credit cost drops from ₹999 (wallet PAYG) to ₹199.80 (Starter), ₹124.95 (Growth), ₹100 (Pro). Contribution margin per connect is ~93.7% on wallet PAYG but ~50% on Growth-tier credits and ~37% on Pro-tier credits once ops cost (~₹37/connect) is included — healthy gross margins either way, but tier mix matters: every agent who upgrades from wallet to Starter+ nearly halves per-connect revenue.
3. **For DMCs, DMCGrid quote-credits (₹80–150) are 3–30x cheaper than the lead channels they pay for today.** A 9 sqm OTM booth costs ₹6.5–7.5L all-in (published bare-space ₹44,000/sqm) → ₹2,300–5,800 per qualified lead/quote. HelloTravel's ₹14,999/30-day plan and TripClap's per-lead model set the digital floor; DMCGrid subscriptions at ₹1,499–7,999/mo undercut both on effective cost with better lead quality (verified-agent B2B RFQs, 2-DMC competition cap). The DMC-side value proposition is the strongest part of the model.
4. **Platform unit costs are negligible; human cost is the business.** Razorpay 2.36% effective (2% + 18% GST), WhatsApp ~₹1.77/connect (post-Oct-2026 rates), AI structuring ~₹0.03–0.09/RFQ on GLM-flash-class models. A fully-loaded ops person costs ₹57–114 per RFQ at 50–100% utilization — 10–100x larger than all platform variable costs combined. In concierge MVP mode, ops is the platform.
5. **Break-even: ~38 paying accounts on ₹98.5k/mo fixed cost (base-case blended ARPU ₹2,640); 25 accounts in the lean founder-only variant.** Six-month scenarios: Bear −₹4.79L cumulative (no break-even), Base −₹2.75L cumulative with first cash-positive month at M6, Bull −₹1.84L with first cash-positive month at M5. Capital needed to reach base-case break-even: **~₹3–4L including CAC spend** — comfortably inside a bootstrap envelope.
6. **CAC/LTV is unusually attractive if channel discipline holds.** Realistic CAC ₹800–3,000 (plan at ₹1,500) via TAAI/OTOAI events, WhatsApp trade groups, and tier-2 agent outreach. LTV at proposed pricing: agent ₹18k–44k, DMC ₹33k–55k → LTV:CAC 12–37x, payback under 1 month. The risk is not CAC — it is churn if concierge matching quality drops (agent close rate <4%).

**Recommendation: proceed to concierge MVP.** The model's economics survive bear-case pessimism on every variable except adoption velocity; and nearly every rupee of cost in the first six months is human labor (verification, matching, support) which is exactly the concierge value that drives word-of-mouth in the travel trade. Commit the full 6-week build only after the day-90 gate (§30/60/90 plan): M3 revenue ₹80k+ and cohort close rate ≥10%.

**Top risks (full register in §7):** (a) adoption velocity in a relationship-driven trade; (b) RFQ leakage — agents and DMCs trading directly after first connect, bypassing credits; (c) concierge quality drop as volume scales past one ops person's ~400 RFQs/mo capacity; (d) WhatsApp template rejections slowing the notification loop.

---

## 1. Agent side: deal-credit economics vs market lead prices

### 1.1 What agents pay today (cited benchmarks)

| Channel | Model | Price | Cost per booking | Source |
|---|---|---|---|---|
| JustDial (shared leads) | Annual listing + pay-per-lead, resold to 5+ agencies | ~₹15,000/mo for ~150 leads (≈₹100/lead) | ₹400/booking @25% close; ₹2,000/booking @5% close | [tourify-lead-sellers] |
| TravelTriangle | Marketing budget + commission on conversion | 5% commission only on converted leads (rep-stated); ~8% platform share agent-reported | ₹2,500–4,000/booking on ₹50–60k package; stacks on every booking | [tt-linkedin-rep], [tourify-lead-sellers], [tourify-ota-math] |
| HelloTravel | Subscription for lead flow | ₹14,999/30 days (trial tier); ₹19,999/30 days; ₹29,999/60 days | Depends on lead volume; fixed cost whether or not leads convert | [hellotravel-pricing] |
| TripClap | Pay-per-lead | From ₹50/lead, varies by plan | ₹50/lead ÷ close rate | [tripclap-pricing] |
| Google Search Ads (direct) | High-intent keywords | ₹400–2,500 cost per booking by niche | — | [tourgrids-operator-guide] |

Key structural points from the audit literature [tourify-lead-sellers]:
- Shared-lead subscriptions (JustDial-style) have **fixed downside but no conversion guarantee** — the same enquiry lands in 5 inboxes and whoever replies fastest wins.
- Commission models (TravelTriangle-style) have **lower downside if nothing converts, but every booking costs 5–8% of package value forever**.
- The only metric that matters is **cost per booking = lead spend ÷ bookings closed** — not cost per lead.
- Platforms claim 20–25% conversion on verified leads [tt-b2b-page], [tourgrids-leads]; reviewers describe closer to 5% [tourify-lead-sellers]. Reality is agency-specific; DMCGrid should design for the pessimistic end.
- A typical verified travel lead contains destination, origin city, pax count, departure date, hotel category, and services required [tourgrids-leads] — exactly the structured RFQ schema DMCGrid plans, so agents will recognize the product format.

### 1.2 Is ₹999/connect cheap or expensive? (visible math)

**Cost per booking for the agent:**

```
cost_per_booking = ₹999 × (RFQs connected per booking)
```

| Agent books 1 of N RFQs | Cost/booking | ROI @ ₹15k margin | ROI @ ₹25k margin | ROI @ ₹40k margin |
|---|---|---|---|---|
| N=1 | ₹999 | 15.0x | 25.0x | 40.0x |
| N=2 | ₹1,998 | 7.5x | 12.5x | 20.0x |
| N=3 | ₹2,997 | 5.0x | 8.3x | 13.3x |
| N=5 | ₹4,995 | 3.0x | 5.0x | 8.0x |
| N=8 | ₹7,992 | 1.9x | 3.1x | 5.0x |
| N=10 | ₹9,990 | 1.5x | 2.5x | 4.0x |
| N=15 | ₹14,985 | 1.0x | 1.7x | 2.7x |

**Break-even close rates (1 connect/RFQ):** cost = margin when N = margin ÷ 999:

- ₹15,000 margin → break-even at 1 booking per **15 RFQs** → minimum close rate **6.7%**
- ₹25,000 margin → break-even at 1 booking per **25 RFQs** → minimum close rate **4.0%**
- ₹40,000 margin → break-even at 1 booking per **40 RFQs** → minimum close rate **2.5%**

**Answer: ₹999/connect is cheap for agents** at any close rate above 6.7% on a ₹15k-margin package — and that threshold drops to 2.5% for ₹40k-margin packages (international packages commonly carry ₹50k–5L revenue [tourgrids-leads], so ₹40k margins are realistic for outbound Thailand/Bali/Dubai). Even the pessimistic 1-in-10 scenario yields 1.5–4x. Compare with TravelTriangle: on a ₹60k package, TT takes ₹4,800/booking (8%) — more than 4 DMCGrid connects — **on every single booking, forever**, while ₹999/connect is a one-time cost per RFQ won.

**Subscriber economics (per-credit cost collapse):**

| Tier | Price | Credits | Per-credit cost | vs wallet PAYG |
|---|---|---|---|---|
| Wallet PAYG | ₹999/connect | 1 | ₹999 | 1.0x |
| Agent Starter | ₹999/mo | 5 | ₹199.80 | 5.0x cheaper |
| Agent Growth | ₹2,499/mo | 20 | ₹124.95 | 8.0x cheaper |
| Agent Pro | ₹5,999/mo | 60 | ₹100.00 | 10.0x cheaper |

Same ROI table on Growth tier (₹124.95/credit): cost/booking at N=1 is ₹125 (120–320x ROI); at N=8 it is ₹1,000 (15–40x ROI — the same economics as wallet PAYG at N=1). **Subscription is strictly rational for any agent connecting ≥1 RFQ/month; the wallet tier exists only as a trust on-ramp.**

### 1.3 What conversion rate makes it a no-brainer?

With a ₹25,000 average margin (mid-range outbound package): **any close rate above 4% makes the wallet tier profitable.** On the Growth subscription (₹124.95/credit, 1 connect/RFQ), cost/booking is ₹124.95 × N: at a 1-in-20 (5%) close rate it is ₹2,499/booking (10x ROI at ₹25k margin); even at a 1-in-100 (1%) close it is ₹12,495/booking — still inside a ₹15k margin. Subscription break-even close rates are ~0.8% (₹15k margin) and ~0.5% (₹25k margin). **The no-brainer threshold is ~1-in-20 (5%) close rate for a subscription agent and ~1-in-25 (4%) for a wallet agent.** Both are below the 20%+ platforms claim and at the floor of what reviewers report for verified leads.

**Design implication for DMCGrid ops:** track connect→booked close rate per agent from day 1 (concierge MVP makes this trivial — ops sees every deal). If cohort close rates fall below 4%, the ₹999 price is unsustainable for that cohort and either lead quality must rise (better DMC shortlisting) or price must fall (subscription nudges).

### 1.4 Ancillary upside the agent keeps (per brief)

The brief's margin math is package-only. Agents also earn on flights, visa, and insurance ancillaries — not modeled above, all upside: a ₹15k-margin package with ₹3–8k ancillary margin pushes real ROI per connect 20–50% higher. This strengthens the ₹999 case further and should be surfaced in agent onboarding materials as "your true margin per DMCGrid deal."

---

## 2. DMC side: what DMCs pay today for B2B lead channels

### 2.1 Current channel costs (cited benchmarks)

**Trade fairs (the flagship channel DMCs use today):**

| Event | Cost | Per-lead math | Source |
|---|---|---|---|
| OTM Mumbai (Asia's largest travel show) | Bare space ₹44,000/sqm (early bird) to ₹56,000/sqm island; 9 sqm stall all-in ₹6.5–7.5L incl. shell, staff, GST, peak-season hotel | ₹5,833/qualified contact @120 contacts [UNVERIFIED]; ₹29,167/quote @20% contact→quote [UNVERIFIED] | [tourify-stall-roi], [otm-press] |
| ITB India Mumbai | 9 sqm shell scheme, price on application [UNVERIFIED: quote-based]; 3-day B2B show | Similar order of magnitude | [itb-india] |
| SATTE Delhi | Space quoted on enquiry only; no public rate card | Budget ₹6.5L+ range for 9 sqm | [tourify-stall-roi] |
| TAAI/IATO/ADTOI membership | ₹15K–₹50K/yr | Networking, FAM trips, credibility; not a lead channel per se | [tourgrids-operator-guide], [tourify-memberships] |
| IATA accreditation | ₹25K–₹60K deposit + setup | Direct airline ticketing only | [tourgrids-operator-guide] |

OTM 2025 drew 50,000+ trade visitors and 2,100+ exhibitors over 3 days [otm-press] — but a small DMC's 9 sqm booth does not capture 50,000 visitors; 120–200 qualified conversations over 3 days is the realistic band for a small stand [UNVERIFIED: operator-plausible estimate]. Additional exhibitor badges cost ₹5,000 + GST each (1 badge per 2 sqm included) [otm-exmanual].

**Lead-gen platforms and consolidators:**

| Channel | Model | Price | Source |
|---|---|---|---|
| TBO Holidays / TBO DMC | Consolidator/distribution; buyers pay wholesale rate + own markup; no IATA needed, no setup fee | Margin built into wholesale rate; TBO connects 159,000+ buyers with 1M+ suppliers across 100+ countries | [flyo-software], [tbo-site] |
| HelloTravel | Subscription lead flow | ₹14,999/30 days (trial) to ₹29,999/60 days; leads on WhatsApp, RM assistance | [hellotravel-pricing] |
| TripClap | Pay-per-lead, free registration | From ₹50/lead; 60% of leads sourced via Google AdWords | [tripclap-pricing] |
| JustDial | Shared leads, resold | ≈₹100/lead effective | [tourify-lead-sellers] |

**Note on the TBO model:** TBO is not a lead-gen platform — it is a distribution/buying platform where the DMC's product sells at a wholesale rate and the buyer marks up ("take full control of your mark-up" [tbo-site]). The DMC "pays" via the wholesale discount (typically 10–20% below retail [UNVERIFIED]). DMCGrid's model differs: the DMC pays a per-quote credit but keeps 100% of its quoted price — comparable economics depend on quote-to-booking rates (§2.2).

### 2.2 Cost per quote for DMCs on DMCGrid (visible math)

| DMC tier | Price/mo | Quote credits | Per-quote credit |
|---|---|---|---|
| DMC Starter | ₹1,499 | 10 | ₹149.90 |
| DMC Growth | ₹3,999 | 40 | ₹99.98 |
| DMC Pro | ₹7,999 | 100 | ₹79.99 |
| Wallet PAYG | ₹799+ | 1 | ₹799+ |

**Comparison — cost per quote/lead:**

| Channel | Cost per quote/lead |
|---|---|
| OTM booth (amortized over 300 quotes/yr) | ₹2,333 |
| OTM booth (per qualified contact @120 contacts) | ₹5,833 |
| HelloTravel (₹14,999/30d, ~100 leads/mo [UNVERIFIED]) | ₹150 |
| TripClap | ₹50–150 |
| **DMCGrid Starter** | **₹149.90** |
| **DMCGrid Pro** | **₹79.99** |

**Answer: DMCGrid quote-credits are cheap for DMCs** — at ₹80–150/quote-credit they match the cheapest per-lead platforms (TripClap ₹50–150) and undercut HelloTravel's effective rate, while costing 15–70x less than trade-fair lead economics. The decisive difference vs TripClap/HelloTravel: DMCGrid quotes are **structured RFQs from verified travel agents** (B2B, not consumer leads), with a max-2-DMC competition cap per RFQ — consumer-lead platforms resell each lead to dozens of agents, which is exactly the pain the audit literature documents [tourify-lead-sellers].

**DMC-side conversion math (what makes a quote a no-brainer):**

```
DMC cost per booked trip = ₹100 (avg credit) × (quotes per booking)
```

| DMC books 1 of N quotes | Cost/booking | vs 10% wholesale-discount cost on ₹1L package (TBO-style) |
|---|---|---|
| N=2 | ₹200 | ₹10,000 |
| N=5 | ₹500 | ₹10,000 |
| N=10 | ₹1,000 | ₹10,000 |
| N=20 | ₹2,000 | ₹10,000 |

Even at 1-in-20 quote→booking, DMCGrid costs ₹2,000/booking vs ₹10,000 equivalent on a wholesale-discount model. **DMC break-even close rate: ~1%** on a ₹1L package — trivially achievable with the 2-DMC competition cap (a 2-way race converts far better than a 20-way one).

---

## 3. Platform cost structure

### 3.1 Variable costs per transaction (cited + computed)

**Razorpay (payment collection):**

| Component | Rate | Source |
|---|---|---|
| Platform fee, all domestic instruments | 2% per successful transaction | [razorpay-pricing] |
| GST on platform fee | 18% (→ 2.36% effective) | [razorpay-pricing], [cyberdefence-pg] |
| Setup fee / AMC / refund fee | ₹0 | [razorpay-pricing] |
| UPI (statutory MDR) | Zero (RBI policy); Razorpay 2% platform fee still applies | [razorpay-pricing] |
| Corporate/business cards | 2.15–3% | [razorpay-pricing] |
| Settlement | T+1 or instant | [razorpay-pricing] |

Computed cost on platform-collected revenue (subscriptions + top-ups + wallet connects — **not** customer trip payments; the platform does not touch those in v1):

| Platform revenue collected/mo | Razorpay fee (2.36%) |
|---|---|
| ₹1,00,000 | ₹2,360 |
| ₹5,00,000 | ₹11,800 |
| ₹20,00,000 | ₹47,200 |

New-merchant note: 0% platform fee for new Razorpay merchants on domestic payments up to ₹5L cumulative GMV or 90 days from activation (one-time KYC fee ₹199 + taxes; GST still applies; credit cards must stay <90% of volume) — **worth activating; saves ~₹3–5k of fees at concierge-MVP volumes.** Compare alternatives: Cashfree 1.95%, PayU ~2% + GST on fee [cyberdefence-pg] — Razorpay's zero-AMC zero-setup structure wins at low volume.

**WhatsApp Business API (India, per-message era):**

Meta switched to per-message billing on 1 July 2025 [setsmart-wa]; the India rate card effective **1 October 2026** [indiatoday-wa-2026], [freepress-wa]:

| Template category | India rate (before GST) | Notes |
|---|---|---|
| Marketing | ₹0.8631/msg | Charged always, no volume discount |
| Utility | ₹0.115/msg (₹0.136 with GST) | Charged even inside the 24-hr window from 1 Oct 2026 |
| Authentication | ₹0.115/msg | OTPs, volume-tiered down |
| Service (free-form replies) | Free first 1,000/month/number; then ₹0.115 | From 1 Oct 2026; no rollover |
| BSP fee (Gupshup self-serve) | +$0.001 ≈ ₹0.085/msg | BSP alternatives: AiSensy ₹999/mo, Interakt ₹2,499/mo, Wati ₹2,999/mo [scalify-wa] |

**DMCGrid notification flow per connect (design target):** 1 RFQ-alert marketing template + 4 utility messages (quote received, connect granted, contact reveal, receipt) ≈ **₹1.34 + BSP ₹0.43 = ₹1.77/connect**. At 1,000 connects/mo: **₹1,770/mo** — negligible. SMS fallback ≈₹0.20/msg [UNVERIFIED] → ~₹1/connect more; use only where WhatsApp is undeliverable. Note: free-form service replies within the 24-hr window cost nothing up to 1,000/month/number — design the concierge flow to keep DMC/agent conversations inside windows opened by inbound messages, and the marginal messaging cost approaches zero.

**AI cost per RFQ structuring (token math, GLM-flash-class):**

Model pricing (Bedrock, Sep 2026) [calcaas-bedrock], [layer3-pricing]: GLM 4.7 Flash $0.07/1M input, $0.40/1M output; Nova Micro $0.035/1M input, $0.14/1M output; Claude Haiku 4.5 $1/1M in, $5/1M out.

```
Per RFQ structuring:
  input  ≈ 1,500 tokens (raw agent RFQ text + system prompt)
  output ≈   600 tokens (structured JSON: destination, pax, dates, services)
  GLM-flash: 1500/1M×$0.07 + 600/1M×$0.40 = $0.000345 ≈ ₹0.03 (USD→INR @83)
  with 2 retries (3 attempts worst case): ₹0.09/RFQ
  Claude Haiku 4.5 comparison: ₹0.37/RFQ
  At 1,000 RFQs/mo with retries: ₹90/mo — effectively free
```

**AI is not a cost line; it is a margin feature.** Even a 10x-worse model (₹0.90/RFQ) is noise against ₹999/connect revenue. Route only high-volume simple classification to Nova Micro; use GLM-flash-class for structuring. The AI copilot add-on (₹ pricer in brief) can therefore be priced almost entirely on value, not token cost.

### 3.2 Human cost: the real cost line

**Concierge ops throughput (manual RFQ distribution):**

```
Per RFQ manual handling:
  read agent RFQ (WhatsApp/email/form): 3 min
  clean + structure into standard format: 4 min
  post to DMC shortlist + notify: 2 min
  distribute + track responses: 5 min
  total: 14 min/RFQ

Ops person effective capacity: 5.5 productive hrs/day = 330 min → 23 RFQs/day → ~613 RFQs/mo (26 days)
With verification + support duties (~35% of time): ~15 RFQs/day → ~390 RFQs/mo
```

**Ops cost per RFQ at utilization levels** (salary ₹35,000/mo [UNVERIFIED], 26 days, loaded ≈₹158/hr):

| Utilization | RFQs/mo | Fully-loaded cost/RFQ |
|---|---|---|
| 100% | 613 | ₹57 |
| 75% | 460 | ₹76 |
| 50% | 306 | ₹114 |

**Answer to "how many RFQs can 1 ops person distribute/day": ~23 at full focus, ~15 with mixed duties.** One ops person comfortably runs ~400 RFQs/mo = ~400–800 connects/mo (at 1–2 DMCs/RFQ) = **₹4–8L/mo of connect-revenue potential** at wallet PAYG — the concierge MVP does not bottleneck revenue until well past base-case scale.

**Server + infra:**

| Item | Cost/mo | Source |
|---|---|---|
| VPS (2–4 vCPU, 4–8GB) | ₹2,000–5,000 | Brief assumption; Hetzner/DigitalOcean class [UNVERIFIED] |
| Domain + misc | ~₹100/mo amortized | — |
| WhatsApp BSP platform | ₹0 self-serve (Gupshup wallet) or ₹999–2,999 (AiSensy/Wati) | [scalify-wa] |
| **Total infra at launch** | **~₹3,500–5,000/mo** | — |

### 3.3 Variable cost per ₹999 connect (full stack, visible math)

```
Razorpay      ₹24   (2.36% of 999)
WhatsApp      ₹2    (5 messages, post-Oct-2026 rates)
AI            ₹0    (0.03–0.09/RFQ)
Verification  ₹0    (amortized; ~₹36/entity one-time)
Ops           ₹37   (14 min/RFQ × ~2 RFQs per connect opportunity ÷ 2 DMCs, at 75% utilization)
TOTAL         ₹63
Contribution margin on wallet PAYG connect: 93.7% (₹936 kept)
Contribution margin on Growth-tier credit (₹124.95): ~50%
Contribution margin on Pro-tier credit (₹100): ~37%
```

**The cost structure is human-dominated:** ops is ~60% of the variable stack, payments ~40%, everything else rounding error. This is why the concierge MVP works — the platform IS the ops, and the ops cost is already in the plan as salary. It is also why the scaling plan (§5.3) pairs every volume doubling with AI-assisted structuring: the only way to hold contribution margin above 85% at scale is to cut the ₹57–114/RFQ human line.

---

## 4. Break-even scenarios (bear / base / bull)

### 4.1 Assumptions (all [UNVERIFIED] unless cited)

| Assumption | Bear | Base | Bull | Basis |
|---|---|---|---|---|
| Agent ARPU/mo (paid) | ₹1,800 | ₹2,200 | ₹2,400 | Tier mix 50/35/15 Starter/Growth/Pro = ₹2,274 pure-mix; Base assumes lighter mix |
| DMC ARPU/mo (paid) | ₹2,500 | ₹3,300 | ₹3,600 | Tier mix 50/35/15 = ₹3,349 pure-mix |
| Agent:DMC payer mix | 60:40 | 60:40 | 60:40 | Two-sided design assumption [UNVERIFIED] |
| Blended ARPU | ₹2,080 | ₹2,640 | ₹2,880 | Computed |
| Founder opportunity cost/mo | ₹60,000 | ₹60,000 | ₹60,000 | [UNVERIFIED] |
| Ops salary/mo | ₹35,000 | ₹35,000 | ₹35,000 | India ops salary [UNVERIFIED] |
| Infra/mo | ₹3,500 | ₹3,500 | ₹3,500 | §3.2 |
| CAC (blended) | ₹1,200 | ₹1,500 | ₹1,000 | §6 |
| Variable rate | 2.41% + WA | 2.41% + WA | 2.41% + WA | Razorpay 2.36% + WhatsApp ₹1.77×15 msgs/payer-mo |

### 4.2 Static break-even (visible math)

```
Fixed cost (Base) = founder ₹60,000 + ops ₹35,000 + infra ₹3,500 = ₹98,500/mo
Contribution per blended payer = ₹2,640 × (1 − 0.0241) = ₹2,576
Break-even payers = ₹98,500 ÷ ₹2,576 = 38 paying accounts
```

At Bear ARPU (₹2,080 blended): break-even = ₹98,500 ÷ ₹2,030 = **47 payers**.
At Bull ARPU (₹2,880 blended): break-even = ₹98,500 ÷ ₹2,811 = **35 payers**.

**Lean founder-only variant (no ops salary, founder runs ops):** fixed = ₹63,500 → break-even = **25 payers** (Base ARPU). This is the true concierge MVP floor — and matches the freemium design (5 free deals both sides) as a credible self-funding path.

### 4.3 Six-month month-by-month P&L

Standardized model: Razorpay 2.36% of revenue; WhatsApp ₹1.77 × 15 msgs/payer-mo; infra ₹3,500; staffing and CAC ramp per scenario. Estimates of payer counts and revenue are [UNVERIFIED] scenario constructions.

**BEAR — slow adoption, founder + 1 ops throughout:**

| Month | Revenue | Staff | CAC | Net/mo | Cumulative |
|---|---|---|---|---|---|
| M1 | ₹0 | ₹95,000 | ₹3,000 | −₹1,01,500 | −₹1,01,500 |
| M2 | ₹8,000 | ₹95,000 | ₹5,000 | −₹95,768 | −₹1,97,268 |
| M3 | ₹18,000 | ₹95,000 | ₹8,000 | −₹89,084 | −₹2,86,353 |
| M4 | ₹30,000 | ₹95,000 | ₹8,000 | −₹77,474 | −₹3,63,826 |
| M5 | ₹45,000 | ₹95,000 | ₹10,000 | −₹64,801 | −₹4,28,627 |
| M6 | ₹60,000 | ₹95,000 | ₹10,000 | −₹50,235 | −₹4,78,862 |

No break-even in 6 months; cumulative burn **₹4.79L**. Revenue ₹60k at M6 ≈ 21 payers at Bear ARPU. Trigger to exit bear: if M4 revenue < ₹25k, cut ops to part-time and pivot acquisition channel before spending further.

**BASE — founder + 1 ops from M1, +1 ops M3 (verification/support), +1 BD M5:**

| Month | Revenue | Staff | CAC | Net/mo | Cumulative |
|---|---|---|---|---|---|
| M1 | ₹15,000 | ₹95,000 | ₹6,000 | −₹90,013 | −₹90,013 |
| M2 | ₹40,000 | ₹1,30,000 | ₹9,000 | −₹1,03,842 | −₹1,93,856 |
| M3 | ₹80,000 | ₹1,30,000 | ₹12,000 | −₹67,733 | −₹2,61,589 |
| M4 | ₹1,20,000 | ₹1,30,000 | ₹12,000 | −₹28,730 | −₹2,90,319 |
| M5 | ₹1,70,000 | ₹1,70,000 | ₹12,000 | −₹20,016 | −₹3,10,335 |
| M6 | ₹2,30,000 | ₹1,70,000 | ₹15,000 | +₹35,408 | −₹2,74,927 |

First cash-positive month: **M6**. Max negative drawdown: **₹3.10L (M5)**. Cumulative 6-mo: −₹2.75L. **Capital needed: ₹3.5L** (drawdown + buffer). M6 revenue ₹2.3L ≈ 87 paying accounts.

**BULL — fast adoption, add-on revenue (verified badge, AI copilot) lifts ARPU, hires pulled forward:**

| Month | Revenue | Staff | CAC | Net/mo | Cumulative |
|---|---|---|---|---|---|
| M1 | ₹20,000 | ₹95,000 | ₹8,000 | −₹87,158 | −₹87,158 |
| M2 | ₹60,000 | ₹1,30,000 | ₹12,000 | −₹87,447 | −₹1,74,605 |
| M3 | ₹1,10,000 | ₹1,65,000 | ₹15,000 | −₹76,627 | −₹2,51,232 |
| M4 | ₹1,60,000 | ₹1,65,000 | ₹15,000 | −₹27,780 | −₹2,79,012 |
| M5 | ₹2,40,000 | ₹2,05,000 | ₹18,000 | +₹7,199 | −₹2,71,814 |
| M6 | ₹3,20,000 | ₹2,05,000 | ₹15,000 | +₹88,125 | −₹1,83,689 |

First cash-positive month: **M5**. Cumulative 6-mo: −₹1.84L. **Capital needed: ₹3L.** Bull assumes ~1.4x Base adoption velocity plus add-on attach (verified badge ₹7,500/yr on 20–30 DMCs, AI copilot on 10–15% of agents).

### 4.4 Scale table (steady-state, Base mix)

| Payers | Revenue/mo | Variable | Staff (est.) | Infra+WA | Net/mo |
|---|---|---|---|---|---|
| 100 (60A/40D) | ₹2,64,000 | ₹6,362 | ₹1,30,000 | ₹5,000 | +₹1,22,638 |
| 500 (300A/200D) | ₹13,20,000 | ₹31,812 | ₹2,50,000 | ₹5,000 | +₹10,33,188 |
| 1,000 (600A/400D) | ₹26,40,000 | ₹63,624 | ₹4,50,000 | ₹5,000 | +₹21,21,376 |

Staffing estimates at scale [UNVERIFIED]: 100 payers = founder + 2 ops; 500 = +1 ops +2 BD +1 support; 1,000 = + eng/AI automation replacing most manual ops. At 500+ payers, AI-assisted RFQ structuring should cut ops per RFQ from ₹76 to <₹20, expanding margin further. A DMC-heavy variant (100 agents + 1,000 DMCs) yields ₹35.2L/mo revenue at ~₹6L staff cost — the DMC side is the cheaper-to-serve, higher-ARPU half.

**Contribution-margin cliff to watch:** on Pro-tier credits (₹100/credit), contribution is ~37% before fixed costs. If tier mix skews Pro-heavy (>40%), blended per-credit revenue approaches the ops cost floor — mitigate with AI-assisted ops (cuts ₹57–114/RFQ human cost) or premium pricing on high-intent RFQs.

---

## 5. Concierge MVP ops runbook

### 5.1 Verification workflow (cost per verified entity, visible math)

**What to verify for a DMC/agent (KYB fields per [abbacus-kyb] + Indian travel trade practice):**

| Field | Method | Cost |
|---|---|---|
| GSTIN | API lookup (validate + taxpayer details) | ₹0.55–2.20/call [apisathi] |
| PAN | API lookup (name, DOB match) | ₹1.32/call [apisathi] |
| Bank account | Penny-drop + name match | ₹0.33/call [apisathi] |
| UPI VPA | API validate | ₹0.22/call [apisathi] |
| IATA accreditation (for those claiming it) | Manual: directory check + certificate upload | ₹0 API; ~3 min human |
| Business proof + website domain match | Manual review | ~9 min human |

```
API cost per entity:  ₹2.20 + ₹1.32 + ₹0.33 = ₹3.85 (worst case, full checks)
Human review:         12 min × ₹158/loaded-hr = ₹32
Total per verified entity: ~₹36  (API ₹4 + human ₹32)
At 100 entities:  ₹3,552      At 500: ₹17,762      At 1,000: ₹35,524
```

**Verification policy for concierge MVP:** GSTIN + PAN mandatory for both sides (₹3.85 API, instant); bank penny-drop only for DMCs who will receive connects; IATA manual check for "verified badge" purchasers (₹7,500/yr add-on justifies the extra ~5 min). Manual-approval-via-admin-dashboard first, automated KYB later — the recommended path per [abbacus-kyb]. **The ₹36/entity cost is trivial; the 12-min human review is the bottleneck — 1 ops person verifies ~35 entities/day alongside RFQ duties.**

### 5.2 RFQ distribution SLA (concierge MVP)

| Step | SLA | Owner |
|---|---|---|
| RFQ received → structured + posted | ≤30 min (business hrs) | Ops |
| DMC shortlist (2 DMCs max per RFQ) selected | ≤2 hrs | Ops |
| DMCs notified (WhatsApp template) | ≤2 hrs | Automated |
| First quote requested from DMCs | ≤4 business hrs | Ops follow-up |
| Quotes relayed to agent (anonymized) | ≤24 hrs from DMC quote receipt | Ops |
| Connect granted + contact reveal + ₹999 debit | On agent selection | Automated (wallet) |
| Post-connect follow-up (booked? margin?) | Day 3 + Day 7 | Ops |

**Speed is the product in the concierge phase:** shared-lead platforms lose deals to whoever replies fastest [tourify-lead-sellers]. A ≤30-min structured-RFQ SLA is a direct competitive weapon against JustDial-style resold leads that sit in 5 inboxes.

### 5.3 Staffing plan 0→6 months

| Phase | Months | Team | Capacity | Focus |
|---|---|---|---|---|
| M0 bootstrap | M0 | Founder only | ~15 RFQs/day + verification | First 10 DMCs, first 20 agents, first 5 paying deals (free-tier validation) |
| Concierge launch | M1–2 | Founder + 1 ops | ~23 RFQs/day + verification + support | ₹15–40k/mo revenue; SLA discipline; cohort close-rate tracking |
| Verification scale | M3–4 | +1 ops (verification + agent support) | ~35 entities/day + RFQ overflow | 100+ verified entities; DMC supply depth (Thailand/Bali/Dubai first) |
| BD push | M5–6 | +1 BD (DMC acquisition + TAAI/OTOAI events) | — | 60+ paying accounts; first add-on sales (verified badge ₹7,500/yr) |
| Post-M6 gate | M6+ | Hire only on revenue trigger: +1 ops per +250 RFQs/mo | — | AI-assist structuring to hold ops/RFQ <₹30 |

**Total 6-month people cost (Base):** ₹95k + ₹130k + ₹130k + ₹130k + ₹170k + ₹170k = **₹8.25L** (incl. founder opportunity cost) — the dominant line item, as designed for a concierge MVP.

### 5.4 TDS/GST/TCS tracking in ops (per brief)

- Platform invoices (subscriptions, connects, top-ups): GST 18% output; Razorpay fee input credit (18% GST on the 2% fee) [razorpay-pricing].
- Agent-side: TCS 2% on overseas tour packages tracked in the agent's own books (Tally head per [flyo-software]) — DMCGrid surfaces per-deal margin + ancillary breakdown so agents' CAs can compute; DMCGrid itself does not withhold in v1 (platform does not touch customer payments).
- DMC payouts: DMCs are paid by agents directly post-connect; DMCGrid only debits the agent's wallet for the connect. No TDS on the platform side for DMC dealings in v1; revisit when platform-facilitated payments ship.

---

## 6. CAC / LTV

### 6.1 Realistic B2B acquisition channels (Indian travel trade)

| Channel | Mechanics | Cash CAC | Notes |
|---|---|---|---|
| WhatsApp + personal network | Founder announcement to 200–500 contacts; trade groups | ~₹0 cash | Highest conversion; first 20–40 customers [tourgrids-operator-guide] |
| TAAI/OTOAI/TAFI events | Networking, attendee lists; membership ₹10–50k/yr [flyo-agency] | ₹5,833/contact if buying an OTM booth; event-entry + meetups far cheaper | [tourify-memberships], [tourify-stall-roi] |
| WhatsApp trade groups (agent/DMC) | Direct outreach in closed groups | ~₹150/contact (time-loaded) | [UNVERIFIED]; 70–90% WhatsApp open rates [yourgrowth-cac] |
| Tier-2 agent outreach | 8–12% commission offers to 20 adjacent-city agents; can 3x bookings by month 6 | ₹800–1,500 | [tourgrids-operator-guide] pattern |
| Google Search Ads | High-intent keywords | ₹400–2,500/booking; SaaS-signup CAC ~₹2–4k [UNVERIFIED India] | B2B SaaS CAC benchmark $702 global [yourgrowth-cac] |
| Trade media (TravelBiz Monitor, ET Travel) | Sponsored features | ₹5k–25k/feature [UNVERIFIED] | Credibility, not direct CAC |

**Realistic blended CAC: ₹800–3,000; plan at ₹1,500** [UNVERIFIED — derived from channel mechanics above]. WhatsApp-first nurture is the multiplier: 7-touch WhatsApp+email sequences convert 20–35% vs 5–8% single-touch [yourgrowth-cac]. TAAI (~2,300 member orgs) and TAFI (~1,400) are the two bodies with real event density; both are cheap to join relative to booth spend [tourify-memberships].

### 6.2 LTV at proposed pricing (visible math)

**Agent LTV** (blended ARPU ₹2,200/mo):

| Monthly churn | Lifetime | LTV | LTV:CAC @₹1,500 | Payback |
|---|---|---|---|---|
| 5% | 20.0 mo | ₹44,000 | 29.3x | 0.7 mo |
| 8% | 12.5 mo | ₹27,500 | 18.3x | 0.7 mo |
| 12% | 8.3 mo | ₹18,333 | 12.2x | 0.7 mo |

**DMC LTV** (blended ARPU ₹3,300/mo):

| Monthly churn | Lifetime | LTV | LTV:CAC @₹1,500 | Payback |
|---|---|---|---|---|
| 6% | 16.7 mo | ₹55,000 | 36.7x | 0.5 mo |
| 10% | 10.0 mo | ₹33,000 | 22.0x | 0.5 mo |

India SMB B2B churn of 5–12%/mo is the realistic band for subscription tools sold to small travel businesses [UNVERIFIED]. Even at the worst case (12% agent churn), LTV:CAC is 12x — far above the 3:1 healthy threshold [yourgrowth-cac]. **Payback is under one month at proposed pricing; CAC is not the constraint.**

**The actual risk: churn driven by match quality.** If concierge-matched DMC quotes don't convert to bookings (agent close rate <4%, §1.3), agents churn and LTV collapses toward 3–4 months (~₹7–9k LTV, still >5x CAC but growth stalls). **Ops KPI #1 from day 1: per-agent connect→booked close rate; target ≥10% at M6.**

### 6.3 Unit-economics guardrails (carry into build)

1. CAC ≤ ₹2,000; if any channel exceeds it for 2 consecutive months, kill it.
2. LTV:CAC ≥ 8x sustained; if below 5x, revisit pricing or churn before scaling spend.
3. Ops cost per RFQ ≤ ₹76 (75% utilization); above ₹114 (50% utilization), the hire is mispriced or RFQ flow is too thin.
4. Contribution margin per connect ≥ 85% on wallet PAYG; watch Pro-tier mix (37% contribution floor).
5. Verification cost ≤ ₹50/entity (automate GSTIN/PAN first; manual review is the scaling bottleneck).
6. Agent cohort close rate ≥ 4% (break-even) / ≥ 10% (healthy) — the single most important metric.

---

## 7. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Adoption velocity slower than Base (relationship-driven trade; agents distrust new platforms) | Medium-high | High | Concierge warmth + freemium 5 free deals + founder-led WhatsApp outreach; bear-case hiring freeze triggers |
| RFQ leakage (agent + DMC trade directly after first connect, bypassing credits) | Medium | Medium-high | Contract terms (no direct dealing for 12 mo post-connect); make the connect cheaper than the workaround; anonymized quotes until connect paid |
| DMC supply too thin in top destinations → agent close rates collapse | Medium | High | Launch DMC-recruiting before agent-recruiting; verified badge subsidy; 2-DMC cap makes each DMC's odds attractive |
| Concierge quality drops past 1 ops person's capacity (~400 RFQs/mo) | Medium | Medium | AI structuring assist (₹0.03–0.09/RFQ); hire on revenue trigger; SLA dashboards from day 1 |
| WhatsApp template rejections / policy changes slow notifications | Medium | Low-medium | Keep templates strictly utility/transactional; SMS fallback; human relay inside service windows |
| Razorpay fee re-pricing or KYC friction | Low | Low | 2.36% is modeled; Cashfree 1.95% alternative [cyberdefence-pg]; zero-AMC structure insulates at low volume |
| Churn >12%/mo on either side | Low-medium | High | Ops KPI #1 (close rate); quarterly pricing review; subscription lock-in with rollover credits |

---

## 30 / 60 / 90-day ops plan

**Day 0–30 (validate + launch):**
- Verify first 30 DMCs (Thailand/Bali/Dubai focus) + 50 agents: GSTIN+PAN API (~₹115 total) + manual review (~6 hrs).
- Founder personally distributes first ~200 RFQs (≤30-min SLA); honor 5 free deals both sides.
- First 10 paying connects at ₹999 wallet PAYG = ₹10k revenue validation.
- Instrument from day 1: close rate per agent, quote acceptance per DMC, ops minutes per RFQ, CAC by channel.
- Razorpay activation (0% fee up to ₹5L GMV / 90 days for new merchants).
- Begin WhatsApp trade-group outreach cadence (2 hrs/day, founder).

**Day 31–60 (concierge scale):**
- Hire ops #1 (₹35k/mo); SLA handover; founder shifts to DMC supply + agent acquisition.
- 100+ verified entities; 400+ RFQs distributed; 30–50 paying connects (₹30–50k/mo revenue).
- Launch Agent Starter ₹999/mo subscription to wallet users (nudge: 5 credits at 5x discount).
- First TAAI/OTOAI event attendance (entry-level, not booth); begin DMC-deep recruiting for 2nd/3rd destination.
- Bear-case checkpoint: if M2 revenue < ₹25k, freeze hiring and re-channel acquisition.

**Day 61–90 (systemize + prove unit economics):**
- Hire ops #2 (verification + support); launch DMC subscriptions (₹1,499 tier first).
- AI structuring assist on RFQ intake (GLM-flash-class, ₹0.03–0.09/RFQ) — target ops/RFQ ≤ ₹57.
- Target: 60+ paying accounts (break-even threshold 38 + margin), M3 revenue ₹80k+.
- Add-on pilot: verified badge ₹7,500/yr to top-10 DMCs (₹75k potential, ~5 min extra verification each).
- Cohort review: close rates by agent vintage; kill channels with CAC > ₹2,000.
- **Decision gate at day 90:** base-case trajectory confirmed (M3 revenue ₹80k+ and cohort close ≥10%) → commit the 6-week full build; bear case → stay concierge, fix supply quality first, re-check in 30 days.

---

## 8. Worked example: one RFQ's full lifecycle with costs and revenue (concierge MVP)

Concrete trace of a single Thailand RFQ through the concierge flow — every number from §3 and §5:

```
Day 0, 10:00  Agent A (verified, Mumbai) sends RFQ on WhatsApp:
              "Thailand 5N6D, 2 adults + 1 child, ex-Mumbai, mid-March,
               4-star, flights + visa + insurance, budget ₹1.6L"
Day 0, 10:22  Ops structures it into the standard RFQ schema (14 min: ₹37 ops cost)
              and posts to DMC shortlist (2 Thailand DMCs selected)
Day 0, 10:30  WhatsApp alerts out to both DMCs (2 marketing templates: ₹1.76 + GST)
Day 1, 12:00  DMC 1 quotes ₹98,000 net; DMC 2 quotes ₹1,04,500 net
              (ops relay cost: 8 min ≈ ₹21)
Day 1, 12:30  Agent sees both anonymized quotes side-by-side; picks DMC 1
Day 1, 12:31  Connect debited: ₹999 from Agent A's wallet (Razorpay fee on
              wallet top-up already collected; marginal PG cost ~₹24)
              Contact reveal: DMC 1's details released to Agent A
Day 1–8       Agent sells white-labeled at ₹1,28,000 (per-deal margin ₹30,000)
              + ancillaries: flights ₹8k margin, visa ₹1.5k, insurance ₹0.8k
Day 8         Booking confirmed. Agent's total DMCGrid cost: ₹999 (1 connect)
              → cost/booking ₹999 vs ₹40,300 total margin = 40.3x ROI
Platform P&L on this deal: ₹999 revenue − ₹24 PG − ₹37 ops − ₹21 relay
              − ₹2.5 WhatsApp − ₹0.09 AI = ₹914 contribution (91.6%)
DMC 1 P&L: ₹98,000 booking − ₹100 (1 quote credit amortized) = 980x on credit
```

This single trace is the pitch: agent pays 2.5% of deal margin for a 2-DMC competition; DMC pays ~₹100 for a verified B2B quote; platform keeps 91.6% contribution. Repeat 400 times a month with one ops person (§3.2) and the Base case follows arithmetically.

---

## 9. Concierge ops handbook (day-to-day detail for the first ops hire)

**Daily rhythm (M1–2, ~6.5 focused hours):**

| Block | Time | Task | Volume |
|---|---|---|---|
| Morning sweep | 09:30–10:30 | Clear overnight RFQ backlog to ≤30-min SLA; overnight DMC quotes relayed | ~8–12 items |
| Structuring block | 10:30–13:00 | Read + structure + post new RFQs | ~10 RFQs |
| Follow-ups | 14:00–15:30 | Chase DMCs past 4-hr quote SLA; chase agent decisions past 48-hr | ~15 touches |
| Verification slot | 15:30–16:30 | New entity GSTIN/PAN API + manual review | ~4–6 entities |
| Close-of-day | 17:00–17:30 | Log: ops minutes/RFQ, close events, margin reports; WA template health | — |

**Weekly rhythm:**
- Monday: cohort close-rate review (agents onboarded in weeks 4/8/12 ago); flag any agent below 4% close → supply-quality intervention.
- Wednesday: DMC supply depth check — quotes-per-RFQ by destination; any destination with <5 active DMCs → recruiting priority.
- Friday: CAC by channel (signups per channel ÷ channel spend); kill/scale decisions per guardrail §6.3.

**Scripts and artifacts ops needs on day 1:**
1. Standard RFQ schema (destination, origin, pax, dates, hotel category, services, budget, trip type) — mirrors the verified-lead fields agents already know [tourgrids-leads].
2. DMC alert WhatsApp template (utility, pre-approved): "New verified RFQ: Thailand 5N6D ex-Mumbai, 3 pax, mid-Mar. Reply QUOTE with your net rate."
3. Quote-relay format for agents: side-by-side anonymized cards (DMC-A/DMC-B), net rates, inclusions, response SLA.
4. Connect confirmation + contact reveal template (utility).
5. Day-3/Day-7 post-connect follow-up script (books the close-rate data that §6.2 LTV depends on).
6. Verification checklist: GSTIN status Active, PAN name match, bank penny-drop name match, website live + domain email match, IATA cert if claimed.

**Escalation rules:**
- RFQ volume >25/day for 3 consecutive days → trigger ops hire #2 (revenue covers it at Base ARPU).
- Any DMC unresponsive past 24-hr quote SLA twice in a week → suspend from shortlist; supply quality > supply count.
- Agent disputes a connect charge → refund from wallet float, log cause; refunds are free on Razorpay [razorpay-pricing].

---

## 10. Assumptions ledger (what to re-verify monthly)

Every number in this blueprint that is not citation-backed, with the trigger that should cause a re-check:

| # | Assumption | Value used | Re-verify when |
|---|---|---|---|
| 1 | Agent tier mix | 50% Starter / 35% Growth / 15% Pro | 50 paying agents; actual mix shifts ARPU ±₹400 |
| 2 | DMC tier mix | 50/35/15 across ₹1,499/₹3,999/₹7,999 | 30 paying DMCs |
| 3 | Agent:DMC payer ratio | 60:40 | First 50 payers; DMC-heavy mix raises blended ARPU (§4.4) |
| 4 | Ops handling time | 14 min/RFQ | First 100 RFQs logged; if >20 min, ops/RFQ hits ₹114+ and capacity drops below 400/mo |
| 5 | Ops salary | ₹35,000/mo | First hire; NCR vs tier-2 varies ±30% |
| 6 | Founder opportunity cost | ₹60,000/mo | founders' choice; excluded in the lean variant (§4.2) |
| 7 | CAC by channel | ₹800–3,000 blended | First 30 paid-acquired accounts |
| 8 | Monthly churn | 5–12% agents, 6–10% DMCs | First cohort day-90 retention; the single biggest LTV lever |
| 9 | WhatsApp msgs per payer | 15/mo | First month of live traffic; per-message model bills each template [setsmart-wa] |
| 10 | Connects per booking (agent) | 1 connect per RFQ; 1 booking per 3–10 RFQs | First 20 booked deals — sets whether ₹999 reads cheap (§1.2) or aggressive |
| 11 | VPS cost | ₹2,000–5,000/mo | At 500+ payers; add load-testing before M4 |
| 12 | OTM booth lead yield | 120 qualified contacts/9 sqm | Only if booth spend is approved (not recommended pre-break-even) |

---

## Appendix: key numbers at a glance

| Metric | Value | Source/derivation |
|---|---|---|
| Agent cost/booking @ wallet PAYG, 1-in-5 close | ₹4,995 (3–8x ROI) | §1.2 |
| Agent break-even close rate (₹25k margin) | 4.0% | §1.2 |
| Subscription per-credit range | ₹100–199.80 | §1.2 |
| DMC cost per quote | ₹80–150 (vs OTM booth ₹2,333–5,833) | §2.2 |
| Razorpay effective | 2.36% of collected revenue | [razorpay-pricing] |
| WhatsApp per connect | ~₹1.77 (5 msgs, post-Oct-2026 rates) | [indiatoday-wa-2026] |
| AI per RFQ | ₹0.03–0.09 (GLM-flash-class) | [calcaas-bedrock] |
| Ops per RFQ | ₹57–114 (50–100% utilization) | §3.2 |
| Ops RFQ capacity | ~15–23 RFQs/day/person | §3.2 |
| Verification per entity | ~₹36 (API ₹4 + human ₹32) | §5.1 |
| Break-even payers (Base) | 38 (25 founder-only) | §4.2 |
| 6-mo capital needed (Base) | ~₹3.5L | §4.3 |
| CAC (plan) | ₹1,500 (range ₹800–3,000) | §6.1 |
| Agent LTV / DMC LTV | ₹18–44k / ₹33–55k | §6.2 |
| LTV:CAC | 12–37x | §6.2 |
| Payback | <1 month | §6.2 |

*All [UNVERIFIED] items are estimates from channel mechanics or vendor-blog claims; verify before committing spend. Every cited benchmark carries its source URL in `dmcgrid_ops_unit_economics_citations.json` (same directory).*

---

*Document: DMCGrid Operations + Unit Economics Blueprint · v1.0 · compiled 5 October 2026 · companion citation ledger: `dmcgrid_ops_unit_economics_citations.json` (28 sources) · companion product brief: DMCGrid two-sided B2B travel marketplace v1 (concierge-MVP decision).*
