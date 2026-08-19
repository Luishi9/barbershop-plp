/**
 * Barbero repository: data access for barber profiles.
 * Barbers are rows in the `profiles` table with rol = 'barbero'.
 */
import { getSupabaseAdmin } from '../config/supabase.js';
import type { Barbero } from '../models/index.js';

export class BarberoRepository {
  private db = getSupabaseAdmin();

  /** List all barbers ordered by name. */
  async findAll(): Promise<Barbero[]> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('rol', 'barbero')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as Barbero[];
  }

  /** Find a single barber by profile id. */
  async findById(id: string): Promise<Barbero | null> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('rol', 'barbero')
      .maybeSingle();

    if (error) throw error;
    return (data ?? null) as Barbero | null;
  }

  /** Create a barber profile row (id matches the provisioned auth user). */
  async create(payload: Omit<Barbero, 'created_at' | 'rol'>): Promise<Barbero> {
    const { data, error } = await this.db
      .from('profiles')
      .insert({ ...payload, rol: 'barbero' })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Barbero;
  }

  /** Update a barber profile row. */
  async update(id: string, payload: Partial<Barbero>): Promise<Barbero | null> {
    const { data, error } = await this.db
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .eq('rol', 'barbero')
      .select()
      .single();

    if (error) throw error;
    return (data ?? null) as Barbero | null;
  }

  /** Delete a barber profile row. */
  async remove(id: string): Promise<void> {
    const { error } = await this.db
      .from('profiles')
      .delete()
      .eq('id', id)
      .eq('rol', 'barbero');

    if (error) throw error;
  }
}