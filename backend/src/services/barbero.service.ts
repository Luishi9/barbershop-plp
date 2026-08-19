/**
 * Barbero service: business rules for barber profiles. Creating a barbero also
 * provisions a Supabase Auth user so they can sign in.
 */
import { z } from 'zod';
import { getSupabaseAdmin } from '../config/supabase.js';
import type { Barbero, Disponibilidad } from '../models/index.js';
import { BarberoRepository } from '../repositories/barbero.repository.js';
import { ApiError } from '../utils/http.js';

const horaSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM');

const disponibilidadSchema: z.ZodType<Disponibilidad> = z.object({
  dia: z.number().int().min(0).max(6),
  horaInicio: horaSchema,
  horaFin: horaSchema,
});

export const barberoCreateSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  telefono: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  especialidad: z.string().optional().nullable(),
  disponibilidad: z.array(disponibilidadSchema).default([]),
});

export const barberoUpdateSchema = barberoCreateSchema.omit({ password: true }).partial();

export class BarberoService {
  constructor(
    private repo = new BarberoRepository(),
    private db = getSupabaseAdmin(),
  ) {}

  /** List all barbers. */
  async list(): Promise<Barbero[]> {
    return this.repo.findAll();
  }

  /** Get a single barber or fail with 404. */
  async getById(id: string): Promise<Barbero> {
    const barbero = await this.repo.findById(id);
    if (!barbero) throw new ApiError(404, 'Barbero no encontrado');
    return barbero;
  }

  /** Create a barber: provisions the Auth user first, then the profile row. */
  async create(input: unknown): Promise<Barbero> {
    const data = barberoCreateSchema.parse(input);

    const { data: createdUser, error: authError } = await this.db.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { nombre: data.nombre, rol: 'barbero' },
    });

    if (authError || !createdUser.user) {
      throw new ApiError(400, authError?.message ?? 'No se pudo crear el usuario');
    }

    return this.repo.create({
      id: createdUser.user.id,
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono ?? null,
      avatar: data.avatar ?? null,
      especialidad: data.especialidad ?? null,
      disponibilidad: data.disponibilidad,
    });
  }

  /** Update a barber profile. */
  async update(id: string, input: unknown): Promise<Barbero> {
    const data = barberoUpdateSchema.parse(input);
    const updated = await this.repo.update(id, data);
    if (!updated) throw new ApiError(404, 'Barbero no encontrado');
    return updated;
  }

  /** Delete a barber: removes the Auth user (profile row cascades via FK). */
  async remove(id: string): Promise<void> {
    const barbero = await this.repo.findById(id);
    if (!barbero) throw new ApiError(404, 'Barbero no encontrado');

    const { error } = await this.db.auth.admin.deleteUser(id);
    if (error) throw new ApiError(400, error.message);
  }
}