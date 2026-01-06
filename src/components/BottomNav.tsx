import { NavLink, useLocation } from 'react-router-dom';
import { Home, Camera, Images, User, Settings, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function BottomNav() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Início' },
    { to: '/capture', icon: Camera, label: 'Capturar' },
    { to: '/photos', icon: Images, label: 'Fotos' },
    { to: '/pending', icon: Clock, label: 'Pendentes' },
    ...(isAdmin ? [{ to: '/photo-map', icon: MapPin, label: 'Mapa' }] : []),
    ...(isAdmin ? [{ to: '/admin', icon: Settings, label: 'Admin' }] : []),
    { to: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="glass-nav pwa-safe-area">
      <div className="flex items-center justify-around h-18 py-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-2xl transition-all duration-300',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div
                className={cn(
                  'p-2.5 rounded-2xl transition-all duration-300',
                  isActive 
                    ? 'bg-primary/20 shadow-glow scale-110' 
                    : 'hover:bg-secondary/50'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all duration-300',
                    isActive && 'drop-shadow-[0_0_8px_hsl(217,91%,60%)]'
                  )}
                />
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-all duration-300',
                isActive && 'text-gradient font-semibold'
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
