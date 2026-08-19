/**
 * Barbero routes: reads for all authenticated users, writes for admins only.
 */
import { Router } from 'express';
import {
  createBarbero,
  getBarbero,
  listBarberos,
  removeBarbero,
  updateBarbero,
} from '../controllers/barbero.controller.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';

export const barberoRouter = Router();

barberoRouter.get('/', listBarberos);
barberoRouter.get('/:id', getBarbero);
barberoRouter.post('/', requireAdmin, createBarbero);
barberoRouter.put('/:id', requireAdmin, updateBarbero);
barberoRouter.delete('/:id', requireAdmin, removeBarbero);