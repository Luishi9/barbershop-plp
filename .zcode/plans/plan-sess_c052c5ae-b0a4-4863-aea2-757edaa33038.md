## Diagnóstico

El scroll fantasma lo causa el **sidebar**, no el `min-h-screen` del contenedor raíz:

- `AppShell.tsx:113` — el `<aside>` (sidebar) tiene `h-screen` (100vh) y es hermano del contenido dentro de `div.flex`, pero el `Navbar` está **encima** de ese flex row en el flujo normal del documento.
- Resultado en escritorio: altura del documento = altura del navbar (~60–80px) + 100vh del sidebar → siempre hay ~80px de scroll aunque no haya contenido.
- En móvil no ocurre porque el sidebar es `hidden lg:flex` (el detalle de 100vh vs barra de URL en iOS se resuelve de paso con `dvh`).

## Cambios (Opción A — ajuste mínimo)

1. **`frontend/src/styles/theme.css`** — agregar variable de altura del navbar como única fuente de verdad (cerca de los `:root` existentes):
   ```css
   :root { --navbar-height: 3.5rem; }            /* base 56px */
   @media (min-width: 40rem) { :root { --navbar-height: 4rem; } }   /* sm 64px */
   @media (min-width: 48rem) { :root { --navbar-height: 5rem; } }   /* md+ 80px */
   ```
   (Alturas actuales calculadas: 60/68/77px → quedan en 56/64/80px, diferencia imperceptible y tokens limpios.)

2. **`frontend/src/app/components/Navbar.tsx:16-17`** — navbar sticky con altura fija:
   - `nav`: quitar `py-3 md:py-4`, agregar `sticky top-0 z-30 h-[var(--navbar-height)]` (conserva `bg-slate-900`, borde y `px`).
   - Contenedor interno: agregar `h-full` para centrar el contenido verticalmente.

3. **`frontend/src/app/components/layout/AppShell.tsx`**:
   - Línea 106 (raíz): `min-h-screen` → `min-h-dvh` (corrige también el exceso de 100vh bajo la barra de URL en iOS).
   - Línea 113 (sidebar): `sticky top-0 h-screen` → `sticky top-[var(--navbar-height)] h-[calc(100dvh-var(--navbar-height))]` → el sidebar ocupa exactamente el viewport debajo del navbar, sin sumar altura extra.

4. **Consistencia** — `min-h-screen` → `min-h-dvh` en los otros 3 usos: `App.tsx:58` (spinner de carga), `LoginPage.tsx:88`, `ResetPasswordPage.tsx:88`.

## Qué NO cambia

- El scroll normal de la página cuando hay mucho contenido (igual que hoy).
- Comportamiento móvil: bottom-nav fija, `pb-24 lg:pb-8` del main, safe-area.
- El botón "Salir" con `mt-auto` al fondo del sidebar (sigue siendo flex-col).
- Cero cambios de lógica: solo clases CSS y una variable.

## Verificación

1. `npm run build` en `/frontend` (compila sin errores).
2. Verificación visual con el dev server:
   - Escritorio (≥lg): con una sección de poco contenido, `document.scrollHeight === window.innerHeight` (sin scrollbar); al scrollear una sección larga, navbar y sidebar quedan fijos sin huecos.
   - Móvil (<lg): bottom-nav intacta y sin scroll fantasma.

No hago commit salvo que lo pidas (mensaje sugerido: `fix(ui): remove phantom page scroll caused by h-screen sidebar`).