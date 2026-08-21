import React from 'react';
import { CitaDetallada, EstadoCita } from '@/types';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Clock, User, Scissors, Calendar, Phone } from 'lucide-react';

interface AppointmentCardProps {
  cita: CitaDetallada;
  onStatusChange?: (id: string, estado: EstadoCita) => void;
  showBarber?: boolean;
}

const ESTADO_COLORS = {
  pendiente: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  confirmada: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completada: 'bg-green-500/10 text-green-500 border-green-500/20',
  cancelada: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  cita, 
  onStatusChange,
  showBarber = false 
}) => {
  return (
    <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-brand" />
              <span className="font-semibold text-slate-900 dark:text-white">{cita.cliente.nombre}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
              <Phone className="w-3 h-3" />
              <span>{cita.cliente.telefono}</span>
            </div>
            {showBarber && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                <Scissors className="w-3 h-3" />
                <span>{cita.barbero.nombre}</span>
              </div>
            )}
          </div>
          <Badge className={ESTADO_COLORS[cita.estado]}>
            {ESTADO_LABELS[cita.estado]}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{new Date(cita.fecha).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{cita.hora} • {cita.servicio.duracion} min</span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">{cita.servicio.nombre}</span>
              <span className="font-semibold text-brand">${cita.servicio.precio}</span>
            </div>
          </div>
        </div>

        {cita.notas && (
          <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-900/50 rounded text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold">Nota:</span> {cita.notas}
          </div>
        )}

        {onStatusChange && cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
          <div className="mt-3 flex gap-2">
            {cita.estado === 'pendiente' && (
              <button
                onClick={() => onStatusChange(cita.id, 'confirmada')}
                className="flex-1 px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
              >
                Confirmar
              </button>
            )}
            <button
              onClick={() => onStatusChange(cita.id, 'completada')}
              className="flex-1 px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
            >
              Completar
            </button>
            <button
              onClick={() => onStatusChange(cita.id, 'cancelada')}
              className="flex-1 px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
