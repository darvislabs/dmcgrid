'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import type { KycStatus, LedgerEntryType } from '@dmcgrid/db';

export async function reviewKycAction(params: {
  kycRecordId: string;
  status: KycStatus;
  reason: string;
}) {
  if (!params.reason || !params.reason.trim()) {
    return { success: false, error: 'A mandatory review reason is required.' };
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any).rpc('admin_review_kyc', {
    p_kyc_record_id: params.kycRecordId,
    p_status: params.status,
    p_reason: params.reason.trim(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/verification');
  revalidatePath('/admin/analytics');
  revalidatePath('/admin/users');
  return { success: true, data };
}

export async function toggleUserActiveAction(params: {
  userId: string;
  isActive: boolean;
  reason: string;
}) {
  if (!params.reason || !params.reason.trim()) {
    return { success: false, error: 'A mandatory reason is required to activate or deactivate a user.' };
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any).rpc('admin_toggle_user_active', {
    p_user_id: params.userId,
    p_is_active: params.isActive,
    p_reason: params.reason.trim(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/users');
  revalidatePath('/admin/analytics');
  return { success: true, data };
}

export async function forceCloseRfqAction(params: {
  rfqId: string;
  reason: string;
}) {
  if (!params.reason || !params.reason.trim()) {
    return { success: false, error: 'A mandatory reason is required to force close an RFQ.' };
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any).rpc('admin_force_close_rfq', {
    p_rfq_id: params.rfqId,
    p_reason: params.reason.trim(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/rfqs');
  revalidatePath('/admin/analytics');
  return { success: true, data };
}

export async function adjustCreditsAction(params: {
  profileId: string;
  entryType: LedgerEntryType;
  amount: number;
  reason: string;
}) {
  if (params.amount <= 0) {
    return { success: false, error: 'Credit adjustment amount must be greater than zero.' };
  }

  if (!params.reason || !params.reason.trim()) {
    return { success: false, error: 'A mandatory reason is required for credit adjustments.' };
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any).rpc('admin_adjust_credits', {
    p_profile_id: params.profileId,
    p_entry_type: params.entryType,
    p_amount: Math.round(params.amount),
    p_reason: params.reason.trim(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/ledger');
  revalidatePath('/admin/analytics');
  revalidatePath('/admin/users');
  return { success: true, data };
}

export async function savePlanAction(params: {
  planId?: string | null;
  planCode?: string | null;
  name?: string | null;
  monthlyLeads?: number | null;
  priceInr?: number | null;
  description?: string | null;
  features?: string[] | null;
  isActive?: boolean;
}) {
  const supabase = createAdminClient();
  const { data, error } = await (supabase as any).rpc('admin_save_plan', {
    p_plan_id: params.planId || null,
    p_plan_code: params.planCode || null,
    p_name: params.name || null,
    p_monthly_leads: params.monthlyLeads ?? null,
    p_price_inr: params.priceInr ?? null,
    p_description: params.description || null,
    p_features: params.features ?? [],
    p_is_active: params.isActive ?? true,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/plans');
  return { success: true, data };
}
