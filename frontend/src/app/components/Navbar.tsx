import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { ThemeToggle } from '@/app/components/ui/theme-toggle';
import { User } from '@/types';
import { useNegocio } from '@/context/NegocioContext';

interface NavbarProps {
  user: User;
}

/** Slim top navbar: logo + negocio · theme toggle · user. Nav lives in AppShell. */
export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const { negocio } = useNegocio();

  return (
    <nav className="bg-slate-900 dark:bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          {negocio?.logoUrl ? (
            <img
              src={negocio.logoUrl}
              alt={negocio.nombre}
              className="w-9 h-9 md:w-10 md:h-10 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-brand to-brand-hover rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">✂</span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-white truncate">
              {negocio?.nombre ?? 'Barbería'}
            </h1>
            <p className="hidden sm:block text-xs text-slate-400 truncate">
              {user.rol === 'admin' ? 'Panel de Administración' : 'Panel de Barbero'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-brand" />
          </div>
          <div className="text-right min-w-0 max-w-[140px] sm:max-w-none">
            <p className="text-sm text-white font-medium truncate">{user.nombre}</p>
            <p className="hidden sm:block text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </nav>
  );
};
