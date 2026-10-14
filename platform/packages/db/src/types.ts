/**
 * DMCGrid Platform - Strict Database Schema Types
 * Generated & typed for Supabase PostgreSQL schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'agent' | 'dmc' | 'admin';
export type KycStatus = 'draft' | 'pending' | 'verified' | 'rejected';
export type RfqStatus = 'draft' | 'published' | 'quoted' | 'connected' | 'closed';
export type RfqMatchStatus = 'notified' | 'viewed' | 'quoted' | 'passed';
export type QuoteStatus = 'submitted' | 'shortlisted' | 'connected' | 'declined';
export type TimeWindowType = 'morning' | 'afternoon' | 'evening' | 'night';
export type MarkupCalcType = 'percentage' | 'fixed';
export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type DealStatus = 'draft' | 'sent' | 'won' | 'lost' | 'pending';
export type ProposalStatus = 'draft' | 'shared' | 'accepted';
export type LedgerEntryType = 'debit' | 'credit';
export type CreditAccountType = 'agent_wallet' | 'dmc_escrow' | 'platform_revenue' | 'system_reserve';

export interface V62CostBreakdown {
  net: number;
  markup_amount: number;
  ancillary_cost: number;
  ancillary_charge: number;
  ancillary_margin: number;
  subtotal: number;
  gst_amount: number;
  tcs_amount: number;
  customer_selling_price: number;
  gross_profit: number;
  cash_profit: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          company_name: string;
          contact_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          kyc_status: KycStatus;
          bio: string | null;
          operating_destinations: string[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          company_name: string;
          contact_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          kyc_status?: KycStatus;
          bio?: string | null;
          operating_destinations?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          company_name?: string;
          contact_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          kyc_status?: KycStatus;
          bio?: string | null;
          operating_destinations?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      kyc_records: {
        Row: {
          id: string;
          profile_id: string;
          business_reg_number: string;
          tax_id_pan: string;
          gst_number: string | null;
          documents_urls: Json;
          status: KycStatus;
          reviewer_id: string | null;
          review_notes: string | null;
          submitted_at: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          business_reg_number: string;
          tax_id_pan: string;
          gst_number?: string | null;
          documents_urls?: Json;
          status?: KycStatus;
          reviewer_id?: string | null;
          review_notes?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          business_reg_number?: string;
          tax_id_pan?: string;
          gst_number?: string | null;
          documents_urls?: Json;
          status?: KycStatus;
          reviewer_id?: string | null;
          review_notes?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rfqs: {
        Row: {
          id: string;
          agent_id: string;
          rfq_number: string;
          status: RfqStatus;
          title: string;
          travelers_adults: number;
          travelers_children: number;
          travelers_infants: number;
          start_date: string;
          end_date: string;
          duration_days: number;
          duration_nights: number;
          budget_min: number | null;
          budget_max: number | null;
          currency: string;
          notes: string | null;
          ai_extracted_data: Json | null;
          published_at: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          rfq_number: string;
          status?: RfqStatus;
          title: string;
          travelers_adults?: number;
          travelers_children?: number;
          travelers_infants?: number;
          start_date: string;
          end_date: string;
          duration_days: number;
          duration_nights: number;
          budget_min?: number | null;
          budget_max?: number | null;
          currency?: string;
          notes?: string | null;
          ai_extracted_data?: Json | null;
          published_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          rfq_number?: string;
          status?: RfqStatus;
          title?: string;
          travelers_adults?: number;
          travelers_children?: number;
          travelers_infants?: number;
          start_date?: string;
          end_date?: string;
          duration_days?: number;
          duration_nights?: number;
          budget_min?: number | null;
          budget_max?: number | null;
          currency?: string;
          notes?: string | null;
          ai_extracted_data?: Json | null;
          published_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rfq_destinations: {
        Row: {
          id: string;
          rfq_id: string;
          destination_name: string;
          country: string;
          nights: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          destination_name: string;
          country: string;
          nights: number;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          rfq_id?: string;
          destination_name?: string;
          country?: string;
          nights?: number;
          order_index?: number;
          created_at?: string;
        };
      };
      rfq_stays: {
        Row: {
          id: string;
          rfq_id: string;
          star_rating: string;
          hotel_type: string;
          meal_plan: string;
          room_count: number;
          preferences: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          star_rating?: string;
          hotel_type?: string;
          meal_plan?: string;
          room_count?: number;
          preferences?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          rfq_id?: string;
          star_rating?: string;
          hotel_type?: string;
          meal_plan?: string;
          room_count?: number;
          preferences?: string | null;
          created_at?: string;
        };
      };
      rfq_experiences: {
        Row: {
          id: string;
          rfq_id: string;
          category: string;
          description: string;
          required: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          category: string;
          description: string;
          required?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          rfq_id?: string;
          category?: string;
          description?: string;
          required?: boolean;
          created_at?: string;
        };
      };
      rfq_matches: {
        Row: {
          id: string;
          rfq_id: string;
          dmc_id: string;
          match_score: number;
          match_reasons: Json;
          status: RfqMatchStatus;
          notified_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          dmc_id: string;
          match_score?: number;
          match_reasons?: Json;
          status?: RfqMatchStatus;
          notified_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          rfq_id?: string;
          dmc_id?: string;
          match_score?: number;
          match_reasons?: Json;
          status?: RfqMatchStatus;
          notified_at?: string;
          created_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          rfq_id: string;
          dmc_id: string;
          quote_number: string;
          status: QuoteStatus;
          valid_until: string;
          total_net_cost: number;
          currency: string;
          response_time_seconds: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          dmc_id: string;
          quote_number: string;
          status?: QuoteStatus;
          valid_until: string;
          total_net_cost: number;
          currency?: string;
          response_time_seconds?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rfq_id?: string;
          dmc_id?: string;
          quote_number?: string;
          status?: QuoteStatus;
          valid_until?: string;
          total_net_cost?: number;
          currency?: string;
          response_time_seconds?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quote_options: {
        Row: {
          id: string;
          quote_id: string;
          option_name: string;
          description: string | null;
          net_cost: number;
          currency: string;
          is_selected: boolean;
          order_index: number;
          day_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_id: string;
          option_name: string;
          description?: string | null;
          net_cost: number;
          currency?: string;
          is_selected?: boolean;
          order_index?: number;
          day_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quote_id?: string;
          option_name?: string;
          description?: string | null;
          net_cost?: number;
          currency?: string;
          is_selected?: boolean;
          order_index?: number;
          day_count?: number;
          created_at?: string;
        };
      };
      quote_line_items: {
        Row: {
          id: string;
          quote_option_id: string;
          day_number: number;
          time_window: TimeWindowType;
          title: string;
          description: string | null;
          cost_category: string;
          net_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_option_id: string;
          day_number: number;
          time_window?: TimeWindowType;
          title: string;
          description?: string | null;
          cost_category?: string;
          net_cost?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quote_option_id?: string;
          day_number?: number;
          time_window?: TimeWindowType;
          title?: string;
          description?: string | null;
          cost_category?: string;
          net_cost?: number;
          created_at?: string;
        };
      };
      connections: {
        Row: {
          id: string;
          rfq_id: string;
          quote_id: string;
          agent_id: string;
          dmc_id: string;
          credit_amount_deducted: number;
          unlocked_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          quote_id: string;
          agent_id: string;
          dmc_id: string;
          credit_amount_deducted?: number;
          unlocked_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          rfq_id?: string;
          quote_id?: string;
          agent_id?: string;
          dmc_id?: string;
          credit_amount_deducted?: number;
          unlocked_at?: string;
          created_at?: string;
        };
      };
      deals: {
        Row: {
          id: string;
          rfq_id: string;
          connection_id: string;
          agent_id: string;
          dmc_id: string;
          selected_quote_option_id: string;
          net_cost: number;
          markup_type: MarkupCalcType;
          markup_percentage: number;
          markup_fixed: number;
          ancillary_cost: number;
          ancillary_charge: number;
          gross_margin: number;
          gst_percentage: number;
          gst_amount: number;
          tcs_percentage: number;
          tcs_amount: number;
          customer_selling_price: number;
          tds_paid: number;
          tds_payable: number;
          cash_profit: number;
          manager_approval_status: ApprovalStatus;
          manager_approved_by: string | null;
          manager_approved_at: string | null;
          status: DealStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          connection_id: string;
          agent_id: string;
          dmc_id: string;
          selected_quote_option_id: string;
          net_cost: number;
          markup_type?: MarkupCalcType;
          markup_percentage?: number;
          markup_fixed?: number;
          ancillary_cost?: number;
          ancillary_charge?: number;
          gross_margin?: number;
          gst_percentage?: number;
          gst_amount?: number;
          tcs_percentage?: number;
          tcs_amount?: number;
          customer_selling_price?: number;
          tds_paid?: number;
          tds_payable?: number;
          cash_profit?: number;
          manager_approval_status?: ApprovalStatus;
          manager_approved_by?: string | null;
          manager_approved_at?: string | null;
          status?: DealStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rfq_id?: string;
          connection_id?: string;
          agent_id?: string;
          dmc_id?: string;
          selected_quote_option_id?: string;
          net_cost?: number;
          markup_type?: MarkupCalcType;
          markup_percentage?: number;
          markup_fixed?: number;
          ancillary_cost?: number;
          ancillary_charge?: number;
          gross_margin?: number;
          gst_percentage?: number;
          gst_amount?: number;
          tcs_percentage?: number;
          tcs_amount?: number;
          customer_selling_price?: number;
          tds_paid?: number;
          tds_payable?: number;
          cash_profit?: number;
          manager_approval_status?: ApprovalStatus;
          manager_approved_by?: string | null;
          manager_approved_at?: string | null;
          status?: DealStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      proposals: {
        Row: {
          id: string;
          deal_id: string;
          version: number;
          title: string;
          customer_name: string;
          customer_email: string | null;
          itinerary_json: Json;
          terms: string | null;
          total_price: number;
          currency: string;
          status: ProposalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          version?: number;
          title: string;
          customer_name: string;
          customer_email?: string | null;
          itinerary_json?: Json;
          terms?: string | null;
          total_price: number;
          currency?: string;
          status?: ProposalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          deal_id?: string;
          version?: number;
          title?: string;
          customer_name?: string;
          customer_email?: string | null;
          itinerary_json?: Json;
          terms?: string | null;
          total_price?: number;
          currency?: string;
          status?: ProposalStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      share_tokens: {
        Row: {
          id: string;
          proposal_id: string;
          token: string;
          views_count: number;
          last_viewed_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          token: string;
          views_count?: number;
          last_viewed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          token?: string;
          views_count?: number;
          last_viewed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      credit_accounts: {
        Row: {
          id: string;
          profile_id: string | null;
          account_type: CreditAccountType;
          name: string;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          account_type: CreditAccountType;
          name: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          account_type?: CreditAccountType;
          name?: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          description: string;
          reference_type: string;
          reference_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          reference_type: string;
          reference_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          description?: string;
          reference_type?: string;
          reference_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      credit_ledger: {
        Row: {
          id: string;
          transaction_id: string;
          account_id: string;
          profile_id: string | null;
          entry_type: LedgerEntryType;
          amount: number;
          balance_after: number;
          reference_type: string;
          reference_id: string | null;
          description: string;
          idempotency_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          account_id: string;
          profile_id?: string | null;
          entry_type: LedgerEntryType;
          amount: number;
          balance_after: number;
          reference_type: string;
          reference_id?: string | null;
          description: string;
          idempotency_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          account_id?: string;
          profile_id?: string | null;
          entry_type?: LedgerEntryType;
          amount?: number;
          balance_after?: number;
          reference_type?: string;
          reference_id?: string | null;
          description?: string;
          idempotency_key?: string | null;
          created_at?: string;
        };
      };
      credit_packs: {
        Row: {
          id: string;
          name: string;
          credits: number;
          price_inr: number;
          gst_rate: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          credits: number;
          price_inr: number;
          gst_rate?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          credits?: number;
          price_inr?: number;
          gst_rate?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          plan_code: string;
          name: string;
          monthly_leads_included: number;
          price_inr: number;
          description: string | null;
          features: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_code: string;
          name: string;
          monthly_leads_included: number;
          price_inr: number;
          description?: string | null;
          features?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_code?: string;
          name?: string;
          monthly_leads_included?: number;
          price_inr?: number;
          description?: string | null;
          features?: Json;
          is_active?: boolean;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          title: string;
          body: string;
          type: string;
          link: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          title: string;
          body: string;
          type: string;
          link?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          title?: string;
          body?: string;
          type?: string;
          link?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          previous_state: Json | null;
          new_state: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          previous_state?: Json | null;
          new_state?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          previous_state?: Json | null;
          new_state?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      calculate_v62_deal_cost: {
        Args: {
          p_net: number;
          p_markup_value?: number;
          p_markup_type?: MarkupCalcType;
          p_ancillary_cost?: number;
          p_ancillary_charge?: number;
          p_gst_percentage?: number;
          p_tcs_percentage?: number;
          p_tds_paid?: number;
          p_tds_payable?: number;
        };
        Returns: V62CostBreakdown;
      };
      post_double_entry_credit_transaction: {
        Args: {
          p_source_account_id: string;
          p_destination_account_id: string;
          p_amount: number;
          p_reference_type: string;
          p_reference_id: string;
          p_description: string;
          p_idempotency_key?: string | null;
          p_actor_id?: string | null;
        };
        Returns: string;
      };
      admin_review_kyc: {
        Args: {
          p_kyc_record_id: string;
          p_status: KycStatus;
          p_reason: string;
          p_reviewer_id?: string;
        };
        Returns: Json;
      };
      admin_toggle_user_active: {
        Args: {
          p_user_id: string;
          p_is_active: boolean;
          p_reason: string;
          p_admin_id?: string;
        };
        Returns: Json;
      };
      admin_force_close_rfq: {
        Args: {
          p_rfq_id: string;
          p_reason: string;
          p_admin_id?: string;
        };
        Returns: Json;
      };
      admin_adjust_credits: {
        Args: {
          p_profile_id: string;
          p_entry_type: LedgerEntryType;
          p_amount: number;
          p_reason: string;
          p_admin_id?: string;
        };
        Returns: Json;
      };
      admin_save_plan: {
        Args: {
          p_plan_id?: string | null;
          p_plan_code?: string | null;
          p_name?: string | null;
          p_monthly_leads?: number | null;
          p_price_inr?: number | null;
          p_description?: string | null;
          p_features?: Json;
          p_is_active?: boolean;
          p_admin_id?: string;
        };
        Returns: Json;
      };
      get_admin_analytics_summary: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_admin_sparkline_14d: {
        Args: Record<string, never>;
        Returns: Json;
      };
      agent_update_deal_status: {
        Args: {
          p_deal_id: string;
          p_status: string;
        };
        Returns: Json;
      };
      agent_create_rfq: {
        Args: {
          p_title: string;
          p_adults?: number;
          p_children?: number;
          p_infants?: number;
          p_start_date?: string;
          p_nights?: number;
          p_budget_min?: number | null;
          p_budget_max?: number | null;
          p_currency?: string;
          p_notes?: string | null;
          p_extra?: Json;
          p_destinations?: Json;
          p_stays?: Json;
          p_experiences?: Json;
        };
        Returns: string;
      };
      mark_notifications_read: {
        Args: {
          p_ids?: Json;
        };
        Returns: Json;
      };
    };
  };
}

export interface AdminAnalyticsSummary {
  agents_count: number;
  dmcs_count: number;
  pending_kyc_count: number;
  published_rfqs_count: number;
  quotes_submitted_count: number;
  connections_made_count: number;
  quote_avg_response_seconds: number;
  revenue_estimated_inr: number;
}

export interface SparklinePoint {
  date: string;
  label: string;
  rfqs: number;
  quotes: number;
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type KycRecord = Database['public']['Tables']['kyc_records']['Row'];
export type Rfq = Database['public']['Tables']['rfqs']['Row'];
export type RfqDestination = Database['public']['Tables']['rfq_destinations']['Row'];
export type RfqStay = Database['public']['Tables']['rfq_stays']['Row'];
export type RfqExperience = Database['public']['Tables']['rfq_experiences']['Row'];
export type RfqMatch = Database['public']['Tables']['rfq_matches']['Row'];
export type Quote = Database['public']['Tables']['quotes']['Row'];
export type QuoteOption = Database['public']['Tables']['quote_options']['Row'];
export type QuoteLineItem = Database['public']['Tables']['quote_line_items']['Row'];
export type Connection = Database['public']['Tables']['connections']['Row'];
export type Deal = Database['public']['Tables']['deals']['Row'];
export type Proposal = Database['public']['Tables']['proposals']['Row'];
export type ShareToken = Database['public']['Tables']['share_tokens']['Row'];
export type Plan = Database['public']['Tables']['plans']['Row'];
export type CreditPack = Database['public']['Tables']['credit_packs']['Row'];
export type CreditAccount = Database['public']['Tables']['credit_accounts']['Row'];
export type CreditLedgerEntry = Database['public']['Tables']['credit_ledger']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type AuditLogEntry = Database['public']['Tables']['audit_log']['Row'];

