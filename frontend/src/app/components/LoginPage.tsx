import React, { useState } from 'react';
import { Scissors, Lock, Mail } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ThemeToggle } from '@/app/components/ui/theme-toggle';
import { User } from '@/types';
import { supabase } from '@/services/supabase';
import { getMe } from '@/services/api';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        return;
      }
      const me = await getMe();
      onLogin(me);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const loginRapido = (userEmail: string) => {
    // Solo rellena el email; la contraseña no se hardcodea.
    setEmail(userEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTQgMTZ2Mmgydi0yaC0yem00LTB2Mmgydi0yaC0yem00IDB2Mmgydi0yaC0yem00IDB2Momgydi0yaC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

      <Card className="w-full max-w-md relative z-10 bg-slate-900/80 backdrop-blur-sm border-slate-800">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-brand to-brand-hover rounded-full flex items-center justify-center mb-2">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl text-white">Barbería Elite</CardTitle>
          <CardDescription className="text-slate-400">
            Sistema de Gestión de Citas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
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
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 space-y-2">
            <p className="text-xs text-slate-500 text-center">Acceso rápido de demostración:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginRapido('admin@barberia.com')}
                className="border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginRapido('miguel@barberia.com')}
                className="border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Barbero
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};