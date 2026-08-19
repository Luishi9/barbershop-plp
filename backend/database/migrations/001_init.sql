-- Enable the pgcrypto extension to enable UUID generation functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (User profiles linked to Supabase Auth)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  email text NOT NULL UNIQUE,
  rol text NOT NULL CHECK (rol IN ('admin', 'barbero')),
  telefono text,
  avatar text,
  especialidad text, -- Only for barberos
  disponibilidad jsonb DEFAULT '[]'::jsonb, -- Only for barberos
  created_at timestamptz DEFAULT now()
);

-- 2. Clientes Table
CREATE TABLE clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  telefono text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

-- 3. Servicios Table
CREATE TABLE servicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  duracion int NOT NULL, -- minutes
  precio numeric(10,2) NOT NULL,
  descripcion text,
  created_at timestamptz DEFAULT now()
);

-- 4. Citas Table
CREATE TABLE citas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  barbero_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  servicio_id uuid NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  hora time NOT NULL,
  estado text NOT NULL CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

-- Basic Policies: Only authenticated users can read ( Backend will use service_role to bypass )
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clientes are viewable by authenticated users" ON clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Servicios are viewable by authenticated users" ON servicios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Citas are viewable by authenticated users" ON citas FOR SELECT TO authenticated USING (true);
