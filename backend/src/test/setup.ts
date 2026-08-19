/**
 * Jest setup: provides valid env vars before any module (config/env.ts) is
 * imported, so tests never trigger process.exit on validation failure.
 */
process.env.SUPABASE_URL = 'https://fake.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-service-role-key-for-tests';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.PORT = '4000';
process.env.DEMO_PASSWORD = 'Barberia2026!';
process.env.NODE_ENV = 'test';