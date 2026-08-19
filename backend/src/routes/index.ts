/**
 * Route definitions for the /api prefix.
 * All routes require authentication; write operations on resources are
 * restricted to admins at the individual router level.
 */
import { Router } from 'express';
import { getMe } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { barberoRouter } from './barbero.routes.js';
import { citaRouter } from './cita.routes.js';
import { clienteRouter } from './cliente.routes.js';
import { servicioRouter } from './servicio.routes.js';

export const apiRouter = Router();

apiRouter.use(requireAuth);

apiRouter.get('/auth/me', getMe);

apiRouter.use('/barberos', barberoRouter);
apiRouter.use('/clientes', clienteRouter);
apiRouter.use('/servicios', servicioRouter);
apiRouter.use('/citas', citaRouter);