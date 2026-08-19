/**
 * Servicio service: business rules for the `servicios` resource.
 */
import { z } from 'zod';
import type { Servicio } from '../models/index.js';
import { ServicioRepository } from '../repositories/servicio.repository.js';
import { ApiError } from '../utils/http.js';

export const servicioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  duracion: z.number().int().positive('La duración debe ser mayor a 0'),
  precio: z.number().nonnegative('El precio no puede ser negativo'),
  descripcion: z.string().optional().nullable(),
});

export class ServicioService {
  constructor(private repo = new ServicioRepository()) {}

  /** List all services. */
  async list(): Promise<Servicio[]> {
    return this.repo.findAll();
  }

  /** Get a single service or fail with 404. */
  async getById(id: string): Promise<Servicio> {
    const servicio = await this.repo.findById(id);
    if (!servicio) throw new ApiError(404, 'Servicio no encontrado');
    return servicio;
  }

  /** Create a service. */
  async create(input: unknown): Promise<Servicio> {
    const data = servicioSchema.parse(input);
    return this.repo.create(data);
  }

  /** Update a service. */
  async update(id: string, input: unknown): Promise<Servicio> {
    const data = servicioSchema.partial().parse(input);
    const updated = await this.repo.update(id, data);
    if (!updated) throw new ApiError(404, 'Servicio no encontrado');
    return updated;
  }

  /** Delete a service. */
  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.remove(id);
  }
}