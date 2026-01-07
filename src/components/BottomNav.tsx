import { NavLink, useLocation } from 'react-router-dom';
import { Home, Camera, Images, User, Settings, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { memo, useMemo } from 'react';

export const BottomNav = memo(function BottomNav() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = useMemo(() => [
    { to: '/dashboard', icon: Home, label: 'Início' },
    { to: '/capture', icon: Camera, label: 'Capturar' },
    { to: '/photos', icon: Images, label: 'Fotos' },
    { to: '/pending', icon: Clock, label: 'Pendentes' },
    ...(isAdmin ? [{ to: '/photo-map', icon: MapPin, label: 'Mapa' }] : []),
    ...(isAdmin ? [{ to: '/admin', icon: Settings, label: 'Admin' }] : []),
    { to: '/profile', icon: User, label: 'Perfil' },
  ], [isAdmin]);

  return (
    <nav className="glass-nav pwa-safe-area">
      <div className="flex items-center justify-around h-18 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-2xl',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'p-2.5 rounded-2xl',
                  isActive && 'bg-primary/20'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                'text-[10px] font-medium',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
});
