-- Migration 003: add codigo_pais column to negocio
-- Used by the WhatsApp wa.me flow to normalize local phone numbers
-- (prepends the code only when missing and the number looks local, <= 10 digits).
-- Starts NULL so admins set their own (e.g. '52' for Mexico, '34' for Spain).

ALTER TABLE negocio ADD COLUMN IF NOT EXISTS codigo_pais text;
