/**
 * WhatsApp wa.me utilities — generate links to open WhatsApp with a pre-filled
 * message. 100% free, no API or backend required. Works with WhatsApp Web on
 * desktop and the WhatsApp app on mobile.
 */
import type { CitaDetallada } from '@/types';
import type { Negocio } from '@/types';

/** Strip everything except digits from a phone string. */
export function formatPhoneForWhatsApp(telefono: string): string {
  return telefono.replace(/\D/g, '');
}

/** Build a wa.me URL for the given phone + message. */
export function buildWaMeLink(phone: string, message: string): string {
  const cleaned = formatPhoneForWhatsApp(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
}

/** Open a wa.me link in a new tab. Returns true if popup opened. */
export function openWhatsApp(phone: string, message: string): boolean {
  const url = buildWaMeLink(phone, message);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  return win !== null;
}

/** Format an ISO date (YYYY-MM-DD) to a Spanish long-form string. */
function formatFecha(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type MessageKind = 'agendada' | 'confirmada' | 'cancelada' | 'recordatorio';

const SALUDO = (nombre: string) => `¡Hola ${nombre.split(' ')[0]}! 👋`;

function datosCita(cita: CitaDetallada, negocio?: Negocio | null): string {
  const nombreNegocio = negocio?.nombre ?? 'nuestra barbería';
  const fecha = formatFecha(cita.fecha);
  const barbero = cita.barbero?.nombre ?? 'nuestro equipo';
  return [
    `📅 Fecha: ${fecha}`,
    `🕐 Hora: ${cita.hora}`,
    `✂️ Servicio: ${cita.servicio.nombre}`,
    `👨‍💼 Barbero: ${barbero}`,
    ``,
    `📍 ${nombreNegocio}`,
    negocio?.direccion ? `   ${negocio.direccion}` : '',
    negocio?.telefono ? `   ${negocio.telefono}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Build the default message body for a given cita + kind, optionally branded
 * with the negocio config (name, address, phone).
 */
export function getMessageTemplate(
  cita: CitaDetallada,
  kind: MessageKind,
  negocio?: Negocio | null,
): string {
  const nombre = cita.cliente?.nombre ?? 'cliente';
  const datos = datosCita(cita, negocio);

  switch (kind) {
    case 'agendada':
      return [
        SALUDO(nombre),
        ``,
        `Tu cita ha sido agendada:`,
        ``,
        datos,
        ``,
        `¡Te esperamos! Si necesitas reagendar, contáctanos.`,
      ].join('\n');

    case 'confirmada':
      return [
        SALUDO(nombre),
        ``,
        `✅ Tu cita ha sido CONFIRMADA:`,
        ``,
        datos,
        ``,
        `¡Nos vemos!`,
      ].join('\n');

    case 'cancelada':
      return [
        SALUDO(nombre),
        ``,
        `❌ Tu cita fue cancelada.`,
        ``,
        datos,
        ``,
        `Para reagendar, contáctanos cuando quieras.`,
      ].join('\n');

    case 'recordatorio':
      return [
        SALUDO(nombre),
        ``,
        `🔔 Recordatorio de tu cita próxima:`,
        ``,
        datos,
        ``,
        `¡Te esperamos!`,
      ].join('\n');
  }
}

/** Default kind to use based on the cita's current estado. */
export function defaultKindForCita(cita: CitaDetallada): MessageKind {
  switch (cita.estado) {
    case 'confirmada':
      return 'confirmada';
    case 'cancelada':
      return 'cancelada';
    case 'completada':
      return 'recordatorio';
    default:
      return 'agendada';
  }
}
