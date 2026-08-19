/**
 * Servicio repository: data access for the `servicios` table.
 */
import { getSupabaseAdmin } from '../config/supabase.js';
import type { Servicio } from '../models/index.js';

export class ServicioRepository {
  private db = getSupabaseAdmin();

  /** List all services ordered by name. */
  async findAll(): Promise<Servicio[]> {
    const { data, error } = await this.db
      .from('servicios')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as Servicio[];
  }

  /** Find a single service by id. */
  async findById(id: string): Promise<Servicio | null> {
    const { data, error } = await this.db
      .from('servicios')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return (data ?? null) as Servicio | null;
  }

  /** Create a service row. */
  async create(payload: Omit<Servicio, 'id' | 'created_at'>): Promise<Servicio> {
    const { data, error } = await this.db
      .from('servicios')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Servicio;
  }

  /** Update a service row. */
  async update(id: string, payload: Partial<Servicio>): Promise<Servicio | null> {
    const { data, error } = await this.db
      .from('servicios')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return (data ?? null) as Servicio | null;
  }

  /** Delete a service row. */
  async remove(id: string): Promise<void> {
    const { error } = await this.db.from('servicios').delete().eq('id', id);
    if (error) throw error;
  }
}