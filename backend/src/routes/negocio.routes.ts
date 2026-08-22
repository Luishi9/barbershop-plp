/**
 * Negocio routes: read for all authenticated users, write for admins.
 */
import { Router } from 'express';
import { getNegocio, updateNegocio } from '../controllers/negocio.controller.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';

export const negocioRouter = Router();

negocioRouter.get('/', getNegocio);
negocioRouter.put('/', requireAdmin, updateNegocio);
