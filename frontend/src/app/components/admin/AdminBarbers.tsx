import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import { Barbero } from '@/types';
import { getBarberos, createBarbero, updateBarbero, deleteBarbero } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const AdminBarbers: React.FC = () => {
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBarbero, setEditingBarbero] = useState<Barbero | null>(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBarberos();
  }, []);

  const loadBarberos = async () => {
    setBarberos(await getBarberos());
  };

  const handleOpenDialog = (barbero?: Barbero) => {
    if (barbero) {
      setEditingBarbero(barbero);
      setNombre(barbero.nombre);
      setEmail(barbero.email);
      setPassword('');
      setTelefono(barbero.telefono || '');
      setEspecialidad(barbero.especialidad || '');
    } else {
      setEditingBarbero(null);
      setNombre('');
      setEmail('');
      setPassword('');
      setTelefono('');
      setEspecialidad('');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const disponibilidad = editingBarbero?.disponibilidad || [
      { dia: 1, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 2, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 3, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 4, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 5, horaInicio: '09:00', horaFin: '18:00' },
    ];

    try {
      if (editingBarbero) {
        await updateBarbero(editingBarbero.id, {
          nombre,
          email,
          telefono,
          especialidad,
          disponibilidad,
        });
      } else {
        await createBarbero({
          nombre,
          email,
          password,
          telefono,
          especialidad,
          disponibilidad,
        });
      }
      await loadBarberos();
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar el barbero');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este barbero?')) {
      await deleteBarbero(id);
      await loadBarberos();
    }
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Gestión de Barberos</CardTitle>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand-hover"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Barbero
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {barberos.map((barbero) => (
              <Card key={barbero.id} className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-hover rounded-full flex items-center justify-center">
                        <Scissors className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{barbero.nombre}</h3>
                        <p className="text-sm text-slate-400">{barbero.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenDialog(barbero)}
                        className="p-2 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(barbero.id)}
                        className="p-2 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {barbero.telefono && (
                    <p className="text-sm text-slate-400 mb-2">📱 {barbero.telefono}</p>
                  )}

                  {barbero.especialidad && (
                    <div className="mb-3">
                        <Badge className="bg-brand-soft text-brand border-brand/30">
                        {barbero.especialidad}
                      </Badge>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500 mb-2">Horario:</p>
                    <div className="flex flex-wrap gap-1">
                      {barbero.disponibilidad.map((disp) => (
                        <span
                          key={disp.dia}
                          className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded"
                        >
                          {DIAS_SEMANA[disp.dia]} {disp.horaInicio}-{disp.horaFin}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {barberos.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Scissors className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay barberos registrados</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{editingBarbero ? 'Editar' : 'Nuevo'} Barbero</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>
            {!editingBarbero && (
              <div className="space-y-2">
                <Label>Contraseña inicial</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Especialidad</Label>
              <Input
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                className="bg-slate-800 border-slate-700"
                placeholder="ej: Cortes clásicos, Diseño, etc."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand-hover"
              >
                {saving ? 'Guardando...' : editingBarbero ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
