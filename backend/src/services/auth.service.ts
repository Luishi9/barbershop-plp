/**
 * Auth service: resolves a local profile from an authenticated user.
 * The JWT verification itself happens in the auth middleware.
 */
import { getSupabaseAdmin } from '../config/supabase.js';
import type { User } from '../models/index.js';
import { ApiError } from '../utils/http.js';

export class AuthService {
  private db = getSupabaseAdmin();

  /** Fetch the local profile for a Supabase auth user id. */
  async getProfile(authUserId: string): Promise<User> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new ApiError(401, 'Perfil de usuario no encontrado');
    }
    return data as unknown as User;
  }
}