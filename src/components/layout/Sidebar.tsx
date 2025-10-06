import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  ChefHat,
  Wine,
  DollarSign,
  BookOpen,
  Package,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  permissions?: string[];
  badge?: number;
  iconColor: string;
}

const menuItems: SidebarMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', iconColor: 'text-blue-400' },
  { id: 'balcao', label: 'Balcão', icon: ShoppingBag, path: '/balcao', iconColor: 'text-amber-400' },
  { id: 'mesas', label: 'Mesas', icon: Utensils, path: '/mesas', iconColor: 'text-emerald-400' },
  { id: 'cozinha', label: 'Cozinha', icon: ChefHat, path: '/cozinha', iconColor: 'text-red-400' },
  { id: 'bar', label: 'Bar', icon: Wine, path: '/bar', iconColor: 'text-purple-400' },
  { id: 'caixa', label: 'Caixa', icon: DollarSign, path: '/caixa', iconColor: 'text-teal-400' },
  { id: 'cardapio', label: 'Cardápio', icon: BookOpen, path: '/cardapio', iconColor: 'text-orange-400' },
  { id: 'estoque', label: 'Estoque', icon: Package, path: '/estoque', iconColor: 'text-indigo-400' },
  { id: 'clientes', label: 'Clientes', icon: Users, path: '/clientes', iconColor: 'text-pink-400' },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3, path: '/relatorios', iconColor: 'text-cyan-400' },
  { id: 'configuracoes', label: 'Configurações', icon: Settings, path: '/configuracoes', iconColor: 'text-slate-400' },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white shadow-lg hover:bg-slate-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-slate-900 transition-all duration-300 z-40 flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <span className="font-display font-bold text-lg text-white">
                EasyComand
              </span>
            </div>
          )}
          {isCollapsed && (
            <span className="text-2xl mx-auto">🍽️</span>
          )}
          <button
            onClick={toggleCollapse}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                      isActive
                        ? "bg-slate-800 text-white font-medium"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        item.iconColor
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-semibold rounded-full bg-accent-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-slate-800 p-4">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email?.split('@')[0] || 'Usuário'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
