/**
 * Settings dialog: allows admins to edit the singleton business config.
 * Tabs: General (nombre + logo) | Contacto (teléfono + dirección) | Horario.
 */
import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Building2, Phone, Clock, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useNegocio } from '@/context/NegocioContext';
import { uploadLogo } from '@/services/api';

const DIAS = [
  { key: '1', label: 'Lunes' },
  { key: '2', label: 'Martes' },
  { key: '3', label: 'Miércoles' },
  { key: '4', label: 'Jueves' },
  { key: '5', label: 'Viernes' },
  { key: '6', label: 'Sábado' },
  { key: '0', label: 'Domingo' },
] as const;

export const SettingsDialog: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const { negocio, save } = useNegocio();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [nombre, setNombre] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [horarios, setHorarios] = useState<Record<string, { activo: boolean; apertura: string; cierre: string }>>({});

  useEffect(() => {
    if (!negocio) return;
    setNombre(negocio.nombre);
    setLogoUrl(negocio.logoUrl);
    setTelefono(negocio.telefono || '');
    setDireccion(negocio.direccion || '');
    setHorarios(negocio.horarios);
  }, [negocio]);

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      await save({ nombre, logoUrl });
      toast.success('Información general guardada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContacto = async () => {
    setSaving(true);
    try {
      await save({ telefono: telefono || null, direccion: direccion || null });
      toast.success('Datos de contacto guardados');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHorarios = async () => {
    setSaving(true);
    try {
      await save({ horarios });
      toast.success('Horario guardado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadLogo(file);
      setLogoUrl(url);
      toast.success('Logo subido — guarda los cambios para aplicar');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir logo');
    } finally {
      setUploading(false);
    }
  };

  const updateHorario = (key: string, field: 'activo' | 'apertura' | 'cierre', value: boolean | string) => {
    setHorarios((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  if (!canEdit) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Configuración"
          title="Configuración"
          className="border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración del Negocio</DialogTitle>
          <DialogDescription>
            Personaliza el nombre, logo, datos de contacto y horarios de la barbería.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">
              <Building2 className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="contacto" className="flex-1">
              <Phone className="w-4 h-4 mr-2" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="horarios" className="flex-1">
              <Clock className="w-4 h-4 mr-2" />
              Horarios
            </TabsTrigger>
          </TabsList>

          {/* GENERAL */}
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del negocio</Label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Barbería"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Logotipo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-brand file:text-white hover:file:bg-brand-hover file:cursor-pointer disabled:opacity-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, SVG o WEBP. Máx 5 MB.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveGeneral} disabled={saving} className="bg-gradient-to-r from-brand to-brand-hover">
                {saving ? 'Guardando...' : 'Guardar General'}
              </Button>
            </div>
          </TabsContent>

          {/* CONTACTO */}
          <TabsContent value="contacto" className="space-y-4">
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+52 555 123 4567"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Av. Principal 123, Ciudad"
                maxLength={200}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveContacto} disabled={saving} className="bg-gradient-to-r from-brand to-brand-hover">
                {saving ? 'Guardando...' : 'Guardar Contacto'}
              </Button>
            </div>
          </TabsContent>

          {/* HORARIOS */}
          <TabsContent value="horarios" className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Define el horario de atención para cada día de la semana.
            </p>
            {DIAS.map(({ key, label }) => {
              const h = horarios[key] || { activo: false, apertura: '09:00', cierre: '18:00' };
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <label className="flex items-center gap-2 w-32 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h.activo}
                      onChange={(e) => updateHorario(key, 'activo', e.target.checked)}
                      className="w-4 h-4 accent-brand"
                    />
                    <span className="font-medium text-slate-900 dark:text-white">{label}</span>
                  </label>
                  {h.activo ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={h.apertura}
                        onChange={(e) => updateHorario(key, 'apertura', e.target.value)}
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                      />
                      <span className="text-slate-500">a</span>
                      <Input
                        type="time"
                        value={h.cierre}
                        onChange={(e) => updateHorario(key, 'cierre', e.target.value)}
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500 italic flex-1">Cerrado</span>
                  )}
                </div>
              );
            })}
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveHorarios} disabled={saving} className="bg-gradient-to-r from-brand to-brand-hover">
                {saving ? 'Guardando...' : 'Guardar Horarios'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
