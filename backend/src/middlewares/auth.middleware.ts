/**
 * Auth middleware: verifies the Supabase Auth JWT sent as
 * `Authorization: Bearer <token>` and attaches the caller context to req.auth.
 */
import type { NextFunction, Request, Response } from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';
import type { AuthContext, User } from '../models/index.js';
import { ApiError } from '../utils/http.js';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Token de autenticación requerido'));
  }

  const token = header.slice('Bearer '.length).trim();
  const supabase = getSupabaseAdmin();

  // Validate the JWT against Supabase Auth (no client trust in the token).
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return next(new ApiError(401, 'Token inválido o expirado'));
  }

  // Resolve the local profile for that auth user.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return next(new ApiError(401, 'Perfil de usuario no encontrado'));
  }

  req.auth = {
    authUserId: userData.user.id,
    email: userData.user.email ?? '',
    profile: profile as User,
  };

  next();
};