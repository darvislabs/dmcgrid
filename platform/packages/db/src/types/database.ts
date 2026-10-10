export type UserRole = 'agent' | 'dmc' | 'admin';
export type KycStatus = 'unsubmitted' | 'pending' | 'verified' | 'rejected';
export type RfqStatus = 'draft' | 'published' | 'matching' | 'quoted' | 'connected' | 'deal_created' | 'closed' | 'cancelled';
export type QuoteStatus = 'draft' | 'submitted' | 'shortlisted' | 'connected' | 'rejected' | 'expired';
export type LineItemServiceType = 'Flight' | 'Local Cab' | 'Transfer' | 'Hotel' | 'Activity' | 'Meal' | 'Other';
export type LedgerAccountType = 'system_reserve' | 'agent_wallet' | 'platform_revenue' | 'escrow';
export type LedgerDirection = 'DEBIT' | 'CREDIT';

export interface Profile {
  id: string;
  role: UserRole;
  email: string;
  full_name: string;
  company_name: string;
  phone: string | null;
  country: string;
  city: string | null;
  website: string | null;
  is_verified: boolean;
  kyc_status: KycStatus;
  credit_balance: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface KycRecord {
  id: string;
  profile_id: string;
  entity_type: 'proprietorship' | 'partnership' | 'pvt_ltd' | 'llp' | 'dmc_foreign' | 'other';
  tax_id: string | null;
  business_reg_number: string | null;
  id_document_url: string | null;
  business_document_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rfq {
  id: string;
  agent_id: string;
  reference_code: string;
  status: RfqStatus;
  title: string;
  traveler_count: number;
  traveler_type: 'couples' | 'family' | 'friends' | 'solo' | 'corporate' | 'group' | null;
  start_date: string;
  end_date: string;
  duration_nights: number;
  pacing: 'relaxed' | 'moderate' | 'packed' | null;
  budget_currency: string;
  budget_min: number | null;
  budget_max: number | null;
  ai_confidence_score: number | null;
  ai_extracted_data: Record<string, unknown> | null;
  sla_expires_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RfqDestination {
  id: string;
  rfq_id: string;
  destination_country: string;
  destination_city: string;
  order_index: number;
  nights: number;
  notes: string | null;
  created_at: string;
}

export interface RfqStay {
  id: string;
  rfq_id: string;
  category: '3_star' | '4_star' | '5_star' | 'luxury' | 'boutique' | 'resort' | 'villa' | null;
  room_count: number;
  room_type: string | null;
  meal_plan: 'ep' | 'cp' | 'map' | 'ap' | 'all_inclusive' | null;
  preferred_chains: string[] | null;
  notes: string | null;
  created_at: string;
}

export interface RfqExperience {
  id: string;
  rfq_id: string;
  experience_type: string;
  is_mandatory: boolean;
  description: string | null;
  created_at: string;
}

export interface RfqMatch {
  id: string;
  rfq_id: string;
  dmc_id: string;
  status: 'pending' | 'viewed' | 'quoted' | 'declined' | 'expired';
  match_score: number | null;
  notified_at: string;
  viewed_at: string | null;
  created_at: string;
}

export interface Quote {
  id: string;
  rfq_id: string;
  dmc_id: string;
  quote_code: string;
  anonymous_label: string;
  status: QuoteStatus;
  currency: string;
  valid_until: string;
  notes: string | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteOption {
  id: string;
  quote_id: string;
  option_name: string;
  net_cost: number;
  currency: string;
  hotel_summary: string | null;
  vehicle_type: string | null;
  is_recommended: boolean;
  created_at: string;
}

export interface QuoteLineItem {
  id: string;
  quote_option_id: string;
  day_number: number;
  time_slot: string | null;
  service_type: LineItemServiceType;
  title: string;
  description: string | null;
  reference_notes: string | null;
  unit_cost: number;
  order_index: number;
  created_at: string;
}

export interface Connection {
  id: string;
  rfq_id: string;
  agent_id: string;
  dmc_id: string;
  quote_id: string;
  credits_spent: number;
  status: 'active' | 'closed';
  connected_at: string;
}

export interface Deal {
  id: string;
  connection_id: string;
  rfq_id: string;
  quote_option_id: string;
  net_cost: number;
  margin_type: 'percentage' | 'fixed';
  margin_rate: number;
  margin_amount: number;
  ancillary_costs: number;
  ancillary_charges: number;
  ancillary_margin: number;
  subtotal: number;
  gst_pct: number;
  gst_amount: number;
  tcs_pct: number;
  tcs_amount: number;
  total_customer_price: number;
  tds_paid: number;
  tds_payable: number;
  gross_profit: number;
  cash_profit: number;
  status: 'draft' | 'sent' | 'won' | 'lost' | 'pending';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  deal_id: string;
  agent_id: string;
  title: string;
  brand_name: string;
  hero_headline: string | null;
  total_display_price: number;
  currency: string;
  itinerary_payload: unknown[];
  inclusions_payload: string[] | null;
  exclusions_payload: string[] | null;
  terms_payload: string[] | null;
  status: 'draft' | 'published' | 'accepted' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface ShareToken {
  id: string;
  proposal_id: string;
  token: string;
  expires_at: string | null;
  view_count: number;
  last_viewed_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  price_inr: number;
  credits_included: number;
  features: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface CreditPack {
  id: string;
  profile_id: string;
  plan_id: string | null;
  credits: number;
  amount_paid: number;
  currency: string;
  payment_gateway: string;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  status: 'pending' | 'captured' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface CreditLedgerEntry {
  id: string;
  transaction_id: string;
  profile_id: string | null;
  account_type: LedgerAccountType;
  direction: LedgerDirection;
  amount: number;
  balance_after: number | null;
  reference_type: 'purchase' | 'connect_fee' | 'refund' | 'bonus' | 'admin_adjustment';
  reference_id: string | null;
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  type: string;
  title: string;
  message: string;
  payload: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  previous_state: Record<string, unknown> | null;
  new_state: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Profile> };
      kyc_records: { Row: KycRecord; Insert: Omit<KycRecord, 'id' | 'created_at' | 'updated_at'>; Update: Partial<KycRecord> };
      rfqs: { Row: Rfq; Insert: Omit<Rfq, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Rfq> };
      rfq_destinations: { Row: RfqDestination; Insert: Omit<RfqDestination, 'id' | 'created_at'>; Update: Partial<RfqDestination> };
      rfq_stays: { Row: RfqStay; Insert: Omit<RfqStay, 'id' | 'created_at'>; Update: Partial<RfqStay> };
      rfq_experiences: { Row: RfqExperience; Insert: Omit<RfqExperience, 'id' | 'created_at'>; Update: Partial<RfqExperience> };
      rfq_matches: { Row: RfqMatch; Insert: Omit<RfqMatch, 'id' | 'created_at'>; Update: Partial<RfqMatch> };
      quotes: { Row: Quote; Insert: Omit<Quote, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Quote> };
      quote_options: { Row: QuoteOption; Insert: Omit<QuoteOption, 'id' | 'created_at'>; Update: Partial<QuoteOption> };
      quote_line_items: { Row: QuoteLineItem; Insert: Omit<QuoteLineItem, 'id' | 'created_at'>; Update: Partial<QuoteLineItem> };
      connections: { Row: Connection; Insert: Omit<Connection, 'id' | 'connected_at'>; Update: Partial<Connection> };
      deals: { Row: Deal; Insert: Omit<Deal, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Deal> };
      proposals: { Row: Proposal; Insert: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Proposal> };
      share_tokens: { Row: ShareToken; Insert: Omit<ShareToken, 'id' | 'created_at'>; Update: Partial<ShareToken> };
      plans: { Row: Plan; Insert: Omit<Plan, 'id' | 'created_at'>; Update: Partial<Plan> };
      credit_packs: { Row: CreditPack; Insert: Omit<CreditPack, 'id' | 'created_at' | 'updated_at'>; Update: Partial<CreditPack> };
      credit_ledger: { Row: CreditLedgerEntry; Insert: Omit<CreditLedgerEntry, 'id' | 'created_at'>; Update: Partial<CreditLedgerEntry> };
      notifications: { Row: Notification; Insert: Omit<Notification, 'id' | 'created_at'>; Update: Partial<Notification> };
      audit_log: { Row: AuditLogEntry; Insert: Omit<AuditLogEntry, 'id' | 'created_at'>; Update: never };
    };
  };
}
