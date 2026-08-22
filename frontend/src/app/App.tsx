import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/services/supabase';
import { getMe } from '@/services/api';
import { LoginPage } from '@/app/components/LoginPage';
import { Navbar } from '@/app/components/Navbar';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { BarberDashboard } from '@/app/components/BarberDashboard';
import { Toaster } from '@/app/components/ui/sonner';
import { NegocioProvider } from '@/context/NegocioContext';

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
    <NegocioProvider>
      <div className="min-h-screen">
        <Navbar user={user} onLogout={handleLogout} />
        {user.rol === 'admin' ? (
          <AdminDashboard user={user} />
        ) : (
          <BarberDashboard user={user} />
        )}
        <Toaster />
      </div>
    </NegocioProvider>
  );
}