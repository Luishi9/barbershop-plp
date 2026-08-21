import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, Plus } from 'lucide-react';
import { User, CitaDetallada, EstadoCita } from '@/types';
import { getCitas, updateCita } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { AppointmentCard } from '@/app/components/AppointmentCard';
import { NewAppointmentDialog } from '@/app/components/admin/NewAppointmentDialog';
import { Button } from '@/app/components/ui/button';

interface BarberDashboardProps {
  user: User;
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('today');
  const [citas, setCitas] = useState<CitaDetallada[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    hoy: 0,
    pendientes: 0,
    completadas: 0,
  });

  useEffect(() => {
    loadData();
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

  const citasPendientes = citas
    .filter((c) => {
      const fechaCita = new Date(c.fecha);
      const hoyDate = new Date();
      hoyDate.setHours(0, 0, 0, 0);
      return (
        fechaCita >= hoyDate &&
        (c.estado === 'pendiente' || c.estado === 'confirmada')
      );
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora}`);
      const dateB = new Date(`${b.fecha}T${b.hora}`);
      return dateA.getTime() - dateB.getTime();
    });

  const citasProximas = citas
    .filter((c) => {
      const fechaCita = new Date(c.fecha);
      const hoyDate = new Date();
      hoyDate.setHours(0, 0, 0, 0);
      const unaSemana = new Date();
      unaSemana.setDate(unaSemana.getDate() + 7);
      return fechaCita >= hoyDate && fechaCita <= unaSemana && c.estado !== 'cancelada';
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora}`);
      const dateB = new Date(`${b.fecha}T${b.hora}`);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Bienvenido, {user.nombre.split(' ')[0]}
            </h2>
            <p className="text-slate-400">Gestiona tus citas y agenda de manera eficiente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">Citas Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-soft rounded-lg">
                      <CalendarIcon className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.hoy}</div>
                    <p className="text-xs text-slate-500">Programadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.pendientes}</div>
                    <p className="text-xs text-slate-500">Por atender</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">Completadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.completadas}</div>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
                <TabsTrigger
                  value="today"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-brand-hover data-[state=active]:text-white"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Hoy
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-brand-hover data-[state=active]:text-white"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Próximas
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-brand-hover data-[state=active]:text-white"
                >
                  Pendientes
                </TabsTrigger>
              </TabsList>

              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand-hover"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cita
              </Button>
            </div>

            <TabsContent value="today">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Citas de Hoy</CardTitle>
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
            </TabsContent>

            <TabsContent value="upcoming">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Próximos 7 días</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {citasProximas.length > 0 ? (
                      citasProximas.map((cita) => (
                        <AppointmentCard
                          key={cita.id}
                          cita={cita}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No tienes citas próximas</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Citas Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {citasPendientes.length > 0 ? (
                      citasPendientes.map((cita) => (
                        <AppointmentCard
                          key={cita.id}
                          cita={cita}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No tienes citas pendientes</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <NewAppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadData}
        defaultBarberoId={user.id}
      />
    </>
  );
};
