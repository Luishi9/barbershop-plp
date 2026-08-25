/**
 * Domain models. Mirror the frontend types in src/types/index.ts so payloads
 * can be consumed directly by the React client.
 */

export type UserRole = 'admin' | 'barbero';

export type EstadoCita = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

export interface Disponibilidad {
  dia: number; // 0 = domingo, 6 = sábado
  horaInicio: string; // HH:MM
  horaFin: string; // HH:MM
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  telefono?: string | null;
  avatar?: string | null;
}

export interface Barbero extends User {
  especialidad?: string | null;
  disponibilidad: Disponibilidad[];
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email?: string | null;
}

export interface Servicio {
  id: string;
  nombre: string;
  duracion: number;
  precio: number;
  descripcion?: string | null;
}

export interface Cita {
  id: string;
  clienteId: string;
  barberoId: string;
  servicioId: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:MM
  estado: EstadoCita;
  notas?: string | null;
}

export interface CitaDetallada extends Cita {
  cliente: Cliente;
  barbero: Barbero;
  servicio: Servicio;
}

/** Navigation modules that can be enabled/disabled per role. */
export type ModuloKey = 'dashboard' | 'citas' | 'barberos' | 'servicios' | 'clientes';

export const MODULO_KEYS: ModuloKey[] = [
  'dashboard',
  'citas',
  'barberos',
  'servicios',
  'clientes',
];

/** Permission matrix: modules allowed per role. */
export interface RolePermission {
  rol: UserRole;
  modulos: ModuloKey[];
}

/** Internal request context, populated by the auth middleware. */
export interface AuthContext {
  authUserId: string;
  email: string;
  profile: User;
}

/** Horario diario del negocio (0 = domingo, 6 = sábado). */
export interface HorarioDia {
  activo: boolean;
  apertura: string; // HH:MM
  cierre: string;   // HH:MM
}

/** Configuración singleton del negocio. */
export interface Negocio {
  id: number;
  nombre: string;
  logoUrl: string | null;
  telefono: string | null;
  direccion: string | null;
  /** Código de país para normalizar teléfonos en WhatsApp (ej. '52'). */
  codigoPais?: string | null;
  horarios: Record<string, HorarioDia>;
  updatedAt: string;
}
