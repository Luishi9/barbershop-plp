/**
 * Role service: validation and rules for the permission matrix.
 */
import { z } from 'zod';
import { MODULO_KEYS } from '../models/index.js';
import type { ModuloKey, RolePermission, UserRole } from '../models/index.js';
import { RoleRepository } from '../repositories/role.repository.js';

const modulosSchema = z
  .array(z.enum(MODULO_KEYS as [ModuloKey, ...ModuloKey[]]))
  .min(1, 'Cada rol debe conservar al menos un módulo');

const rolSchema = z.enum(['admin', 'barbero']);

export const roleUpdateSchema = z.object({ modulos: modulosSchema });

export class RoleService {
  constructor(private repo = new RoleRepository()) {}

  /** List the full permission matrix. */
  async list(): Promise<RolePermission[]> {
    return this.repo.findAll();
  }

  /** Update allowed modules for one role. */
  async update(rol: string, input: unknown): Promise<RolePermission> {
    const rolValido = rolSchema.parse(rol) as UserRole;
    const data = roleUpdateSchema.parse(input);
    return this.repo.upsert(rolValido, data.modulos);
  }
}
