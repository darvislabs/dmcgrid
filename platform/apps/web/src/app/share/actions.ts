'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';

export async function recordTravelerChoiceAction(params: {
  token: string;
  optionId: string;
  notes?: string;
}) {
  try {
    const adminClient = createAdminClient();

    const { data, error } = await (adminClient as any).rpc('record_traveler_choice', {
      p_token: params.token.trim(),
      p_option_id: params.optionId,
      p_notes: params.notes || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/share/${params.token}`);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to record selection' };
  }
}
