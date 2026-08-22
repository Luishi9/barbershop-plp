/**
 * Negocio context: loads the singleton business config once after login and
 * exposes it via a React context. Children re-render automatically when it
 * changes (after an update from the Settings dialog).
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Negocio, NegocioUpdate } from '@/types';
import { getNegocio, updateNegocio } from '@/services/api';

interface NegocioContextValue {
  negocio: Negocio | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: (input: NegocioUpdate) => Promise<Negocio>;
}

const NegocioContext = createContext<NegocioContextValue | undefined>(undefined);

export const NegocioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNegocio();
      setNegocio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando configuración');
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (input: NegocioUpdate) => {
    const updated = await updateNegocio(input);
    setNegocio(updated);
    return updated;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <NegocioContext.Provider value={{ negocio, loading, error, refresh, save }}>
      {children}
    </NegocioContext.Provider>
  );
};

export function useNegocio(): NegocioContextValue {
  const ctx = useContext(NegocioContext);
  if (!ctx) throw new Error('useNegocio debe usarse dentro de <NegocioProvider>');
  return ctx;
}
