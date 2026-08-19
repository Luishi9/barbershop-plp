/**
 * Servicio controller: HTTP entry points for service resources.
 */
import type { Request, Response } from 'express';
import { ServicioService } from '../services/servicio.service.js';
import { asyncHandler, ok } from '../utils/http.js';

const service = new ServicioService();

/** GET /api/servicios — list all services. */
export const listServicios = asyncHandler(async (_req: Request, res: Response) => {
  const data = await service.list();
  ok(res, data, 'Servicios obtenidos');
});

/** GET /api/servicios/:id — get a single service. */
export const getServicio = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.getById(req.params.id);
  ok(res, data, 'Servicio obtenido');
});

/** POST /api/servicios — create a service (admin only). */
export const createServicio = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.create(req.body);
  ok(res, data, 'Servicio creado', 201);
});

/** PUT /api/servicios/:id — update a service (admin only). */
export const updateServicio = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.update(req.params.id, req.body);
  ok(res, data, 'Servicio actualizado');
});

/** DELETE /api/servicios/:id — delete a service (admin only). */
export const removeServicio = asyncHandler(async (req: Request, res: Response) => {
  await service.remove(req.params.id);
  ok(res, null, 'Servicio eliminado', 204);
});