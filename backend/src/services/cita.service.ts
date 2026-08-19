/**
 * Cita service: business rules for appointments. Validates that the related
 * records exist and that no conflict overlaps the requested slot.
 */
import { z } from 'zod';
import type { Cita, CitaDetallada, EstadoCita } from '../models/index.js';
import { BarberoRepository } from '../repositories/barbero.repository.js';
import { CitaRepository } from '../repositories/cita.repository.js';
import { ClienteRepository } from '../repositories/cliente.repository.js';
import { ServicioRepository } from '../repositories/servicio.repository.js';
import { ApiError } from '../utils/http.js';

const horaSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM');
const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD');

const estados = ['pendiente', 'confirmada', 'completada', 'cancelada'] as const;

export const citaSchema = z.object({
  clienteId: z.string().uuid('clienteId inválido'),
  barberoId: z.string().uuid('barberoId inválido'),
  servicioId: z.string().uuid('servicioId inválido'),
  fecha: fechaSchema,
  hora: horaSchema,
  notas: z.string().optional().nullable(),
});

export const citaUpdateSchema = z.object({
  estado: z.enum(estados).optional(),
  fecha: fechaSchema.optional(),
  hora: horaSchema.optional(),
  notas: z.string().optional().nullable(),
  barberoId: z.string().uuid('barberoId inválido').optional(),
  servicioId: z.string().uuid('servicioId inválido').optional(),
});

type CreateInput = z.infer<typeof citaSchema>;

export class CitaService {
  constructor(
    private repo = new CitaRepository(),
    private clienteRepo = new ClienteRepository(),
    private barberoRepo = new BarberoRepository(),
    private servicioRepo = new ServicioRepository(),
  ) {}

  /** List citas applying optional filters. */
  async list(filters: { clienteId?: string; barberoId?: string; estado?: EstadoCita; fecha?: string } = {}): Promise<CitaDetallada[]> {
    return this.repo.findAll(filters);
  }

  /** Get a single cita or fail with 404. */
  async getById(id: string): Promise<CitaDetallada> {
    const cita = await this.repo.findById(id);
    if (!cita) throw new ApiError(404, 'Cita no encontrada');
    return cita;
  }

  /** Create a cita after validating references and checking availability. */
  async create(input: unknown): Promise<CitaDetallada> {
    const data = citaSchema.parse(input);
    await this.assertRelationsExist(data);

    const conflict = await this.findConflict(data.barberoId, data.fecha, data.hora);
    if (conflict) {
      throw new ApiError(409, 'El barbero ya tiene una cita en ese horario');
    }

    return this.repo.create(data);
  }

  /** Update a cita (estado, fecha, hora, notas, barbero/servicio). */
  async update(id: string, input: unknown): Promise<CitaDetallada> {
    const data = citaUpdateSchema.parse(input);
    const existing = await this.repo.findById(id);
    if (!existing) throw new ApiError(404, 'Cita no encontrada');

    const barberoId = data.barberoId ?? existing.barberoId;
    const fecha = data.fecha ?? existing.fecha;
    const hora = data.hora ?? existing.hora;

    // When the slot changes, check for conflicts (excluding this cita).
    if (data.fecha || data.hora || data.barberoId) {
      const conflict = await this.findConflict(barberoId, fecha, hora, id);
      if (conflict) {
        throw new ApiError(409, 'El barbero ya tiene una cita en ese horario');
      }
    }

    const updated = await this.repo.update(id, data);
    if (!updated) throw new ApiError(404, 'Cita no encontrada');
    return updated;
  }

  /** Delete a cita. */
  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.remove(id);
  }

  /** Ensure cliente, barbero and servicio exist before creating. */
  private async assertRelationsExist(data: CreateInput): Promise<void> {
    const [cliente, barbero, servicio] = await Promise.all([
      this.clienteRepo.findById(data.clienteId),
      this.barberoRepo.findById(data.barberoId),
      this.servicioRepo.findById(data.servicioId),
    ]);
    if (!cliente) throw new ApiError(400, 'El cliente no existe');
    if (!barbero) throw new ApiError(400, 'El barbero no existe');
    if (!servicio) throw new ApiError(400, 'El servicio no existe');
  }

  /** Search for an overlapping cita for a barbero on a date+time slot. */
  private async findConflict(
    barberoId: string,
    fecha: string,
    hora: string,
    excludeId?: string,
  ): Promise<boolean> {
    const matches = await this.repo.findAll({ barberoId, fecha, hora });
    if (!excludeId) return matches.length > 0;
    return matches.some((cita: Cita) => cita.id !== excludeId);
  }
}