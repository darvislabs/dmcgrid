'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function unlockConnectionAction(params: {
  agentId?: string;
  dmcId: string;
  quoteId?: string | null;
  rfqId?: string | null;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const agentId = params.agentId || user?.id || 'a1111111-1111-1111-1111-111111111111';
    const adminClient = createAdminClient();

    const { data, error } = await (adminClient as any).rpc('agent_unlock_connection', {
      p_agent_id: agentId,
      p_dmc_id: params.dmcId,
      p_quote_id: params.quoteId || null,
      p_rfq_id: params.rfqId || null,
      p_credit_cost: 5,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/connections');
    revalidatePath('/wallet');
    if (params.rfqId) revalidatePath(`/rfq/${params.rfqId}`);
    revalidatePath('/rfq');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to unlock connection' };
  }
}

export async function acceptQuoteAction(params: {
  rfqId: string;
  quoteId: string;
  optionId: string;
  agentId?: string;
  markupPercentage?: number;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const agentId = params.agentId || user?.id || 'a1111111-1111-1111-1111-111111111111';
    const adminClient = createAdminClient();

    const { data, error } = await (adminClient as any).rpc('agent_accept_quote', {
      p_rfq_id: params.rfqId,
      p_quote_id: params.quoteId,
      p_option_id: params.optionId,
      p_agent_id: agentId,
      p_markup_percentage: params.markupPercentage || 12.00,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/rfq/${params.rfqId}`);
    revalidatePath('/rfq');
    revalidatePath('/connections');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to accept quote' };
  }
}

export async function rejectQuoteAction(params: {
  rfqId: string;
  quoteId: string;
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await (adminClient as any)
      .from('quotes')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', params.quoteId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/rfq/${params.rfqId}`);
    revalidatePath('/rfq');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to decline quote' };
  }
}

export async function buyCreditPackAction(params: {
  packId: string;
  credits: number;
  packName: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const agentId = user?.id || 'a1111111-1111-1111-1111-111111111111';
    const adminClient = createAdminClient() as any;

    // 1. Get or create agent_wallet
    let { data: account } = await adminClient
      .from('credit_accounts')
      .select('id, balance')
      .eq('profile_id', agentId)
      .eq('account_type', 'agent_wallet')
      .maybeSingle();

    if (!account) {
      const { data: newAcc } = await adminClient
        .from('credit_accounts')
        .insert({
          profile_id: agentId,
          account_type: 'agent_wallet',
          name: 'Agent Credits Wallet',
          balance: 0,
        })
        .select()
        .single();
      account = newAcc;
    }

    if (!account) {
      return { success: false, error: 'Could not access credit wallet account' };
    }

    const curBalance = Number(account.balance) || 0;
    const newBalance = curBalance + params.credits;

    // 2. Update balance
    await adminClient
      .from('credit_accounts')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', account.id);

    // 3. Create credit transaction
    const { data: tx } = await adminClient
      .from('credit_transactions')
      .insert({
        description: `Purchased ${params.packName} (${params.credits} Credits)`,
        reference_type: 'pack_purchase',
        reference_id: params.packId,
        created_by: agentId,
      })
      .select('id')
      .single();

    // 4. Ledger entry
    if (tx) {
      await adminClient.from('credit_ledger').insert({
        transaction_id: tx.id,
        account_id: account.id,
        profile_id: agentId,
        entry_type: 'credit',
        amount: params.credits,
        balance_after: newBalance,
        reference_type: 'pack_purchase',
        reference_id: params.packId,
        description: `Purchased ${params.packName}`,
      });
    }

    // 5. Audit log
    await adminClient.from('audit_log').insert({
      actor_id: agentId,
      action: 'CREDIT_PACK_PURCHASED',
      entity_type: 'credit_accounts',
      entity_id: account.id,
      new_state: {
        pack_id: params.packId,
        pack_name: params.packName,
        credits: params.credits,
        new_balance: newBalance,
      },
    });

    revalidatePath('/wallet');
    revalidatePath('/');
    revalidatePath('/rfq');
    return { success: true, newBalance };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to purchase credit pack' };
  }
}

export async function updateDealStatusAction(params: {
  dealId: string;
  status: 'draft' | 'sent' | 'won' | 'lost' | 'pending';
}) {
  try {
    const adminClient = createAdminClient();

    const { data, error } = await (adminClient as any).rpc('agent_update_deal_status', {
      p_deal_id: params.dealId,
      p_status: params.status,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/deals');
    revalidatePath(`/deals/${params.dealId}`);
    revalidatePath('/proposals');
    revalidatePath('/feed');
    revalidatePath('/');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update deal status' };
  }
}

export async function markNotificationsReadAction(params: {
  ids?: string[];
}) {
  try {
    const adminClient = createAdminClient();

    const { data, error } = await (adminClient as any).rpc('mark_notifications_read', {
      p_ids: params.ids || [],
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/deals');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to mark notifications read' };
  }
}

export async function publishRfqAction(params: {
  title: string;
  adults: number;
  children: number;
  infants: number;
  startDate: string;
  nights: number;
  budgetMin: number | null;
  budgetMax: number | null;
  currency?: string;
  notes?: string | null;
  extra?: Record<string, unknown>;
  destinations: Array<{
    destination_name: string;
    country: string;
    nights: number;
    order_index: number;
  }>;
  stays?: {
    star_rating: string;
    hotel_type: string;
    meal_plan: string;
    room_count: number;
    preferences?: string | null;
  } | null;
  experiences?: Array<{
    category: string;
    description: string;
    required: boolean;
  }>;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Use user session client if authenticated; otherwise fallback to admin client with impersonation if in demo mode
    const client = user ? supabase : createAdminClient();

    const { data, error } = await (client as any).rpc('agent_create_rfq', {
      p_title: params.title,
      p_adults: params.adults,
      p_children: params.children,
      p_infants: params.infants,
      p_start_date: params.startDate,
      p_nights: params.nights,
      p_budget_min: params.budgetMin,
      p_budget_max: params.budgetMax,
      p_currency: params.currency || 'INR',
      p_notes: params.notes || null,
      p_extra: params.extra || {},
      p_destinations: params.destinations,
      p_stays: params.stays || null,
      p_experiences: params.experiences || [],
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/rfq');
    revalidatePath('/wallet');
    return { success: true, id: data as string };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to publish RFQ' };
  }
}

