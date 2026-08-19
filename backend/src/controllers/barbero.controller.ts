/**
 * Barbero controller: HTTP entry points for barber resources.
 */
import type { Request, Response } from 'express';
import { BarberoService } from '../services/barbero.service.js';
import { asyncHandler, ok } from '../utils/http.js';

const service = new BarberoService();

/** GET /api/barberos — list all barbers. */
export const listBarberos = asyncHandler(async (_req: Request, res: Response) => {
  const data = await service.list();
  ok(res, data, 'Barberos obtenidos');
});

/** GET /api/barberos/:id — get a single barber. */
export const getBarbero = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.getById(req.params.id);
  ok(res, data, 'Barbero obtenido');
});

/** POST /api/barberos — create a barber (admin only). */
export const createBarbero = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.create(req.body);
  ok(res, data, 'Barbero creado', 201);
});

/** PUT /api/barberos/:id — update a barber (admin only). */
export const updateBarbero = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.update(req.params.id, req.body);
  ok(res, data, 'Barbero actualizado');
});

/** DELETE /api/barberos/:id — delete a barber (admin only). */
export const removeBarbero = asyncHandler(async (req: Request, res: Response) => {
  await service.remove(req.params.id);
  ok(res, null, 'Barbero eliminado', 204);
});