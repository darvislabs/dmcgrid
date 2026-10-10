-- ═══════════════════════════════════════════════════════════
-- DMCGrid Platform Database Migration 00013
-- Wave 4: Seed Data for Proposals & Notifications
-- ═══════════════════════════════════════════════════════════

-- 1. Enrich existing proposal 1 (Thailand)
update public.proposals
set 
  customer_name = 'Dr. Kabir & Mrs. Ananya Sen',
  customer_email = 'dr.kabir.sen@hospital-network.in',
  terms = 'Rates include all luxury private transfers, 5-star resort accommodations, daily gourmet breakfast, private boat charters, and English-speaking private destination hosts. Excludes international airfare and personal expenses. Cancellation policy: Full refund up to 14 days prior to departure.',
  itinerary_json = '[
    {
      "day": 1,
      "title": "VIP Arrival in Bangkok & Chao Phraya River Cruise",
      "description": "Private VIP fast-track immigration at Suvarnabhumi Airport. Luxury limousine transfer to The Siam Hotel. Evening private teakwood boat sunset champagne cruise along the historic Chao Phraya River.",
      "location": "Bangkok, Thailand",
      "accommodation": "The Siam Hotel (Courtyard Suite)",
      "meals": ["Welcome Dinner", "Sunset Refreshments"],
      "activities": [
        { "time": "14:30", "title": "VIP Fast-Track & Chauffeur Transfer", "description": "Meet-and-assist upon aircraft disembarkation with porter service." },
        { "time": "18:00", "title": "Bespoke Sunset River Cruise", "description": "Private charter on antique teakwood barge with champagne pairing." }
      ]
    },
    {
      "day": 2,
      "title": "Sacred Temples & Private Chef Experience",
      "description": "Private morning exploration of Wat Pho and the Emerald Buddha with an expert cultural scholar. Afternoon private chef culinary workshop in a restored heritage residence.",
      "location": "Bangkok, Thailand",
      "accommodation": "The Siam Hotel (Courtyard Suite)",
      "meals": ["Artisan Breakfast", "Private Tasting Lunch"],
      "activities": [
        { "time": "09:00", "title": "Exclusive Wat Pho & Grand Palace Access", "description": "Special access before public touring hours with senior cultural curator." },
        { "time": "13:00", "title": "Private Royal Thai Gastronomy Masterclass", "description": "Interactive culinary masterclass paired with boutique regional wines." }
      ]
    },
    {
      "day": 3,
      "title": "Private Flight to Phuket & Andaman Villa Check-in",
      "description": "Private domestic transfer to Phuket. Arrival at Amanpuri Resort overlooking Pansea Beach. Relaxing oceanfront private villa afternoon.",
      "location": "Phuket, Thailand",
      "accommodation": "Amanpuri (Ocean Pool Pavilion)",
      "meals": ["Gourmet Breakfast", "Andaman Seafood Dinner"],
      "activities": [
        { "time": "11:00", "title": "Luxury Domestic Wing to Phuket", "description": "Dedicated airport check-in and private VIP transfer to Pansea Beach." },
        { "time": "16:00", "title": "Holistic Ayurvedic Wellness Consultation", "description": "Personalized 90-minute treatment at the Aman Spa." }
      ]
    },
    {
      "day": 4,
      "title": "Private Yacht Charter to Phi Phi & Phang Nga",
      "description": "Full-day charter aboard a 48ft luxury catamaran. Snorkeling emerald lagoons, hidden sea caves, and a private beach picnic prepared by the onboard chef.",
      "location": "Phang Nga Bay, Thailand",
      "accommodation": "Amanpuri (Ocean Pool Pavilion)",
      "meals": ["Breakfast", "Chef Yacht Picnic Lunch"],
      "activities": [
        { "time": "08:30", "title": "Private Catamaran Embarkation", "description": "Exclusive navigation to secluded limestone karst lagoons away from tourist boats." },
        { "time": "13:00", "title": "Secluded Sandbar Champagne Lunch", "description": "Fine dining set up on an uninhabited sandbar." }
      ]
    },
    {
      "day": 5,
      "title": "Sunset Catamaran & Michelin Dining at Pru",
      "description": "Leisurely morning by the private plunge pool. Sunset cocktails followed by an 8-course farm-to-table tasting experience at Michelin-starred PRU.",
      "location": "Phuket, Thailand",
      "accommodation": "Amanpuri (Ocean Pool Pavilion)",
      "meals": ["Gourmet Breakfast", "Michelin-Starred Dinner"],
      "activities": [
        { "time": "19:00", "title": "PRU Tasting Menu Experience", "description": "Hyper-local organic gastronomy from Pru Jampa farm." }
      ]
    }
  ]'::jsonb
where id = 'ea000000-0000-0000-0000-000000000001';

-- 2. Enrich existing proposal 2 (Switzerland)
update public.proposals
set 
  customer_name = 'The Sterling Family (4 Travelers)',
  customer_email = 'sterling.family.travel@heritage.co.uk',
  terms = 'Includes 1st Class Swiss Travel Pass Flex, 5-star mountain chalet stays, private certified ski instructors, luggage forwarding, and Michelin-starred culinary reservations.',
  itinerary_json = '[
    {
      "day": 1,
      "title": "Zurich Arrival & Glacier Express First Class to Zermatt",
      "description": "Private meet-and-assist at Zurich Kloten Airport. Panoramic 1st class Excellence Class journey aboard the Glacier Express through the Swiss Alps to Zermatt.",
      "location": "Zermatt, Switzerland",
      "accommodation": "The Omnia (Matterhorn View Penthouse)",
      "meals": ["Welcome Alpine Dinner"],
      "activities": [
        { "time": "10:30", "title": "Excellence Class Boarding", "description": "7-course wine-paired lunch on the iconic alpine route." },
        { "time": "16:00", "title": "Chalet Check-in & Ski Gear Fitting", "description": "Private in-chalet custom ski and boot equipment fitting." }
      ]
    },
    {
      "day": 2,
      "title": "Private Guide on the Matterhorn Glacier Paradise",
      "description": "Full-day private ski coaching on Europe highest cable car summit. Lunch at Chez Vrony with direct view of the Matterhorn pyramid.",
      "location": "Zermatt, Switzerland",
      "accommodation": "The Omnia (Matterhorn View Penthouse)",
      "meals": ["Alpine Breakfast", "Chez Vrony Gourmet Lunch"],
      "activities": [
        { "time": "09:00", "title": "Matterhorn Glacier Ski Safari", "description": "Skiing with a Swiss Olympic certified instructor." },
        { "time": "13:00", "title": "Chez Vrony Alpine Table Reservation", "description": "Traditional cured meats and artisanal Valais raclette." }
      ]
    },
    {
      "day": 3,
      "title": "Helicopter Flight over the Aletsch Glacier & St. Moritz Transfer",
      "description": "Scenic Air Zermatt helicopter transfer over the UNESCO Aletsch Glacier, landing in St. Moritz for high-altitude luxury at Badrutt''s Palace.",
      "location": "St. Moritz, Switzerland",
      "accommodation": "Badrutt''s Palace Hotel",
      "meals": ["Champagne Breakfast", "Palace Grand Dinner"],
      "activities": [
        { "time": "11:00", "title": "Private Heli-Tour over the Great Aletsch", "description": "Breathtaking aerial views of the longest glacier in the Alps." },
        { "time": "18:00", "title": "Private Spa & Ice Rink Skating", "description": "Complimentary palace outdoor rink session with hot spiced cider." }
      ]
    }
  ]'::jsonb
where id = 'c90dcb83-30fb-4619-8ee8-9f2ad275574e';

-- 3. Seed Proposal 3: Bali & Nusa Penida Sanctuary
do $$
declare
  v_rfq_id uuid := 'f1000000-0000-0000-0000-000000000003';
  v_agent_id uuid := 'a1111111-1111-1111-1111-111111111111';
  v_dmc_id uuid := 'd1111111-1111-1111-1111-111111111111';
  v_conn_id uuid;
  v_quote_id uuid;
  v_opt_id uuid;
  v_deal_id uuid := 'd0000000-0000-0000-0000-000000000003';
  v_prop_id uuid := 'ea000000-0000-0000-0000-000000000003';
  v_token text := 'prop_bali_sanctuary_2026';
begin
  -- Ensure connection exists
  select id into v_conn_id from public.connections where agent_id = v_agent_id and dmc_id = v_dmc_id limit 1;
  if v_conn_id is null then
    insert into public.connections (agent_id, dmc_id, credit_amount_deducted)
    values (v_agent_id, v_dmc_id, 0)
    returning id into v_conn_id;
  end if;

  -- Ensure quote option
  select id, quote_id into v_opt_id, v_quote_id from public.quote_options where option_name = 'Value' limit 1;
  if v_opt_id is null then
    select id into v_opt_id from public.quote_options limit 1;
  end if;

  -- Insert deal 3
  if not exists (select 1 from public.deals where id = v_deal_id) then
    insert into public.deals (
      id,
      rfq_id,
      connection_id,
      agent_id,
      dmc_id,
      selected_quote_option_id,
      net_cost,
      markup_percentage,
      manager_approval_status,
      status
    ) values (
      v_deal_id,
      v_rfq_id,
      v_conn_id,
      v_agent_id,
      v_dmc_id,
      v_opt_id,
      210000.00,
      14.00,
      'approved',
      'draft'
    );
  end if;

  -- Insert proposal 3
  if not exists (select 1 from public.proposals where id = v_prop_id) then
    insert into public.proposals (
      id,
      deal_id,
      version,
      title,
      customer_name,
      customer_email,
      total_price,
      currency,
      status,
      terms,
      itinerary_json
    ) values (
      v_prop_id,
      v_deal_id,
      1,
      'Bali & Nusa Penida: Private Island & Wellness Sanctuary',
      'Vikram & Meera Singhania',
      'singhania.travel@apexholdings.in',
      259182.00,
      'INR',
      'draft',
      'All luxury pool villa accommodations included with daily breakfast, private chauffeur, speedboat charter to Nusa Penida, yoga instruction, and spa credits.',
      '[
        {
          "day": 1,
          "title": "Arrival in Denpasar & Private Transfer to Mandapa, Ubud",
          "description": "VIP tarmac arrival at Ngurah Rai International Airport. Chauffeur-driven transfer into the Ayung River valley in Ubud.",
          "location": "Ubud, Bali",
          "accommodation": "Mandapa, a Ritz-Carlton Reserve (River Front Pool Villa)",
          "meals": ["Welcome Indonesian Dinner"],
          "activities": [
            { "time": "15:00", "title": "Check-in & River Meditation", "description": "Private tea ceremony overlooking the sacred Ayung River." }
          ]
        },
        {
          "day": 2,
          "title": "Private Blessing Ceremony & Tirta Empul Sacred Springs",
          "description": "Dawn blessing by a traditional Balinese Pemangku priest followed by private access to the holy water spring temple of Tirta Empul.",
          "location": "Tampak Siring, Bali",
          "accommodation": "Mandapa, a Ritz-Carlton Reserve",
          "meals": ["Breakfast", "Organic Farm Lunch"],
          "activities": [
            { "time": "08:00", "title": "Sacred Water Purification Ritual", "description": "Guided holy spring cleansing ceremony." }
          ]
        },
        {
          "day": 3,
          "title": "Private Speedboat Charter to Nusa Penida & Kelingking Beach",
          "description": "Cruising turquoise waters to Nusa Penida. Snorkeling with giant Manta Rays at Manta Point and cliffside photography at Kelingking.",
          "location": "Nusa Penida, Indonesia",
          "accommodation": "Bulgari Resort Bali (Ocean Cliff Villa)",
          "meals": ["Breakfast", "Seafood Beach BBQ Lunch"],
          "activities": [
            { "time": "09:00", "title": "Manta Ray Private Snorkel", "description": "Encounters with resident giant manta rays." }
          ]
        }
      ]'::jsonb
    );

    insert into public.share_tokens (
      proposal_id,
      deal_id,
      rfq_id,
      token,
      expires_at
    ) values (
      v_prop_id,
      v_deal_id,
      v_rfq_id,
      'prop_bali_sanctuary_2026',
      now() + interval '30 days'
    );
  end if;
end $$;

-- 4. Seed Proposal 4: Swiss Alpine Grand Winter Journey
do $$
declare
  v_rfq_id uuid := 'f1000000-0000-0000-0000-000000000002';
  v_agent_id uuid := 'a1111111-1111-1111-1111-111111111111';
  v_dmc_id uuid := 'd2222222-2222-2222-2222-222222222222';
  v_conn_id uuid;
  v_opt_id uuid;
  v_deal_id uuid := 'd0000000-0000-0000-0000-000000000004';
  v_prop_id uuid := 'ea000000-0000-0000-0000-000000000004';
  v_token text := 'prop_swiss_winter_2026';
begin
  select id into v_conn_id from public.connections where agent_id = v_agent_id and dmc_id = v_dmc_id limit 1;
  if v_conn_id is null then
    insert into public.connections (agent_id, dmc_id, credit_amount_deducted)
    values (v_agent_id, v_dmc_id, 0)
    returning id into v_conn_id;
  end if;

  select id into v_opt_id from public.quote_options where option_name = 'Swiss Alpine Comfort' limit 1;
  if v_opt_id is null then
    select id into v_opt_id from public.quote_options limit 1;
  end if;

  if not exists (select 1 from public.deals where id = v_deal_id) then
    insert into public.deals (
      id,
      rfq_id,
      connection_id,
      agent_id,
      dmc_id,
      selected_quote_option_id,
      net_cost,
      markup_percentage,
      manager_approval_status,
      status
    ) values (
      v_deal_id,
      v_rfq_id,
      v_conn_id,
      v_agent_id,
      v_dmc_id,
      v_opt_id,
      320000.00,
      15.00,
      'approved',
      'lost'
    );
  end if;

  if not exists (select 1 from public.proposals where id = v_prop_id) then
    insert into public.proposals (
      id,
      deal_id,
      version,
      title,
      customer_name,
      customer_email,
      total_price,
      currency,
      status,
      terms,
      itinerary_json
    ) values (
      v_prop_id,
      v_deal_id,
      1,
      'St. Moritz & Gstaad: Royal Winter Alpine Tour',
      'Hon. David & Victoria Sterling',
      'v.sterling@mayfairpartners.co.uk',
      394944.00,
      'INR',
      'accepted',
      'Private aviation transfer from Geneva to St. Moritz, dedicated 24/7 mountain concierge, ski lift passes for Corviglia & Diavolezza.',
      '[
        {
          "day": 1,
          "title": "Geneva Airport Reception & Heli-Transfer to St. Moritz",
          "description": "Private terminal transfer via twin-engine helicopter to Engadin Airport, St. Moritz. Escorted limousine check-in at The Alpina Gstaad.",
          "location": "Gstaad, Switzerland",
          "accommodation": "The Alpina Gstaad (Panorama Suite)",
          "meals": ["Six-Course Welcome Dinner"],
          "activities": [
            { "time": "14:00", "title": "Private Helicopter Flight", "description": "Panoramic mountain transit over Mont Blanc." }
          ]
        },
        {
          "day": 2,
          "title": "Private Slopes & Six Senses Spa Recovery",
          "description": "First-tracks experience with former World Cup alpine skier followed by afternoon Tibetan singing bowl therapies.",
          "location": "Gstaad, Switzerland",
          "accommodation": "The Alpina Gstaad",
          "meals": ["Breakfast", "Mountain Hut Lunch"],
          "activities": [
            { "time": "08:30", "title": "First Tracks Corviglia", "description": "Exclusive ski lift access 1 hour prior to general opening." }
          ]
        }
      ]'::jsonb
    );

    insert into public.share_tokens (
      proposal_id,
      deal_id,
      rfq_id,
      token,
      expires_at
    ) values (
      v_prop_id,
      v_deal_id,
      v_rfq_id,
      'prop_swiss_winter_2026',
      now() + interval '30 days'
    );
  end if;
end $$;

-- 5. Seed Test Notifications for Agent and DMC
insert into public.notifications (
  recipient_id,
  title,
  body,
  type,
  link,
  is_read,
  created_at
) values 
(
  'a1111111-1111-1111-1111-111111111111',
  'Deal Accepted by Traveler: Thailand Kingdoms & Siam',
  'Dr. Kabir Sen confirmed itinerary selection via secure traveler portal. Ready to issue customer invoice.',
  'deal_won',
  '/deals/d0000000-0000-0000-0000-000000000001',
  false,
  now() - interval '12 minutes'
),
(
  'a1111111-1111-1111-1111-111111111111',
  'New Quote Submitted (QTE-2026-8812)',
  'Siam Horizon D.M.C. submitted a bespoke 3-tier option quote for Luxury Honeymoon in Phuket.',
  'quote_received',
  '/rfq/f1000000-0000-0000-0000-000000000001',
  false,
  now() - interval '45 minutes'
),
(
  'a1111111-1111-1111-1111-111111111111',
  'Proposal Viewed: Swiss Winter Experience',
  'Traveler opened and reviewed shared proposal link via Safari (Switzerland).',
  'proposal_viewed',
  '/proposals/c90dcb83-30fb-4619-8ee8-9f2ad275574e',
  true,
  now() - interval '2 hours'
),
(
  'd1111111-1111-1111-1111-111111111111',
  'Deal Won: Thailand Kingdoms & Siam',
  'Apex Journeys LLP confirmed customer acceptance. Customer Selling Price: INR 174,724.20.',
  'deal_won',
  '/deals',
  false,
  now() - interval '10 minutes'
),
(
  'd1111111-1111-1111-1111-111111111111',
  'New RFQ Match: Bali Wellness Retreat',
  'A high-intent luxury RFQ matching your destination coverage was published.',
  'rfq_matched',
  '/feed',
  false,
  now() - interval '3 hours'
);
