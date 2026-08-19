/**
 * Admin middleware: blocks non-admin callers. Must run AFTER requireAuth so
 * that req.auth is populated.
 */
import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/http.js';

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.auth?.profile.rol !== 'admin') {
    return next(new ApiError(403, 'Acceso denegado: se requiere rol admin'));
  }
  next();
};