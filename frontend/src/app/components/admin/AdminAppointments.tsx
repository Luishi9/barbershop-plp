import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import { CitaDetallada, EstadoCita } from '@/types';
import { getCitas, updateCita, deleteCita } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { AppointmentCard } from '@/app/components/AppointmentCard';
import { NewAppointmentDialog } from '@/app/components/admin/NewAppointmentDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface AdminAppointmentsProps {
  onUpdate?: () => void;
}

export const AdminAppointments: React.FC<AdminAppointmentsProps> = ({ onUpdate }) => {
  const [citas, setCitas] = useState<CitaDetallada[]>([]);
  const [filteredCitas, setFilteredCitas] = useState<CitaDetallada[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadCitas();
  }, []);

  useEffect(() => {
    filterCitas();
  }, [citas, searchTerm, statusFilter]);

  const loadCitas = async () => {
    const citasDetalladas = await getCitas();
    setCitas(citasDetalladas);
    if (onUpdate) onUpdate();
  };

  const filterCitas = () => {
    let filtered = [...citas];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((cita) =>
        cita.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.barbero.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter((cita) => cita.estado === statusFilter);
    }

    // Ordenar por fecha y hora
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora}`);
      const dateB = new Date(`${b.fecha}T${b.hora}`);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredCitas(filtered);
  };

  const handleStatusChange = async (id: string, estado: EstadoCita) => {
    await updateCita(id, { estado });
    await loadCitas();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta cita?')) {
      await deleteCita(id);
      await loadCitas();
    }
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Gestión de Citas</CardTitle>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand-hover"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cita
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar por cliente, barbero o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-900/50 border-slate-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredCitas.length > 0 ? (
              filteredCitas.map((cita) => (
                <AppointmentCard
                  key={cita.id}
                  cita={cita}
                  showBarber={true}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron citas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <NewAppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadCitas}
      />
    </>
  );
};