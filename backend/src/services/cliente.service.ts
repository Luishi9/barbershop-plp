/**
 * Cliente service: business rules for the `clientes` resource.
 */
import { z } from 'zod';
import type { Cliente } from '../models/index.js';
import { ClienteRepository } from '../repositories/cliente.repository.js';
import { ApiError } from '../utils/http.js';

export const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  telefono: z.string().min(1, 'El teléfono es obligatorio'),
  email: z.string().email('Email inválido').optional().nullable(),
});

export class ClienteService {
  constructor(private repo = new ClienteRepository()) {}

  /** List all clients. */
  async list(): Promise<Cliente[]> {
    return this.repo.findAll();
  }

  /** Get a single client or fail with 404. */
  async getById(id: string): Promise<Cliente> {
    const cliente = await this.repo.findById(id);
    if (!cliente) throw new ApiError(404, 'Cliente no encontrado');
    return cliente;
  }

  /** Create a client. */
  async create(input: unknown): Promise<Cliente> {
    const data = clienteSchema.parse(input);
    return this.repo.create(data);
  }

  /** Update a client. */
  async update(id: string, input: unknown): Promise<Cliente> {
    const data = clienteSchema.partial().parse(input);
    const updated = await this.repo.update(id, data);
    if (!updated) throw new ApiError(404, 'Cliente no encontrado');
    return updated;
  }

  /** Delete a client. */
  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.remove(id);
  }
}