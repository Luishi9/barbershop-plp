/**
 * ResetPasswordPage — landing for the Supabase recovery email link
 * (/reset-password). Exchanges the code/token automatically (detectSessionInUrl),
 * lets the user set a new password, and forces a clean re-login afterwards.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Scissors, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ThemeToggle } from '@/app/components/ui/theme-toggle';
import { supabase } from '@/services/supabase';
import { useNegocio } from '@/context/NegocioContext';

type View = 'waiting' | 'form' | 'success' | 'invalid';

export const ResetPasswordPage: React.FC = () => {
  const { negocio } = useNegocio();
  const [view, setView] = useState<View>('waiting');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ref to read the latest view inside async callbacks without re-subscribing.
  const viewRef = useRef(view);
  viewRef.current = view;

  useEffect(() => {
    // Supabase-js exchanges the recovery link automatically and emits this event.
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setView('form');
    });

    // Fallback: implicit-flow links or an already-active session also allow the form.
    const timer = setTimeout(async () => {
      if (viewRef.current !== 'waiting') return;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        setView(sessionData.session ? 'form' : 'invalid');
      } catch {
        setView('invalid');
      }
    }, 2000);

    return () => {
      data.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  /** Updates the password, then signs out to force a clean re-login. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) {
        setError(updateErr.message);
        return;
      }
      await supabase.auth.signOut();
      setView('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-slate-900/80 backdrop-blur-sm border-slate-800">
        <CardHeader className="text-center space-y-2">
          {negocio?.logoUrl ? (
            <img
              src={negocio.logoUrl}
              alt={negocio.nombre}
              className="mx-auto w-16 h-16 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-brand to-brand-hover rounded-full flex items-center justify-center mb-2">
              <Scissors className="w-8 h-8 text-white" />
            </div>
          )}
          <CardTitle className="text-2xl text-white">Restablecer contraseña</CardTitle>
          <CardDescription className="text-slate-400">{negocio?.nombre ?? 'Barbería'}</CardDescription>
        </CardHeader>

        <CardContent>
          {view === 'waiting' && (
            <p className="text-sm text-slate-400 text-center py-6">Verificando enlace…</p>
          )}

          {view === 'invalid' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                El enlace no es válido o ya expiró. Solicita uno nuevo desde el inicio de sesión.
              </div>
              <Button
                type="button"
                onClick={goLogin}
                className="w-full bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand-hover text-white"
              >
                Volver al inicio de sesión
              </Button>
            </div>
          )}

          {view === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-slate-300">Nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-slate-300">Confirmar contraseña</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand-hover text-white"
              >
                {loading ? 'Guardando...' : 'Actualizar contraseña'}
              </Button>
            </form>
          )}

          {view === 'success' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.
              </div>
              <Button
                type="button"
                onClick={goLogin}
                className="w-full bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand-hover text-white"
              >
                Ir a iniciar sesión
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
