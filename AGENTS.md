# mi archivo de AGENT.md 

## Desarrollo

- Tener en cuenta siempre el modelo MVC para tener un mejor manejo de las carpetas del proyecto

## Stack tecnologico

Frontend

- Framework principal: React
- Bundler / Dev Server: Vite
- Lenguaje: JavaScript (ES6+) / TypeScript (recomendado si planeas escalar)
- Estilos: Tailwind CSS
- Gestión de estado: Context API / Zustand / Redux (según complejidad)
- Routing: React Router
- Consumo de API: Axios / Fetch API

Backend

- Node.js + Express
-Arquitectura REST
- Autenticación con JWT
- Validación con Zod o Joi

Base de Datos

- Supabase (PostgreSQL alojado)
- Auth con Supabase Auth

DevOps

- Git (GitHub)
- CI/CD con GitHub Actions

Estructura del Proyecto (MVC)

- Backend (MVC)

/backend
│── /api/index.ts     # Entry serverless para Vercel
│── /database         # Migraciones SQL + seed
│── /src
│   │── /config        # Configuración (env, supabase, etc.)
│   │── /controllers   # Controladores (lógica de entrada/salida)
│   │── /models        # Modelos (tipos de dominio)
│   │── /routes        # Definición de endpoints
│   │── /services      # Lógica de negocio
│   │── /middlewares   # Middlewares (auth, admin, error, etc.)
│   │── /utils         # Funciones auxiliares
│   │── app.ts
│   │── server.ts

- Frontend
/frontend
│── /src
│   │── /components
│   │── /pages
│   │── /layouts
│   │── /hooks
│   │── /services      # API calls
│   │── /context       # Estado global
│   │── /utils
│   │── main.tsx

## Patrones de Diseño

- Backend
* MVC (obligatorio)
* Service Layer Pattern (lógica desacoplada del controlador)
* Repository Pattern (opcional con ORM)
* Middleware Pattern (Express)

- Frontend
* Component-Based Architecture
* Container / Presentational Pattern
* Custom Hooks Pattern
* Atomic Design (opcional para UI escalable)

- Generales
* DRY (Don't Repeat Yourself)
* KISS (Keep It Simple)
* SOLID (en backend principalmente)

## Convenciones de Código

- Generales
* Código en inglés
* Nombres descriptivos (no abreviaciones ambiguas)
* Máximo 80-100 caracteres por línea
* comentarios con explicacion en las funciones

- Naming
* Variables: camelCase
* Funciones: camelCase
* Clases: PascalCase

Archivos:

    * Backend: user.controller.ts
    * Frontend: UserCard.tsx

- Funciones
* Máximo 30-40 líneas
* Una sola responsabilidad

- Comentarios
* Solo cuando agreguen valor
* explicativos sobre funcionamiento
* Evitar comentarios obvios

## Prohibiciones

❌ Lógica de negocio en controladores

❌ Acceso directo a la base de datos desde rutas

❌ Código duplicado

❌ Variables globales innecesarias

❌ Hardcodeo de valores sensibles

❌ Mezclar responsabilidades (ej: UI + lógica en un mismo componente complejo)

❌ Commits sin mensaje claro

❌ Uso de any en TypeScript sin justificación

## Flujo de Trabajo (Git)

- Branching Strategy

* main → producción

* develop → integración

* feature/* → nuevas funcionalidades

* fix/* → correcciones

* hotfix/* → errores críticos

- Flujo

* Crear branch desde develop

* Desarrollar feature

* Hacer commits siguiendo convención

* Crear Pull Request hacia develop

* Code review obligatorio

* Merge

## Testing

- Backend

* Unit Testing: Jest
* Integration Testing: Supertest

- Frontend

* Unit Testing: Vitest / Jest
* Component Testing: React Testing Library

- Reglas

* Cobertura mínima: 70%
* Tests obligatorios en:
    * Servicios
    * Lógica crítica
    * Endpoints principales

## CI/CD

- Pipeline mínimo

1. Instalación de dependencias
2. Linting (ESLint)
3. Testing
4. Build
5. Deploy (si aplica)

- Reglas

* No se puede hacer merge si fallan tests
* No se puede hacer merge si falla lint

## Convención de Commits

- Formato:

tipo(scope): descripción

- Tipos

feat: nueva funcionalidad

fix: bug

refactor: mejora interna

docs: documentación

test: testing

chore: tareas menores

- Ejemplos
feat(auth): add JWT authentication
fix(api): correct user endpoint validation
refactor(user): improve service structure

## Pull Requests (PRs)
- Reglas

Título claro y descriptivo

Descripción obligatoria:
    Qué se hizo
    Por qué
    Cómo probarlo

- Checklist

Código probado

Sin errores de lint

Tests agregados/actualizados

Sin console.logs innecesarios

## Seguridad

- Uso obligatorio de variables de entorno
- Sanitización de inputs
- Validación en backend
- Manejo adecuado de errores (no exponer stack traces)

## Escalabilidad

- Separación clara de capas
- Código desacoplado
- Preparado para microservicios (futuro)
- Uso de caché (Redis opcional)

## Filosofía del Proyecto

Código limpio, predecible y escalable siempre es mejor que soluciones rápidas y desordenadas.

## Flujos de Trabajo del Sistema

### Flujo 1 — Autenticación
1. Usuario abre la app → `App.tsx` consulta `supabase.auth.getSession()`.
2. Si hay sesión válida → llama `getMe()` → carga perfil desde backend → renderiza `Navbar` + dashboard correspondiente.
3. Si no hay sesión → renderiza `LoginPage`.
4. Login exitoso → `supabase.auth.signInWithPassword()` → `onAuthStateChange` dispara → carga perfil → renderiza dashboard.
5. Logout → `supabase.auth.signOut()` → estado limpio → vuelve a `LoginPage`.

### Flujo 2 — Gestión de Citas
1. Admin/Barbero crea cita desde `NewAppointmentDialog` (puede crear cliente nuevo en el momento).
2. Frontend envía `POST /api/citas` con `clienteId`, `barberoId`, `servicioId`, `fecha`, `hora`, `notas`.
3. Backend valida con zod → verifica referencias (cliente/barbero/servicio existen) → chequea conflictos de horario → persiste.
4. Frontend recarga lista → toast de éxito o error.
5. Cambio de estado (`PUT /api/citas/:id`) sigue el mismo flujo.

### Flujo 3 — Configuración del Negocio
1. Admin hace click en ⚙ Configuración (Navbar) → abre `SettingsDialog` con 3 tabs.
2. Tab General: edita nombre y sube logo (Supabase Storage bucket `logos`).
3. Tab Contacto: edita teléfono y dirección.
4. Tab Horarios: toggle por día con horarios apertura/cierre.
5. Al guardar, se persiste via `PUT /api/negocio` (admin only).
6. `NegocioContext` recarga y los cambios se reflejan en Navbar y LoginPage.

### Flujo 4 — Notificación WhatsApp (wa.me)
1. Admin hace click en "📱 Notificar" en una `AppointmentCard` o tras crear/confirmar/cancelar cita.
2. Abre `WhatsAppPreviewDialog` con:
   - Datos del cliente (nombre + teléfono normalizado).
   - Plantilla pre-seleccionada según estado de la cita (`defaultKindForCita`) y selector para cambiarla.
   - Textarea editable + vista previa estilo burbuja WhatsApp.
3. Si el teléfono es local (≤10 dígitos), se antepone el `codigoPais` configurado en ⚙ Configuración → Contacto.
4. Al enviar, toast "Abriendo WhatsApp…" y se abre `https://wa.me/{phone}?text={encoded}` en nueva pestaña (fallback: copiar enlace si el navegador bloquea popups).
5. WhatsApp Web/App abre con el mensaje pre-llenado → admin envía manualmente.
6. Flujo semi-automático: 0 costo, sin backend, ~5 segundos por mensaje.

### Flujo 5 — Tema Claro/Oscuro
1. Usuario hace click en el botón Sol/Luna en la Navbar.
2. `useTheme` hook alterna el estado y aplica/quita la clase `.dark` en `<html>`.
3. La clase activa el bloque `.dark { ... }` del `theme.css` (tokens semánticos).
4. Preferencia se persiste en `localStorage` (clave `barbershop-theme`).
5. Todos los componentes que usan tokens semánticos (`bg-surface`, `text-text-primary`, etc.) responden automáticamente.

### Flujo 6 — Búsqueda y Filtros de Citas
1. Usuario escribe en el campo búsqueda de `AdminAppointments` o selecciona estado en el select.
2. Filtros se aplican en cliente sobre la lista cargada (no se vuelve a llamar al backend).
3. Orden por fecha/hora descendente para ver las más recientes primero.

### Flujo 7 — Navegación Responsiva y Permisos por Rol (App Shell)
1. Tras login, `AppShell` carga la matriz `rol → módulos` vía `useRoles()` (GET /api/roles, con defaults hardcodeados como fallback).
2. **Escritorio (≥lg)**: sidebar fija a la izquierda con los módulos permitidos + Configuración (admin) + Salir abajo; el contenido se renderiza en `<main>` según la sección activa.
3. **Móvil (<lg)**: navbar superior slim (logo, tema, usuario) + bottom-nav fija con íconos de las mismas secciones + Salir; safe-area iOS respetada.
4. Al cambiar de sección el componente se remonta → datos siempre frescos.
5. Admin edita permisos en ⚙ Configuración → tab Roles (checkboxes por módulo, PUT /api/roles/:rol).
6. Guard: si la sección activa pierde permiso, AppShell salta al primer módulo permitido del rol.
7. Alcance del control: filtrado a nivel UI; las escrituras del backend siguen protegidas por requireAdmin.