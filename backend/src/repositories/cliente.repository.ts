/**
 * Cliente repository: data access for the `clientes` table.
 */
import { getSupabaseAdmin } from '../config/supabase.js';
import type { Cliente } from '../models/index.js';

export class ClienteRepository {
  private db = getSupabaseAdmin();

  /** List all clients ordered by name. */
  async findAll(): Promise<Cliente[]> {
    const { data, error } = await this.db
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as Cliente[];
  }

  /** Find a single client by id. */
  async findById(id: string): Promise<Cliente | null> {
    const { data, error } = await this.db
      .from('clientes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return (data ?? null) as Cliente | null;
  }

  /** Create a client row. */
  async create(payload: Omit<Cliente, 'id' | 'created_at'>): Promise<Cliente> {
    const { data, error } = await this.db
      .from('clientes')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Cliente;
  }

  /** Update a client row. */
  async update(id: string, payload: Partial<Cliente>): Promise<Cliente | null> {
    const { data, error } = await this.db
      .from('clientes')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return (data ?? null) as Cliente | null;
  }

  /** Delete a client row. */
  async remove(id: string): Promise<void> {
    const { error } = await this.db.from('clientes').delete().eq('id', id);
    if (error) throw error;
  }
}