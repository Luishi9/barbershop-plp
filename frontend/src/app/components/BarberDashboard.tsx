/**
 * Barber overview section — daily stats + today's appointments list.
 * Full appointment management lives in BarberCitas (separate shell section).
 */
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, User as UserIcon } from 'lucide-react';
import { User, CitaDetallada, EstadoCita } from '@/types';
import { getCitas, updateCita } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { AppointmentCard } from '@/app/components/AppointmentCard';

interface BarberDashboardProps {
  user: User;
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({ user }) => {
  const [citas, setCitas] = useState<CitaDetallada[]>([]);
  const [stats, setStats] = useState({ hoy: 0, pendientes: 0, completadas: 0 });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    const misCitas = await getCitas({ barberoId: user.id });
    setCitas(misCitas);

    const hoy = new Date().toISOString().split('T')[0];
    const citasHoy = misCitas.filter((c) => c.fecha === hoy && c.estado !== 'cancelada');
    const citasPendientes = misCitas.filter(
      (c) => c.estado === 'pendiente' || c.estado === 'confirmada'
    );
    const citasCompletadas = misCitas.filter((c) => c.estado === 'completada');

    setStats({
      hoy: citasHoy.length,
      pendientes: citasPendientes.length,
      completadas: citasCompletadas.length,
    });
  };

  const handleStatusChange = async (id: string, estado: EstadoCita) => {
    await updateCita(id, { estado });
    await loadData();
  };

  const hoy = new Date().toISOString().split('T')[0];
  const citasHoy = citas
    .filter((c) => c.fecha === hoy && c.estado !== 'cancelada')
    .sort((a, b) => a.hora.localeCompare(b.hora));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Citas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-soft rounded-lg">
                <CalendarIcon className="w-5 h-5 text-brand" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.hoy}</div>
                <p className="text-xs text-slate-500">Programadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendientes}</div>
                <p className="text-xs text-slate-500">Por atender</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completadas}</div>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-brand" />
            Citas de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {citasHoy.length > 0 ? (
              citasHoy.map((cita) => (
                <AppointmentCard
                  key={cita.id}
                  cita={cita}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tienes citas programadas para hoy</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
