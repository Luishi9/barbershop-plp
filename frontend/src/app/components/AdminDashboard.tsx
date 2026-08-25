/**
 * Admin overview section — KPI cards + upcoming appointments.
 * Navigation between sections lives in AppShell (sidebar / bottom-nav).
 */
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
} from 'lucide-react';
import { User, CitaDetallada, EstadoCita } from '@/types';
import { getCitas, getClientes, getServicios, updateCita } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { AppointmentCard } from '@/app/components/AppointmentCard';

interface AdminDashboardProps {
  user: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [citas, setCitas] = useState<CitaDetallada[]>([]);
  const [stats, setStats] = useState({
    totalCitas: 0,
    citasHoy: 0,
    ingresos: 0,
    clientes: 0,
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    const [todasCitas, clientes, servicios] = await Promise.all([
      getCitas(),
      getClientes(),
      getServicios(),
    ]);
    setCitas(todasCitas);

    const hoy = new Date().toISOString().split('T')[0];
    const citasHoy = todasCitas.filter((c) => c.fecha === hoy);
    const citasCompletadas = todasCitas.filter((c) => c.estado === 'completada');

    const ingresos = citasCompletadas.reduce((sum, cita) => {
      const servicio = servicios.find((s) => s.id === cita.servicioId);
      return sum + (servicio?.precio || 0);
    }, 0);

    setStats({
      totalCitas: todasCitas.length,
      citasHoy: citasHoy.length,
      ingresos,
      clientes: clientes.length,
    });
  };

  const handleStatusChange = async (id: string, estado: EstadoCita) => {
    await updateCita(id, { estado });
    await loadData();
  };

  const citasProximas = citas
    .filter((c) => {
      const fechaCita = new Date(c.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return fechaCita >= hoy && c.estado !== 'completada' && c.estado !== 'cancelada';
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora}`);
      const dateB = new Date(`${b.fecha}T${b.hora}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalCitas}</div>
                <p className="text-xs text-slate-500">Todas las citas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Citas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-soft rounded-lg">
                <Clock className="w-5 h-5 text-brand" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.citasHoy}</div>
                <p className="text-xs text-slate-500">Programadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">${stats.ingresos}</div>
                <p className="text-xs text-slate-500">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.clientes}</div>
                <p className="text-xs text-slate-500">Registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand" />
            Próximas Citas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {citasProximas.length > 0 ? (
              citasProximas.map((cita) => (
                <AppointmentCard
                  key={cita.id}
                  cita={cita}
                  showBarber={true}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No hay citas próximas
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
