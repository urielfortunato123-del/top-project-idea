import { useAuth } from '@/contexts/AuthContext';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building2, 
  LogOut, 
  Camera, 
  HardHat, 
  ChevronRight,
  Smartphone,
  Shield,
  Bell
} from 'lucide-react';
import { COMPANIES } from '@/data/mockData';

export default function Profile() {
  const { user, logout } = useAuth();
  const { getSyncStatus } = useOfflineQueue();
  const syncStatus = getSyncStatus();
  const navigate = useNavigate();

  const company = COMPANIES.find(c => c.id === user?.companyId);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: Bell, label: 'Notificações', action: () => {} },
    { icon: Smartphone, label: 'Dispositivos', action: () => {} },
    { icon: Shield, label: 'Segurança', action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with avatar */}
      <header className="bg-gradient-to-b from-primary/10 to-background pt-8 pb-6 px-4">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-glow">
              <User className="h-12 w-12 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-md border-2 border-background">
              <HardHat className="h-4 w-4 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-xl font-bold">{user?.name}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
            {user?.role}
          </span>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Company Card */}
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-secondary">
              <Building2 className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Empresa</p>
              <p className="font-medium">{company?.name}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{syncStatus.synced + syncStatus.pending + syncStatus.error}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{syncStatus.synced}</p>
              <p className="text-xs text-muted-foreground">Enviadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{syncStatus.pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  <button
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {index < menuItems.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair da Conta
        </Button>

        {/* App Info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>ObraPhoto Mobile v1.0.0</p>
          <p>PWA • Registro Técnico de Campo</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}