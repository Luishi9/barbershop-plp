-- Migration 004: role_permissions — which navigation modules each role can access.
-- Used by the responsive app shell to build the sidebar/bottom-nav dynamically.
-- NOTE: this is UI-level access control; API writes remain protected by role
-- middlewares (requireAdmin) regardless of this matrix.

CREATE TABLE IF NOT EXISTS role_permissions (
  rol text PRIMARY KEY CHECK (rol IN ('admin', 'barbero')),
  modulos jsonb NOT NULL DEFAULT '[]'::jsonb
);

INSERT INTO role_permissions (rol, modulos) VALUES
  ('admin',   '["dashboard","citas","barberos","servicios","clientes"]'::jsonb),
  ('barbero', '["dashboard","citas"]'::jsonb)
ON CONFLICT (rol) DO NOTHING;
