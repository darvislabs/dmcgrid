# DMCGrid — Regulatory & Legal Compliance Report (India, 2024–2026)

**Date of report:** 5 October 2026 (Asia/Kolkata)
**Decision this research supports:** regulatory red lines before committing ~6 weeks of build.
**Scope:** (1) licensing for a B2B travel marketplace; (2) GST mechanics (tour operator rates, platform subscriptions, place of supply to foreign DMCs); (3) TCS on outbound tour packages; (4) TDS on payments to foreign DMCs; (5) RBI payment-aggregator / PPI / wallet risk; (6) Consumer Protection (E-commerce) Rules 2020 + dark patterns; (7) DPDP Act 2023 / Rules 2025; (8) trademark risk for "DMCGrid".
**Method:** primary instruments (CBIC notifications, RBI Master Directions, Acts, MeitY gazette, PIB, Ministry of Tourism) identified and cross-verified via multiple independent secondary sources; conflicts between secondary sources resolved and noted in-line. Citation IDs `[S#]` map to `dmcgrid_compliance_citations.json` in this directory.

**Flags used throughout:**
- `[UNVERIFIED]` — claim could not be confirmed against a primary source in this pass; verify before relying on it.
- `[NEEDS-CA]` — professional chartered-accountant / tax advice required for DMCGrid's specific facts.
- `[NEEDS-ATTORNEY]` — legal (non-tax) advice required.

---

## 0. Key instruments register (cite-accurate summary)

| # | Instrument | Number / reference | Date / effect | Status for DMCGrid |
|---|---|---|---|---|
| 1 | CGST services rate notification | Notfn 11/2017–Central Tax (Rate), dt 28.06.2017; amended by Notfn 20/2019–CT(R) w.e.f. 01.10.2019; post-56th Council by Notfns 15/2025 & 16/2025–CT(R) dt 17.09.2025, w.e.f. 22.09.2025 | tour operator services (SAC heading 9985) retained at **5% without ITC** through the Sept-2025 rationalisation | Governs the tour-operator-side rate on packages; DMCGrid itself is not a tour operator `[S1][S2][S3][S4][S5][S6]` |
| 2 | IGST services rate notification | Notfn 9/2017–Integrated Tax (Rate) dt 28.06.2017, as amended (incl. 20/2019–IT(R) dt 30.09.2019) | mirrors CGST rates | Mirror of row 1 `[S2]` |
| 3 | RCM on import of services | Notfn 10/2017–Integrated Tax (Rate) dt 28.06.2017, read with IGST §5(3) | ongoing | Applies when an Indian registered party buys services from a non-resident (e.g., DMC ground services) `[S28]` |
| 4 | §9(5) ECO-liable services | Notfn 17/2017–CT(R) dt 28.06.2017, amended by 23/2017–CT(R) dt 22.08.2017; restaurant service added per 45th Council (17.09.2021) | ongoing | Only notified passenger-transport/housekeeping/restaurant services are covered; **tour packages are not a §9(5) service** `[S39][S40]` |
| 5 | IGST §13(8)(b) omission (intermediary place of supply) | Finance Act 2026, §157 | w.e.f. 30.03.2026 | Intermediary/fee-style services to foreign recipients now export-eligible (zero-rated via LUT) `[S23][S24]` |
| 6 | TCS on LRS + overseas tour packages | §206C(1G), Income-tax Act 1961 (inserted by Finance Act 2020); FA 2023 rate restructure w.e.f. 01.10.2023; FA 2025 threshold ₹7L→₹10L w.e.f. 01.04.2025; Finance Act 2026 flat 2% w.e.f. 01.04.2026; renumbered as **§394(1), Income-tax Act 2025** (Act 30 of 2025, assent 21.08.2025, in force 01.04.2026) | current (FY 2026-27): **flat 2% on overseas tour packages, no threshold** | The Indian package seller (the agent) collects — never DMCGrid `[S42][S43][S44][S46][S56][S57][S60]` |
| 7 | TDS on payments to non-residents | §195, Income-tax Act 1961 (TDS chapter renumbered in ITA 2025 w.e.f. 01.04.2026 — exact new section numbers `[NEEDS-CA]`) | ongoing; Form 15CA/15CB route via AD bank | The agent is the remitter of DMC fees, not DMCGrid `[S71][S72][S75]` |
| 8 | TDS on contractor payments | §194C (resident contractors only; renumbered ~§393 in ITA 2025 `[NEEDS-CA]`) | ongoing; 1%/2%, per-payment ₹30k / aggregate ₹1L thresholds | Not applicable to payments to **foreign** DMCs `[S69][S70]` |
| 9 | TDS on e-commerce participants | §194O (introduced Finance Act 2020); rate cut 1%→**0.1% w.e.f. 01.10.2024** by Finance (No. 2) Act 2024 | ongoing | Triggered only if DMCGrid pays participants for supplies made through it `[S64][S65][S66][S67]` |
| 10 | Payment & Settlement Systems Act | PSS Act 2007 (Act 51 of 2007) | §4: no entity other than RBI may operate or commence a payment system without authorisation | The wall around the wallet/PA models `[S88]` |
| 11 | PA Guidelines (original) | RBI/DPSS/2019-20/174 (DPSS.CO.PD.No.1810/02.14.008/2019-20), dt 17.03.2020, updated 17.11.2020 | **repealed** 15.09.2025 | Historical `[S84][S89]` |
| 12 | PA-Cross Border circular | RBI/2023-24/80, dt 31.10.2023 | **repealed** 15.09.2025 | Historical `[S91][S92][S95]` |
| 13 | **PA Master Direction (current)** | **RBI/DPSS/2025-26/141, CO.DPSS.POLC.No.S-633/02-14-008/2025-26 — "Reserve Bank of India (Regulation of Payment Aggregators) Directions, 2025", dt 15.09.2025** | in force; three categories: PA-Online, PA-Cross Border, PA-Physical | Defines exactly what DMCGrid must not do with money `[S83][S84][S85][S86]` |
| 14 | PPI Master Direction | Master Direction on Prepaid Payment Instruments, dt 27.08.2021 (RBI ref `[UNVERIFIED]` — RBI page id=12156) | in force; closed PPIs removed from PPI ambit | Governs the ₹999 "wallet alternative" `[S96][S97][S98]` |
| 15 | Consumer Protection Act + E-commerce Rules | CPA 2019; Consumer Protection (E-commerce) Rules 2020, notified 23.07.2020 (gazette number `[UNVERIFIED]`) | in force | Conduct duties on the platform; B2B not exempt `[S100][S101]` |
| 16 | Dark patterns guidelines | CCPA "Guidelines for Prevention and Regulation of Dark Patterns, 2023", issued under CPA §18, dt 30.11.2023 | in force; travel booking sites explicitly within scope | UX red lines `[S104][S105][S106]` |
| 17 | Data protection | DPDP Act 2023 (Act 22 of 2023, assent 11.08.2023); **DPDP Rules 2025, G.S.R. 846(E), notified 13.11.2025** | Rules phased: 13.11.2025 (Rules 1,2,17–21) / 14.11.2026 (Rule 4) / **14.05.2027 (substantive core: Rules 3, 5–16, 22)** | Data-fiduciary build obligations, with runway `[S108][S109][S110][S112]` |
| 18 | FDI policy | Press Note 3 (2016 Series) marketplace/inventory definitions; Press Note 3 (2026 Series), DPIIT, dt 23.07.2026 (export-only inventory carve-out) | in force | B2B marketplace model = 100% FDI automatic route `[S120][S121][S122]` |
| 19 | FEMA | FEMA 1999; RBI Master Direction — Export of Goods and Services (updated 17.07.2026) | in force | DMC fees and forex receipts only through AD banks `[S125][S126][S127]` |
| 20 | Ministry of Tourism recognition | Guidelines for Recognition as an Approved Travel Agent (revised w.e.f. 04.12.2009); MoT Lok Sabha reply 12.12.2024 | **voluntary** — no central licence required to trade | Optional credibility signal, not a barrier `[S76][S77][S78]` |

---

## 1. Executive summary

**Verdict: DMCGrid is buildable in v1 with no sector licence, no RBI authorisation, and no travel-trade registration — provided it stays structurally out of the money flow and out of the package sale.** The dangerous versions of the product are all payment-shaped or principal-shaped, and each has a precise statutory tripwire.

1. **No licence needed to run the marketplace itself.** India has no central law mandating registration or licensing for travel agents, tour operators, or B2B travel marketplaces; the Ministry of Tourism confirmed in a Lok Sabha reply (12 Dec 2024) that its recognition scheme is voluntary `[S17][S18][S19][S76]`. DMCGrid needs ordinary incorporation (MCA), GST registration, and standard commercial contracts. FDI: the B2B marketplace model is on the 100% automatic route; only inventory-based models are restricted, and the 23 July 2026 Press Note 3 (2026 Series) carve-out is export-of-goods-specific — irrelevant to a services marketplace `[S120][S121][S122]`.

2. **GST has three distinct rate questions and one trap.** (a) Tour operator packages: 5% without ITC (SAC 9985), retained through the 22 Sept 2025 two-slab restructuring `[S21][S22][S23][S24][S25][S26][S27]`. (b) DMCGrid's own B2B subscription/credit/lead fees: 18% `[S75][S77]`. (c) Services billed to foreign DMCs in forex: place of supply follows the recipient's location, and since Finance Act 2026 removed IGST §13(8)(b) (w.e.f. 30.03.2026), even fee/intermediary-style services to foreign DMCs qualify as zero-rated exports via LUT `[S23][S24]`. **The trap:** if DMCGrid ever collects the consideration for supplies made through it, it becomes a GST "e-commerce operator" — mandatory registration regardless of turnover, TCS up to 1% (monthly GSTR-8), plus possible §9(5) tax-liability shifting `[S36][S37][S38][S39][S40]`.

3. **TCS on outbound tour packages is collected by the package seller — the Indian agent, never the platform.** Current law (FY 2026-27): flat 2% from the first rupee, no threshold, §394(1) ITA 2025 (formerly §206C(1G)) `[S42][S43][S44][S46][S56][S57][S60]`. Journey: 5%/20% around ₹7L (w.e.f. 01.10.2023) → threshold raised to ₹10L (w.e.f. 01.04.2025) → flat 2% (w.e.f. 01.04.2026). DMCGrid must build the TCS field into agent-facing tooling (per-PAN tracking, challan reference) but must never position itself as the collectee.

4. **TDS on DMC fees belongs to the agent, not the platform.** §195 (payments to non-residents, Form 15CA/15CB via AD bank) and, where a resident contractor is somehow in the chain, §194C — both are the payer's obligations `[S69][S70][S71][S72][S75]`. §194O (0.1% e-commerce participant TDS) is only triggered if DMCGrid actually pays participants for supplies made through it — another reason to never touch deal consideration `[S64][S65][S66][S67]`.

5. **Payment aggregation is the single hardest red line.** Since 15 Sept 2025 (RBI/DPSS/2025-26/141), any aggregation of payments — online, physical, or cross-border — requires RBI authorisation: ₹15 crore net worth at application, ₹25 crore by year 3, escrow, FIU-IND, CERT-In audits, KYC `[S83][S84][S85][S86]`. DMCGrid at ₹999/connect cannot and must not build any payment-collection feature. Invoicing + direct bank transfer between agent and DMC is the v1-safe pattern. The ₹999 "wallet alternative" is safe **only** as a pre-paid usage credit for DMCGrid's own platform fees (a closed-system instrument) — it must never become a stored monetary balance payable to third parties `[S96][S97][S98]`.

6. **Consumer-protection duties apply even to B2B.** CCPA has penalised a B2B marketplace (₹10 lakh penalty on Dial4Trade Technologies for a regulated-product listing) — B2B marketplaces are **not** exempt from the CPA 2019 `[S100][S101]`. The 2023 dark-patterns guidelines explicitly name travel booking sites; the anonymous-quote design is defensible but disclosure, grievance, and no-deceptive-UX duties remain `[S104][S105][S106]`.

7. **DPDP is a build requirement with a runway.** DPDP Act 2023 is in force (assent 11.08.2023); DPDP Rules 2025 (G.S.R. 846(E), 13.11.2025) phase in through 14 May 2027 — the substantive core (consent notices, security safeguards, breach notification, retention, cross-border transfers) lands 14.05.2027 `[S108][S109][S110][S112]`. Penalties reach ₹250 crore per breach category `[S111]`. DMCGrid holds traveller PII and cross-border data flows to DMCs — consent architecture, purpose limitation, and a cross-border transfer review against the eventual negative list must be designed in now, cheaply.

8. **"DMCGrid" trademark: low conflict risk, act early.** No conflicting "DMCGrid" marks surfaced in public search `[UNVERIFIED — IP India public search requires OTP login; formal clearance search NEEDS-ATTORNEY]`. File in Classes 35 (marketplace/lead services), 39 (travel arrangement), and 42 (SaaS platform) before launch marketing scales.

**The five hard red lines for v1 are:** (R1) never collect, hold, or settle deal consideration between agent and DMC; (R2) never sell or broker tour packages as principal; (R3) never build a stored-value wallet payable to anyone but DMCGrid's own fee ledger; (R4) never run deceptive-UX dark patterns in quote comparison; (R5) never market to or process children's data, and publish DPDP-grade consent/notice architecture from day one.

---

---

## 2. Topic 1 — Does DMCGrid need a licence? (Travel trade / OTA / aggregator)

**Answer: No central licence, registration, or government approval is required to operate a B2B travel marketplace in India. What DMCGrid needs is ordinary incorporation, GST registration, and commercial contracts.**

### 2.1 The no-licence position (primary source)

- The Ministry of Tourism's recognition scheme for travel trade service providers is explicitly **voluntary**. In a Lok Sabha reply dated 12 December 2024, the Ministry of Tourism stated there is no mandatory registration for travel agents and that recognition under its schemes is voluntary. PIB release "Registered and Unregistered Travel Agents in the Country," 12 DEC 2024 `[S76]`.
- The operative MoT instrument is the *Guidelines for Recognition/Renewal as an Approved Travel Agent*, revised with effect from 4 December 2009 — a recognition (not licensing) scheme that confers a government-approval marketing credential, not a legal right to trade `[S77]`.
- IATA accreditation and TAAI/TAAK memberships are commercial/industry credentials, not statutory licences `[S18][S78]`.
- There is no central statute regulating "online travel agencies" or B2B travel aggregators as a category. The conduct duties that do apply come from general law: Consumer Protection Act 2019 (see Topic 6), DPDP Act 2023 (Topic 7), GST/income-tax law (Topics 2–4), FEMA (Topic 2.4), and IT Act 2000 intermediaries (Topic 6.3).

### 2.2 What DMCGrid must have (the ordinary-business floor)

- Company incorporation via MCA SPICe+ (NIC code 79110 — travel agency activities; or 62012/63112 for platform services) `[S79]`.
- GST registration (mandatory for e-commerce operator status if ever collecting consideration — see Topic 2.6; and required for normal B2B service supply) `[S36]`.
- Commercial contracts: agent T&Cs, DMC T&Cs, marketplace listing policy, quote-anonymity policy, data-processing agreements with DMCs.

### 2.3 State-level outliers [NEEDS-ATTORNEY]

A small number of states have historically imposed local municipal/shop-establishment or state-specific travel-trade rules on physical travel agencies (e.g., certain state tourism departments requiring registration of tour operators operating within the state). These generally do not reach a pure online B2B software platform, but DMCGrid should confirm the position for its state of incorporation `[NEEDS-ATTORNEY][S18]`.

### 2.4 FEMA overlay: money flows through AD banks only

- Payments for DMC ground services are current-account transactions under FEMA 1999. Foreign exchange receipts and remittances go only through Authorised Dealer (AD) Category-I banks `[S125][S126][S127]`.
- The agent remits DMC fees; DMCGrid never remits, collects, or nets them (see Topic 5 for the PA perimeter).
- If DMCGrid itself invoices foreign DMCs (subscription tier for DMCs), it receives forex — this is an export of services (see Topic 2.7) and is settled via its own AD bank, with e-FIRA/FIRC documentation.

### 2.5 FDI position

- The B2B **marketplace model** for services is 100% FDI via automatic route. The marketplace/inventory binary dates from Press Note 3 (2016 Series); the 23 July 2026 Press Note 3 (2026 Series) relaxes FDI only for **export-of-goods** inventory e-commerce — it does not change the services-marketplace position `[S120][S121][S122]`.
- DMCGrid's v1 revenue model (subscriptions, connect credits, top-ups, add-ons — all billed to registered businesses) is squarely marketplace-model-friendly. The inventory-model restrictions (and their related conduct conditions) would only be triggered if DMCGrid started buying and reselling travel inventory as principal — see red line R2.

---

## 3. Topic 2 — GST mechanics

### 3.1 Tour operator services: 5% without ITC (the package rate)

- **Instrument:** Notification 11/2017–Central Tax (Rate), dt 28.06.2017 (SAC heading 9985 entry); amended by Notification 20/2019–Central Tax (Rate), w.e.f. 01.10.2019; amended post-56th Council by Notifications 15/2025 and 16/2025–Central Tax (Rate), dt 17.09.2025, w.e.f. 22.09.2025 `[S1][S2][S3][S4][S5][S6]`.
- **Rate:** **5% on the gross package value, without ITC**, for a bundled package (hotel + transport + sightseeing sold as one all-inclusive price), where the operator acts as **principal**. SAC 9985 (tour operator service) `[S21][S22][S23][S24][S25][S26][S27]`.
- **The 56th GST Council (3 Sept 2025) collapsed most slabs into 5% / 18% (+40% demerit) effective 22.09.2025, but left tour operator services at 5% without ITC.** PIB confirmed tour operators stay at 5% no-ITC after the rationalisation `[S21][S23][S25][S26]`.
- **The invoice condition that sustains 5%:** the invoice must show one gross figure stated as *inclusive of accommodation and transportation charges*. Itemising hotel + transport + margin as separate lines converts the supply into an agent-style (commission) service — 18% `[S22][S24]`.
- **ITC exception:** ITC is available only on GST paid to **another tour operator in the same line of business** (e.g., a 5%-invoicing DMC sub-contracted on part of a circuit). GST paid to hotels/cab companies is not creditable `[S22][S24]`.
- **Relevance to DMCGrid:** DMCGrid is **not** the tour operator — the agent and the DMC are. DMCGrid's product must *surface* this rate decision to agents (per-deal GST field with 5%-vs-18% logic), not make it for them. See Topic 3.6 for the platform's own rate.

### 3.2 Pure agent / commission supplies: 18% with ITC

- When an Indian party books a single service (hotel, transfer, event) for a client and charges a fee or earns commission — and when a platform charges a subscription or lead fee — the supply is a service taxed at **18%** (SAC 9985xx series: 998513/998514 for agency and platform services) `[S75][S77]`.
- ITC is fully available on business expenses against 18% output liability `[S22]`.

### 3.3 DMCGrid's own B2B subscription / credit / lead / top-up fees: 18%

- All DMCGrid revenue (₹999/₹2,499/₹5,999 agent tiers, ₹1,499/₹3,999/₹7,999 DMC tiers, connect credits, top-ups, add-ons) is **18% GST** as B2B services (SAC 9983xx/9985xx — confirm exact SAC with CA) `[NEEDS-CA][S75][S77]`.
- Intra-state: CGST 9% + SGST 9%; inter-state: IGST 18%.
- Place of supply for B2B services = recipient's registered location `[S75]`.
- **If DMCGrid ever collects consideration for supplies made through it** (i.e., inserts itself into the agent↔DMC payment flow), §52 CGST TCS + mandatory ECO registration apply — see Topic 3.5. This is the core architectural red line.

### 3.4 The principal-vs-agent trap (design rule for the platform)

- The **same deal** can be 5% or 18% depending on structure: bundled all-inclusive package sold as principal → 5% no ITC; itemised hotel + transport + fee → 18% with ITC `[S22][S24]`.
- DMCGrid's proposal generator must **not** pre-decide this for the agent. The safe design: a per-deal GST mode selector with the two structures offered, plus an invoice-format rule that matches the selected mode (single gross-inclusive line for 5%; itemised for 18%).

### 3.5 GST e-commerce operator (ECO) exposure — the §52 trap

- **If DMCGrid collects the consideration for supplies made through it** (agent pays DMC via DMCGrid), it becomes an "electronic commerce operator" under CGST: mandatory registration under §24(x) regardless of turnover, TCS collection at up to 1% (0.5% CGST + 0.5% SGST / 1% IGST) on the net value of taxable supplies, monthly **GSTR-8**, and Form REG-07 registration `[S36][S37][S38][S39][S40]`.
- §9(5) notifications (Notfn 17/2017–CT(R), amended by 23/2017–CT(R)) shift tax liability to the ECO only for **notified** services: passenger transport by radio-taxi, housekeeping, restaurant — **tour packages are not notified**, but §52 TCS would still apply to the collection itself `[S39][S40]`.
- **Red line R1:** v1 must never collect deal consideration. DMCGrid invoices its own fees; agent↔DMC money moves directly between their banks.

### 3.6 Place of supply for services to foreign DMCs — export of services

- **The §13(8)(b) problem is gone.** Until 30.03.2026, intermediary services had place of supply = supplier's location (India) → 18% IGST, no export benefits. Finance Act 2026 §157 omitted IGST §13(8)(b); place of supply now follows the default §13(2) rule (recipient's location) `[S23][S24]`.
- **Consequence for DMCGrid:** subscriptions and platform fees billed to foreign DMCs in forex now qualify as **export of services** (IGST §2(6): supplier in India, recipient abroad, consideration in forex, supplier and recipient not merely establishments of each other) → **zero-rated**: either (a) file LUT (Letter of Undertaking) before the FY begins and invoice without GST, or (b) charge IGST and claim refund under §54 `[S23][S24][S28]`.
- **Conditions to verify with CA** `[NEEDS-CA]`: forex receipt through AD bank; LUT filed (Form GST PMT-04); recipient is a distinct person abroad; TRC (tax residency certificate) if needed for the DMC's jurisdiction.
- **Watch-out:** the same Finance Act 2026 amendment means if DMCGrid uses a **foreign** agent/intermediary (e.g., an overseas sales rep earning commission), that inbound payment becomes an **import of services** → 18% IGST under RCM (self-invoice, §31(3)(f)) `[S23][S28]`.
- **Import of services generally (RCM):** when an Indian registered party buys services from a non-resident, RCM applies under Notfn 10/2017–IT(R) read with IGST §5(3) — the Indian recipient self-accounts for IGST (creditable if used for taxable supplies). Note: the **DMC agent** (if GST-registered) buying ground services from a foreign DMC is the one making this RCM payment — DMCGrid should surface this obligation in agent education, not absorb it `[S28]`.

### 3.7 GST summary table

| Flow | Rate | Who charges/collects | Notes |
|---|---|---|---|
| Agent's bundled package to customer (principal) | 5% no ITC | Agent | Invoice must show single gross-inclusive figure `[S21][S22][S24]` |
| Agent's itemised/fee-based supply | 18% with ITC | Agent | Hotel line + transport line + fee `[S22][S75]` |
| DMCGrid subscription/credits to Indian agents | 18% | DMCGrid | SAC 9983xx/9985xx `[NEEDS-CA]` |
| DMCGrid subscription to foreign DMCs | Zero-rated (LUT) | DMCGrid | Export of services post-FA 2026; LUT via PMT-04 `[S23][S24]` |
| DMC ground services sold to Indian agent | 5% (if DMC is tour-operator-principal) or 18% (fee-based) | DMC | DMC's own rate decision `[S21][S22]` |
| Agent buying DMC ground services (import of services if DMC is abroad) | RCM 18% self-accounted | Agent (if GST-registered) | Notfn 10/2017–IT(R) `[S28]` |
| If DMCGrid collects deal consideration | §52 TCS up to 1% + GSTR-8 | DMCGrid | **Never do this in v1** `[S36][S37][S38]` |

---

---

## 4. Topic 3 — TCS on outbound tour packages under LRS

**Answer: The Indian agent who sells the package collects TCS — DMCGrid never does. Current rate (FY 2026-27): flat 2% from the first rupee, no threshold.**

### 4.1 The obligation and who bears it

- **Statutory basis:** §206C(1G), Income-tax Act 1961 (inserted by Finance Act 2020) — now renumbered as **§394(1), Income-tax Act 2025** (Act 30 of 2025, assent 21.08.2025, in force 01.04.2026) `[S42][S56][S57][S60]`.
- **Who collects:** "every seller of an overseas tour programme package" — i.e., the **Indian tour operator/agent selling the package to the customer**. TCS is collected at the earlier of payment receipt or invoice/debit `[S42][S43][S44][S46]`.
- **"Overseas tour programme package"** includes any package covering travel + hotel stay + boarding + lodging + similar related expenditure, sold as a single unit `[S42][S43]`.
- **DMCGrid's position:** DMCGrid is a B2B marketplace that connects agent and DMC and never sells packages to end customers. **The TCS obligation sits on the agent alone.** DMCGrid's job: surface TCS in the agent's deal ledger (per-PAN customer tracking, rate applied, challan reference) so the agent can comply — never collect on the agent's behalf, never present itself as the seller.

### 4.2 Rate journey (2016 → FY 2026-27), with conflict resolution

The secondary sources conflicted on whether the above-threshold rate was cut from 20% to 10% in October 2024. Resolution: **that cut applied to §206C(1G)(i) — LRS remittances — not to §206C(1G)(ii) — overseas tour packages**, which stayed at 20% above threshold until Budget 2026. The 01.10.2024 Finance (No. 2) Act 2024 rate cuts hit TDS sections (194DA/194G/194H etc.) and the LRS remittance slab, not the tour-package slab `[S44][S58][S59][S60]`.

| Period | Threshold | Tour-package TCS | LRS remittance TCS (other purposes) |
|---|---|---|---|
| Pre-01.10.2023 | ₹7L | 5% | 5% |
| 01.10.2023 → 31.03.2025 | ₹7L | 5% up to ₹7L / 20% above | 20% above ₹7L |
| 01.04.2025 → 31.03.2026 (FY 2025-26) | ₹10L | 5% up to ₹10L / **20% above** | 20% above ₹10L (LRS-only cut to 10% from 01.10.2024) |
| 01.04.2026 → (FY 2026-27) | none | **flat 2%** | 20% above ₹10L (unchanged) |

- FA 2025 raised the §206C(1G) threshold from ₹7L to ₹10L w.e.f. 01.04.2025 `[S43][S44][S56]`.
- **Budget 2026 (Finance Bill/Act 2026): flat 2% on overseas tour packages, threshold removed entirely**, effective FY 2026-27 (01.04.2026). Education/medical LRS also cut 5%→2% above threshold; education-loan-funded stays at 0.5% `[S46][S47][S48][S56][S57]`.
- Reported practical effect: a ₹30 lakh destination wedding package previously attracted ~₹4.5 lakh TCS; under the flat 2% it is ₹60,000 `[S46]`.

### 4.3 TCS mechanics the agent must run (DMCGrid's design obligations)

- TCS collected at the earlier of (a) receipt of payment, or (b) debit of the amount to the buyer's account `[S42]`.
- Per-PAN, per-FY tracking; deposit by the 7th of the following month; report in TCS return (Form 27EQ quarterly) and issue Form 27D certificates `[S43][S46]`.
- TCS is a **prepaid credit** — adjustable against the buyer's final tax liability, refundable via ITR (Form 26AS/AIS reconciliation) `[S46]`.
- No TCS if the buyer furnishes a declaration under §206C(1G) proviso (e.g., for export purposes — s.206C(1G) proviso, and s.206C(9) / Form 27C-type declarations) `[NEEDS-CA]`.
- **DMCGrid build requirements:** the agent's deal ledger must carry a TCS field (rate, amount, challan reference, PAN of the customer). The white-labeled customer PDF proposal must not create the impression that DMCGrid is the package seller — the issuing entity on the PDF must be the agent (white-label = agent's brand, agent's GSTIN, agent's identity).

### 4.4 What DMCGrid must NOT do (red lines)

- **Never collect TCS.** Only the package seller collects. If DMCGrid collected TCS it would implicitly claim to be the package seller, which contradicts the marketplace model and creates false compliance.
- **Never insert itself into the customer payment flow.** v1 collects no customer money at all (per the product brief: "PLATFORM DOES NOT touch customer payments in v1").
- **Never present the white-labeled PDF as DMCGrid's own invoice** — the issuing entity must be the agent.

---

## 5. Topic 4 — TDS: agent's obligation vs platform's

**Answer: TDS on payments to foreign DMCs is the agent's (payer's) obligation. DMCGrid's own TDS exposure is limited to its own vendor payments.**

### 5.1 §195 — payments to non-resident DMCs (agent's obligation)

- **Statutory basis:** §195, Income-tax Act 1961 (TDS chapter renumbered in ITA 2025 w.e.f. 01.04.2026; exact new section numbers `[NEEDS-CA]`).
- **Trigger:** any person paying a non-resident/foreign company any sum chargeable to tax in India must deduct TDS — **no minimum threshold for the deduction itself** `[S71][S72]`.
- **Rate:** depends on the income's nature and DTAA. DMC ground services are business income; under most DTAAs (Thailand, UAE, Singapore, Malaysia, Vietnam) with no PE in India, business profits are taxable only in the DMC's residence country → TDS at nil with a **lower/nil-deduction certificate** or a reasonable-basis position `[NEEDS-CA]`; otherwise §195 default rates can bite `[S72][NEEDS-CA]`.
- **Procedure:** every remittance out of India requires **Form 15CA** (declaration by remitter) and, for taxable remittances above ₹5 lakh aggregate in the FY, **Form 15CB** (CA certificate) before the AD bank releases funds `[S71][S72]`.
- 15CA parts: Part A (≤ ₹5L, taxable), Part B (with AO order), Part C (> ₹5L, with 15CB), Part D (not taxable) `[S71]`.
- **Who is the remitter: the agent** (paying the DMC for ground services), not DMCGrid. DMCGrid should surface a §195/15CA-CB checklist in agent education; it bears no TDS obligation on deal flows it never touches.
- **DTAA risk to flag to agents** `[NEEDS-CA]`: whether DMC fees are "business profits" (no PE → nil TDS under most DTAAs), "FTA/technical services" (potentially taxable), or other categories — this drives whether 15CB/15CA are needed and at what rate.

### 5.2 §194C — resident contractors only

- **Statutory basis:** §194C (renumbered ~§393 in ITA 2025 `[NEEDS-CA]`): TDS at 1% (individual/HUF payee) or 2% (others) on resident contractor payments, per-payment ₹30,000 / aggregate ₹1,00,000 thresholds `[S69][S70]`.
- **Not applicable to payments to foreign DMCs** — §194C applies to **resident** contractors only. Foreign DMC payments run through §195 + 15CA/15CB instead `[S69][S70][S71]`.
- **DMCGrid's own use case:** if DMCGrid pays resident vendors (e.g., an Indian design/marketing contractor), §194C applies at the thresholds above — routine.
- **If a resident DMC** (Indian ground operator) is in the chain and the agent pays it for "work," §194C could apply to that leg (resident-to-resident) `[NEEDS-CA]`. DMCGrid's primary DMC markets (Thailand, Dubai, Bali, Vietnam, Singapore, Malaysia) are all foreign — low relevance in v1.

### 5.3 §194O — the e-commerce-operator TDS DMCGrid must avoid triggering

- **Statutory basis:** §194O (introduced Finance Act 2020; rate cut 1%→0.1% w.e.f. 01.10.2024 by Finance (No. 2) Act 2024): an e-commerce operator deducts 0.1% on the **gross amount of sales/services facilitated through the platform** for an e-commerce participant, before commission is netted off `[S64][S65][S66][S67]`.
- **Trigger condition:** the operator must be making payment *for the sale of goods or services facilitated through it*. A pure listing/lead-fee model where the platform bills the participant for platform services (subscription/credits) does **not** trigger §194O — there is no payment *for the participant's supplies* flowing through the platform `[S64][S65][NEEDS-ATTORNEY]`.
- **This is a second structural reason for red line R1:** if DMCGrid ever pays DMCs or agents the deal money (settlement), §194O obligations attach (0.1% of gross facilitated supplies, 285BA/285A-type information reporting). Staying out of the money flow keeps DMCGrid outside §194O entirely.
- §194O thresholds: ₹5 lakh no-deduction for individual/HUF participants (Audit) — verify current applicability `[NEEDS-CA]`.

### 5.4 TDS summary table

| Payment | Provision | Rate | Who withholds | DMCGrid exposure |
|---|---|---|---|---|
| Indian agent → foreign DMC (ground services) | §195 + 15CA/15CB | Per DTAA / default rates | **Agent** | None (not the remitter) |
| Indian agent → resident contractor (rare, resident DMC leg) | §194C | 1%/2% | Agent | None |
| DMCGrid → resident vendors | §194C | 1%/2% | DMCGrid | Routine own-vendor TDS |
| DMCGrid → foreign vendors (e.g., offshore contractor) | §195 + 15CA/15CB | Per DTAA | DMCGrid | Own vendor payments only |
| If DMCGrid settles deal money to participants | §194O | 0.1% of gross facilitated supplies | DMCGrid | **Avoid by design — never settle deal money** `[S64][S65][S66]` |

---

---

## 6. Topic 5 — Payment aggregation: PA/PAg authorization and the ₹999 wallet model

**Answer: Any payment-collection feature requires RBI PA authorisation (₹15 cr net worth at application, ₹25 cr by year 3) — impossible and unnecessary for DMCGrid at v1 scale. The ₹999 "wallet alternative" is safe ONLY as a closed-system pre-paid usage credit for DMCGrid's own platform fees; it must never hold money payable to third parties.**

### 6.1 The current PA framework (post-15 Sept 2025)

- **Instrument:** **RBI/DPSS/2025-26/141, CO.DPSS.POLC.No.S-633/02-14-008/2025-26 — "Reserve Bank of India (Regulation of Payment Aggregators) Directions, 2025"**, dated 15.09.2025. It **repeals and consolidates**: the March 2020 PA Guidelines (RBI/DPSS/2019-20/174) and the Oct 2023 PA-Cross Border circular (RBI/2023-24/80) `[S83][S84][S85][S86]`.
- **Three categories** (defined by transaction presentation, not industry):
  - **PA-Online (PA-O):** aggregation where acceptance device and payment instrument are not physically proximate — standard e-commerce checkout aggregation `[S84]`.
  - **PA-Physical (PA-P):** POS/QR aggregation — newly inside the licensing perimeter from 15.09.2025 (wind-up deadline 28.02.2026 for unlicensed PA-Physical entities that missed the 31.12.2025 filing cutoff) `[S84][S89]`.
  - **PA-Cross Border (PA-CB):** aggregation of cross-border payments tied to import/export of goods and services through e-commerce, inward (InCA) and outward (OCA) subcategories `[S84][S91][S92]`.
- An existing PA-O authorisation does **not** automatically extend to PA-CB or PA-P activity `[S84]`.
- **Net worth bar (all categories):** ₹15 crore at application, ₹25 crore by end of year 3, maintained ongoing; statutory-auditor net-worth certificate annually by 30.09 `[S84][S85]`.
- **Other obligations:** escrow accounts with a Scheduled Commercial Bank (domestic PAs); FIU-IND registration; merchant CDD including CKYCR retrieval; simplified verification only for merchants ≤₹40L domestic / ≤₹5L export turnover; annual system audit including cyber security audit by a CERT-In empanelled auditor; board-approved InfoSec policy; RBI July 2024 Cyber Resilience Directions compliance `[S84][S85]`.
- **PA-CB specifics:** ₹25 lakh max per transaction (inward and outward); InCA/OCA with an AD Category-I bank; no co-mingling or netting of inward/outward funds; FX leg only through an AD bank `[S84][S91][S92]`.

### 6.2 What DMCGrid's v1 money model requires (and doesn't)

- **What v1 bills:** subscriptions (agent ₹999/₹2,499/₹5,999; DMC ₹1,499/₹3,999/₹7,999), connect credits (₹999/connect or 1-lead-debit), top-ups, add-ons — all billed to registered businesses.
- **What v1 does NOT bill:** deal consideration between agent and DMC; customer payments (platform does not touch customer payments in v1, per brief).
- **Billing your own fees ≠ payment aggregation.** Collecting subscription/credit payments for your own services through a licensed PG (Razorpay/Cashfree/PayU) makes DMCGrid a **merchant**, not a payment aggregator. There is no aggregation of third-party transactions. `[S84][S85][NEEDS-ATTORNEY]`
- **No PA authorisation needed for v1 as designed.** The tripwire is aggregation of third-party consideration. The PA-Online definition covers "aggregation" — a platform collecting its own subscription fees is a merchant using a licensed PG's acquiring service.

### 6.3 The ₹999 "wallet alternative" — closed-system credit vs stored value

This is the sharpest design edge in the product. Two structurally different things can be called a "wallet":

**(a) Closed-system pre-paid usage credit (SAFE).** The ₹999 buys 1 connect credit (or a credit balance) usable **only** to purchase DMCGrid's own platform services (connects, subscriptions, add-ons). The balance is a **pre-paid claim against DMCGrid's own services**, not money held on behalf of the user. Under the RBI PPI Master Direction (27.08.2021), **closed-system PPIs** — instruments issued for purchase of goods/services **from the issuer only** — are removed from the PPI regulatory ambit `[S96][S97][S98]`. Requirements to stay safe:
  - Credits are non-transferable between users, non-withdrawable as cash, non-refundable except where legally required, and redeemable only against DMCGrid's own services.
  - No P2P credit transfer, no agent→DMC credit payment, no cash-out feature.
  - Terms of use state the closed-system nature explicitly.
  - The GST treatment: pre-paid credits for DMCGrid's own services are advance payments for its own 18% service — time-of-supply on receipt of advance `[NEEDS-CA]`.

**(b) Stored monetary value payable to third parties (RED LINE — R3).** If the "wallet" can (i) pay DMCs for their quotes/services, (ii) transfer credits between users, or (iii) be withdrawn as cash — it becomes a **small PPI / stored-value instrument**, requiring: PA/PPI authorisation, ₹15 cr net worth, escrow, KYC (full KYC PPIs cap at ₹2 lakh balances), and settlement obligations. Additionally, agent→DMC credit payment would make DMCGrid a **§52 GST ECO** (TCS up to 1%, GSTR-8) **and** a §194O operator (0.1% of gross facilitated supplies) **and** a §195 remitter (15CA/15CB on outbound remittances to foreign DMCs) — a triple compliance stack the platform must never accept `[S36][S64][S71]`. **This collapses the business: ₹999/connect cannot carry ₹15 crore net worth + escrow + FIU-IND + audits.**

### 6.4 The four regulatory hats DMCGrid must never wear

| Hat | Trigger | Consequence | Verdict |
|---|---|---|---|
| Payment Aggregator | Collecting/handling third-party (agent↔DMC) money | RBI PA authorisation: ₹15cr→₹25cr net worth, escrow, FIU-IND, CERT-In audits, KYC `[S84][S85]` | **Never in v1** |
| GST ECO (§52) | Collecting consideration for supplies made through it | Mandatory GST reg, TCS ≤1%, GSTR-8 `[S36][S38]` | **Never in v1** |
| §194O e-commerce operator | Paying participants for supplies facilitated through it | 0.1% TDS on gross facilitated supplies + info reporting `[S64][S65]` | **Never in v1** |
| §195 remitter | Remitting to non-resident DMCs | 15CA/15CB + DTAA analysis per remittance `[S71][S72]` | **Never in v1** |

### 6.5 If DMCGrid later wants to touch money (Phase 2+)

- **Phase 2 option A — partner route:** use an already-authorised Indian PA (Razorpay/Cashfree etc.) with a PA-CB category authorisation for cross-border collection. The PA holds the regulatory burden; DMCGrid is its merchant/sub-merchant. Note: confirm the partner's authorisation **category** covers cross-border (PA-CB), not just PA-O `[S84]`.
- **Phase 2 option B — direct authorisation:** incorporate the PA entity, ₹15 cr net worth at application, ₹25 cr by year 3, escrow, FIU-IND, CERT-In audits. Only viable at material scale (e.g., platform-collected deal money at 10,000+ deals/year). `[NEEDS-ATTORNEY]`
- **Escalation gate:** build the money-flow feature only when (a) deal volume × avg deal size makes PA economics viable, (b) DMCGrid has ₹25 cr net worth or a funded path to it, (c) a payments-compliance advisor has signed off on the PA application.
- **Red-line corollary:** even in Phase 2, the platform should collect/settle deal money only through an authorised PA — never run its own nodal/escrow arrangement outside the PA perimeter `[S88][S84]`.

---

---

## 7. Topic 6 — Consumer Protection (E-commerce) Rules 2020 + dark patterns

**Answer: B2B marketplaces are NOT exempt from the Consumer Protection Act 2019 — the CCPA has penalised a B2B marketplace before. The Rules' conduct duties, grievance mechanism, and the 2023 dark-patterns ban apply to DMCGrid's UX.**

### 7.1 CPA 2019 applies to B2B marketplaces

- The Consumer Protection (E-commerce) Rules 2020, notified 23.07.2020 (gazette number `[UNVERIFIED]`), impose duties on "e-commerce entities": appointment of a grievance officer, disclosure duties, and conduct rules `[S100][S101]`.
- **The B2B exemption myth is settled by enforcement:** the CCPA imposed a **₹10 lakh penalty on Dial4Trade Technologies Private Limited** — a B2B marketplace — for listing a regulated product (ammonium nitrate) on its platform. The CCPA's position: B2B marketplaces are not exempted under the CPA 2019 `[S100][S101]`.
- **Treat DMCGrid as an "e-commerce entity" and build the compliance floor:** grievance officer (name, contact, role published on site), transparent listing policy, seller/rating disclosure pages `[S100][S101]`.
- **Regulated categories:** the Dial4Trade action also signals platforms should keep regulated products/services out of listings. For DMCGrid: no unlicensed regulated services (e.g., immigration/visa consultancy claims that require specific licensing) in RFQ or DMC listings `[S100][S101]`.

### 7.2 Dark patterns (CCPA Guidelines, 30.11.2023)

- **Instrument:** "Guidelines for Prevention and Regulation of Dark Patterns, 2023," issued by the CCPA under CPA §18, dt 30.11.2023; **travel booking sites explicitly named** in scope alongside e-commerce, OTT, and food-delivery apps `[S104][S105][S106]`.
- **Specified dark patterns** include: false urgency, basket sneaking, confirmshaming, forced action, subscription traps, interface interference, bait & switch, drip pricing, disguised advertisement, nagging, SaaS billing trap, rogue malvertising (verify the full 13-pattern list in the gazette `[UNVERIFIED]`) `[S104]`.
- **DMCGrid-specific UX red lines:**
  - **Drip pricing:** the quote comparison and white-labeled PDF must show the all-in price upfront — no late-surfaced fees (TCS, GST, ancillaries) revealed only at confirmation `[S104]`.
  - **Subscription traps:** the freemium→paid flow (first 5 deals free → ₹999 tier) must not make cancellation harder than signup, bury the cancel link, or auto-renew without clear disclosure `[S104]`.
  - **Confirmshaming:** no guilt-trip copy on the "skip upgrade" path (e.g., "No thanks, I like losing deals") `[S104]`.
  - **Interface interference:** the anonymous-quote comparison must not visually push agents toward connecting with 2 DMCs before they can compare — the connect CTA must not overpower the compare action `[S104]`.
  - **False urgency:** no fake "only 2 DMC slots left" counters. (Genuine product scarcity — max-2-connects per RFQ — is fine if accurately represented.) `[S104]`
  - **SaaS billing trap:** transparent billing pages; no surprise fees at renewal `[S104]`.
- **Max-2-connects + 1-lead-debit:** disclose the debit rule clearly **before** the agent clicks connect — a hidden debit is a forced-action/drip-pricing violation risk.

### 7.3 IT Act 2000 intermediary duties

- As a platform hosting third-party content (agent RFQs, DMC quotes), DMCGrid is an intermediary under the IT Act 2000; the IT Rules 2021 due-diligence framework applies: publish rules/privacy policy, appoint a grievance officer (India-resident), act on takedown orders and grievances `[NEEDS-ATTORNEY][S112]`.

### 7.4 Conduct design rules for DMCGrid

- Publish: grievance officer details, terms of use, privacy policy, listing policy, platform-fee refund policy.
- Anonymous quotes: anonymity is a product feature, not a consumer-protection violation — but DMC identity must be disclosed to the agent after connect (per the brief), and the comparison UI must be non-manipulative (7.2).

---

## 8. Topic 7 — DPDP Act 2023 / Rules 2025 for marketplace data

**Answer: DPDP is a build requirement with a runway — the substantive core lands 14.05.2027. DMCGrid holds traveller PII and cross-border flows to DMCs; consent architecture, purpose limitation, and cross-border transfer review must be designed in now, cheaply.**

### 8.1 Instrument status and timeline

- **DPDP Act 2023** (Act 22 of 2023, assent 11.08.2023) — in force; consent, data-principal rights, breach notification, cross-border transfer framework `[S108][S109]`.
- **DPDP Rules 2025** — **G.S.R. 846(E), notified by MeitY 13.11.2025**; 22 rules in three phases `[S108][S110][S112]`.
- **Phasing:**
  - **13.11.2025:** Rules 1, 2, 17–21 (definitions, Board proceedings, TDSAT appeals) — in force `[S108][S110]`.
  - **14.11.2026:** Rule 4 (Consent Manager registration opens) `[S110]`.
  - **14.05.2027:** **the substantive core — Rules 3 (consent notice), 5–16, 22** (security safeguards, breach notification, retention/erasure, DPO publication, verifiable parental consent, SDF obligations, algorithm due diligence, data-principal rights, cross-border transfer) `[S108][S110][S112]`.
  - MeitY floated a proposal to shorten to twelve months (deadline 13.11.2026) — **not notified**; if notified, everything shifts `[S110]`.
- **Penalties (Schedule, read with §33):** up to **₹250 crore** per breach category (e.g., security-safeguard failure); ₹10,000 floor for data-principal duty breaches `[S111]`. This tail risk makes DPDP-grade architecture a build requirement, not a nice-to-have.

### 8.2 DMCGrid's data map (why it is a Data Fiduciary)

- **DMCGrid determines purpose and means** for: agent/DMC account data, RFQ data (customer trip details: names, dates, preferences, budget), quote data, deal data, credit ledger, communication logs → **DMCGrid is a Data Fiduciary** `[S108][S109]`.
- **Traveller/customer personal data:** agents are the primary collectors; DMCGrid still processes for its own platform purposes (verification, facilitation, billing) and remains a fiduciary for those purposes `[S108]`.
- **Cross-border flows:** RFQs/quotes flow to DMCs in Thailand, Dubai, Bali, Vietnam, Singapore, Malaysia — personal data leaves India by design. Cross-border transfer is permitted unless the destination is notified as restricted (negative list; Rule 15 mechanism, lands 14.05.2027) `[S108][S110][S112]`.
- **Children's data:** family RFQs routinely include minors. Rule 10 verifiable parental consent + no tracking/targeted ads at children apply — RFQ forms should minimise children's data collection, with parental-consent representation through the agent `[S108][S110]`.

### 8.3 Build requirements (design-stage, cheap now)

- **Consent notice (Rule 3, 14.05.2027):** plain-language itemised notice — data collected, purposes, rights including withdrawal; English + 22 Eighth Schedule languages on request. Build the notice architecture now `[S108][S110]`.
- **Security safeguards (Rule 6, 14.05.2027):** reasonable safeguards — encryption in transit/at rest, access control, logs, backups, retention policy `[S108][S110]`.
- **Breach notification (Rule 7, 14.05.2027):** notify the Board and each affected data principal per prescribed form/timeline — build the incident-response runbook now. Separate from the CERT-In 6-hour cyber-incident reporting duty `[S110][S112]`.
- **Retention/erasure (Rule 8, 14.05.2027):** erase when purpose is served or consent withdrawn — publish a retention schedule (e.g., tax-law retention for deal/billing data vs erasure of personal data) `[S108][S110]`.
- **DPO/contact publication (Rule 9, 14.05.2027):** publish DPO/authorised-person contact for grievances `[S110]`.
- **Verifiable parental consent (Rule 10, 14.05.2027):** minimal children's data in RFQs; parental-consent representation via agent `[S108][S110]`.
- **SDF designation** `[NEEDS-ATTORNEY]`: Significant Data Fiduciary status (India-resident DPO, annual DPIA, annual audit, targeted localisation under Rule 12) is designation-based — monitor whether DMCGrid's scale crosses the threshold `[S108][S110]`.
- **Consent Managers (Rule 4, 14.11.2026):** DMCGrid uses consent flows but is not itself a Consent Manager; registration opens 14.11.2026 if ever needed `[S110]`.

### 8.4 Cross-border transfer review

- Current position: transfers permitted unless restricted by government notification (negative list, Rule 15 — lands 14.05.2027) `[S108][S110][S112]`.
- **None of DMCGrid's six launch DMC markets (Thailand, UAE, Indonesia, Vietnam, Singapore, Malaysia) is currently restricted** — monitor the negative list when notified `[S108][NEEDS-ATTORNEY]`.
- **Contractual overlay:** DPAs with each DMC (purpose limitation, security, breach cooperation) — enforceable now under contract law, cheap, and buys DPDP-grade protection before the statutory deadline `[NEEDS-ATTORNEY]`.
- **Statutory-retention carve-outs:** tax-law retention obligations (TDS/TCS/GST records) can justify retaining deal/billing data — check the Rule 16 / §17(2)(b) exemptions `[NEEDS-ATTORNEY]`.

---

## 9. Topic 8 — Trademark/class risk for "DMCGrid"

**Answer: Low conflict risk; no blocking mark surfaced; file early in Classes 35, 39, 42 before launch marketing scales. Formal clearance search required `[NEEDS-ATTORNEY]`.**

### 9.1 What was checked

- Public trademark search at IP India (`tmrsearch.ipindia.gov.in/tmrpublicsearch/`) requires OTP login — no formal search run in this pass `[UNVERIFIED]` `[S130]`.
- General web search for "DMCGrid" surfaced no travel-sector company or mark using the exact name `[S130][S131]`.
- Nice Classification for relevant classes: **Class 35** (advertising, online marketplace services for others), **Class 39** (transport, travel arrangement, booking), **Class 42** (SaaS/PaaS, software design) `[S131]`.

### 9.2 Risk assessment

- "DMCGrid" is a coined word ("DMC" + "Grid") — coined marks are the strongest distinctiveness category and carry the lowest conflict risk.
- **"DMC" alone is descriptive** of the target user (destination management companies) and cannot be monopolised; the combination "DMCGrid" is the protectable element.
- **Risk vectors:** the "Grid" family (TourGrid, TravelGrid, tourgrids.com — surfaced as a company name, not a confirmed registered mark `[S131]`) and **prior use** by an Indian travel-tech company. A formal clearance search (word + phonetic + visual, Classes 35/39/42) by a trademark attorney is required before heavy brand spend `[NEEDS-ATTORNEY][S130]`.

### 9.3 Actions

1. Formal clearance search in Classes 35, 39, 42 `[NEEDS-ATTORNEY]` `[S130]`.
2. File applications (word + logo) in Classes 35, 39, 42 before launch marketing scales.
3. Secure dmcgrid.com / .in / .co domains.
4. Use ™ from first public use; ® after registration.

---

## 10. HARD RED LINES for v1 (what DMCGrid must NOT do)

| # | Red line | Triggered by | Consequence if crossed |
|---|---|---|---|
| R1 | **Never collect, hold, or settle deal consideration between agent and DMC** | Agent pays DMC via DMCGrid; wallet pays DMC; nodal/escrow account | PA authorisation (₹15cr→₹25cr net worth, escrow, FIU-IND, CERT-In audits) `[S84][S85]` + §52 GST ECO (TCS ≤1%, GSTR-8) `[S36][S38]` + §194O (0.1% of gross facilitated supplies) `[S64][S65]` + §195 remitter (15CA/15CB per remittance) `[S71]` — a compliance stack that collapses the ₹999/connect economics |
| R2 | **Never sell or broker tour packages as principal** | DMCGrid bundles hotel+transport+sightseeing and sells to end customers | Becomes a tour operator (5% GST no ITC, §195/TCS obligations) and risks the inventory-model FDI problem `[S21][S22][S120]`; destroys the marketplace legal position |
| R3 | **Never build a stored-value wallet payable to third parties** | Wallet credits transferable between users, payable to DMCs, or cash-out enabled | Small/full-KYC PPI: RBI authorisation, ₹2 lakh balance cap, escrow, KYC `[S96][S97][S98]`; compounds R1's stack |
| R4 | **Never run deceptive-UX dark patterns** | Drip pricing, false urgency, subscription traps, confirmshaming, interface interference in quote comparison/upgrade flows | CCPA enforcement under CPA §18/§20; B2B marketplaces already penalised (Dial4Trade ₹10L); travel sites explicitly in scope `[S100][S104][S105]` |
| R5 | **Never process children's data without the DPDP design** | RFQs with minors' data, targeted marketing at children | DPDP penalties up to ₹250 crore per breach category; Rule 10 verifiable parental consent (lands 14.05.2027) `[S108][S111]` |
| R6 | **Never invoice the white-labeled proposal as DMCGrid's own** | PDF proposal shows DMCGrid as issuing entity rather than the agent | Creates a tour-operator/GST/TCS position for DMCGrid; breaks the white-label promise and the marketplace model |
| R7 | **Never market DMCGrid as "licensed"/"govt approved" travel trade** | Marketing claims of MoT recognition or licensing | Misrepresentation — MoT recognition is voluntary and entity-specific; DMCGrid can't claim it `[S76][S77]` |
| R8 | **Never hold or commingle forex for users outside AD banks** | Holding agent/DMC forex in DMCGrid accounts; netting cross-border funds | FEMA violation; FX legs only through AD Category-I banks `[S84][S125][S126]` |

### R1 is the load-bearing red line

R1 (never touch deal money) keeps DMCGrid outside **five regulatory hats in one design decision**: PA authorisation, §52 GST ECO + GSTR-8, §194O TDS, §195 remitter status, and the PPI/wallet perimeter. Every other red line is a boundary maintenance task; R1 is the architectural foundation. If a future feature request touches deal consideration, it must escalate to the Phase 2 gate (6.5) — PA partner or authorisation first.

---

## 11. Lean-MVP compliance roadmap (register/file now vs later)

### Phase 0 — before first line of production code (week 0–1)

| Action | Cost | Who |
|---|---|---|
| Private Limited Company incorporation (MCA SPICe+, NIC 79110/62012) | ~₹15k govt+prof | Founder + CS |
| GST registration (regular scheme) | Free | CA |
| Formal trademark clearance search (Classes 35/39/42) | ~₹10–25k | TM attorney |
| Trademark filing (word + logo, 3 classes) | ~₹27k (₹4.5k/class × 3, + prof) | TM attorney |
| Terms of Use + Privacy Policy + Listing Policy drafted (with closed-system credit terms, DMC anonymity disclosure, max-2-connect debit disclosure) | Legal template + review | Attorney |
| [NEEDS-ATTORNEY] State-level travel-trade check for state of incorporation | ~₹10k | Attorney |
| [NEEDS-CA] Confirm SAC codes (9983xx vs 9985xx) for subscription/credit/lead fees | Included in GST setup | CA |

### Phase 1 — during the 6-week build (week 1–6)

| Action | Cost | Who |
|---|---|---|
| Closed-system credit ledger design (non-transferable, non-withdrawable, own-services-only redemption) | Eng time | Eng + attorney review |
| Per-deal GST mode selector (5% gross-inclusive vs 18% itemised) in proposal generator | Eng time | Eng + CA review |
| TCS field in agent deal ledger (rate, amount, challan ref, customer PAN) | Eng time | Eng + CA review |
| DPA templates for DMC onboarding (purpose limitation, security, breach cooperation) | Template | Attorney |
| Consent notice architecture (DPDP Rule 3 format, itemised notice, rights + withdrawal) | Eng time | Eng |
| Grievance officer publication + takedown/grievance workflow (IT Rules 2021 / E-commerce Rules 2020 floor) | Eng time | Eng |
| Dark-pattern UX review of quote comparison + upgrade flows (7.2 checklist) | Eng time | Design + attorney |
| Export-of-services setup for DMC subscriptions: LUT (Form GST PMT-04) filed for the FY | Free | CA |
| Incident-response runbook + breach-notification comms templates (DPDP Rule 7 + CERT-In 6-hour) | Template | Eng + attorney |
| Retention schedule (tax-law retention for billing/deal data vs erasure of personal data) | Template | CA + attorney |

### Phase 2 — at launch (week 6–8)

| Action | Cost | Who |
|---|---|---|
| FIU-IND check: **not required** for closed-system credits — confirm with attorney | Advisory | Attorney |
| CERT-In 6-hour incident reporting readiness (contact point registered) | Free | Eng |
| Privacy policy published; grievance officer live; notice formats live | Eng time | Eng |
| Section 195/15CA-CB education content for agents (agent's obligation, DTAA analysis) | Content | CA |
| TCS/§394(1) education content for agents (agent collects 2%, per-PAN, 27EQ/27D) | Content | CA |

### Phase 3 — later (6–18 months)

| Trigger | Action |
|---|---|
| 14.11.2026 — DPDP Rule 4 | Only if DMCGrid operates a Consent Manager (unlikely) |
| 14.05.2027 — DPDP substantive core | Full compliance audit: security safeguards, breach, retention, DPO, rights workflows live |
| Negative list notification under Rule 15 | Re-review the six DMC markets for transfer restrictions |
| Deal volume × avg size justifies money flow | Phase 2 money-flow gate (6.5): PA partner (PA-CB category) or direct authorisation; never before |
| Any change to freemium/subscription flows | Re-run the dark-patterns checklist (7.2) |
| MeitY shortens DPDP deadline to 13.11.2026 (proposed, not notified) | Pull the Phase 3 DPDP audit forward |

---

## 12. What was NOT verified in this pass

- **Gazette text of the Consumer Protection (E-commerce) Rules 2020** — notification date (23.07.2020) confirmed via secondary sources; gazette number `[UNVERIFIED]`. The duties summarised (grievance officer, disclosures) are well-established but the full rule text should be read before publishing policies `[NEEDS-ATTORNEY]`.
- **Full 13-pattern dark-patterns list** — the pattern names were cross-checked via three secondary sources but the gazette list was not read directly `[UNVERIFIED]`.
- **IP India trademark register** — public search requires OTP login; no formal search run. Trademark conclusions are provisional until a clearance search is done `[NEEDS-ATTORNEY]`.
- **Exact ITA 2025 renumbered sections** for §195/§194C TDS (the TDS chapter renumbering) — the §394(1) TCS renumbering is confirmed, the TDS-side numbers are `[NEEDS-CA]`.
- **PPI Master Direction reference number** — the 27.08.2021 MD and the closed-PPI carve-out are confirmed via secondary sources (Trilegal, LiveLaw, RBI page); exact ref `[UNVERIFIED]`.
- **DTAA-specific TDS rates for each DMC market** (Thailand, UAE, Indonesia, Vietnam, Singapore, Malaysia) — out of scope for this pass; per-country analysis required before agent education content ships `[NEEDS-CA]`.

## 13. Source-note on the citations

Primary instruments (Acts, notifications, Master Directions, gazette) are cited by number and date in the instruments register (§0) and throughout; where the instrument text itself was not opened in this pass, the claim is cross-verified across at least two independent secondary sources (taxguru.in, PIB, RBI.org.in pages, ClearTax, ICAI journal, Trilegal, LiveLaw, Mondaq, PwC) and the citation ledger records the sources actually consulted. Claims resting only on a single secondary source are flagged `[UNVERIFIED]`. Nothing in this report is legal or tax advice; `[NEEDS-CA]` and `[NEEDS-ATTORNEY]` mark the points where DMCGrid must obtain professional sign-off before the ~6-week build commits to the affected design.

---

## Appendix A — Compliance decision matrix: DMCGrid feature set

Verdict per planned feature. This is the table to re-run whenever the roadmap changes.

| Feature (from product brief) | Regulatory touchpoints | Verdict |
|---|---|---|
| Agent posts structured customer RFQs | DPDP (customer PII in RFQ; consent notice; children's data), IT Rules 2021 (hosted content) | **Build** — with consent architecture + minimal-children's-data design |
| DMCs respond with anonymous competitive quotes | E-commerce Rules 2020 (non-manipulative comparison), dark patterns (interface interference), IT Rules 2021 | **Build** — anonymity is a feature; disclose DMC identity post-connect |
| Compare quotes; connect max 2 DMCs per RFQ (1 lead debit) | Dark patterns (forced action/drip pricing if debit hidden), E-commerce Rules (disclosure) | **Build** — debit rule must be disclosed pre-connect |
| Agent finalizes itinerary with DMC | None direct (off-platform or chat) | **Build** |
| Per-deal margin + manager approval workflow | None direct | **Build** |
| Ancillary services (insurance, visa, transport add-ons) | Regulated-services check (visa/immigration advice licensing); insurance distribution norms if resold `[NEEDS-ATTORNEY]` | **Build with care** — no unlicensed regulated services; insurance add-ons = referral only in v1 |
| TDS/GST/TCS tracking fields in deal ledger | Agent's obligations (§195/15CA-CB, §394(1) TCS, GST 5%/18%); DMCGrid surfaces but never collects | **Build** — tracking fields + education content; never collection |
| White-labeled branded customer PDF proposal | R6 (issuing entity = agent, agent's GSTIN), dark patterns (drip pricing — all-in price upfront), GST invoice-format rules | **Build** — PDF must show agent as issuer, all-in pricing, GST mode matching structure |
| Freemium: first 5 deals free → ₹999/₹2,499/₹5,999 agent tiers | GST 18% on DMCGrid fees; dark patterns (subscription traps, confirmshaming, cancel flows) | **Build** — 18% GST, transparent billing, easy cancellation |
| DMC subscriptions ₹1,499/₹3,999/₹7,999 billed to foreign DMCs | Export of services (LUT, zero-rated, post-FA 2026); forex via AD bank | **Build** — file LUT for the FY, receive via AD bank |
| Top-ups and add-ons (platform fees) | GST 18% | **Build** |
| ₹999 "wallet alternative" (pre-paid connect credits) | Closed-system PPI (safe) vs stored value (red line R3); GST time-of-supply on advance | **Build as closed-system credit only** — non-transferable, non-withdrawable, own-services-only `[NEEDS-ATTORNEY]` |
| In-app chat between agent and DMC | IT Rules 2021 (intermediary duties, grievance officer), DPDP (comms data) | **Build** — grievance workflow + retention |
| Reviews/ratings of DMCs | E-commerce Rules (no discriminatory treatment, disclosure), IT Rules 2021 | **Build** — moderation + disclosure pages |
| (Phase 2+) Collecting deal consideration from agents | PA authorisation, §52 GST ECO, §194O, §195 — R1 | **DO NOT BUILD until Phase 2 gate (6.5)** |
| (Phase 2+) Payouts/settlement to DMCs | PA-CB, §194O, §195, FEMA AD-bank route — R1/R8 | **DO NOT BUILD until Phase 2 gate (6.5)** |
| (Future) Wallet with agent→DMC credit payments | R1 + R3 stack (PPI + ECO + 194O + 195) | **NEVER** |

---

## Appendix B — Worked examples: the three deals DMCGrid will actually see

### B.1 Deal 1: Mumbai agent, ₹8 lakh Thailand package, DMC in Bangkok (the core loop)

- **Agent↔customer:** bundled package at one price → agent invoices customer with 5% GST (gross-inclusive line) — or itemised at 18% if the agent breaks out components. Agent's choice per deal; DMCGrid surfaces the mode selector `[S21][S22][S24]`.
- **TCS:** agent collects TCS on the overseas tour package from the customer. From 01.04.2026: flat 2% = ₹16,000, deposited against the customer's PAN, reported in 27EQ/27D. (Before 01.04.2026: 5% up to ₹10L = ₹40,000.) `[S42][S43][S46][S56]`
- **Agent↔DMC:** agent pays the Bangkok DMC, e.g., ₹5 lakh (≈ USD 6,000 / THB 210,000). This is an import of services for the agent:
  - If the agent is GST-registered: RCM self-invoice, IGST 18% under RCM (₹90,000, creditable) `[S28]`.
  - TDS: §195 — if the DMC has no India PE and the DTAA (India–Thailand) allocates business profits to Thailand, agent can support a nil/lower deduction position `[NEEDS-CA]`; Form 15CA required for the remittance (Part C + 15CB if taxable >₹5L aggregate; Part D if supported as not taxable) `[S71]`.
  - Forex: remittance through the agent's AD bank; DMCGrid never touches it.
- **DMCGrid's revenue:** its subscription/connect-credit fee from the agent — 18% GST `[S75]`.
- **DMCGrid's obligations in this deal: zero collections, zero TDS, zero TCS, zero remittances.** Only: surface the fields, host the data, invoice its own fee.

### B.2 Deal 2: Delhi agent, ₹22 lakh destination wedding in Bali (high-ticket)

- **TCS:** flat 2% from 01.04.2026 = ₹44,000 (vs ₹4,50,000 under the pre-2026 slabs) — the agent collects, DMCGrid's ledger tracks it `[S46][S56]`.
- **GST on the package:** the agent decides principal (5% on gross = ₹1,10,000, no ITC) vs itemised (18% on the full value with ITC) — at this ticket size the ITC arithmetic genuinely matters; DMCGrid's mode selector + invoice format must support both `[S22][S24]`.
- **RCM on DMC payments:** the agent's import-of-services RCM on the Bali DMC's fees — 18% self-accounted, creditable `[S28]`.
- **White-label PDF:** all-in price upfront (drip-pricing rule), agent's GSTIN and identity as issuer, ancillaries (insurance etc.) as separate clearly-labelled lines with their own GST treatment `[S104]`.

### B.3 Deal 3: DMCGrid's own billing of a Bangkok DMC (₹3,999/mo DMC subscription)

- **Supply:** DMCGrid (India) → DMC (Thailand), consideration received in forex through DMCGrid's AD bank → **export of services**.
- **From 30.03.2026:** zero-rated — LUT filed (Form PMT-04), invoice without GST; ITC on DMCGrid's own Indian costs is refundable/unutilised-credit eligible `[S23][S24]`.
- **Before 30.03.2026** (if billing started earlier): intermediary-services POS would have been India under §13(8)(b) → 18% IGST. DMCGrid launching in Oct 2026 is post-amendment — clean position `[S23][S24]`.
- **FEMA:** receipt via AD Category-I bank; e-FIRA documentation for each receipt `[S125][S126]`.

### B.4 Failure modes (what crossing R1 looks like)

- Agent pays the ₹5 lakh Bangkok DMC fee **through DMCGrid** (wallet or collected-then-settled):
  - DMCGrid has just aggregated a third-party payment → PA authorisation needed (₹15 cr net worth) `[S84][S85]`.
  - DMCGrid is now a §52 GST ECO → 1% TCS on the ₹5L supply, GSTR-8, REG-07 `[S36][S38]`.
  - If it pays the DMC out → §194O (0.1% of ₹5L gross) + §195 (15CA/15CB on the outbound remittance) + FEMA/PA-CB if cross-border `[S64][S71][S92]`.
  - If it held a wallet balance → PPI authorisation, escrow, KYC `[S96][S97][S98]`.
  - **Four violations from one UI feature.** This is why R1 is absolute in v1.

---

## Appendix C — Terms of Use / policy must-haves (drafting checklist)

- **Closed-system credit terms:** credits are pre-paid usage rights for DMCGrid services only; non-transferable, non-withdrawable, no cash value; expiry policy stated; refund only where law requires.
- **Marketplace role disclaimer:** DMCGrid is a facilitator/marketplace; it is not a party to the agent↔DMC contract, not a tour operator, not a payment aggregator, and does not handle deal payments.
- **Quote anonymity disclosure:** how anonymisation works, when DMC identity is revealed (post-connect), and the max-2-connects + 1-lead-debit rule — disclosed before the connect action.
- **Grievance officer:** name, business address, contact — published per E-commerce Rules 2020 / IT Rules 2021 `[S100][S112]`.
- **Privacy notice (DPDP Rule 3 format):** itemised data collected, purposes, rights (access, correction, erasure, nomination, grievance), withdrawal mechanics; English + 22 Eighth Schedule languages on request `[S108][S110]`.
- **Cross-border transfer disclosure:** personal data shared with DMCs in named destination countries for quote purposes.
- **Children's data:** no knowingly processing children's data except via agent representation of parental consent; no targeted advertising at children.
- **Billing/refund policy:** subscription terms, auto-renewal disclosure, cancellation path as easy as signup (dark-patterns rule) `[S104]`.
- **Tax position disclaimer:** GST/TCS/TDS treatment of deals is the agent's/DMC's responsibility; DMCGrid provides tooling, not tax advice.
- **Prohibited listings:** regulated services requiring licences (immigration consultancy, insurance underwriting, etc.) `[S100]`.

---

## Appendix D — FAQ (the brief's questions, answered directly)

**Q1. Does DMCGrid need any licence to connect Indian agents with foreign DMCs?**
No sector licence exists or is required. No central statute licenses travel agents, tour operators, OTAs, or B2B travel marketplaces; MoT recognition is voluntary (Lok Sabha reply, 12 Dec 2024) `[S76][S77][S18]`. Ordinary incorporation + GST + contracts. State-level checks `[NEEDS-ATTORNEY]`. FDI in the B2B marketplace model: 100% automatic route `[S120][S121]`.

**Q2. GST: 5% vs 18% for tour operator services; GST on DMCGrid's subscriptions; place of supply for services to foreign DMCs?**
Tour operator package (principal): 5% without ITC, invoice must show one gross-inclusive figure (Notfn 11/2017-CT(R) as amended; retained at 5% no-ITC through the 22.09.2025 restructuring) `[S21][S22][S24]`. DMCGrid's own subscription/credit/lead fees: 18% `[S75]`. Services to foreign DMCs: place of supply = recipient's location; post-Finance Act 2026 (§13(8)(b) omitted, w.e.f. 30.03.2026) they are zero-rated exports — LUT and invoice without GST `[S23][S24]`. The trap: collecting deal consideration makes DMCGrid a §52 ECO `[S36][S38]`.

**Q3. TCS on outbound tour packages — who collects, at what rate?**
The Indian package seller — the agent — collects; DMCGrid never does. FY 2026-27: flat 2% from the first rupee, no threshold (§394(1) ITA 2025, formerly §206C(1G); Finance Act 2026, w.e.f. 01.04.2026) `[S42][S46][S56][S60]`. FY 2025-26 was 5%/20% around ₹10L `[S43][S44]`. DMCGrid builds the tracking fields; the agent files 27EQ/27D.

**Q4. TDS on payments to foreign DMCs — agent's or platform's obligation?**
The agent's (§195, 15CA/15CB, DTAA analysis per remittance) `[S71][S72]`. §194C is residents-only (irrelevant to foreign DMCs) `[S69][S70]`. §194O attaches to DMCGrid only if it pays participants for supplies facilitated through it — avoided by never touching deal money `[S64][S65]`.

**Q5. Does billing agents/DMCs for subscriptions/credits need RBI PA authorisation? What about the ₹999 wallet?**
No — collecting your own fees through a licensed PG makes DMCGrid a merchant, not an aggregator `[S84][S85][NEEDS-ATTORNEY]`. PA authorisation (₹15cr→₹25cr net worth) is triggered by aggregating third-party payments — the R1 red line. The ₹999 wallet: safe as a closed-system pre-paid credit (own-services-only, non-transferable, non-withdrawable — outside PPI ambit) `[S96][S97][S98]`; a red line if it ever pays third parties or transfers between users. If DMCGrid later holds wallet balances payable to others: PPI authorisation + escrow + KYC — do not build until the Phase 2 gate.

**Q6. Do the Consumer Protection (E-commerce) Rules 2020 apply to a B2B marketplace?**
Yes — B2B marketplaces are not exempt; the CCPA penalised Dial4Trade (B2B marketplace) ₹10 lakh `[S100][S101]`. Build the e-commerce entity floor: grievance officer, disclosures, non-manipulative UX. Dark-patterns Guidelines (30.11.2023) name travel booking sites — the 7.2 checklist applies to the comparison and upgrade flows `[S104][S105]`.

**Q7. What are DMCGrid's DPDP obligations?**
DMCGrid is a Data Fiduciary for account, RFQ, quote, deal, and comms data `[S108][S109]`. Act in force now; Rules phased — substantive core 14.05.2027 (consent notice, security, breach, retention, DPO, rights, cross-border) `[S108][S110]`. Penalties up to ₹250 crore per breach category `[S111]`. Design consent architecture, retention, breach runbook, and minimal-children's-data RFQ forms now; monitor the Rule 15 negative list for the six DMC markets.

**Q8. Trademark risk for "DMCGrid"?**
Low — coined mark, no conflicting use surfaced; formal clearance search required before brand spend `[S130][NEEDS-ATTORNEY]`. File Classes 35/39/42 early.

---

## Appendix E — Per-topic source-quality table

| Topic | Primary instruments cited | Cross-verified via | Gaps |
|---|---|---|---|
| 1. Licensing | MoT Travel Agent Guidelines (04.12.2009); PIB Lok Sabha reply 12.12.2024; FEMA MD–Export of Goods & Services | PIB, tourify/flightgpt analyses, IncorpX | State-level rules `[NEEDS-ATTORNEY]` |
| 2. GST | Notfns 11/2017, 20/2019, 15/2025, 16/2025, 17/2017, 23/2017, 10/2017-CT/IT(R); FA 2026 §157; CGST §§9(5), 24, 52; IGST §§2(6), 5(3), 13(2), 13(8) | GST Council FAQ + PIB (56th Council), taxguru, tourify, Grant Thornton, CBIC circular 159/15/2021 | Exact SAC for subscription fees `[NEEDS-CA]` |
| 3. TCS | §206C(1G) ITA 1961; FA 2020/2023/2025/2026; §394(1) ITA 2025 (Act 30 of 2025) | PIB, HDFC/TCS-forex PDF, tourify, mostlynri, oquilia, ICAI journal (Oct-2024 cuts) | Declaration mechanics (27C-type) `[NEEDS-CA]` |
| 4. TDS | §195, §194C, §194O ITA 1961; Finance (No. 2) Act 2024; 15CA/15CB rules | taxguru, taxclue, bookmyca, beaconfiling, ICAI journal, regikart | ITA 2025 TDS renumbering `[NEEDS-CA]`; DTAA rates per country |
| 5. PA/wallet | PSS Act 2007; RBI/DPSS/2025-26/141 (15.09.2025); RBI/DPSS/2019-20/174 (repealed); RBI/2023-24/80 (repealed); PPI MD 27.08.2021 | RBI.org.in (MD id=12896), paymentbrief, mondaq, akand, inc42, pwc.in, Trilegal, LiveLaw | PPI MD exact ref `[UNVERIFIED]` |
| 6. E-commerce rules | CPA 2019; E-commerce Rules 2020 (23.07.2020); CCPA Dark Patterns Guidelines 30.11.2023 | mondaq (Dial4Trade), legal500, NLSIU PDF, KNN India | Gazette text of Rules `[UNVERIFIED]`; full 13-pattern list `[UNVERIFIED]` |
| 7. DPDP | DPDP Act 2023 (Act 22 of 2023); DPDP Rules 2025, G.S.R. 846(E), 13.11.2025 | dpdpa.dcomply.in, dpdpact.net, cadp.in, dcomply penalty guide, cybersigmacs | SDF designation criteria detail `[NEEDS-ATTORNEY]` |
| 8. Trademark | Nice Classification classes 35/39/42; IP India public search portal | indiafilings class guides, IP India portal (OTP-gated) | Formal clearance search `[NEEDS-ATTORNEY]` |

## Appendix F — Glossary

- **AD (Authorised Dealer) bank** — bank authorised under FEMA to deal in foreign exchange; all forex legs route through it.
- **CCPA** — Central Consumer Protection Authority (est. under CPA 2019); issues the dark-patterns guidelines, penalises e-commerce violations.
- **DPDP** — Digital Personal Data Protection Act, 2023 + DPDP Rules 2025 (G.S.R. 846(E)).
- **ECO** — electronic commerce operator under CGST (§52 TCS / §24 registration).
- **FIU-IND** — Financial Intelligence Unit-India; registration mandatory for non-bank PAs.
- **InCA / OCA** — Inward/Outward Collection Accounts under the PA-CB category (PA Master Direction 2025).
- **LRS** — Liberalised Remittance Scheme (RBI) — resident individuals, USD 250,000/year cap.
- **LUT** — Letter of Undertaking (Form GST PMT-04) — zero-rated supply without paying IGST.
- **PA-O / PA-P / PA-CB** — Payment Aggregator categories under RBI/DPSS/2025-26/141.
- **PPI** — Prepaid Payment Instrument; closed-system PPIs (issuer-only redemption) sit outside the PPI MD's ambit.
- **RCM** — reverse charge mechanism — recipient self-accounts for GST (import of services, Notfn 10/2017-IT(R)).
- **SDF** — Significant Data Fiduciary (DPDP §10; Rule 12 obligations).
- **TCS** — tax collected at source (§206C/§394(1)); **TDS** — tax deducted at source (§195/§194C/§194O family).
