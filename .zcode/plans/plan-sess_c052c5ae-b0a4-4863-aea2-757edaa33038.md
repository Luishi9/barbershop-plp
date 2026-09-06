## Aclaración aplicada

El `<Toaster />` no se eliminó: se movió de `App.tsx` a `main.tsx` (dentro de `NegocioProvider`, junto a `<App />`) para que las notificaciones estén montadas también en las pantallas de login y reset-password — necesario para el toast de actualización PWA. Todos los `toast()` existentes siguen renderizando igual.

## Paso pendiente (sin cambios de código)

Ejecutar `npm run build` en `/frontend` y verificar que:
1. Compila sin errores (el import de `virtual:pwa-register` y los tipos de `vite-plugin-pwa/client` resuelven).
2. `dist/` contiene `manifest.webmanifest`, `sw.js` y `registerSW.js`.
3. El `index.html` de `dist/` incluye el link al manifest y el meta `theme-color`.

Si el build revela algún error (p. ej. de tipos), corregirlo y re-verificar. Nada más queda pendiente — iconos, manifest, meta tags, viewport-fit=cover y registro del SW ya están aplicados.