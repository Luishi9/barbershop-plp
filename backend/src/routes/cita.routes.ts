/**
 * Cita routes: all authenticated users can manage appointments.
 */
import { Router } from 'express';
import {
  createCita,
  getCita,
  listCitas,
  removeCita,
  updateCita,
} from '../controllers/cita.controller.js';

export const citaRouter = Router();

citaRouter.get('/', listCitas);
citaRouter.get('/:id', getCita);
citaRouter.post('/', createCita);
citaRouter.put('/:id', updateCita);
citaRouter.delete('/:id', removeCita);