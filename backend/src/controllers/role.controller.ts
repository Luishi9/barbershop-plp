/**
 * Role controller: HTTP entry points for the permission matrix.
 */
import type { Request, Response } from 'express';
import { RoleService } from '../services/role.service.js';
import { asyncHandler, ok } from '../utils/http.js';

const service = new RoleService();

/** GET /api/roles — list the permission matrix (any authenticated user). */
export const listRoles = asyncHandler(async (_req: Request, res: Response) => {
  const data = await service.list();
  ok(res, data, 'Permisos obtenidos');
});

/** PUT /api/roles/:rol — update modules for a role (admin only). */
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.update(req.params.rol, req.body);
  ok(res, data, 'Permisos actualizados');
});
