import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

export type DmcSupabaseClient = SupabaseClient<Database>;

export function createDmcClient(supabaseUrl: string, supabaseAnonKey: string): DmcSupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
