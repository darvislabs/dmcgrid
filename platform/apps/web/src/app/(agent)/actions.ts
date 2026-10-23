'use server';

import crypto from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function unlockConnectionAction(params: {
  agentId?: string;
  dmcId: string;
  quoteId?: string | null;
  rfqId?: string | null;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const agentId = user.id;

    const { data, error } = await (supabase as any).rpc('agent_unlock_connection', {
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

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const agentId = user.id;

    const { data, error } = await (supabase as any).rpc('agent_accept_quote', {
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await (supabase as any)
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

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const isConfigured = Boolean(
    keyId &&
    keySecret &&
    !keyId.includes('placeholder') &&
    !keySecret.includes('placeholder') &&
    keyId.trim() !== '' &&
    keySecret.trim() !== ''
  );
  return { keyId, keySecret, isConfigured };
}

export async function topUpCredits(packId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: pack, error: packErr } = await (supabase as any)
      .from('credit_packs')
      .select('*')
      .eq('id', packId)
      .eq('is_active', true)
      .single();

    if (packErr || !pack) {
      return { success: false, error: 'Credit pack not found' };
    }

    const { keyId, keySecret, isConfigured } = getRazorpayConfig();

    if (!isConfigured) {
      return {
        success: true,
        isConfigured: false,
        packId: pack.id,
        packName: pack.name,
        credits: pack.credits,
        priceInr: Number(pack.price_inr),
      };
    }

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const amountPaise = Math.round(Number(pack.price_inr) * 100);

    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `topup_${pack.id.slice(0, 8)}_${Date.now()}`,
        notes: {
          pack_id: pack.id,
          credits: String(pack.credits),
          profile_id: user.id,
        },
      }),
    });

    if (!orderRes.ok) {
      const errText = await orderRes.text();
      console.error('Razorpay order creation failed:', errText);
      return { success: false, error: 'Failed to create payment order with gateway' };
    }

    const order = await orderRes.json();

    return {
      success: true,
      isConfigured: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      packId: pack.id,
      packName: pack.name,
      credits: pack.credits,
      priceInr: Number(pack.price_inr),
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error initiating top-up' };
  }
}

export async function verifyTopUp(params: {
  order_id: string;
  payment_id: string;
  signature: string;
  packId: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { keySecret } = getRazorpayConfig();
    if (!keySecret) {
      return { success: false, error: 'Razorpay secret key not configured' };
    }

    // Verify HMAC signature: crypto.createHmac('sha256', key_secret).update(order_id|payment_id)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${params.order_id}|${params.payment_id}`)
      .digest('hex');

    if (expectedSignature !== params.signature) {
      return { success: false, error: 'Invalid payment signature' };
    }

    // Fetch pack details
    const { data: pack, error: packErr } = await (supabase as any)
      .from('credit_packs')
      .select('*')
      .eq('id', params.packId)
      .eq('is_active', true)
      .single();

    if (packErr || !pack) {
      return { success: false, error: 'Credit pack not found' };
    }

    // Execute SECURITY DEFINER RPC
    const { data: rpcRes, error: rpcErr } = await (supabase as any).rpc('wallet_topup_credit', {
      p_profile_id: user.id,
      p_credits: pack.credits,
      p_amount_inr: Number(pack.price_inr),
      p_payment_ref: params.payment_id,
    });

    if (rpcErr) {
      return { success: false, error: rpcErr.message || 'Failed to grant credits' };
    }

    revalidatePath('/wallet');
    revalidatePath('/');
    revalidatePath('/rfq');

    return {
      success: true,
      newBalance: rpcRes?.new_balance,
      creditsAdded: rpcRes?.credits_added,
      txId: rpcRes?.tx_id,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Payment verification failed' };
  }
}

export async function demoTopUpCredits(params: {
  packId: string;
  paymentRef?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: pack, error: packErr } = await (supabase as any)
      .from('credit_packs')
      .select('*')
      .eq('id', params.packId)
      .eq('is_active', true)
      .single();

    if (packErr || !pack) {
      return { success: false, error: 'Credit pack not found' };
    }

    const ref = params.paymentRef || `DEMO-${crypto.randomUUID()}`;

    // Execute SECURITY DEFINER RPC
    const { data: rpcRes, error: rpcErr } = await (supabase as any).rpc('wallet_topup_credit', {
      p_profile_id: user.id,
      p_credits: pack.credits,
      p_amount_inr: Number(pack.price_inr),
      p_payment_ref: ref,
    });

    if (rpcErr) {
      return { success: false, error: rpcErr.message || 'Failed to grant demo credits' };
    }

    revalidatePath('/wallet');
    revalidatePath('/');
    revalidatePath('/rfq');

    return {
      success: true,
      newBalance: rpcRes?.new_balance,
      creditsAdded: rpcRes?.credits_added,
      paymentRef: ref,
      txId: rpcRes?.tx_id,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to process demo top-up' };
  }
}

export const demoTopUpAction = demoTopUpCredits;

export async function buyCreditPackAction(params: {
  packId: string;
  credits?: number;
  packName?: string;
}) {
  return demoTopUpCredits({ packId: params.packId });
}

export async function updateDealStatusAction(params: {
  dealId: string;
  status: 'draft' | 'sent' | 'won' | 'lost' | 'pending';
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await (supabase as any).rpc('agent_update_deal_status', {
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await (supabase as any).rpc('mark_notifications_read', {
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

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const client = supabase;

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

