/**
 * Seed script for Supabase.
 *
 * Creates the demo auth users, profiles, clientes, servicios and citas
 * based on the frontend mock data (src/data/mockData.ts).
 *
 * Idempotent: safe to run multiple times — it skips items that already exist.
 *
 * Requirements (environment variables):
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE_KEY
 *  - DEMO_PASSWORD (optional, defaults to "Barberia2026!")
 *
 * Run with:  npm run seed
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Demo data (mirrors src/data/mockData.ts)
// ---------------------------------------------------------------------------

interface DemoUsuario { id: string; nombre: string; email: string; rol: 'admin' | 'barbero'; telefono?: string; }
interface DemoBarbero extends DemoUsuario { especialidad?: string; disponibilidad: { dia: number; horaInicio: string; horaFin: string }[]; }
interface DemoCliente { id: string; nombre: string; telefono: string; email?: string; }
interface DemoServicio { id: string; nombre: string; duracion: number; precio: number; descripcion?: string; }
interface DemoCita {
  id: string;
  clienteId: string;
  barberoId: string;
  servicioId: string;
  fecha: string; // ISO date
  hora: string;  // HH:MM
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  notas?: string;
}

const USUARIOS: DemoUsuario[] = [
  { id: 'admin-1',   nombre: 'Carlos Administrador', email: 'admin@barberia.com',  rol: 'admin',   telefono: '+1234567890' },
  { id: 'barbero-1', nombre: 'Miguel Cortez',        email: 'miguel@barberia.com',  rol: 'barbero', telefono: '+1234567891' },
  { id: 'barbero-2', nombre: 'Juan Estilos',        email: 'juan@barberia.com',    rol: 'barbero', telefono: '+1234567892' },
];

const BARBEROS: DemoBarbero[] = [
  {
    id: 'barbero-1', nombre: 'Miguel Cortez', email: 'miguel@barberia.com', rol: 'barbero', telefono: '+1234567891',
    especialidad: 'Cortes clásicos y fade',
    disponibilidad: [
      { dia: 1, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 2, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 3, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 4, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 5, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 6, horaInicio: '10:00', horaFin: '16:00' },
    ],
  },
  {
    id: 'barbero-2', nombre: 'Juan Estilos', email: 'juan@barberia.com', rol: 'barbero', telefono: '+1234567892',
    especialidad: 'Diseño y colorimetría',
    disponibilidad: [
      { dia: 1, horaInicio: '10:00', horaFin: '19:00' },
      { dia: 2, horaInicio: '10:00', horaFin: '19:00' },
      { dia: 3, horaInicio: '10:00', horaFin: '19:00' },
      { dia: 5, horaInicio: '10:00', horaFin: '19:00' },
      { dia: 6, horaInicio: '10:00', horaFin: '17:00' },
    ],
  },
];

const CLIENTES: DemoCliente[] = [
  { id: 'cliente-1', nombre: 'Roberto García',  telefono: '+1234560001', email: 'roberto@email.com' },
  { id: 'cliente-2', nombre: 'Luis Martínez',  telefono: '+1234560002', email: 'luis@email.com' },
  { id: 'cliente-3', nombre: 'Pedro Sánchez',   telefono: '+1234560003', email: 'pedro@email.com' },
  { id: 'cliente-4', nombre: 'Diego López',      telefono: '+1234560004', email: 'diego@email.com' },
  { id: 'cliente-5', nombre: 'Fernando Torres',  telefono: '+1234560005', email: 'fernando@email.com' },
];

const SERVICIOS: DemoServicio[] = [
  { id: 'serv-1', nombre: 'Corte Clásico',    duracion: 30, precio: 15, descripcion: 'Corte tradicional con tijera y máquina' },
  { id: 'serv-2', nombre: 'Fade Moderno',      duracion: 45, precio: 25, descripcion: 'Degradado profesional con diseño' },
  { id: 'serv-3', nombre: 'Barba',             duracion: 20, precio: 10, descripcion: 'Perfilado y arreglo de barba' },
  { id: 'serv-4', nombre: 'Corte + Barba',     duracion: 50, precio: 30, descripcion: 'Servicio completo' },
  { id: 'serv-5', nombre: 'Diseño Especial',   duracion: 60, precio: 35, descripcion: 'Diseños personalizados y detalles' },
  { id: 'serv-6', nombre: 'Afeitado Clásico',  duracion: 30, precio: 20, descripcion: 'Afeitado tradicional con navaja' },
];

/** Builds the demo citas with dates relative to today (mirrors generarCitasEjemplo). */
function citas(): DemoCita[] {
  const hoy = new Date();
  const iso = (d: Date) => d.toISOString().split('T')[0];
  const manana = new Date(hoy);       manana.setDate(hoy.getDate() + 1);
  const pasadoManana = new Date(hoy); pasadoManana.setDate(hoy.getDate() + 2);
  const ayer = new Date(hoy);         ayer.setDate(hoy.getDate() - 1);

  return [
    { id: 'cita-1', clienteId: 'cliente-1', barberoId: 'barbero-1', servicioId: 'serv-2', fecha: iso(hoy),          hora: '10:00', estado: 'confirmada', notas: 'Cliente prefiere fade bajo' },
    { id: 'cita-2', clienteId: 'cliente-2', barberoId: 'barbero-2', servicioId: 'serv-4', fecha: iso(hoy),          hora: '11:00', estado: 'confirmada' },
    { id: 'cita-3', clienteId: 'cliente-3', barberoId: 'barbero-1', servicioId: 'serv-1', fecha: iso(hoy),          hora: '14:00', estado: 'pendiente' },
    { id: 'cita-4', clienteId: 'cliente-4', barberoId: 'barbero-1', servicioId: 'serv-4', fecha: iso(manana),      hora: '09:00', estado: 'pendiente' },
    { id: 'cita-5', clienteId: 'cliente-5', barberoId: 'barbero-2', servicioId: 'serv-5', fecha: iso(manana),      hora: '15:00', estado: 'confirmada' },
    { id: 'cita-6', clienteId: 'cliente-1', barberoId: 'barbero-2', servicioId: 'serv-1', fecha: iso(ayer),        hora: '16:00', estado: 'completada' },
    { id: 'cita-7', clienteId: 'cliente-2', barberoId: 'barbero-1', servicioId: 'serv-3', fecha: iso(pasadoManana),hora: '12:00', estado: 'pendiente' },
  ];
}

// ---------------------------------------------------------------------------
// Supabase admin client
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Barberia2026!';

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Faltan variables de entorno: SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY');
  console.error('Crea un archivo backend/.env con esos valores (ver .env.example).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const log = (msg: string) => console.log(`[seed] ${msg}`);
const warn = (msg: string) => console.warn(`[seed] ${msg}`);

async function findProfileByEmail(email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (error) throw new Error(`No se pudo buscar perfil ${email}: ${error.message}`);
  return data;
}

async function findAuthUserByEmail(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw new Error(`No se pudo listar usuarios Auth: ${error.message}`);
  return data.users.find((u) => u.email === email) ?? null;
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

interface ProfileRow { id: string; nombre: string; email: string; rol: string; telefono: string | null; avatar: string | null; especialidad: string | null; disponibilidad: unknown; }
interface Row { id: string; }

async function seedProfiles(): Promise<Record<string, string>> {
  const mockIdToUuid: Record<string, string> = {};

  for (const u of USUARIOS) {
    let profile = await findProfileByEmail(u.email);

    if (!profile) {
      let userId = (await findAuthUserByEmail(u.email))?.id;

      if (!userId) {
        log(`Creando usuario Auth: ${u.email}`);
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
          email: u.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
        });
        if (authErr) throw new Error(`No se pudo crear usuario Auth ${u.email}: ${authErr.message}`);
        userId = authUser.user?.id as string;
      } else {
        log(`Usuario Auth ya existe: ${u.email} — reutilizando (perfil pendiente)`);
      }

      const barberoData = BARBEROS.find((b) => b.id === u.id);
      const { error: profileErr } = await supabase.from('profiles').insert({
        id: userId,
        nombre: u.nombre,
        email: u.email,
        rol: u.rol,
        telefono: u.telefono ?? null,
        avatar: null,
        especialidad: barberoData?.especialidad ?? null,
        disponibilidad: barberoData?.disponibilidad ?? [],
      });
      if (profileErr) throw new Error(`No se pudo insertar perfil ${u.email}: ${profileErr.message}`);

      mockIdToUuid[u.id] = userId as string;
      log(`  + perfil creado (${u.rol})`);
    } else {
      mockIdToUuid[u.id] = profile.id;
      log(`Perfil ya existe: ${u.email}`);
    }
  }

  return mockIdToUuid;
}

async function seedClientes(): Promise<Record<string, string>> {
  const mockIdToUuid: Record<string, string> = {};
  const { data: existing } = await supabase.from('clientes').select('id, nombre, telefono, email');

  for (const c of CLIENTES) {
    const match = existing?.find((row: Row & { nombre?: string; telefono?: string; email?: string | null }) =>
      row.nombre === c.nombre && row.telefono === c.telefono
    );

    if (match) {
      mockIdToUuid[c.id] = match.id;
      log(`Cliente ya existe: ${c.nombre}`);
      continue;
    }

    const { data, error } = await supabase.from('clientes').insert({
      nombre: c.nombre, telefono: c.telefono, email: c.email ?? null,
    }).select().single();
    if (error) throw new Error(`No se pudo insertar cliente ${c.nombre}: ${error.message}`);

    mockIdToUuid[c.id] = data.id;
    log(`  + cliente: ${c.nombre}`);
  }
  return mockIdToUuid;
}

async function seedServicios(): Promise<Record<string, string>> {
  const mockIdToUuid: Record<string, string> = {};
  const { data: existing } = await supabase.from('servicios').select('id, nombre');

  for (const s of SERVICIOS) {
    const match = existing?.find((row: Row & { nombre?: string }) => row.nombre === s.nombre);

    if (match) {
      mockIdToUuid[s.id] = match.id;
      log(`Servicio ya existe: ${s.nombre}`);
      continue;
    }

    const { data, error } = await supabase.from('servicios').insert({
      nombre: s.nombre, duracion: s.duracion, precio: s.precio, descripcion: s.descripcion ?? null,
    }).select().single();
    if (error) throw new Error(`No se pudo insertar servicio ${s.nombre}: ${error.message}`);

    mockIdToUuid[s.id] = data.id;
    log(`  + servicio: ${s.nombre}`);
  }
  return mockIdToUuid;
}

async function seedCitas(
  usuarioMap: Record<string, string>,
  clienteMap: Record<string, string>,
  servicioMap: Record<string, string>,
): Promise<void> {
  const { count } = await supabase.from('citas').select('*', { count: 'exact', head: true });
  if (count && count > 0) {
    log(`Ya existen ${count} citas — omitiendo seed de citas.`);
    return;
  }

  const rows = citas().map((c) => ({
    cliente_id: clienteMap[c.clienteId],
    barbero_id: usuarioMap[c.barberoId],
    servicio_id: servicioMap[c.servicioId],
    fecha: c.fecha,
    hora: c.hora,
    estado: c.estado,
    notas: c.notas ?? null,
  }));

  const { error } = await supabase.from('citas').insert(rows);
  if (error) throw new Error(`No se pudieron insertar citas: ${error.message}`);

  log(`  + ${rows.length} citas insertadas`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log('Iniciando seed…');
  const usuarioMap = await seedProfiles();
  const clienteMap = await seedClientes();
  const servicioMap = await seedServicios();
  await seedCitas(usuarioMap, clienteMap, servicioMap);
  log('Seed completado.');
  log('Contraseña demo de todos los usuarios: ' + DEMO_PASSWORD);
}

main().catch((err) => {
  console.error('[seed] Error fatal:', err);
  process.exit(1);
});
