/**
 * Cliente routes: reads for all authenticated users, writes for admins only.
 */
import { Router } from 'express';
import {
  createCliente,
  getCliente,
  listClientes,
  removeCliente,
  updateCliente,
} from '../controllers/cliente.controller.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';

export const clienteRouter = Router();

clienteRouter.get('/', listClientes);
clienteRouter.get('/:id', getCliente);
clienteRouter.post('/', requireAdmin, createCliente);
clienteRouter.put('/:id', requireAdmin, updateCliente);
clienteRouter.delete('/:id', requireAdmin, removeCliente);