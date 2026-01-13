import { NavLink, useLocation } from 'react-router-dom';
import { Home, Camera, Images, User, Settings, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/LanguageContext';
import { memo, useMemo } from 'react';

export const BottomNav = memo(function BottomNav() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const navItems = useMemo(() => [
    { to: '/dashboard', icon: Home, label: t.nav.home },
    { to: '/capture', icon: Camera, label: t.nav.capture },
    { to: '/photos', icon: Images, label: t.nav.photos },
    { to: '/pending', icon: Clock, label: t.nav.pending },
    ...(isAdmin ? [{ to: '/photo-map', icon: MapPin, label: t.nav.map }] : []),
    ...(isAdmin ? [{ to: '/admin', icon: Settings, label: t.nav.admin }] : []),
    { to: '/profile', icon: User, label: t.nav.profile },
  ], [isAdmin, t]);

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
