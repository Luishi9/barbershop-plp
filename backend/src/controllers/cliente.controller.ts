/**
 * Cliente controller: HTTP entry points for client resources.
 */
import type { Request, Response } from 'express';
import { ClienteService } from '../services/cliente.service.js';
import { asyncHandler, ok } from '../utils/http.js';

const service = new ClienteService();

/** GET /api/clientes — list all clients. */
export const listClientes = asyncHandler(async (_req: Request, res: Response) => {
  const data = await service.list();
  ok(res, data, 'Clientes obtenidos');
});

/** GET /api/clientes/:id — get a single client. */
export const getCliente = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.getById(req.params.id);
  ok(res, data, 'Cliente obtenido');
});

/** POST /api/clientes — create a client (admin only). */
export const createCliente = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.create(req.body);
  ok(res, data, 'Cliente creado', 201);
});

/** PUT /api/clientes/:id — update a client (admin only). */
export const updateCliente = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.update(req.params.id, req.body);
  ok(res, data, 'Cliente actualizado');
});

/** DELETE /api/clientes/:id — delete a client (admin only). */
export const removeCliente = asyncHandler(async (req: Request, res: Response) => {
  await service.remove(req.params.id);
  ok(res, null, 'Cliente eliminado', 204);
});