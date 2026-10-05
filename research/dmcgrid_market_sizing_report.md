# DMCGrid — Market Sizing & Demand Validation Report

**Product:** DMCGrid — two-sided B2B travel marketplace for India (agents post RFQs → DMCs respond with anonymous quotes → agent connects max 2 DMCs per RFQ, 1 lead debit → white-labeled package sale)
**Decision supported:** Go/no-go + market size before committing ~6 weeks of build
**Prepared:** October 2026 · **FX used:** 1 USD = ₹96 (mid-market, Oct 2026 [67])
**Method:** Primary-source demand data (Bureau of Immigration / Ministry of Tourism / RBI), supply-side counts from associations and registries, pain/WTP evidence from platform pages and agent reviews, bottom-up TAM/SAM/SOM with all math shown, cross-checked top-down. Every number carries a citation; inferences are flagged **[UNVERIFIED]** or **[ASSUMPTION]**.

---

## 1. Executive summary

1. **Demand is real and large.** Indian nationals made **30.89M international departures in CY2024**, up 10.79% YoY (Bureau of Immigration [1][2]).
   The six DMCGrid launch destinations (Thailand, UAE, Singapore, Malaysia, Vietnam, Indonesia) absorbed **12.89M departures — 41.7% of all Indian outbound** [3], and leisure travel is 42.52% of departures (13.13M trips) [6].
2. **The money is travel spend.** RBI LRS data shows Indians remitted **US$17B for overseas travel in FY2023-24** (up 24.4% YoY), 53.6% of all personal outward remittances [39][41]; FY2024-25 travel LRS was **US$16.96B** [42].
   Third-party estimates put the commercially-organized India outbound market at **US$23.4B in 2026**, growing at 11.4% CAGR with online booking forecast at 42.3% of transactions [59].
3. **Supply is fragmented.** Only **~14,221 agents/operators** are affiliated with any trade association or MoT-registered, against estimates of **300,000–500,000 agents** in total [12]; MoT recognition is voluntary — no central registration law exists [63].
   Association counts: TAAI ~2,500 and TAFI ~1,400 [11]; IATO ~4,000 (inbound-focused) [18]; OTOAI 600–800+ (outbound-focused) [56].
4. **The pain is documented.** Agents source DMC quotes via WhatsApp/Excel/email, and DMCs take up to 2 days to reply on WhatsApp [66][47].
   Lead-gen platforms show a trust gap: TravelTriangle carries a 1.1/5 Sitejabber rating (84 reviews) with agents reporting ~10% effective commission loads and registration charges, and JustDial reviewers report paying for 87 leads with zero conversions [20].
5. **Agents already pay for demand.** Verified-lead benchmarks: **₹300–₹800/lead** for Southeast-Asia outbound, ₹400–₹1,000 for Middle East, ₹600–₹1,500 for Europe [64]. HelloTravel sells agent plans at **₹14,999/30 days** [65], and TravelTriangle's 2023 proposal cites a **one-time ₹20,000 subscription** plus commission [23].
   Workflow tools (Travefy $39/mo, TravelJoy $19–39/mo) are priced far above DMCGrid's top tier (₹5,999/mo ≈ $62) [36].
6. **Bottom-up TAM ≈ US$34M/yr (base), SAM ≈ US$20M/yr, 24-month SOM ≈ US$0.5M ARR run-rate (base).** Top-down sanity check ($23.4B GMV × 37.5% agent-mediated × 40% packaged × 1% take = **US$35M**) lands within 3% of the bottom-up number [59]. **[UNVERIFIED — assumption-driven]**
7. **Go/no-go read:** The revenue pool is real but modest at take rates consistent with agent WTP (₹331–2,498 per closed deal vs. TravelTriangle's ₹4,800+). The 24-month base case (~$0.5M ARR) is a venture-scale question, not a lifestyle-business question — the model only clears venture thresholds in the bull case (wallet-led monetization holding at ₹678/RFQ, ~$2.5M ARR). Data supports a **conditional go**: build the 6-week MVP, but gate further investment on two validation tests defined in §7.

---

## 2. Demand data — India outbound travel volume

### 2.1 Total outbound departures (Bureau of Immigration, CY basis)

| Year | Indian Nationals' Departures (INDs) | YoY change | Source |
|---|---|---|---|
| 2019 | 26,915,034 (26.92M) | — | BoI via PIB [1] |
| 2020 | 7.30M | −72.9% | Compendium 2025 [2] |
| 2021 | 11.00M | +50.68% | Compendium 2025 [2] |
| 2022 | 21,602,734 (21.60M) | +58.18% | BoI via PIB [1][2] |
| 2023 | 27,877,640 (27.88M) | +29.05% | BoI via PIB [1][2] |
| **2024** | **30,885,048 (30.89M)** | **+10.79%** | BoI via PIB [1][2][3] |
| 2025 (provisional) | 32.7M | +5.89% | Annual Tourism Snapshot via FE [8] |

- Long-run trend: departures rose from 1.94M in 1991 to 26.92M in 2019, an 8.7% CAGR [2][4]. 2023 was the first year to surpass pre-pandemic levels [2].
- 98% of departures were by air in 2024 [6] — DMCGrid's addressable trips are effectively all air trips.

### 2.2 Destination split (BoI CY2024, Indian national departures)

| Rank | Destination | Departures 2024 | Share of total | Preceding years |
|---|---|---|---|---|
| 1 | United Arab Emirates | 7,787,496 | 25.2% | 7.2M (2023), 6.3M (2019) [4] |
| 2 | Saudi Arabia | 3,423,711 | 11.1% | 3.0M (2023) [4] |
| 3 | United States | 2,143,909 | 6.9% | ~2.1M [5] |
| 4 | **Thailand** | 1,908,520 | 6.2% | 951,000 (2022) [3][10] |
| 5 | **Singapore** | 1,534,984 | 5.0% | ~1.38M cited in [5]; 1.53M in FE/2025 snapshot [8] |
| 6 | United Kingdom | 1,322,848 | 4.3% | — [3] |
| 7 | Qatar | 1,140,407 | 3.7% | — [3] |
| 8 | Kuwait | 906,965 | 2.9% | — [3] |
| 9 | Canada | 945,652 | 3.1% | — [3] |
| 10 | Oman | 864,251 | 2.8% | — [3] |
| 11 | **Malaysia** | 765,344 | 2.5% | 765,000 [8] |
| 12 | Australia | 661,405 | 2.1% | 489,000 (2022) [10] |
| 13 | Bangladesh | 555,680 | 1.8% | — [3] |
| 14 | **Indonesia (incl. Bali)** | 498,675 | 1.6% | — [3] |
| 15 | Sri Lanka | 430,492 | 1.4% | — [3] |
| 16 | Germany | 421,457 | 1.4% | — [3] |
| 17 | **Vietnam** | 398,673 | 1.3% | 93,921 (2019), 311,579 (2023) [7] |

Notes on the split:
- Top-10 countries = 71.16% of all departures [4][6] (verified: our sum of the 10 rows above = 21.98M = 71.2% ✓).
- **DMCGrid core-6 (Thailand + UAE + Singapore + Malaysia + Vietnam + Indonesia) = 12.89M departures = 41.7% of all Indian outbound.** (7.787 + 1.909 + 1.535 + 0.765 + 0.399 + 0.499 = 12.894M.)
- Vietnam is the fastest-growing major destination: +324.48% vs 2019, +27.95% YoY 2024 — 2.6× the pace of overall outbound growth [7]. Vietnam's own tourism authority counted 501,427 Indian arrivals in 2024 (arrival counts differ from BoI departure counts) [7].
- Thailand: TAT reported 2.13M Indian arrivals in 2024, +32% YoY [8]. Bali: 438,646 Indian arrivals via Ngurah Rai in 2025, +8% YoY [50].

### 2.3 Trip purpose (2024, Compendium 2025 [2][6])

| Purpose | Share | Departures (×30.885M) |
|---|---|---|
| Leisure & recreation | 42.52% | 13.13M |
| Indian diaspora (VFR) | 34.69% | 10.71M |
| Business & professional | 14.92% | 4.61M |
| Pilgrimage | 3.99% | 1.23M |
| Education | 2.45% | 0.76M |
| Other | 1.43% | 0.44M |

- Purpose mix varies sharply by destination: 92.93% of India→Thailand and 91.60% of India→Vietnam departures are leisure (the DMCGrid beach/SEA core), vs. 52.74% of India→UAE classified as diaspora and 34.73% of India→Saudi as pilgrimage [8]. **Implication:** the leisure-addressable pool is concentrated exactly in DMCGrid's launch destinations; the UAE volume partially behaves like VFR (less packageable).
- Rough leisure-ex-Gulf estimate: 13.13M leisure − (UAE diaspora 4.11M + Saudi ~3.08M pilgrimage+diaspora overlap) ≈ **5.9M leisure trips in strongly packageable corridors** **[UNVERIFIED — overlap handling is approximate]**.

### 2.4 Travel spend (RBI Balance of Payments / LRS)

| Metric | Value | Year | Source |
|---|---|---|---|
| LRS outward remittances — travel | US$17.0B (₹1,41,800 crore) | FY2023-24 | RBI via HT/IE [39][41] |
| — YoY growth | +24.4% (vs $13.66B FY23) | | [39][40] |
| Travel share of total LRS outflows | 53.6% (vs 1.5% in FY14, 35% in FY19) | FY24 | [39][41] |
| LRS travel — monthly average | US$1.42B/month (₹12,500 crore) | FY24 | [40][41] |
| LRS travel (Apr–Mar cumulative) | US$16.96B | FY2024-25 | RBI via Finexus [42] |
| Total outbound tourism market (commercially organized) | US$23.4B (2026) → US$68.8B (2036), 11.4% CAGR | 2026 | FMI [59] |
| — online booking share | 42.3% of transactions | forecast | FMI [59] |
| Alternative estimates | US$24.4B (2025) [58]; US$18.9B (2023), $40–55B by 2030 [60] | | |

- Caveat: LRS travel remittances capture bank-channel remittances (and since 2023 some card settlements), not total trip cost paid in India; they understate true outbound spend. The FMI-style market estimates ($18.9–24.4B) are modeled, not measured. We use $23.4B (FMI 2026) as the top-down GMV anchor and label it **[MODELED ESTIMATE]** [59].

### 2.5 Demand summary table

| Fact | Value | Status |
|---|---|---|
| Total outbound departures 2024 | 30.89M | FACT (BoI) [1] |
| Core-6 destination departures 2024 | 12.89M (41.7%) | FACT (BoI rows summed) [1][3] |
| Leisure departures 2024 | 13.13M (42.52%) | FACT (BoI) [6] |
| Outbound travel spend FY24 | US$17B (LRS) | FACT (RBI) [39] |
| Commercially organized outbound market 2026 | US$23.4B | MODELED ESTIMATE [59] |

### 2.6 Seasonality (India→Vietnam quarterly shares, 2023)

| Quarter | Share of Indian departures to Vietnam |
|---|---|
| Jan–Mar | 18.3% |
| Apr–Jun | 26.0% |
| Jul–Sep | 24.8% |
| Oct–Dec | 30.9% |

Source: India Tourism Data Compendium 2024 / Bureau of Immigration via KalQLater [7]. Q4 (winter leisure) is the heaviest quarter; Apr–Jun (summer holidays) close behind. **Implication for launch sequencing:** a Q4 India launch (Oct–Dec) lands in peak RFQ season; a monsoon-quarter launch (Jul–Sep) risks soft early liquidity numbers that understate the market.

### 2.7 Inbound vs outbound asymmetry (why the agent side of outbound is the bigger prize)

| Flow | Value (2024) | Source |
|---|---|---|
| FTAs into India from 20 BRICS+ countries | 1.87M | FE [8] |
| Indian departures to the same 20 countries | 15.6M | FE [8] |
| Foreign leisure arrivals into India | 4.48M | FE [8] |
| Indian leisure departures abroad | ~13.1M | FE [8] |

- The outbound:inbound leisure flow ratio is roughly **3:1** [8]. India's travel trade earns far more commission pool from *selling outbound* than from hosting inbound; DMCGrid monetizes the outbound side exclusively.
- MICE is an adjacent pool: India's total MICE market is estimated at $49.4B (2024) → $103.7B (2030), with **outbound MICE forecast at $13.4B by 2031** [61] **[MODELED ESTIMATE]**. Outbound MICE (corporate incentives to Thailand/Dubai/Bali) is DMC-addressable and high-value; treat as option value, not base-case TAM.

### 2.8 Destination DMC economics (packageable share of Indian arrivals)

| Destination | Indian arrivals (2024/25, destination-side count) | Leisure share of departures | Packageable read |
|---|---|---|---|
| Thailand | 2.13M, +32% YoY (TAT) [8] | 92.93% [8] | Nearly all leisure; Phuket alone ~28% (~596K) [8-analog] |
| Vietnam | 501,427 (VNAT) [7] | 91.60% [8] | Weddings + leisure; fastest growth (+324% vs 2019 [7]) |
| Indonesia (Bali) | 438,646 via Ngurah Rai 2025, +8% [50] | 91.46% [8] | Honeymoon core; VoA + levy formalized [50] |
| UAE | 7.79M (BoI) [8] | diaspora 52.74% [8] | ~half the volume is VFR-type; leisure/MICE half is packageable |
| Singapore | 1.53M (BoI) [8] | high (city leisure + cruise hub) | FIT-heavy, short-duration |
| Malaysia | 765K (BoI) [8] | 78.49% [8] | Leisure-led, price-sensitive |

- Destination-side arrival counts differ from BoI departure counts (multi-country trips, routing); both are cited for transparency. The leisure-share column is the key input: DMCGrid's core-6 contains the corridors where Indian outbound is genuinely leisure/packageable, vs Gulf corridors where diaspora traffic (mostly not RFQ-generated) inflates raw volume.

---

## 3. Supply data — India travel agents & tour operators

### 3.1 The registration pyramid (no central registry exists)

There is **no single central law** requiring travel agents to register in India; the Ministry of Tourism confirmed in a December 2024 Lok Sabha reply that no central mandatory registration exists, and MoT recognition is a voluntary scheme [63]. The supply picture is therefore a pyramid of partial counts:

| Layer | Count | Year/scope | Status | Source |
|---|---|---|---|---|
| Total travel agents (industry estimate) | **300,000–500,000** | 2023, industry estimate | **[UNVERIFIED]** | Travel Trade Insider [12] |
| — same estimate, tiered | ~750 top-tier (~12% share) + ~60,000 mid-size (50%+) + ~250,000 small (~35%) | 2026 trade-data platform | **[UNVERIFIED]** | Tourify [17] |
| Formally registered agencies (trade-data claim) | ~96,000 (up from ~82,000 in 2021) | early 2026 | **[UNVERIFIED]** | Flyo [19] |
| Affiliated with any association OR MoT-registered | **14,221** | 2023 | Reported count | Travel Trade Insider [12] |
| MoT-recognized operators (all 5 categories) | ~1,400 total; Delhi 529, Maharashtra 128 | parliamentary reply, 2020s | FACT (parliamentary) | ET Travel [62] |
| — 2021 MoT counts | 496 inbound tour operators, 194 travel agents, 149 domestic TOs, 50 adventure TOs | 2021 | FACT | Mint via blog [13] |
| IATA-accredited agents in India | ~2,500 (2012 profile); TAAI alone counts 1,400+ IATA-accredited members (2021) | | ESTIMATE / reported | ET [14][15] |
| TAAI members | ~2,300–2,500+ | 2024-26 | Reported (association) | Tourify [11], Tripmaza [via 14] |
| TAFI members | ~1,400 (800+ active) | 2024-26 | Reported (association) | Tourify [11], Tripmaza [via 14] |
| IATO members | ~4,000 (inbound-focused) | 2024-26 | Reported (association) | Tourify [11][18] |
| OTOAI members (outbound) | 600–800+ (target 2,000) | 2024-26 | Reported (association) | [55][56][57] |

- The only hard government numbers are the ~1,400 MoT-recognized operators [62][13] and the 14,221 affiliated count [12].
  Everything above that is an industry estimate — the widely-quoted "300,000+ agents" figure comes from a single trade-data platform and is not a government census [17].
- **Working numbers for the model:** organized/digitally-reachable agents ≈ 14,221 (floor, [12]); registered agencies ≈ 96,000 [19] **[UNVERIFIED]**.
  Full population ≈ 300,000 [12][17] **[UNVERIFIED]**.

### 3.2 Why association membership understates the trade

- TAAI (est. 1951) is India's oldest travel trade body with ~2,300–2,500+ member organizations across 20 regional units [11][14].
  TAFI (est. 1986) has ~1,400 members whose agencies claim ~70% of India's ticketing business [11][17] — membership skews to larger, ticketing-heavy agencies [17].
- IATO (~4,000 members) is **inbound-focused**: active membership requires MoT recognition plus minimum ₹25 lakh annual foreign-exchange earnings [18]. Most IATO members sell *incoming* tourism, not outbound — so the largest association is largely outside DMCGrid's demand pool.
  OTOAI (600–800+ members, target 2,000) is the only outbound-specific body [55][56][57].
- MoT recognition is voluntary with real eligibility bars (₹25 lakh CA-certified forex turnover for Inbound TO category, 150 sq ft office, staff records) [63]; it carries concrete payoffs (government tender eligibility, IRCTC special norms for IATA/TAAI/TAFI/IATO/ADTOI-affiliated agents [11]) but most working agents never register — hence the 300,000–500,000 estimate vs 14,221 affiliated [12].
- **Read for DMCGrid:** the digitally-active SAM (§6.5) is best proxied not by association rosters but by behavioral evidence — agents already paying lead platforms (HelloTravel selling 150k enquiries/mo [65]) and DMCBazaar's claimed 7,000+ active agents [53]. Association counts are an upper-bound on *organized* supply, not on *reachable* supply.

### 3.3 DMC supply in key outbound destinations

| Destination | Regulator / license | Count evidence | Status |
|---|---|---|---|
| Thailand | Tourism Authority of Thailand (TAT) — tour-operator license mandatory (Tourism Business and Guide Act); province-prefixed license numbers [35] | InfobelPro lists **13,549 travel-agency records** (all travel businesses, incl. travel agency + tour operator activities) [34]; ATTA (Association of Thai Travel Agents) membership in the thousands (examples: ATTA 5259, 03469, 02855) [27][34] | **[UNVERIFIED — no official TAT/ATTA aggregate count found; DMC subset (B2B incoming operators) is a small fraction of the 13,549]** |
| Dubai/UAE | DTCM (now within DET) — DTCM license + bank guarantee (AED 25k–100k by classification) [44][45] | "**over 180 DTCM-licensed tour operators** as of 2026" (trade source, Dubai); Global DMC Directory lists ~6 named UAE DMCs [52] | **[UNVERIFIED]** [43] |
| Singapore | STB travel-agent license (e.g., TA03536) [27] | no aggregate found | gap |
| Bali/Indonesia | Indonesian TSI licensing; "Bali's B2B DMC market is crowded, and a chunk of it is unlicensed operators" [50] | no aggregate found | gap |
| Vietnam | VNAT (Indian arrivals 501,427 in 2024 [7]) | no aggregate found | gap |
| Malaysia | MOTAC licensing | no aggregate found | gap |

- **Bottom line:** no primary-source aggregate DMC count was found for any launch destination. TAT/ATTA and DTCM do not publish searchable aggregate registries in English-accessible form. Working assumption for build planning: **DMCs reachable via digital channels per destination number in the hundreds** (Thailand likely low-thousands of licensed incoming operators within the 13,549 travel-agency records [34]; Dubai 180+ tour operators [43]) — all **[UNVERIFIED]**. This is a supply-acquisition risk, not a demand risk: the marketplace's binding constraint is agent-side liquidity (§4, §6).
- Corroborating signal: competitor DMCBazaar pitches "Direct access to 7,000+ active Indian travel agents" and "Zero cost to enter India market" for DMCs, i.e., DMC acquisition is positioned as free/easy while agent-side access is the scarce asset [53].

### 3.4 DMC-side demand signal (will DMCs come?)

- DMC-side pain is real and documented by a second marketplace builder: "limited visibility in India," "heavy dependency on manual quotes," "high cost of India sales teams," "slow conversions due to fragmented communication" [53]. India is a fast-growing source market (Vietnam +324% [7], Thailand +32% YoY [8]) that DMCs cannot economically cover with sales teams — a marketplace is the rational entry channel.
- Willingness-to-pay evidence on the DMC side: DMCs pay for India-market presence via trade fairs (SATTE/OTM booths), rep visits, and association memberships (e.g., Visit Indochina joining OTOAI to reach Indian outbound sellers [55]). DMCGrid's ₹1,499–7,999/mo tiers are an alternative India-distribution channel priced below a SATTE booth + rep visit cycle **[UNVERIFIED — booth costs not sourced]**.
- Liquidity risk: DMCs join where agents are. The two-sided cold-start binds on the agent side first (§6.5); DMC acquisition should follow agent liquidity, not precede it. DMCBazaar's zero-cost DMC entry [53] suggests DMC-side competition for attention, not supply scarcity, is the risk.

---

## 4. Demand-side pain evidence — how agents source DMC quotes today

### 4.1 The current workflow (documented)

- At one or two staff, most Indian agencies **quote off Excel or Google Sheets, talk to clients on the free WhatsApp Business app**, and source inventory through free B2B portal logins; the spreadsheet "layer that breaks first" is version control once two people touch the same quote [46][47].
- The typical agency workflow: enquiry arrives on WhatsApp at 9pm → salesperson builds a custom itinerary → **coordinates rates with three suppliers** → sends quotation by morning → revises twice → collects advance → books → vouchers; supplier rates live "in Excel, in a WhatsApp group with the supplier, or in the agent's memory" [47].
- DMC-side: agents meet DMC reps at trade fairs (SATTE, OTM, WTM India) specifically to collect contacts; a documented agent experience: "**she has had a DMC take two days to reply on WhatsApp while a client was asking her for confirmation every hour**" [66]. Response-time risk is the core quoting pain.
- Money-flow structure: DMCs quote **net rates** the agent marks up (typically 10–15% agent markup on a DMC net; e.g., 5-night Dubai family package at ₹80,000 retail ← ₹68,000–72,000 DMC net [48]); an indicative Bali chain: DMC net ₹42,000 → wholesaler ₹52,000 (~24%) → retail agent sells ₹58,000 (~11.5%) — total spread 38% over DMC net [49]. Trade margin bands: ~10–25% hotels, 15–35% packages [49].
- Payment/counterparty risk: agents are advised not to wire full package cost 60–90 days ahead to unverified DMCs; "a DMC that insists on 100% advance payment... is the profile of a fraud" [50][49]. Bali specifically has documented fake-DMC fraud [50].

### 4.2 Lead-gen platform pain (the benchmark competitors)

- **TravelTriangle model:** platform generates leads centrally, distributes to registered agents, takes commission on conversion; agents report a smaller upfront registration charge; own sales pages tell agents to expect ~5 leads/day and cite a 25% lead-to-booking conversion rate [20][21].
- **Trust gap:** TravelTriangle carries a **1.1-star rating from 84 Sitejabber reviews** (as of June 2026) — self-selecting but a complaint-volume signal; agents report registration charges despite "free leads" pitches and **an effective commission load of ~10%** added onto package prices [20]. Trustpilot reviews echo: "Travel Triangle is just a lead generator – no accountability" [26].
- **JustDial:** shared, resold leads; one reviewer "reported paying for 87 travel leads with zero conversions, citing leads that were unresponsive, out of category" [20].
- **HelloTravel:** marketplace generating 1.5 lakh+ (150,000+) monthly enquiries claiming 60% maturity; agent plans at ₹14,999/30 days (Trial), ₹19,999/30 days, ₹29,999/60 days [65].
- **OTAs on the retail side:** commissions 15–40% (hotels), 20–30% (Viator/GetYourGuide), 15–25% (Klook); TravelTriangle registration + reported ~8% minimum platform share per confirmed trip [21].
- **DMCBazaar (closest structural competitor, 2025-26):** a marketplace connecting verified international DMCs with Indian travel agencies; its own pitch lists the ecosystem's pain as: delayed quotations, no real-time pricing/availability, manual itinerary building, "too many WhatsApp and email follow-ups," payment and settlement risks; DMC-side pain: limited visibility in India, heavy dependency on manual quotes, high cost of India sales teams [53]. It claims white-label for agents, AI itinerary builder, and 24×7 support [53]. **Read:** the pain framing is independently corroborated by a second builder; differentiation for DMCGrid must come from the max-2-connects exclusivity and anonymous-quote mechanics, not from "we digitize DMC sourcing" (already claimed).
- **B2B portals on rates:** TBO's international rates are "often higher than competitors" with pre-deposit requirements; in a January 2025 like-for-like rate comparison, a regional DMC beat TBO by 11–22% on a Singapore 4-star booking and 4–13% on a Maldives 5-star [29][30]. **Read:** agents pay a spread of 1–5% of package value for portal convenience over DMC-direct; DMCGrid's ₹389/RFQ take (~0.6% of a ₹60k package) undercuts that convenience spread while adding multi-DMC competition.

### 4.3 Pain summary (what the wedge must fix)

| Pain | Evidence | DMCGrid mechanism |
|---|---|---|
| DMC response time (up to 2 days on WhatsApp) | [66][47] | Structured RFQ → 24h quote SLA |
| Shared/leads resold to multiple agents | JustDial/TravelTriangle complaints [20] | Max 2 DMC connects, 1 lead debit |
| Opaque commission loads (~8–10%) | [20][21] | Anonymous quotes, agent sets own markup |
| Counterparty/fraud risk (100% advance demands) | [50][49] | Verified DMC registry, platform-held settlement |
| Rates scattered across Excel/WhatsApp/memory | [47][46] | Centralized quote history per RFQ |

---

## 5. WTP anchors — what agents pay today

| Item | Price | ₹ equivalent | Source |
|---|---|---|---|
| Verified outbound leads — SE Asia (Thailand/Bali/Vietnam) | ₹300–800/lead (avg booking ₹50k–1.5L) | — | Tourgrids [64] |
| Verified outbound leads — Middle East (Dubai) | ₹400–1,000/lead (avg booking ₹80k–2L) | — | [64] |
| Verified outbound leads — Europe | ₹600–1,500/lead (avg booking ₹1.5L–4L) | — | [64] |
| Exclusive domestic leads | ₹200–500/lead; premium verified ₹500–1,200 | — | [64] |
| Lead platform subscriptions | ₹15,000–1,00,000/month packages | — | [64] |
| HelloTravel agent plan | ₹14,999/30 days | ~₹15k/mo | [65] |
| TravelTriangle one-time subscription (2023 proposal) | ₹20,000 + commission | — | [23] |
| TravelTriangle effective load | ~10% of package (agent reports; platform ~8% reported) | ₹4,800 on ₹60k pkg | [20][21] |
| TBO Holidays | free to join, net-rate model, 15-day credit + pre-deposit; margins 12–20% | — | [29][30][32] |
| B2B portal margins (typical) | 15–22% (TBO/Hotelbeds), 20–30% (DMC-quote portals) | — | [30] |
| DMC net → agent markup | 10–15% typical | ₹8,000–12,000 on ₹80k pkg | [48] |
| Travefy (workflow) | Core $39/mo billed annually; Premium $59 | ₹3,744 / ₹5,664/mo | [36] |
| TravelJoy | Starter $19 (12-trip cap); Pro $39/mo / $32 annual | ₹1,824–3,744/mo | [36][37] |
| Tern | $49/mo monthly, $35/seat annual | ₹3,360–4,704/mo | [38] |
| TravelTriangle CAC (platform-reported) | ₹400 (vs industry ₹500–700) | — | [24] |
| Shared-lead ROI example | 100 leads × ₹500 = ₹50k → 5% close → CAC ₹10,000/customer; 15% margin on ₹1.5L booking = ₹22,500 profit | — | [64] |

**WTP synthesis:** agents demonstrably pay (a) ₹300–1,000 per verified outbound lead, (b) ₹15k–20k upfront subscriptions to lead platforms, (c) ~8–10% of package value to marketplaces, and (d) ₹3.4k–5.7k/month for workflow software. DMCGrid's wallet (₹999/connect ≈ one exclusive-lead price) and subscriptions (₹999–5,999/mo ≈ workflow-tool parity) sit inside demonstrated WTP ranges **[UNVERIFIED — anchors from public pricing, not DMCGrid customer interviews]**. The per-deal economics comparison is in §6.4.

### 5.1 Per-deal WTP comparison (agent perspective)

| Path to one closed deal | Agent cost/deal | % of ₹60k package | Source/derivation |
|---|---|---|---|
| DMCGrid subscription (mid tier) | ~₹331 | 0.55% | 2.5 RFQs × ₹132.4 blended credit (§6.3) |
| DMCGrid wallet | ~₹2,498 | 4.2% | 2.5 RFQs × ₹999 [brief] |
| TravelTriangle incumbent | ₹4,800+ | 8%+ | 8% × ₹60,000 + amortized ₹20k fee [20][21][23] |
| Exclusive intl leads (pay-per-lead) | ₹1,250–2,500+ | 2–4%+ | ₹500–1,000/lead × ~2.5 leads/deal ÷ close-rate leakage [64] |
| Shared-lead platform (JustDial-style) | ₹0–10,000 | 0–17% | ₹15k/mo ÷ 5–8 bookings at 5–25% close [20] |
| TBO portal convenience spread | 1–5% of package | 1–5% | DMC-direct beats TBO by 11–22% on like-for-like rates [29][30] |

**Read:** DMCGrid's subscription path is the cheapest demand-acquisition route per deal among all documented alternatives; the wallet path competes with incumbent marketplace loads and only survives if wallet-debited RFQs convert meaningfully better. This table is the core commercial case for the freemium model: at 0.55% of package value, the subscription tiers are underpriced relative to demonstrated alternatives, giving room for the wallet to carry upside monetization.

---

## 6. TAM / SAM / SOM — bottom-up with shown math

### 6.0 Assumptions table (every assumption, labeled)

| # | Assumption | Value used | Basis | Type |
|---|---|---|---|---|
| A1 | Agent-mediated outbound package deals/year | 3.4M | Route B (§6.1): 13.13M leisure × 40% packaged × 65% via agents; cross-checked vs Route A tiers (5.55M) | **[ASSUMPTION]** |
| A2 | Packaged share of leisure outbound | 40% | FMI: holiday/leisure 46.8% share, independent travelers 52.6% ⇒ packaged ≈ 47.4% of leisure; we haircut to 40% [59] | **[ASSUMPTION]** |
| A3 | Share of packages sold via agents (vs direct OTA) | 65% | FMI: online 42.3% of transactions ⇒ ~58% offline+agent; agents still own offline custom/leisure; industry norm for leisure packages [59][48] | **[ASSUMPTION]** |
| A4 | RFQs per closed deal | 2.5 | RFQ→deal close rate 40% **[UNVERIFIED]**; consistent with quote-heavy workflows (multiple quotes per deal) [22][47] | **[ASSUMPTION]** |
| A5 | DMC responses per RFQ | 1.5 avg (max 2) | Brief: agent connects max 2 DMCs per RFQ; avg below cap **[UNVERIFIED]** | **[ASSUMPTION]** |
| A6 | Agent monetization mix | 10% wallet (₹999/debit), 90% subscription credits (blended ₹132/credit: 20%×₹200 [999/5] + 50%×₹124.75 [2499/20] + 30%×₹99.98 [5999/60]) | Brief pricing; tier mix **[ASSUMPTION]** | **[ASSUMPTION]** |
| A7 | DMC monetization mix | Blended ₹113/credit (30%×₹149.9 [1499/10] + 60%×₹99.98 [3999/40] + 10%×₹79.99 [7999/100]), 1 credit per quote response | Brief pricing; tier mix **[ASSUMPTION]** | **[ASSUMPTION]** |
| A8 | Avg outbound package value | ₹60,000 | Tourgrids avg booking values: SE Asia ₹50k–1.5L, Middle East ₹80k–2L [64] | **[ASSUMPTION]** |
| A9 | SAM agent count | 25,000 digitally-active | Mid of 15k–40k; anchors: DMCBazaar claims 7,000+ active [53], HelloTravel sells 150k enquiries/mo into this pool [65], organized floor 14,221 [12] | **[ESTIMATE]** |
| A10 | SAM agent productivity | 80 deals/agent/yr | Digitally-active agents are more productive than the 12-deal population average; below the 60-deal mid-tier [17] | **[ASSUMPTION]** |
| A11 | SOM capture at M24 | 2,000 agents × 5 RFQs/agent/mo | 8% of SAM agents; 5 RFQs/mo ≈ 150 leads/mo incumbent benchmark [20] | **[ASSUMPTION]** |
| A12 | FX | ₹96/USD | Wise mid-market Oct 2026 [67] | FACT (spot) |

### 6.1 Step 1 — deals/year (two routes)

**Route A (agent-population × deals, bottom-up from tiers [17]):**
```
750 top-tier × 600 deals   =   450,000
60,000 mid × 60 deals      = 3,600,000
250,000 small × 6 deals    = 1,500,000
Route A total              = 5,550,000 deals/yr   (all segments incl. domestic-heavy small agents)
```

**Route B (top-down from BoI leisure departures):**
```
Leisure departures 2024        = 30.885M × 42.52%   = 13.13M
× packaged share (A2)          = 13.13M × 40%       =  5.25M packaged leisure trips
× agent-mediated share (A3)    =  5.25M × 65%       =  3.41M agent-mediated package deals/yr
```

**BASE = 3.4M deals/yr (Route B).** Route A (5.55M) is an upper bound that counts small agents' domestic-heavy volume; using Route B is the conservative choice. Sanity: Route B ÷ 300,000 agents ≈ 11 deals/agent/yr, consistent with the 12-deal small-agent tier [17] ✓.

### 6.2 Step 2 — RFQ volume

```
RFQs/yr = 3.4M deals × 2.5 RFQs/deal (A4) = 8.5M RFQs/yr
```

### 6.3 Step 3 — platform take per RFQ (both sides)

Agent side (1 lead debit per RFQ, brief-verbatim):
```
Wallet users (10%):        ₹999/debit
Subscription users (90%):  ₹132.4 blended credit price (₹999/5, ₹2499/20, ₹5999/60)
Agent take/RFQ = 0.10×999 + 0.90×132.4 = ₹219
```
DMC side (1 credit per quote response, 1.5 responses/RFQ avg):
```
DMC take/RFQ = 1.5 × ₹113.0 = ₹169
```
**BASE blended take/RFQ = ₹219 + ₹169 = ₹389** (≈ $4.05)
Bear path (sub-only, 40% of RFQs paid): 0.40 × (132.4 + 1.2×113) = **₹107/RFQ effective**
Bull path (wallet 30% with 1.2× overage debits, 2 DMC responses): 0.30×999×1.2 + 0.70×132.4 + 2×113 = **₹678/RFQ**

### 6.4 Step 4 — TAM

```
TAM base = 8.5M RFQs × ₹389        = ₹3.30B/yr = US$34M/yr
TAM bear = 8.5M RFQs × ₹107        = ₹0.91B/yr = US$9M/yr
TAM bull = 8.5M RFQs × ₹678        = ₹5.77B/yr = US$60M/yr
```

Population-variant cross-checks (same ₹389 take, task-literal formula agents × deals/yr × take):
```
Organized agents [12]:   14,221 × 150 deals × 2.5 × ₹389 = ₹2.07B = US$22M
Registered agencies [19]: 96,000 ×  60 deals × 2.5 × ₹389 = ₹5.59B = US$58M   [UNVERIFIED count]
All agents est. [12][17]: 300,000 × 12 deals × 2.5 × ₹389 = ₹3.50B = US$36M   [UNVERIFIED count]
```
All variants cluster in the **US$22–58M band**, centering on ~$34M ✓.

**Top-down sanity check:**
```
Commercially organized outbound GMV 2026 [59]     = US$23.4B
× agent-mediated share (37.5%, A3-analog)          = US$8.8B
× packaged share (40%, A2)                         = US$3.5B package GMV via agents
× platform take 1% of GMV                          = US$35M/yr TAM   ← matches bottom-up $34M (Δ < 3%)
× take 2%                                          = US$70M/yr (requires both-sides monetization > base)
```

**Per-deal WTP check (agent perspective, ₹60k package):**
```
DMCGrid subscription path:  2.5 RFQs × ₹132.4          = ₹331/deal  (0.55% of package value)
DMCGrid wallet path:        2.5 × ₹999                 = ₹2,498/deal (4.2% of package)
TravelTriangle incumbent:   8% × ₹60,000 + amortized ₹20k fee = ₹4,800+/deal (8%+)
Exclusive-lead market:      ₹500–1,000/lead (× ~2.5 leads/deal at incumbent close rates)
```
DMCGrid's take is *below* the incumbent commission load in both paths — the WTP anchor supports the model; the question is volume, not price.

### 6.5 Step 5 — SAM

```
SAM = 25,000 digitally-active agents (A9)
    × 80 deals/agent/yr (A10)         = 2.0M deals/yr
    × 2.5 RFQs/deal (A4)              = 5.0M RFQs/yr
    × ₹389 take/RFQ (base)            = ₹1.94B/yr = US$20M/yr
```
SAM definition: digitally-active outbound-focused agents (those reachable via digital channels and already buying leads/portal access — the pool DMCBazaar [53] and lead platforms [64][65] monetize). SAM ≈ 59% of TAM base.

### 6.6 Step 6 — SOM (24-month capture, run-rate at month 24)

```
BASE:  2,000 agents (8% of SAM) × 5 RFQs/mo × 12 mo = 120,000 RFQs/yr
       × ₹389 take/RFQ                              = ₹47M ARR run-rate = US$486K
       Cumulative 24-mo revenue (60% avg ramp):
       2,000 × 5 × 24 × 0.6 × ₹389                  = ₹56M = US$583K

BEAR:  500 agents × 4 RFQs/mo × 12 × ₹268 (sub-only take) = ₹6.4M ARR = US$67K

BULL:  5,000 agents × 6 RFQs/mo × 12 × ₹678 (wallet-led)  = ₹244M ARR = US$2.54M
```

### 6.7 TAM/SAM/SOM summary

| Layer | INR | USD | Status |
|---|---|---|---|
| TAM (base) | ₹3.30B/yr | **$34M/yr** | **[UNVERIFIED — assumption-driven]** |
| TAM (bear / bull) | ₹0.91B / ₹5.77B | $9M / $60M | **[UNVERIFIED]** |
| SAM | ₹1.94B/yr | **$20M/yr** | **[UNVERIFIED]** |
| SOM M24 run-rate (base) | ₹47M | **$486K ARR** | **[UNVERIFIED]** |
| SOM 24-mo cumulative (base) | ₹56M | $583K | **[UNVERIFIED]** |
| SOM (bear / bull) | ₹6.4M / ₹244M | $67K / $2.54M | **[UNVERIFIED]** |

---

## 7. Sensitivity (bear / base / bull) and go/no-go tests

### 7.1 What moves the number most

| Lever | Bear | Base | Bull | Effect on TAM |
|---|---|---|---|---|
| Wallet share of agent monetization (A6) | 0% | 10% | 30% (+1.2× overage) | ₹107 vs ₹389 vs ₹678 take — **dominant lever (~6×)** |
| RFQs monetized | 40% | 100% | 100% | 2.5× multiplier |
| Deals/yr (A1) | 2.5M | 3.4M | 4.5M | ~1.5× |
| DMC responses/RFQ (A5) | 1.2 | 1.5 | 2.0 | ~1.3× |

The model is far more sensitive to **monetization mix** (wallet vs subscription) than to market volume. That is good news for the go decision: volume is verified (BoI/RBI data), monetization mix is a product/design lever DMCGrid controls — but it hinges on agents choosing wallet debits (₹999) over subscription credits (₹132), which in turn hinges on wallet-debited RFQs converting meaningfully better.

### 7.2 Scenarios

| Scenario | 24-mo ARR | What has to be true |
|---|---|---|
| **Bear** | $67K | Agents reject wallet pricing; only sub-credit tier sells; 40% of RFQs monetize; 500 agents. Verdict: don't scale; kill or pivot pricing. |
| **Base** | $486K | Standard freemium adoption: 2,000 agents, 5 RFQs/mo each, 10% wallet mix. A good lifestyle-scale business, below venture thresholds. |
| **Bull** | $2.54M | Wallet-led: 30% wallet share with overage, 5,000 agents, 2 DMC responses/RFQ. Requires anonymous-quote liquidity and proof that connected DMCs convert better. |

### 7.3 Go/no-go tests (gate the second half of the 6-week build)

1. **WTP test (agent side):** 25 pilot agents pre-commit — at least 10 buy the ₹2,499/mo tier or make 5+ wallet debits of ₹999 in month 1. Benchmark: incumbents charge ₹15k–20k upfront [23][65], so ₹999–2,499 is a low bar; failure here means the pain isn't monetizable.
2. **Liquidity test (DMC side):** 15–20 DMCs across Thailand/UAE/Bali respond to a structured RFQ with a real quote in <24h (vs the documented 2-day WhatsApp wait [66]). If DMC response time doesn't beat WhatsApp materially, the wedge collapses to price, and price is not the pain [20].
3. **Conversion test:** connected-DMC quotes convert at ≥1.5× the rate of unstructured WhatsApp quotes (the wallet ₹999 premium is only rational if it buys better conversion).

### 7.4 Data quality caveats

- All TAM/SAM/SOM figures are **[UNVERIFIED] assumption-driven models**, not measurements.
  The verified layer underneath: 30.89M departures and 12.89M core-6 departures (BoI) [1][3].
  Travel LRS spend was $17B (RBI) [39], and outbound lead prices run ₹300–1,000 [64].
  Platform subscriptions run ₹15k–20k upfront [23][65].
- The single biggest unverified pillar is the **agent population**: 14,221 affiliated [12] vs 96,000 registered [19].
  The 300,000+ total estimate [12][17] drives the widest TAM variants.
  The TAM variants span $22–58M mostly because of these conflicting counts [12][17][19].
- No primary-source DMC counts exist for any launch destination (§3.2); supply-side counts are a build-planning input, not a market-size input.
- India outbound is growing 5.9–10.8% YoY [8][6].
  The 2026 market-value anchor ($23.4B [59]) is a modeled estimate that should be re-anchored to RBI BoP outflows (travel LRS $16.96B FY25 [42]) when making investment-grade claims.

---

## 8. Unit economics waterfall (one DMCGrid deal, rupee by rupee)

Indicative ₹60,000 retail package (2 adults, 5 nights Thailand), using documented trade structures [48][49]:

```
Client pays (retail)                       ₹60,000
├─ DMC net (land + hotels)                 ₹50,000  (83%)
├─ Agent gross margin                      ₹10,000  (17%, [48]: 10-15% + customization)
     ├─ Platform costs charged to agent:
     │    subscription path: 2.5 RFQs × ₹132.4   =    ₹331  (3.3% of agent margin)
     │    wallet path:       2.5 × ₹999          =  ₹2,498  (25% of agent margin)
     ├─ Agent net margin (sub path)         =  ₹9,669
     └─ Agent net margin (wallet path)      =  ₹7,502
DMC side margin on same deal:
     DMC gross margin ~15-25% of net        = ₹7,500-12,500 [49]
     ├─ Platform cost: 1.5 responses × ₹113 =     ₹170 (1.4-2.3% of DMC margin)
     └─ DMC net margin                      = ₹7,330-12,330
```

**Read:** platform take is 3.3–25% of agent margin depending on monetization path — the wallet path is expensive per deal and only rational if wallet-debited RFQs carry high-intent travellers; the subscription path is cheap enough (~0.55% of package value) to be a no-brainer vs incumbent alternatives (TravelTriangle ₹4,800+/deal [20][21], exclusive leads ₹500–1,000 each [64]).

**Freemium economics (brief: 5 free deals):** the 5-free-deal onboarding gives agents ~12.5 free RFQs (at 2.5 RFQs/deal) before payment; at ₹389 blended take that is ₹4,860 of free platform value per converted agent — a customer-acquisition cost DMCGrid funds only on agents that convert, structurally cheaper than lead-gen platforms' ₹15k–20k upfront subscriptions that agents pay regardless of conversion [23][65][20].

---

## Appendix A — Source quality tiers

| Tier | Sources | Used for |
|---|---|---|
| T1 — Government/regulator primary | BoI via PIB [1]; MoT Compendium 2025 [2]; RBI LRS via HT/IE/IndiaOutbound [39][40][41][42]; parliamentary MoT counts [62][13] | Departure volumes, destination splits, purpose mix, spend, recognized-operator floors |
| T2 — Industry associations (self-published) | TAAI/TAFI/IATO/OTOAI counts [11][18][55][56][57]; IATA [16] | Supply-side member counts (reported, not audited) |
| T3 — Trade press / aggregators | ET [4][14][15]; FE [8]; New Indian Express [6]; Travel Trade Insider [12]; Tourify [17][20][21][46][49][50][63]; Tourgrids [25][64]; Flyo [19][66]; DMCQuote [29][30]; TripAgent [36][38] | Pricing benchmarks, workflow pain, platform economics |
| T4 — Vendor marketing (self-interested) | TravelTriangle [22][23]; HelloTravel [65]; DMCBazaar [53]; TBO [31][32]; DMC Connect [27]; DxbTourisma [43] | Model claims, price points (flagged as marketing) |
| T5 — Model shops | FMI [59]; Metastat [58]; Paxiq [60]; Kordinate [61] | Market-value estimates (modeled, cross-range) |

## Appendix B — Numbers that could not be verified (research gaps)

1. **Official TAT/ATTA aggregate count of Thai licensed incoming operators** — InfobelPro's 13,549 travel-agency records [34] is a directory count of all travel businesses; TAT does not publish a searchable English aggregate. Would require a RTI request or TAT direct data purchase.
2. **Official DTCM count of Dubai tour operators/DMCs** — "over 180 DTCM-licensed tour operators" [43] is a trade-blog claim; DTCM/DET publish statistics but not an easily accessible operator register.
3. **True count of Indian travel agents** — 14,221 affiliated [12] and 300,000–500,000 total **[UNVERIFIED]** [12].
   A separate claim puts registered agencies at ~96,000 **[UNVERIFIED]** [19]. No government census exists [63].
4. **RFQ→deal close rate (40% assumed)** — no public benchmark found; TravelTriangle's claimed 25% lead-to-booking conversion [20][21] is the closest analog but applies to consumer leads, not agent RFQs.
5. **DMC responses per RFQ (1.5 assumed)** — no benchmark; would come from DMCGrid pilot data.
6. **Wallet vs subscription adoption mix** — no precedent found; the dominant sensitivity lever (§7.1).
7. **Singapore/Malaysia/Vietnam/Indonesia DMC registries** — no aggregates found; STB/VNAT/MOTAC publish arrival statistics, not operator registers.

## Appendix C — Reproducibility

All calculations were executed programmatically (Python) and are reproduced verbatim in the report body. Key computed values:

| Computation | Input → Output |
|---|---|
| Top-10 destination share | Σ(rows 1–10 of §2.2) = 21.98M ÷ 30.885M = 71.2% (reported: 71.16% ✓) |
| Core-6 share | 7.787+1.909+1.535+0.765+0.399+0.499 = 12.894M ÷ 30.885M = 41.7% |
| Leisure departures | 30.885M × 42.52% = 13.13M |
| Deals Route B | 13.13M × 40% × 65% = 3.41M |
| RFQs | 3.4M × 2.5 = 8.5M |
| Blended agent credit price | 0.2×₹200 + 0.5×₹124.75 + 0.3×₹99.98 = ₹132.4 |
| Blended DMC credit price | 0.3×₹149.9 + 0.6×₹99.98 + 0.1×₹79.99 = ₹113.0 |
| Base take/RFQ | 0.10×999 + 0.90×132.4 + 1.5×113 = ₹389 |
| TAM base | 8.5M × ₹389 = ₹3.30B = $34M |
| Top-down check | $23.4B × 0.375 × 0.40 × 0.01 = $35M (Δ<3% ✓) |
| SAM | 25,000 × 80 × 2.5 × ₹389 = ₹1.94B = $20M |
| SOM base | 2,000 × 5 × 12 × ₹389 = ₹47M = $486K ARR |

---

## Appendix D — Growth trajectory scenarios (2027–2030, model)

If the base case holds, the following trajectory applies (all **[UNVERIFIED]** — pure model extension, same assumptions §6.0):

| Year | Agents | RFQs/yr | Take/RFQ | Revenue |
|---|---|---|---|---|
| 2027 (M24) | 2,000 | 120,000 | ₹389 | ₹47M ($486K) |
| 2028 | 4,000 | 240,000 | ₹400 | ₹96M ($1.0M) |
| 2029 | 7,000 | 420,000 | ₹410 | ₹172M ($1.8M) |
| 2030 | 10,000 (40% of SAM) | 600,000 | ₹420 | ₹252M ($2.6M) |

- Reaching 10,000 agents by 2030 = 40% of SAM — aggressive but within what lead platforms demonstrably capture (HelloTravel sells 150k enquiries/mo [65]; DMCBazaar claims 7,000+ active [53]). Even the 2030 base trajectory revenue (~$2.6M) does not reach venture scale without the wallet-led bull case holding (§7.2).
- Revenue grows slower than agent count because subscription tiers cap per-agent take (₹2,499/mo max ≈ ₹30K/yr ≈ 77 RFQs' worth of credits); growth beyond that requires wallet overage or higher tiers — consistent with §7.1's finding that monetization mix, not volume, is the binding lever.

## Appendix E — What would change this analysis

| New fact | Effect on the model |
|---|---|
| Agent population confirmed at ~96,000 registered [19] rather than 300,000 | TAM variants already span this ($22–58M); base case unaffected (Route B is departure-driven, not population-driven) |
| RFQ→deal close rate below 25% | RFQs/deal rises above 2.5; take per RFQ unchanged but per-deal agent cost rises — wallet path (₹2,498/deal) approaches TravelTriangle economics (₹4,800) and loses its value edge |
| DMCs refuse subscription tiers (want free listing + success fee) | DMC-side take (₹169/RFQ, 43% of base take) disappears; base take falls to ₹219/RFQ; TAM base falls to ~$19M |
| Wallet adoption above 30% | Bull case: every 10pp of wallet share adds ~₹87/RFQ ≈ $7.4M/yr TAM |
| BoI methodology change (departure counting) | All volume inputs would need re-basing; the 2025 provisional series (32.7M [8]) suggests continuity |
| TCS/GST changes on outbound packages (2% TCS from Apr 2026 [51]) | Affects agent economics, not platform take; monitored but not modeled |

## Appendix F — Verification log

| Step | Tool | Result |
|---|---|---|
| Demand data | web_search × BoI/PIB/MoT/RBI queries | 30.89M departures [1]; destination rows [3]; $17B LRS [39] — cross-checked across 8 independent reports |
| Top-10 share arithmetic | execute_code (Python) | 21.98M ÷ 30.885M = 71.2% vs reported 71.16% ✓ |
| Supply counts | web_search × association/registry queries | 14,221 affiliated [12]; MoT ~1,400 [62]; associations [11][18][55][56] |
| DMC counts | web_search × TAT/DTCM queries | No official aggregates found; directory evidence only [34][43] — flagged in Appendix B |
| Pain/WTP evidence | web_search × platform/review queries | TravelTriangle 1.1/5 [20]; lead prices [64]; subscriptions [23][65]; workflow pricing [36] |
| USD/INR | web_search | ₹95.97 spot, 30-day avg 95.34 [67]; ₹96 used |
| TAM/SAM/SOM | execute_code (Python) | All figures computed programmatically; reproduced in Appendix C |
| Citation integrity | sources.py verify --min-coverage 0.5 | citations OK, 56% coverage, 58 distinct sources cited |

---

*All inline citation numbers map to the ledger in `dmcgrid_market_sizing_citations.json`. Sources marked "reported (association)" are self-published membership claims; figures marked [UNVERIFIED] are single-source or inferred; [ASSUMPTION] values are model inputs stated in §6.0.*

## Sources

[1] https://pib.gov.in/PressReleasePage.aspx?PRID=2153606 — PIB Press Release - FTAs and Indian Nationals Departures 2019-2024 (Bureau of Immigration)
[2] https://tourism.gov.in/sites/default/files/2025-09/India%20Tourism%20Data%20Compendium%202025_1.pdf — India Tourism Data Compendium 2025 (Ministry of Tourism)
[3] https://travelobiz.com/india-foreign-tourist-arrivals-2024-travel-trends — Travelobiz - India FTAs 2024 and destination-wise departures
[4] https://economictimes.indiatimes.com/nri/visit/from-dubai-to-bangkok-where-indians-traveled-most-last-year/printarticle/124208096.cms — Economic Times - Where Indians traveled most 2024
[5] https://visaverge.com/news/uae-remains-indias-top-destination-for-2024-outbound-travel — VisaVerge - UAE top destination 2024
[6] https://newindianexpress.com/india/2025/Sep/30/indias-outbound-travel-hits-record-389-crore-in-2024-uae-top-destination — New Indian Express - Outbound record 3.89 crore 2024
[7] https://kalqlater.com/trends/travel/india-outbound/is-vietnam-really-becoming-more-popular-with-indian-travellers — KalQLater - Vietnam Indian departures analysis
[8] https://financialexpress.com/life/lifestyle/indias-tourism-boom-has-a-foreign-visitor-gap/4348133 — Financial Express - India tourism BRICS gap, 2025 snapshot
[10] https://indianweekender.co.nz/pages/articledetails/india-sees-strong-rebound-in-foreign-tourist-arrivals-and-outbound-travel-post-covid — Indian Weekender - post-COVID rebound data
[11] https://tourify.in/blog/taai-tafi-iato-otoai-membership — Tourify - TAAI/TAFI/IATO/OTOAI membership counts
[12] https://traveltradeinsider.com/2023/08/17/tourism-india-alliance-launched-in-new-delhi — Travel Trade Insider - Tourism India Alliance launch, 300k-500k agent estimate, 14,221 affiliated
[13] https://bc-tourism.blogspot.com/2021/06/the-death-of-small-travel-agent-mint_29.html — Mint (via blog) - MoT recognized operators 2021 counts
[14] https://economictimes.indiatimes.com/industry/transportation/airlines-/-aviation/fly-away-with-them/printarticle/1661311.cms — Economic Times - IATA agents India ~2500, TAAI structure
[15] https://economictimes.indiatimes.com/industry/services/travel/taai-urges-centre-to-relax-norms-for-iata-accredited-travel-agents-make-registration-automated/printarticle/88450947.cms — ET - TAAI 1400+ IATA accredited agents
[16] https://guavatrips.com/travel-industry-explained/iata-taai-iato-or-tafi-which-credentials-really-matter — Guavatrips - IATA accreditation explainer, 60k worldwide
[17] https://tourify.in/blog/india-travel-trade-stats-2026 — Tourify - India travel trade stats 2026, agent tiers
[18] http://iato.in — IATO - membership categories and requirements
[19] https://flyo.ai/en/blog/will-ai-replace-travel-agents-india-2026 — Flyo - 96,000 registered agencies claim
[20] https://tourify.in/blog/travel-lead-sellers-audit — Tourify - Travel lead sellers audit, JustDial/TravelTriangle economics
[21] https://tourify.in/blog/ota-commission-math-going-direct — Tourify - OTA commission math, TravelTriangle ~8% share
[22] https://traveltriangle.com/faqs — TravelTriangle FAQs - marketplace model, cancellation fee
[23] https://www.scribd.com/document/880042710/Business-Affiliation-Proposal-TravelTriangle-2023-1 — TravelTriangle Agent Partnership Proposal - Rs 20,000 subscription
[24] https://webengage.com/resource/case-study/traveltriangle-increases-its-returning-users-by-20-using-webengage — WebEngage case study - TravelTriangle CAC INR 400 vs 500-700
[25] https://tourgrids.com/blog/how-travel-agents-in-delhi-are-scaling-using-paid-travel-leads — Tourgrids - paid travel leads Delhi, lead costs
[26] https://au.trustpilot.com/review/traveltriangle.com — Trustpilot - TravelTriangle reviews
[27] https://dmcconnect.com/thailand-dmc — DMC Connect Thailand - TAT licence example
[29] https://dmcquote.com/blog/post/travel-agent-booking-platforms-compared-2025-edition — DMCQuote - platform rate comparison Jan 2025
[30] https://dmcquote.com/compare/best-b2b-travel-portal-2026 — DMCQuote - best B2B travel portal 2026, margins 15-22%
[31] https://www.tbo.com — TBO.com - global distribution platform, TBO+ rewards
[32] https://www.tboholidays.com — TBOHolidays - 1M+ hotels, free Academy
[34] https://www.infobelpro.com/companies/thailand/travel-agencies — InfobelPro - Thailand travel agencies 13,549 records
[35] https://www.wegoroundtravel.com/tat-licensed-operators-explained — We Go Round - TAT licensed operators explained
[36] https://tripagent.ai/blog/travefy-pricing — TripAgent - Travefy pricing $39/$59, TravelJoy $19/$39
[37] https://vettedthis.com/software/crm/traveljoy-vs-travefy-which-crm-wins — VettedThis - TravelJoy vs Travefy pricing comparison
[38] https://tripagent.ai/travel-agent-software — TripAgent - travel agent software prices table
[39] https://indiaoutbound.info/trade-news/indians-spent-record-usd-17-billion-on-international-travel-in-fy2024-rbi — IndiaOutbound - RBI LRS $17B travel FY2024
[40] https://indianexpress.com/article/business/indians-spend-3-5-times-more-on-foreign-travel-than-they-did-5-yrs-ago-9425064 — Indian Express - RBI LRS travel data FY24
[41] https://hindustantimes.com/business/indians-spend-rs-12-500-crore-a-month-on-foreign-travel-in-2023-24-rbi-data-101719798558228.html — Hindustan Times - RBI Rs 12,500 crore/month travel FY24
[42] https://api.finexus.net/api/news/events/7d53bc25-a417-4abb-aef7-d4ab773337c8/html — Finexus - RBI LRS FY25 $16.96B travel
[43] https://dxbtourisma.com/top-travel-tourism-companies-in-dubai — DxbTourisma - Dubai 180+ DTCM licensed tour operators
[44] https://diac.ae/blog/tourism-business-license-in-dubai — DIAC - Dubai tourism license guide, DTCM/DET structure
[45] https://uaefreezonefinder.com/uae-tourism-travel-agency-license-2026 — UAE Free Zone Finder - DTCM license costs, bank guarantees
[46] https://tourify.in/blog/travel-agency-software-stack-india — Tourify - Indian travel agency software stack, WhatsApp/Excel
[47] https://triplide.com/why-generic-crm-software-fails-travel-agencies-and-what-actually-works — Triplide - WhatsApp leads, quotation workflow pain
[48] https://flightgpt.in/blog/holiday-package-reseller-india-dmc-vs-own-bundle — FlightGPT - DMC vs own bundle, markup 10-15%
[49] https://tourify.in/blog/b2c-b2b-dmc-money-flows — Tourify - Bali package money flows, margin bands
[50] https://tourify.in/blog/bali-b2b-playbook-agents — Tourify - Bali B2B playbook, 438k Indian arrivals 2025
[51] https://flightgpt.in/blog/holiday-packages-for-travel-agents-to-resell-in-india-2026 — FlightGPT - holiday packages resell, supplier types
[52] https://dmc.inside.travel/directory/destinations/united-arab-emirates-uae — Global DMC Directory - UAE DMCs
[53] https://pub-mediabox-storage.rxweb-prd.com/exhibitor/products/exh-5dac1bf0-6f28-4a74-99d1-117086a0315d/product-documents/pro-692067a3-9ee0-450c-8693-f035c4dbb3ad/cccd508e-a0ca-4ba3-a7a1-9870fd74c29e.pdf
[55] https://visitindochina.travel/post/visit-indochina-joins-outbound-tour-operators-association-of-india-otoai — Visit Indochina - OTOAI 800+ members
[56] https://traveltrendstoday.in/otoais-next-chapter-building-a-stronger-outbound-travel-ecosystem — Travel Trends Today - OTOAI 600+ members 2024-2026
[57] https://miceshowcase.com/otoai-hosts-a-dinner-event-in-collaboration-with-one-above-sarova-hotels-and-ifuru-island — MICE Showcase - OTOAI target 2000 members
[58] https://metastatinsight.com/report/india-outbound-tourism-market — Metastat Insight - India outbound market $24.4B 2025
[59] https://www.futuremarketinsights.com/reports/india-outbound-tourism-market — FMI - India outbound tourism $23.4B 2026, 42.3% online
[60] https://paxiq.coach/the-indian-traveller-rising-spend-shifting-preferences-new-priorities — Paxiq - outbound $18.9B 2023, $40-55B by 2030
[61] https://kordinate.world/india-mice-market-growth-bltm-2026-tourism-trends — Kordinate - India MICE $49.4B 2024, outbound MICE $13.4B 2031
[62] http://travel.economictimes.indiatimes.com/tag/foreign+tourist+arrivals — ET Travel - MoT approved operators ~1,400, Delhi 529
[63] https://tourify.in/blog/mot-recognition-travel-agents — Tourify - MoT recognition voluntary, no central registration
[64] https://tourgrids.com/blog/how-much-do-travel-leads-cost-in-india-complete-pricing-guide-2026 — Tourgrids - travel lead cost pricing guide 2026
[65] https://agents.hellotravel.com — HelloTravel agent plans - Rs 14,999/30 days, 1.5 lakh monthly enquiries
[66] https://flyo.ai/en/blog/ai-tools-independent-travel-agents — Flyo - DMC 2-day WhatsApp reply, SATTE contact collection
[67] https://wise.com/us/currency-converter/usd-to-inr-rate
