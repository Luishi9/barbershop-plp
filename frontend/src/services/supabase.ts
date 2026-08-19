/**
 * Supabase client (anon key). Used for authentication only; data is read and
 * written through the backend API (which holds the service-role key).
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en las variables de entorno.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);