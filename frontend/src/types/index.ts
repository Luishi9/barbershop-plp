export type UserRole = 'admin' | 'barbero';

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
  duracion: number; // en minutos
  precio: number;
  descripcion?: string | null;
}

export type EstadoCita = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

export interface Cita {
  id: string;
  clienteId: string;
  barberoId: string;
  servicioId: string;
  fecha: string; // ISO date string
  hora: string; // HH:MM format
  estado: EstadoCita;
  notas?: string | null;
}

export interface Disponibilidad {
  dia: number; // 0 = domingo, 6 = sábado
  horaInicio: string; // HH:MM
  horaFin: string; // HH:MM
}

export interface CitaDetallada extends Cita {
  cliente: Cliente;
  barbero: Barbero;
  servicio: Servicio;
}

export interface HorarioDia {
  activo: boolean;
  apertura: string; // HH:MM
  cierre: string;   // HH:MM
}

export interface Negocio {
  id: number;
  nombre: string;
  logoUrl: string | null;
  telefono: string | null;
  direccion: string | null;
  horarios: Record<string, HorarioDia>; // keys: "0".."6"
  updatedAt: string;
}

export type NegocioUpdate = {
  nombre?: string;
  logoUrl?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  horarios?: Record<string, HorarioDia>;
};
