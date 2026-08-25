/**
 * Barber appointments section — full list with an internal segmented filter
 * (Hoy / Próximas / Pendientes) and the "Nueva Cita" dialog.
 */
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { User, CitaDetallada, EstadoCita } from '@/types';
import { getCitas, updateCita } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { AppointmentCard } from '@/app/components/AppointmentCard';
import { NewAppointmentDialog } from '@/app/components/admin/NewAppointmentDialog';

type FilterKey = 'hoy' | 'proximas' | 'pendientes';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'hoy', label: 'Hoy' },
  { key: 'proximas', label: 'Próximas' },
  { key: 'pendientes', label: 'Pendientes' },
];

interface BarberCitasProps {
  user: User;
}

export const BarberCitas: React.FC<BarberCitasProps> = ({ user }) => {
  const [citas, setCitas] = useState<CitaDetallada[]>([]);
  const [filter, setFilter] = useState<FilterKey>('hoy');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setCitas(await getCitas({ barberoId: user.id }));
  };

  const handleStatusChange = async (id: string, estado: EstadoCita) => {
    await updateCita(id, { estado });
    await loadData();
  };

  const hoyStr = new Date().toISOString().split('T')[0];

  const citasHoy = citas
    .filter((c) => c.fecha === hoyStr && c.estado !== 'cancelada')
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const citasPendientes = citas
    .filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada')
    .sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`));

  const citasProximas = citas
    .filter((c) => {
      const fechaCita = new Date(c.fecha);
      const desde = new Date();
      desde.setHours(0, 0, 0, 0);
      const enUnaSemana = new Date();
      enUnaSemana.setDate(enUnaSemana.getDate() + 7);
      return fechaCita >= desde && fechaCita <= enUnaSemana && c.estado !== 'cancelada';
    })
    .sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`));

  const visible =
    filter === 'hoy' ? citasHoy : filter === 'proximas' ? citasProximas : citasPendientes;

  const emptyMessages: Record<FilterKey, string> = {
    hoy: 'No tienes citas programadas para hoy',
    proximas: 'No tienes citas próximas',
    pendientes: 'No tienes citas pendientes',
  };

  return (
    <>
      {/* Toolbar: segmented filter + nueva cita */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="inline-flex w-fit max-w-full overflow-x-auto rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                filter === key
                  ? 'bg-gradient-to-r from-brand to-brand-hover text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand-hover shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white capitalize">
            {FILTERS.find((f) => f.key === filter)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visible.length > 0 ? (
              visible.map((cita) => (
                <AppointmentCard
                  key={cita.id}
                  cita={cita}
                  showBarber={false}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{emptyMessages[filter]}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <NewAppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadData}
        defaultBarberoId={user.id}
      />
    </>
  );
};
