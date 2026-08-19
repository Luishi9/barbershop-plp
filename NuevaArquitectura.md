# Nueva Arquitectura — Barber-Shop

> Plan de migración del proyecto a: **Frontend Vite (Vercel) + Backend Express (Vercel) + Base de datos y Auth en Supabase.**

---

## Arquitectura objetivo

```
React/Vite (Vercel) ── supabase-js (Auth) ──► Supabase Auth
       │
       └─ fetch /api/* con Bearer JWT ──► Express (Vercel) ──► Supabase Postgres (service role)
```

### Flujo de datos (decisión confirmada)

- **Frontend → Backend API → Supabase**
- El frontend autentica con Supabase Auth (`supabase-js` + anon key), obtiene un JWT y lo envía como `Authorization: Bearer <token>` al backend.
- El backend Express verifica el JWT con `supabase.auth.getUser(token)`, aplica autorización por rol y accede a Supabase Postgres con la **service-role key**.
- Centraliza la lógica de negocio (patrón MVC + Service Layer) conforme al `AGENTS.md`.

### Decisiones confirmadas

| Tema | Decisión |
| --- | --- |
| Ubicación del backend | Carpeta `backend/` dentro de este mismo repo (monorepo) |
| Host del frontend | Vercel (Vite) |
| Host del backend | Vercel (serverless) con `rootDirectory: backend` |
| Auth | Supabase Auth (email/password) |
| Datos demo | Seed de los datos actuales (`mockData.ts`) en Supabase |
| Tipos compartidos | Duplicados entre front/back por simplicidad (opcional `shared/` más adelante) |

---

## Fase 1 — Supabase: esquema y seed

### Migración SQL (`backend/database/migrations/001_init.sql`)

Tablas:

- `profiles`
  - `id uuid PK ref auth.users(id)`
  - `nombre text`
  - `email text`
  - `rol text` (`'admin' | 'barbero'`)
  - `telefono text`
  - `avatar text`
  - `especialidad text` (barbero)
  - `disponibilidad jsonb` (barbero, array de `{ dia, horaInicio, horaFin }`)
- `clientes`
  - `id uuid PK (gen_random_uuid())`
  - `nombre text`
  - `telefono text`
  - `email text`
- `servicios`
  - `id uuid PK`
  - `nombre text`
  - `duracion int` (minutos)
  - `precio numeric(10,2)`
  - `descripcion text`
- `citas`
  - `id uuid PK`
  - `cliente_id uuid FK → clientes.id`
  - `barbero_id uuid FK → profiles.id`
  - `servicio_id uuid FK → servicios.id`
  - `fecha date`
  - `hora time`
  - `estado text` (`'pendiente' | 'confirmada' | 'completada' | 'cancelada'`)
  - `notas text`

Row Level Security activado por tabla (defensa en profundidad; el service role lo salta).

### Seed (`backend/scripts/seed.ts`, requiere service-role key)

- Crea los 3 usuarios demo en Supabase Auth:
  - `admin@barberia.com`
  - `miguel@barberia.com`
  - `juan@barberia.com`
- Contraseña demo documentada en `README` (no hardcodeada en el frontend).
- Inserta `profiles`, `clientes`, `servicios` y `citas` a partir de `src/data/mockData.ts`.

---

## Fase 2 — Backend Express (MVC según AGENTS.md)

### Estructura

```
backend/
├── package.json
├── tsconfig.json
├── vercel.json
├── .env.example
├── api/
│   └── index.ts                 # entrada serverless de Vercel (importa app)
├── database/
│   ├── migrations/001_init.sql
│   └── seed.ts
└── src/
    ├── config/
    │   ├── env.ts               # validación de variables (zod)
    │   └── supabase.ts           # clientes service-role + admin auth
    ├── models/
    │   └── index.ts             # tipos de dominio
    ├── repositories/
    │   ├── barbero.repository.ts
    │   ├── cliente.repository.ts
    │   ├── servicio.repository.ts
    │   └── cita.repository.ts
    ├── services/
    │   ├── auth.service.ts
    │   ├── barbero.service.ts
    │   ├── cliente.service.ts
    │   ├── servicio.service.ts
    │   └── cita.service.ts
    ├── controllers/
    │   ├── auth.controller.ts
    │   ├── barbero.controller.ts
    │   ├── cliente.controller.ts
    │   ├── servicio.controller.ts
    │   └── cita.controller.ts
    ├── routes/
    │   ├── index.ts
    │   ├── barbero.routes.ts
    │   ├── cliente.routes.ts
    │   ├── servicio.routes.ts
    │   └── cita.routes.ts
    ├── middlewares/
    │   ├── auth.middleware.ts    # verifica JWT (supabase.auth.getUser)
    │   ├── admin.middleware.ts   # chequea rol admin
    │   └── error.middleware.ts
    ├── utils/
    │   └── http.ts               # asyncHandler, helpers de respuesta
    ├── app.ts                    # cors (origen configurable), json, rutas
    └── server.ts                 # dev local, puerto 4000
```

### Endpoints REST (todos protegidos con JWT)

- `GET /api/auth/me` → perfil del usuario autenticado
- CRUD `barberos` (admin), `clientes`, `servicios`
- CRUD `citas` con filtros (`barberoId`, `estado`, `fecha`)
- `GET /api/citas` con join detallado (cliente + barbero + servicio → `CitaDetallada`)
- Crear barbero = crear usuario Supabase (service role) + `profile`

### Validación y seguridad

- Validación de entrada con **zod**
- Sin exposición de stack traces, errores controlados
- Variables de entorno obligatorias (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGIN`)
- CORS con origen configurable

##

### Vercel

- `vercel.json` enruta a `api/index.ts`
- `@vercel/node` como devDependency

### Testing y CI (según AGENTS.md)

- **Jest** (unit) + **Supertest** (integration) en servicios y endpoints principales
- Cobertura mínima 70%
- Workflow GitHub Actions: lint → test → build
- Sin merge si fallan tests o lint

---

## Fase 3 — Frontend (Vite, se mantiene)

### Cambios

- Instalar `@supabase/supabase-js`
- `src/services/supabase.ts` → cliente (anon key)
- `src/services/api.ts` → wrapper `fetch` que adjunta `Authorization: Bearer`
- **Reemplazar `src/services/storage.ts`**: las funciones de datos pasan a ser async (llamadas a la API); el auth pasa a Supabase
- Actualizar componentes a `await` de llamadas async:
  - `app/App.tsx`
  - `app/components/LoginPage.tsx`
  - `app/components/AdminDashboard.tsx`
  - `app/components/BarberDashboard.tsx`
  - `app/components/admin/AdminAppointments.tsx`
  - `app/components/admin/AdminBarbers.tsx`
  - `app/components/admin/AdminClients.tsx`
  - `app/components/admin/AdminServices.tsx`
  - `app/components/admin/NewAppointmentDialog.tsx`
- `App.tsx`: suscribirse a `supabase.auth.onAuthStateChange`; logout con `supabase.auth.signOut()`
- `LoginPage.tsx`: usar `signInWithPassword`; los botones demo llenan el email (sin hardcodear passwords)
- `vite.config.ts`: proxy `/api → http://localhost:4000` en desarrollo
- `.env.example` con `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`

### Tipos

- `User` y relacionados (`Barbero`, `Cliente`, `Servicio`, `Cita`, `CitaDetallada`) se conservation; el backend responde perfiles mapeables a esos tipos.

---

## Fase 4 — Despliegue y verificación

1. Crear proyecto Supabase, ejecutar migración + seed
2. Crear proyecto Vercel para el **backend** (`rootDirectory: backend`), configurar env vars y desplegar
3. Crear proyecto Vercel para el **frontend**, configurar env vars y desplegar
4. Verificar login + CRUD en local y producción

---

## Notas y fuera de scope

- La carpeta del proyecto **no es repo git aún**: se recomienda `git init` antes de conectar a Vercel.
- Los **errores de react-doctor (`exhaustive-deps`)** en `BarberDashboard.tsx` y `AdminAppointments.tsx` quedan **fuera de este scope**; se abordarán como tarea aparte.
- Convención de commits conforme al `AGENTS.md` (`feat(scope): ...`, `fix(scope): ...`, etc.).
