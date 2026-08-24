/**
 * WhatsAppPreviewDialog — shows a preview of the message that will be sent via
 * wa.me, lets the admin edit it, and opens WhatsApp in a new tab with the
 * message pre-filled. No backend, no API cost.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Send, ExternalLink, Phone, User as UserIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { useNegocio } from '@/context/NegocioContext';
import { formatPhoneForWhatsApp, getMessageTemplate, openWhatsApp } from '@/utils/whatsapp';
import type { CitaDetallada } from '@/types';

interface WhatsAppPreviewDialogProps {
  cita: CitaDetallada | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WhatsAppPreviewDialog: React.FC<WhatsAppPreviewDialogProps> = ({
  cita,
  open,
  onOpenChange,
}) => {
  const { negocio } = useNegocio();
  const [message, setMessage] = useState('');

  const defaultTemplate = useMemo(() => {
    if (!cita) return '';
    // Pick "agendada" as default when dialog opens (covers post-create flow).
    return getMessageTemplate(cita, 'agendada', negocio);
  }, [cita, negocio]);

  useEffect(() => {
    if (open && cita) {
      setMessage(getMessageTemplate(cita, 'agendada', negocio));
    }
  }, [open, cita, negocio]);

  if (!cita) return null;

  const telefono = cita.cliente?.telefono ?? '';
  const cleaned = formatPhoneForWhatsApp(telefono);
  const hasPhone = cleaned.length >= 7;
  const charCount = message.length;

  const handleSend = () => {
    if (!hasPhone) return;
    const opened = openWhatsApp(telefono, message);
    if (!opened) {
      // Popup blocked — fallback to copying the link.
      window.prompt('Copia este enlace para abrir WhatsApp:', `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            Notificar por WhatsApp
          </DialogTitle>
          <DialogDescription>
            Revisa el mensaje, editalo si quieres y abre WhatsApp para enviarlo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient card */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-900 dark:text-white">{cita.cliente?.nombre ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Phone className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700 dark:text-slate-300">{telefono || 'Sin teléfono'}</span>
              {hasPhone && (
                <span className="text-xs text-slate-500 ml-auto">wa.me/{cleaned}</span>
              )}
            </div>
          </div>

          {/* Editable message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Mensaje</Label>
              <span className="text-xs text-slate-500">{charCount} caracteres</span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none font-mono text-sm"
            />
          </div>

          {/* Preview bubble */}
          <div className="space-y-2">
            <Label>Vista previa</Label>
            <div className="rounded-lg bg-[#efeae2] dark:bg-[#0b141a] p-4 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><circle cx=%2225%22 cy=%2225%22 r=%221%22 fill=%22%23ffffff%22 opacity=%220.05%22/></svg>')]">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-lg bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white px-3 py-2 shadow-sm relative">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed m-0">
                    {message || '(vacío)'}
                  </pre>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-slate-600 dark:text-slate-300">
                      {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <svg viewBox="0 0 16 15" className="w-3.5 h-3.5 text-sky-500" fill="currentColor">
                      <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-200 dark:border-slate-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={!hasPhone || !message.trim()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Abrir WhatsApp
            <ExternalLink className="w-3 h-3 ml-2 opacity-70" />
          </Button>
        </DialogFooter>

        {!hasPhone && (
          <p className="text-xs text-red-500 mt-2">
            El cliente no tiene un teléfono válido para enviar el mensaje.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
