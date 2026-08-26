import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/services/supabase';
import { getMe } from '@/services/api';
import { LoginPage } from '@/app/components/LoginPage';
import { ResetPasswordPage } from '@/app/components/ResetPasswordPage';
import { AppShell } from '@/app/components/layout/AppShell';
import { Toaster } from '@/app/components/ui/sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore an existing session on first load.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        getMe()
          .then(setUser)
          .catch(() => supabase.auth.signOut())
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Keep the profile in sync with the auth lifecycle.
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        getMe()
          .then(setUser)
          .catch(() => setUser(null));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Standalone route: landing of the Supabase recovery email.
  // Must come after all hooks (they always run; this only changes the render).
  if (window.location.pathname === '/reset-password') {
    return <ResetPasswordPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-slate-400 text-sm">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <AppShell user={user} onLogout={handleLogout} />
      <Toaster />
    </>
  );
}
