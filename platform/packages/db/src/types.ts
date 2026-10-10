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
    };
  };
}
