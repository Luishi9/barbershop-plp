/**
 * Role repository: data access for the `role_permissions` matrix.
 */
import { getSupabaseAdmin } from '../config/supabase.js';
import type { ModuloKey, RolePermission, UserRole } from '../models/index.js';

type RoleRow = {
  rol: string;
  modulos: ModuloKey[];
};

const toDomain = (row: RoleRow): RolePermission => ({
  rol: row.rol as UserRole,
  modulos: row.modulos ?? [],
});

export class RoleRepository {
  private db = getSupabaseAdmin();

  async findAll(): Promise<RolePermission[]> {
    const { data, error } = await this.db
      .from('role_permissions')
      .select('rol, modulos')
      .order('rol', { ascending: false }); // admin primero

    if (error) throw error;
    return ((data ?? []) as RoleRow[]).map(toDomain);
  }

  async upsert(rol: UserRole, modulos: ModuloKey[]): Promise<RolePermission> {
    const { data, error } = await this.db
      .from('role_permissions')
      .upsert({ rol, modulos })
      .select('rol, modulos')
      .single();

    if (error) throw error;
    return toDomain(data as RoleRow);
  }
}
