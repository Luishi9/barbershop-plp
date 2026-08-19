/**
 * Servicio routes: reads for all authenticated users, writes for admins only.
 */
import { Router } from 'express';
import {
  createServicio,
  getServicio,
  listServicios,
  removeServicio,
  updateServicio,
} from '../controllers/servicio.controller.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';

export const servicioRouter = Router();

servicioRouter.get('/', listServicios);
servicioRouter.get('/:id', getServicio);
servicioRouter.post('/', requireAdmin, createServicio);
servicioRouter.put('/:id', requireAdmin, updateServicio);
servicioRouter.delete('/:id', requireAdmin, removeServicio);