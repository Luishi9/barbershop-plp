/**
 * Negocio service: business rules for the singleton business config.
 */
import { z } from 'zod';
import type { Negocio } from '../models/index.js';
import { NegocioRepository } from '../repositories/negocio.repository.js';
import { ApiError } from '../utils/http.js';

const horaSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM');

const horarioDiaSchema = z.object({
  activo: z.boolean(),
  apertura: horaSchema,
  cierre: horaSchema,
});

const horariosSchema = z.record(z.string(), horarioDiaSchema).refine(
  (horarios) => {
    return Object.entries(horarios).every(([_, h]) => h.apertura < h.cierre);
  },
  { message: 'La hora de apertura debe ser menor que la de cierre' },
);

export const negocioUpdateSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  logoUrl: z.string().url().nullable().optional(),
  telefono: z.string().max(50).nullable().optional(),
  direccion: z.string().max(200).nullable().optional(),
  codigoPais: z
    .string()
    .regex(/^\d{1,4}$/, 'Solo dígitos, entre 1 y 4')
    .nullable()
    .optional(),
  horarios: horariosSchema.optional(),
});

export class NegocioService {
  constructor(private repo = new NegocioRepository()) {}

  /** Get the singleton business config. Creates default if missing. */
  async get(): Promise<Negocio> {
    const existing = await this.repo.find();
    if (existing) return existing;
    throw new ApiError(404, 'Configuración de negocio no encontrada');
  }

  /** Update business config. */
  async update(input: unknown): Promise<Negocio> {
    const data = negocioUpdateSchema.parse(input);
    const updated = await this.repo.update(data);
    if (!updated) {
      throw new ApiError(500, 'No se pudo actualizar la configuración');
    }
    return updated;
  }
}
