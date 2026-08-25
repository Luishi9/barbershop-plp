/**
 * Role routes: read for all authenticated users, write for admins.
 */
import { Router } from 'express';
import { listRoles, updateRole } from '../controllers/role.controller.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';

export const roleRouter = Router();

roleRouter.get('/', listRoles);
roleRouter.put('/:rol', requireAdmin, updateRole);
