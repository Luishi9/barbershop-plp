/**
 * useRoles — loads the role→modules permission matrix once and exposes it.
 * Falls back to safe defaults when the API is unreachable or not migrated,
 * so the app shell never breaks because of this hook.
 */
import { useCallback, useEffect, useState } from 'react';
import type { ModuloKey } from '@/types';
import { getRoles } from '@/services/api';

export const DEFAULT_MODULES: Record<string, ModuloKey[]> = {
  admin: ['dashboard', 'citas', 'barberos', 'servicios', 'clientes'],
  barbero: ['dashboard', 'citas'],
};

export function useRoles() {
  const [modulosByRol, setModulosByRol] =
    useState<Record<string, ModuloKey[]>>(DEFAULT_MODULES);

  const refresh = useCallback(async () => {
    try {
      const list = await getRoles();
      const map: Record<string, ModuloKey[]> = { ...DEFAULT_MODULES };
      for (const row of list) map[row.rol] = row.modulos;
      setModulosByRol(map);
    } catch {
      // Keep defaults — table may not exist yet or request failed.
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { modulosByRol, refresh };
}
