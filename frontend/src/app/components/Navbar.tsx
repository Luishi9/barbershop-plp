import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ThemeToggle } from '@/app/components/ui/theme-toggle';
import { SettingsDialog } from '@/app/components/ui/settings-dialog';
import { User } from '@/types';
import { useNegocio } from '@/context/NegocioContext';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const { negocio } = useNegocio();
  const isAdmin = user.rol === 'admin';

  return (
    <nav className="bg-slate-900 dark:bg-slate-900 border-b border-slate-800 dark:border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {negocio?.logoUrl ? (
            <img
              src={negocio.logoUrl}
              alt={negocio.nombre}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-hover rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">✂</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white">{negocio?.nombre ?? 'Barbería'}</h1>
            <p className="text-xs text-slate-400">
              {user.rol === 'admin' ? 'Panel de Administración' : 'Panel de Barbero'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAdmin && <SettingsDialog canEdit={isAdmin} />}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-brand" />
            </div>
            <div className="text-right">
              <p className="text-sm text-white font-medium">{user.nombre}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>
    </nav>
  );
};
