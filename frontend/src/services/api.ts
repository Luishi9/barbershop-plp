/**
 * API client for the backend. Attaches the current Supabase session token as
 * `Authorization: Bearer` and unwraps the standard `{ success, message, data }`
 * envelope returned by every endpoint.
 */
import type {
  Barbero,
  CitaDetallada,
  Cliente,
  Disponibilidad,
  EstadoCita,
  ModuloKey,
  Negocio,
  NegocioUpdate,
  RolePermission,
  Servicio,
  User,
} from '@/types';
import { supabase } from './supabase';

// In dev, requests go to the relative /api (proxied by Vite). In production,
// VITE_API_URL points to the deployed backend (e.g. https://backend.vercel.app/api).
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Low-level fetch that injects the JWT and parses the API envelope. */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!res.ok) {
    throw new Error(body.message || 'Error de servidor');
  }
  return body.data;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** GET /api/auth/me — profile of the current authenticated user. */
export const getMe = (): Promise<User> => apiFetch<User>('/auth/me');

// ---------------------------------------------------------------------------
// Barberos
// ---------------------------------------------------------------------------

export interface CreateBarberoInput {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  especialidad?: string;
  disponibilidad: Disponibilidad[];
}

export type UpdateBarberoInput = Partial<Omit<CreateBarberoInput, 'password'>>;

export const getBarberos = (): Promise<Barbero[]> => apiFetch<Barbero[]>('/barberos');

export const createBarbero = (input: CreateBarberoInput): Promise<Barbero> =>
  apiFetch<Barbero>('/barberos', { method: 'POST', body: JSON.stringify(input) });

export const updateBarbero = (id: string, input: UpdateBarberoInput): Promise<Barbero> =>
  apiFetch<Barbero>(`/barberos/${id}`, { method: 'PUT', body: JSON.stringify(input) });

export const deleteBarbero = (id: string): Promise<void> =>
  apiFetch<void>(`/barberos/${id}`, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

export interface CreateClienteInput {
  nombre: string;
  telefono: string;
  email?: string;
}

export type UpdateClienteInput = Partial<CreateClienteInput>;

export const getClientes = (): Promise<Cliente[]> => apiFetch<Cliente[]>('/clientes');

export const createCliente = (input: CreateClienteInput): Promise<Cliente> =>
  apiFetch<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(input) });

export const updateCliente = (id: string, input: UpdateClienteInput): Promise<Cliente> =>
  apiFetch<Cliente>(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(input) });

export const deleteCliente = (id: string): Promise<void> =>
  apiFetch<void>(`/clientes/${id}`, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// Servicios
// ---------------------------------------------------------------------------

export interface CreateServicioInput {
  nombre: string;
  duracion: number;
  precio: number;
  descripcion?: string;
}

export type UpdateServicioInput = Partial<CreateServicioInput>;

export const getServicios = (): Promise<Servicio[]> => apiFetch<Servicio[]>('/servicios');

export const createServicio = (input: CreateServicioInput): Promise<Servicio> =>
  apiFetch<Servicio>('/servicios', { method: 'POST', body: JSON.stringify(input) });

export const updateServicio = (id: string, input: UpdateServicioInput): Promise<Servicio> =>
  apiFetch<Servicio>(`/servicios/${id}`, { method: 'PUT', body: JSON.stringify(input) });

export const deleteServicio = (id: string): Promise<void> =>
  apiFetch<void>(`/servicios/${id}`, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// Citas
// ---------------------------------------------------------------------------

export interface CreateCitaInput {
  clienteId: string;
  barberoId: string;
  servicioId: string;
  fecha: string;
  hora: string;
  notas?: string;
}

export interface UpdateCitaInput {
  estado?: EstadoCita;
  fecha?: string;
  hora?: string;
  notas?: string;
  barberoId?: string;
  servicioId?: string;
}

export type CitaFilters = {
  barberoId?: string;
  estado?: EstadoCita;
  fecha?: string;
};

export const getCitas = (filters: CitaFilters = {}): Promise<CitaDetallada[]> => {
  const params = new URLSearchParams();
  if (filters.barberoId) params.set('barberoId', filters.barberoId);
  if (filters.estado) params.set('estado', filters.estado);
  if (filters.fecha) params.set('fecha', filters.fecha);

  const query = params.toString();
  return apiFetch<CitaDetallada[]>(`/citas${query ? `?${query}` : ''}`);
};

export const createCita = (input: CreateCitaInput): Promise<CitaDetallada> =>
  apiFetch<CitaDetallada>('/citas', { method: 'POST', body: JSON.stringify(input) });

export const updateCita = (id: string, input: UpdateCitaInput): Promise<CitaDetallada> =>
  apiFetch<CitaDetallada>(`/citas/${id}`, { method: 'PUT', body: JSON.stringify(input) });

export const deleteCita = (id: string): Promise<void> =>
  apiFetch<void>(`/citas/${id}`, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// Negocio (singleton config)
// ---------------------------------------------------------------------------

/** Public read (no auth) — used by the login screen. */
export async function getNegocio(): Promise<Negocio> {
  const res = await fetch(`${BASE}/public/negocio`);
  const body = (await res.json().catch(() => ({}))) as ApiEnvelope<Negocio>;
  if (!res.ok) throw new Error(body.message || 'Error de servidor');
  return body.data;
}

export const updateNegocio = (input: NegocioUpdate): Promise<Negocio> =>
  apiFetch<Negocio>('/negocio', { method: 'PUT', body: JSON.stringify(input) });

// ---------------------------------------------------------------------------
// Roles y permisos
// ---------------------------------------------------------------------------

export const getRoles = (): Promise<RolePermission[]> => apiFetch<RolePermission[]>('/roles');

export const updateRolePermissions = (
  rol: string,
  modulos: ModuloKey[],
): Promise<RolePermission> =>
  apiFetch<RolePermission>(`/roles/${rol}`, {
    method: 'PUT',
    body: JSON.stringify({ modulos }),
  });

/**
 * Upload a logo file to Supabase Storage `logos` bucket and return its public URL.
 * Uses the admin client (current user's anon key + storage.from) but requires the
 * row-level security policy on storage.objects to permit admins.
 */
export async function uploadLogo(file: File): Promise<{ url: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const fileName = `logo-${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from('logos')
    .upload(fileName, file, { upsert: true, contentType: file.type });

  if (uploadErr) throw new Error(`Error subiendo logo: ${uploadErr.message}`);

  const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
  return { url: data.publicUrl };
}