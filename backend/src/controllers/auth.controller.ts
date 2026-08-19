/**
 * Auth controller: identity endpoints. The JWT is verified by the auth
 * middleware, which attaches req.auth with the caller's profile.
 */
import type { Request, Response } from 'express';
import { ok } from '../utils/http.js';

/** GET /api/auth/me — current user profile. */
export const getMe = async (req: Request, res: Response) => {
  ok(res, req.auth!.profile, 'Perfil obtenido');
};