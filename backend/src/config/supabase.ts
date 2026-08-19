/**
 * Supabase admin client (service-role key). Bypasses RLS — used by the backend
 * to read/write data after verifying the caller's JWT in middleware.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _admin;
}
