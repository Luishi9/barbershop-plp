import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Servicio } from '@/types';
import { getServicios, createServicio, updateServicio, deleteServicio } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';

export const AdminServices: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);

  const [nombre, setNombre] = useState('');
  const [duracion, setDuracion] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServicios();
  }, []);

  const loadServicios = async () => {
    setServicios(await getServicios());
  };

  const handleOpenDialog = (servicio?: Servicio) => {
    if (servicio) {
      setEditingServicio(servicio);
      setNombre(servicio.nombre);
      setDuracion(servicio.duracion.toString());
      setPrecio(servicio.precio.toString());
      setDescripcion(servicio.descripcion || '');
    } else {
      setEditingServicio(null);
      setNombre('');
      setDuracion('');
      setPrecio('');
      setDescripcion('');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        nombre,
        duracion: parseInt(duracion),
        precio: parseFloat(precio),
        descripcion: descripcion || undefined,
      };

      if (editingServicio) {
        await updateServicio(editingServicio.id, payload);
      } else {
        await createServicio(payload);
      }
      await loadServicios();
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar el servicio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      await deleteServicio(id);
      await loadServicios();
    }
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Gestión de Servicios</CardTitle>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand-hover"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Servicio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicios.map((servicio) => (
              <Card key={servicio.id} className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-hover rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{servicio.nombre}</h3>
                        <p className="text-sm text-slate-400">{servicio.duracion} minutos</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenDialog(servicio)}
                        className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(servicio.id)}
                        className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {servicio.descripcion && (
                    <p className="text-sm text-slate-400 mb-3">{servicio.descripcion}</p>
                  )}

                  <div className="pt-3 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Precio</span>
                        <span className="text-xl font-bold text-brand">${servicio.precio}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {servicios.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay servicios registrados</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{editingServicio ? 'Editar' : 'Nuevo'} Servicio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del servicio</Label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="bg-slate-800 border-slate-700"
                placeholder="ej: Corte Clásico"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Duración (minutos)</Label>
                <Input
                  type="number"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  placeholder="30"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Precio ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  placeholder="15.00"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="bg-slate-800 border-slate-700 resize-none"
                rows={3}
                placeholder="Descripción breve del servicio..."
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
                {saving ? 'Guardando...' : editingServicio ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
