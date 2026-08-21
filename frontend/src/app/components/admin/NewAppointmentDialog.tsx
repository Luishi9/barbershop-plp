import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { getBarberos, getClientes, getServicios, createCita, createCliente } from '@/services/api';
import { Barbero, Cliente, Servicio } from '@/types';

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultBarberoId?: string;
}

export const NewAppointmentDialog: React.FC<NewAppointmentDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  defaultBarberoId,
}) => {
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  
  const [selectedBarbero, setSelectedBarbero] = useState(defaultBarberoId || '');
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedServicio, setSelectedServicio] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [notas, setNotas] = useState('');
  
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      getBarberos()
        .then(setBarberos)
        .catch(() => setBarberos([]));
      getClientes()
        .then(setClientes)
        .catch(() => setClientes([]));
      getServicios()
        .then(setServicios)
        .catch(() => setServicios([]));

      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFecha(today);
    }
  }, [open]);

  useEffect(() => {
    if (defaultBarberoId) {
      setSelectedBarbero(defaultBarberoId);
    }
  }, [defaultBarberoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let clienteId = selectedCliente;

      // Si es un cliente nuevo, crearlo primero
      if (isNewClient) {
        const newClient = await createCliente({
          nombre: newClientName,
          telefono: newClientPhone,
          email: newClientEmail || undefined,
        });
        clienteId = newClient.id;
      }

      await createCita({
        clienteId,
        barberoId: selectedBarbero,
        servicioId: selectedServicio,
        fecha,
        hora,
        notas: notas || undefined,
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo crear la cita');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedBarbero(defaultBarberoId || '');
    setSelectedCliente('');
    setSelectedServicio('');
    setFecha('');
    setHora('');
    setNotas('');
    setIsNewClient(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Cita</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Barbero</Label>
            <Select value={selectedBarbero} onValueChange={setSelectedBarbero} required>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Seleccionar barbero" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {barberos.map((barbero) => (
                  <SelectItem key={barbero.id} value={barbero.id}>
                    {barbero.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cliente</Label>
              <button
                type="button"
                onClick={() => setIsNewClient(!isNewClient)}
                className="text-xs text-brand hover:text-brand"
              >
                {isNewClient ? 'Seleccionar existente' : '+ Nuevo cliente'}
              </button>
            </div>
            
            {isNewClient ? (
              <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg">
                <Input
                  placeholder="Nombre"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  required
                />
                <Input
                  placeholder="Teléfono"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email (opcional)"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            ) : (
              <Select value={selectedCliente} onValueChange={setSelectedCliente} required>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre} - {cliente.telefono}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Servicio</Label>
            <Select value={selectedServicio} onValueChange={setSelectedServicio} required>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {servicios.map((servicio) => (
                  <SelectItem key={servicio.id} value={servicio.id}>
                    {servicio.nombre} - ${servicio.precio} ({servicio.duracion} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="bg-slate-800 border-slate-700 resize-none"
              rows={3}
              placeholder="Preferencias del cliente, instrucciones especiales..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand-hover"
            >
              {saving ? 'Creando...' : 'Crear Cita'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
