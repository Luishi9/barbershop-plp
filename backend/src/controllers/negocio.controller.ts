/**
 * Negocio controller: HTTP entry points for the singleton business config.
 */
import type { Request, Response } from 'express';
import { NegocioService } from '../services/negocio.service.js';
import { asyncHandler, ok } from '../utils/http.js';

const service = new NegocioService();

/** GET /api/negocio — get current business config (any authenticated user). */
export const getNegocio = asyncHandler(async (_req: Request, res: Response) => {
  const data = await service.get();
  ok(res, data, 'Configuración obtenida');
});

/** PUT /api/negocio — update business config (admin only). */
export const updateNegocio = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.update(req.body);
  ok(res, data, 'Configuración actualizada');
});
