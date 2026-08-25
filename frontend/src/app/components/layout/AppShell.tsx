/**
 * AppShell — responsive application layout.
 * Desktop (≥lg): fixed left sidebar with module navigation + Salir at bottom.
 * Mobile (<lg): slim top navbar + fixed bottom icon-only navigation bar.
 * The visible items are filtered by the role permission matrix (RBAC).
 */
import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Scissors,
  Settings as SettingsIcon,
  Sparkles,
  Users,
} from 'lucide-react';
import type { ModuloKey, User } from '@/types';
import { useRoles } from '@/hooks/useRoles';
import { Navbar } from '@/app/components/Navbar';
import { SettingsDialog } from '@/app/components/ui/settings-dialog';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { BarberDashboard } from '@/app/components/BarberDashboard';
import { BarberCitas } from '@/app/components/BarberCitas';
import { AdminAppointments } from '@/app/components/admin/AdminAppointments';
import { AdminBarbers } from '@/app/components/admin/AdminBarbers';
import { AdminServices } from '@/app/components/admin/AdminServices';
import { AdminClients } from '@/app/components/admin/AdminClients';

interface NavItem {
  key: ModuloKey;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'citas', label: 'Citas', icon: CalendarDays },
  { key: 'barberos', label: 'Barberos', icon: Scissors },
  { key: 'servicios', label: 'Servicios', icon: Sparkles },
  { key: 'clientes', label: 'Clientes', icon: Users },
];

interface AppShellProps {
  user: User;
  onLogout: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ user, onLogout }) => {
  const isAdmin = user.rol === 'admin';
  const { modulosByRol, refresh: refreshRoles } = useRoles();
  const allowed = modulosByRol[user.rol] ?? [];

  const [section, setSection] = useState<ModuloKey>('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Guard: if the active section loses permission, jump to the first allowed one.
  useEffect(() => {
    if (!allowed.includes(section) && allowed.length > 0) {
      setSection(allowed[0]);
    }
  }, [allowed, section]);

  const items = NAV_ITEMS.filter((item) => allowed.includes(item.key));
  const activeLabel =
    NAV_ITEMS.find((i) => i.key === section)?.label ?? 'Dashboard';

  const handleNav = (key: string) => {
    if (key === 'configuracion') {
      if (isAdmin) setSettingsOpen(true);
      return;
    }
    if (key === 'salir') {
      onLogout();
      return;
    }
    setSection(key as ModuloKey);
  };

  const renderSection = () => {
    switch (section) {
      case 'citas':
        return isAdmin ? <AdminAppointments onUpdate={() => {}} /> : <BarberCitas user={user} />;
      case 'barberos':
        return <AdminBarbers />;
      case 'servicios':
        return <AdminServices />;
      case 'clientes':
        return <AdminClients />;
      default:
        return isAdmin ? <AdminDashboard user={user} /> : <BarberDashboard user={user} />;
    }
  };

  /** Shared classes for a nav button in both sidebar and bottom bar. */
  const isActive = (item: NavItem) => section === item.key;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar user={user} />

      <div className="flex">
        {/* ── Sidebar (desktop only) ─────────────────────────────── */}
        <aside
          aria-label="Navegación principal"
          className="hidden lg:flex flex-col sticky top-0 h-screen w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 gap-1"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-gradient-to-r from-brand to-brand-hover text-white shadow'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => handleNav('configuracion')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                settingsOpen
                  ? 'bg-gradient-to-r from-brand to-brand-hover text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <SettingsIcon className="w-4 h-4 shrink-0" />
              Configuración
            </button>
          )}

          {/* Salir — bottom of the sidebar */}
          <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleNav('salir')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Salir
            </button>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────────── */}
        <main className="flex-1 min-w-0 w-full max-w-7xl mx-auto p-4 md:p-6 pb-24 lg:pb-8">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6">
            {activeLabel}
          </h1>
          {renderSection()}
        </main>
      </div>

      {/* ── Bottom nav (mobile only) ─────────────────────────────── */}
      <nav
        aria-label="Navegación móvil"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      >
        <div
          className="flex items-stretch"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                  active
                    ? 'text-brand'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="truncate max-w-full px-0.5">{item.label}</span>
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => handleNav('configuracion')}
              aria-label="Configuración"
              className="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <SettingsIcon className="w-5 h-5" />
              <span className="truncate max-w-full px-0.5">Config.</span>
            </button>
          )}

          <button
            onClick={() => handleNav('salir')}
            aria-label="Salir"
            className="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-red-600 dark:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="truncate max-w-full px-0.5">Salir</span>
          </button>
        </div>
      </nav>

      <SettingsDialog
        canEdit={isAdmin}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        roles={modulosByRol}
        onRolesSaved={refreshRoles}
      />
    </div>
  );
};
