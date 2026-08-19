/**
 * Centralized error handler. Never exposes stack traces to the client in
 * production — only a generic message with a controlled status code.
 */
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/http.js';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      data: null,
      errors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  // Unexpected error: log it locally but hide details from the client.
  if (env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    data: null,
  });
};