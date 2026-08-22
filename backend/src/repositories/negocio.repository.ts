/**
 * Negocio repository: data access for the singleton `negocio` table.
 * The table only has one row (id=1).
 */
import { getSupabaseAdmin } from '../config/supabase.js';
import type { HorarioDia, Negocio } from '../models/index.js';

type NegocioRow = {
  id: number;
  nombre: string;
  logo_url: string | null;
  telefono: string | null;
  direccion: string | null;
  horarios: Record<string, HorarioDia>;
  updated_at: string;
};

const toDomain = (row: NegocioRow): Negocio => ({
  id: row.id,
  nombre: row.nombre,
  logoUrl: row.logo_url,
  telefono: row.telefono,
  direccion: row.direccion,
  horarios: row.horarios,
  updatedAt: row.updated_at,
});

export class NegocioRepository {
  private db = getSupabaseAdmin();

  async find(): Promise<Negocio | null> {
    const { data, error } = await this.db
      .from('negocio')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;
    return data ? toDomain(data as NegocioRow) : null;
  }

  async update(payload: {
    nombre?: string;
    logoUrl?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    horarios?: Record<string, HorarioDia>;
  }): Promise<Negocio | null> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.nombre !== undefined) update.nombre = payload.nombre;
    if (payload.logoUrl !== undefined) update.logo_url = payload.logoUrl;
    if (payload.telefono !== undefined) update.telefono = payload.telefono;
    if (payload.direccion !== undefined) update.direccion = payload.direccion;
    if (payload.horarios !== undefined) update.horarios = payload.horarios;

    const { data, error } = await this.db
      .from('negocio')
      .update(update)
      .eq('id', 1)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data ? toDomain(data as NegocioRow) : null;
  }
}
