-- Migration 002: negocio (singleton config table) + storage bucket for logos

-- 1. Negocio table (singleton, only id=1 allowed)
CREATE TABLE negocio (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nombre text NOT NULL DEFAULT 'Barbería',
  logo_url text,
  telefono text,
  direccion text,
  horarios jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Insert default row so the singleton exists
INSERT INTO negocio (id, nombre, horarios) VALUES (
  1,
  'Barbería',
  '{
    "1": {"activo": true, "apertura": "09:00", "cierre": "18:00"},
    "2": {"activo": true, "apertura": "09:00", "cierre": "18:00"},
    "3": {"activo": true, "apertura": "09:00", "cierre": "18:00"},
    "4": {"activo": true, "apertura": "09:00", "cierre": "18:00"},
    "5": {"activo": true, "apertura": "09:00", "cierre": "18:00"},
    "6": {"activo": true, "apertura": "10:00", "cierre": "16:00"},
    "0": {"activo": false, "apertura": "10:00", "cierre": "16:00"}
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. Storage bucket for logos (public read, admin write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS policies
-- Anyone can read logos (public bucket)
CREATE POLICY "Logos are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

-- Only admins can upload logos (verify role via profiles table)
CREATE POLICY "Admins can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admins can update logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admins can delete logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
