/**
 * Cita controller: HTTP entry points for appointment resources.
 */
import type { Request, Response } from 'express';
import type { EstadoCita } from '../models/index.js';
import { CitaService } from '../services/cita.service.js';
import { ApiError, asyncHandler, ok } from '../utils/http.js';

const service = new CitaService();

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const estados: EstadoCita[] = ['pendiente', 'confirmada', 'completada', 'cancelada'];

/** GET /api/citas — list citas with optional filters (?estado=&fecha=&barberoId=&clienteId=). */
export const listCitas = asyncHandler(async (req: Request, res: Response) => {
  const { estado, fecha, barberoId, clienteId } = req.query;

  if (estado !== undefined && !estados.includes(estado as EstadoCita)) {
    throw new ApiError(400, `Estado inválido. Valores permitidos: ${estados.join(', ')}`);
  }
  if (barberoId !== undefined && !uuidRegex.test(barberoId as string)) {
    throw new ApiError(400, 'barberoId inválido');
  }
  if (clienteId !== undefined && !uuidRegex.test(clienteId as string)) {
    throw new ApiError(400, 'clienteId inválido');
  }

  const data = await service.list({
    estado: estado as EstadoCita | undefined,
    fecha: fecha as string | undefined,
    barberoId: barberoId as string | undefined,
    clienteId: clienteId as string | undefined,
  });
  ok(res, data, 'Citas obtenidas');
});

/** GET /api/citas/:id — get a single cita. */
export const getCita = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.getById(req.params.id);
  ok(res, data, 'Cita obtenida');
});

/** POST /api/citas — create a cita. */
export const createCita = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.create(req.body);
  ok(res, data, 'Cita creada', 201);
});

/** PUT /api/citas/:id — update a cita. */
export const updateCita = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.update(req.params.id, req.body);
  ok(res, data, 'Cita actualizada');
});

/** DELETE /api/citas/:id — delete a cita. */
export const removeCita = asyncHandler(async (req: Request, res: Response) => {
  await service.remove(req.params.id);
  ok(res, null, 'Cita eliminada', 204);
});