import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, User, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Cliente } from '@/types';
import { getClientes, createCliente, updateCliente, deleteCliente } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

export const AdminClients: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredClientes(
        clientes.filter((c) =>
          c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.telefono.includes(searchTerm) ||
          (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
      setFilteredClientes(clientes);
    }
  }, [searchTerm, clientes]);

  const loadClientes = async () => {
    setClientes(await getClientes());
  };

  const handleOpenDialog = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setNombre(cliente.nombre);
      setTelefono(cliente.telefono);
      setEmail(cliente.email || '');
    } else {
      setEditingCliente(null);
      setNombre('');
      setTelefono('');
      setEmail('');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, {
          nombre,
          telefono,
          email: email || undefined,
        });
      } else {
        await createCliente({
          nombre,
          telefono,
          email: email || undefined,
        });
      }
      await loadClientes();
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      await deleteCliente(id);
      await loadClientes();
    }
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Gestión de Clientes</CardTitle>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand-hover"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredClientes.map((cliente) => (
              <Card key={cliente.id} className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-brand" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{cliente.nombre}</h3>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenDialog(cliente)}
                        className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id)}
                        className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-400">📱 {cliente.telefono}</p>
                    {cliente.email && <p className="text-slate-400">✉️ {cliente.email}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClientes.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron clientes</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{editingCliente ? 'Editar' : 'Nuevo'} Cliente</DialogTitle>
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
              <Label>Teléfono</Label>
              <Input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email (opcional)</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700"
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
                {saving ? 'Guardando...' : editingCliente ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
