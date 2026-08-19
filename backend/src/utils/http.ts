/**
 * HTTP helpers: ApiError, asyncHandler and a JSON success responder.
 */
import type { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

/**
 * Wraps async route handlers so rejected promises are forwarded to the
 * centralized error middleware instead of crashing the process.
 */
export const asyncHandler =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/** Standard success envelope used across every endpoint. */
export const ok = <T>(res: Response, data: T, message = 'Success', status = 200) => {
  res.status(status).json({ success: true, message, data });
};