'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function submitQuoteAction(params: {
  rfqId: string;
  options: Array<{
    option_name: string;
    description?: string;
    net_cost: number;
    day_count?: number;
    line_items?: Array<{
      day_number: number;
      time_window: string;
      title: string;
      description?: string;
      cost_category: string;
      net_cost: number;
    }>;
  }>;
  dmcId?: string;
  notes?: string;
  validDays?: number;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const dmcId = user.id;

    if (!params.options || params.options.length === 0) {
      return { success: false, error: 'At least one quote option is required.' };
    }

    const { data, error } = await (supabase as any).rpc('dmc_submit_quote', {
      p_rfq_id: params.rfqId,
      p_options: params.options,
      p_dmc_id: dmcId,
      p_notes: params.notes || null,
      p_valid_days: params.validDays || 14,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/briefs/${params.rfqId}`);
    revalidatePath('/quotes');
    revalidatePath('/feed');
    revalidatePath(`/rfq/${params.rfqId}`);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit quote' };
  }
}
