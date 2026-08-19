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