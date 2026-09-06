/**
 * PWA service worker registration. The plugin uses registerType 'prompt',
 * so a new build waits in the background until the user accepts the
 * "Actualizar" toast — the reload then swaps in the new precache.
 */
import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  const updateSW = registerSW({
    onNeedRefresh() {
      toast.info('Nueva versión disponible', {
        description: 'Recarga la app para aplicar los cambios.',
        duration: Infinity,
        action: {
          label: 'Actualizar',
          onClick: () => updateSW(true),
        },
      });
    },
  });
}
