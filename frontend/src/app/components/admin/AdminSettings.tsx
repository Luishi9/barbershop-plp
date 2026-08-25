/**
 * AdminSettings — full-page configuration section.
 * Tabs: General (nombre + logo) | Contacto | Horarios | Roles (permisos).
 * Loads its own data (negocio context + roles hook); remounts on navigation,
 * so everything is fresh every time the section opens.
 */
import React, { useEffect, useState } from 'react';
import { Building2, Phone, Clock, ImageIcon, ShieldCheck, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/app/components/ui/card';
import { useNegocio } from '@/context/NegocioContext';
import { uploadLogo, updateRolePermissions } from '@/services/api';
import { MODULO_KEYS, MODULO_LABELS } from '@/types';
import type { ModuloKey } from '@/types';
import { useRoles } from '@/hooks/useRoles';

const DIAS = [
    { key: '1', label: 'Lunes' },
    { key: '2', label: 'Martes' },
    { key: '3', label: 'Miércoles' },
    { key: '4', label: 'Jueves' },
    { key: '5', label: 'Viernes' },
    { key: '6', label: 'Sábado' },
    { key: '0', label: 'Domingo' },
] as const;

const ROLES_EDITABLES = [
    { rol: 'admin', label: 'Administrador', hint: 'Acceso total recomendado' },
    { rol: 'barbero', label: 'Barbero', hint: 'Módulos visibles para barberos' },
] as const;

type RolesDraft = Record<string, ModuloKey[]>;

export const AdminSettings: React.FC = () => {
    const { negocio, save } = useNegocio();
    const { modulosByRol: roles, refresh: refreshRoles } = useRoles();
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [savingRole, setSavingRole] = useState<string | null>(null);

    const [nombre, setNombre] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [codigoPais, setCodigoPais] = useState('');
    const [horarios, setHorarios] = useState<Record<string, { activo: boolean; apertura: string; cierre: string }>>({});
    const [rolesDraft, setRolesDraft] = useState<RolesDraft>({ admin: [], barbero: [] });

    // Sync form state when the section mounts (navigation remounts it).
    useEffect(() => {
        if (negocio) {
            setNombre(negocio.nombre);
            setLogoUrl(negocio.logoUrl);
            setTelefono(negocio.telefono || '');
            setDireccion(negocio.direccion || '');
            setCodigoPais(negocio.codigoPais || '');
            setHorarios(negocio.horarios);
        }
        setRolesDraft({
            admin: [...(roles.admin ?? [])],
            barbero: [...(roles.barbero ?? [])],
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            await save({
                telefono: telefono || null,
                direccion: direccion || null,
                codigoPais: codigoPais || null,
            });
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

    const updateHorario = (
        key: string,
        field: 'activo' | 'apertura' | 'cierre',
        value: boolean | string,
    ) => {
        setHorarios((prev) => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }));
    };

    const toggleModulo = (rol: string, modulo: ModuloKey) => {
        setRolesDraft((prev) => ({
            ...prev,
            [rol]: prev[rol].includes(modulo)
                ? prev[rol].filter((m) => m !== modulo)
                : [...prev[rol], modulo],
        }));
    };

    const handleSaveRole = async (rol: string) => {
        setSavingRole(rol);
        try {
            await updateRolePermissions(rol, rolesDraft[rol]);
            toast.success(`Permisos de ${rol} actualizados`);
            refreshRoles();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'No se pudieron guardar los permisos');
        } finally {
            setSavingRole(null);
        }
    };

    return (
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand" />
                    Configuración del Negocio
                </CardTitle>
                <CardDescription>
                    Personaliza el nombre, logo, contacto, horarios y permisos por rol.
                </CardDescription>
            </CardHeader>
            <CardContent>


                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="w-full flex-wrap h-auto gap-1">
                        <TabsTrigger value="general" className="flex-1 min-w-[100px]">
                            <Building2 className="w-4 h-4 mr-1.5" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="contacto" className="flex-1 min-w-[100px]">
                            <Phone className="w-4 h-4 mr-1.5" />
                            Contacto
                        </TabsTrigger>
                        <TabsTrigger value="horarios" className="flex-1 min-w-[100px]">
                            <Clock className="w-4 h-4 mr-1.5" />
                            Horarios
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="flex-1 min-w-[80px]">
                            <ShieldCheck className="w-4 h-4 mr-1.5" />
                            Roles
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
                                <div className="w-20 h-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
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
                        <div className="space-y-2">
                            <Label>Código de país (WhatsApp)</Label>
                            <Input
                                value={codigoPais}
                                onChange={(e) => setCodigoPais(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                placeholder="52"
                                inputMode="numeric"
                            />
                            <p className="text-xs text-slate-500">
                                Se antepone automáticamente a teléfonos locales de 10 dígitos o menos.
                                Ej.: 52 (México), 34 (España), 57 (Colombia).
                            </p>
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
                                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                                >
                                    <label className="flex items-center gap-2 sm:w-32 cursor-pointer shrink-0">
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
                                            <span className="text-slate-500 shrink-0">a</span>
                                            <Input
                                                type="time"
                                                value={h.cierre}
                                                onChange={(e) => updateHorario(key, 'cierre', e.target.value)}
                                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-500 italic">Cerrado</span>
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

                    {/* ROLES */}
                    <TabsContent value="roles" className="space-y-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Define qué módulos de navegación puede ver cada rol. Los cambios aplican
                            cuando los usuarios vuelvan a iniciar sesión o recarguen la app.
                        </p>

                        {ROLES_EDITABLES.map(({ rol, label, hint }) => (
                            <div
                                key={rol}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3"
                            >
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white">{label}</h4>
                                    <p className="text-xs text-slate-500">{hint}</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {MODULO_KEYS.map((modulo) => {
                                        const checked = rolesDraft[rol]?.includes(modulo) ?? false;
                                        return (
                                            <label
                                                key={modulo}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${checked
                                                        ? 'border-brand/40 bg-brand-soft text-slate-900 dark:text-white'
                                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleModulo(rol, modulo)}
                                                    className="w-4 h-4 accent-brand shrink-0"
                                                />
                                                <span className="truncate">{MODULO_LABELS[modulo]}</span>
                                            </label>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={() => handleSaveRole(rol)}
                                        disabled={savingRole === rol || rolesDraft[rol].length === 0}
                                        className="bg-gradient-to-r from-brand to-brand-hover"
                                        title={
                                            rolesDraft[rol].length === 0
                                                ? 'Cada rol debe conservar al menos un módulo'
                                                : undefined
                                        }
                                    >
                                        <Save className="w-3.5 h-3.5 mr-1.5" />
                                        {savingRole === rol ? 'Guardando...' : `Guardar ${label}`}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};