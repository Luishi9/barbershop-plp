/**
 * Route definitions for the /api prefix.
 * All routes require authentication; write operations on resources are
 * restricted to admins at the individual router level.
 */
import { Router } from 'express';
import { getMe } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getNegocio } from '../controllers/negocio.controller.js';
import { barberoRouter } from './barbero.routes.js';
import { citaRouter } from './cita.routes.js';
import { clienteRouter } from './cliente.routes.js';
import { negocioRouter } from './negocio.routes.js';
import { roleRouter } from './role.routes.js';
import { servicioRouter } from './servicio.routes.js';

export const apiRouter = Router();

// Public endpoints (no auth required) — used by the login screen.
apiRouter.get('/public/negocio', getNegocio);

apiRouter.use(requireAuth);

apiRouter.get('/auth/me', getMe);

apiRouter.use('/barberos', barberoRouter);
apiRouter.use('/clientes', clienteRouter);
apiRouter.use('/servicios', servicioRouter);
apiRouter.use('/citas', citaRouter);
apiRouter.use('/negocio', negocioRouter);
apiRouter.use('/roles', roleRouter);