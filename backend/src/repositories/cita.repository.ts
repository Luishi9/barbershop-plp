/**
 * Cita repository: data access for the `citas` table, joining the related
 * cliente, barbero (profile) and servicio rows and mapping to domain objects.
 */
import { getSupabaseAdmin } from '../config/supabase.js';
import type { Cita, CitaDetallada, UserRole } from '../models/index.js';

type CitaFilters = {
  clienteId?: string;
  barberoId?: string;
  estado?: Cita['estado'];
  fecha?: string;
  hora?: string;
};

const SELECT = `
  *,
  cliente:clientes(id, nombre, telefono, email),
  barbero:profiles(id, nombre, email, rol, telefono, avatar, especialidad, disponibilidad),
  servicio:servicios(id, nombre, duracion, precio, descripcion)
`;

type CitaRow = {
  id: string;
  cliente_id: string;
  barbero_id: string;
  servicio_id: string;
  fecha: string;
  hora: string;
  estado: Cita['estado'];
  notas: string | null;
  created_at: string;
  cliente: { id: string; nombre: string; telefono: string; email: string | null };
  barbero: {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    telefono: string | null;
    avatar: string | null;
    especialidad: string | null;
    disponibilidad: CitaDetallada['barbero']['disponibilidad'];
  };
  servicio: {
    id: string;
    nombre: string;
    duracion: number;
    precio: number;
    descripcion: string | null;
  };
};

/** Convert a joined DB row into the camelCase domain shape. */
const toDomain = (row: CitaRow): CitaDetallada => ({
  id: row.id,
  clienteId: row.cliente_id,
  barberoId: row.barbero_id,
  servicioId: row.servicio_id,
  fecha: row.fecha,
  hora: row.hora,
  estado: row.estado,
  notas: row.notas,
  cliente: { ...row.cliente },
  barbero: { ...row.barbero },
  servicio: { ...row.servicio },
});

export class CitaRepository {
  private db = getSupabaseAdmin();

  /** List citas with optional filters, newest first. */
  async findAll(filters: CitaFilters = {}): Promise<CitaDetallada[]> {
    let query = this.db.from('citas').select(SELECT).order('fecha', { ascending: false });

    if (filters.clienteId) query = query.eq('cliente_id', filters.clienteId);
    if (filters.barberoId) query = query.eq('barbero_id', filters.barberoId);
    if (filters.estado) query = query.eq('estado', filters.estado);
    if (filters.fecha) query = query.eq('fecha', filters.fecha);
    if (filters.hora) query = query.eq('hora', filters.hora);

    const { data, error } = await query;
    if (error) throw error;
    return ((data ?? []) as unknown as CitaRow[]).map(toDomain);
  }

  /** Find a single cita by id with its relations. */
  async findById(id: string): Promise<CitaDetallada | null> {
    const { data, error } = await this.db
      .from('citas')
      .select(SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return toDomain(data as unknown as CitaRow);
  }

  /** Create a cita row. */
  async create(
    payload: Pick<Cita, 'clienteId' | 'barberoId' | 'servicioId' | 'fecha' | 'hora' | 'notas'>,
  ): Promise<CitaDetallada> {
    const { data, error } = await this.db
      .from('citas')
      .insert({
        cliente_id: payload.clienteId,
        barbero_id: payload.barberoId,
        servicio_id: payload.servicioId,
        fecha: payload.fecha,
        hora: payload.hora,
        notas: payload.notas ?? null,
        estado: 'pendiente',
      })
      .select(SELECT)
      .single();

    if (error) throw error;
    return toDomain(data as unknown as CitaRow);
  }

  /** Update a cita row (any mutable field). */
  async update(
    id: string,
    payload: Partial<Pick<Cita, 'estado' | 'fecha' | 'hora' | 'notas' | 'barberoId' | 'servicioId'>>,
  ): Promise<CitaDetallada | null> {
    const { data, error } = await this.db
      .from('citas')
      .update({
        estado: payload.estado,
        fecha: payload.fecha,
        hora: payload.hora,
        notas: payload.notas ?? null,
        barbero_id: payload.barberoId,
        servicio_id: payload.servicioId,
      })
      .eq('id', id)
      .select(SELECT)
      .single();

    if (error) throw error;
    if (!data) return null;
    return toDomain(data as unknown as CitaRow);
  }

  /** Delete a cita row. */
  async remove(id: string): Promise<void> {
    const { error } = await this.db.from('citas').delete().eq('id', id);
    if (error) throw error;
  }
}