import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePendingPhotos, usePhotoRecords, useSyncPendingPhotos } from '@/hooks/usePhotos';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useNotifications } from '@/hooks/useNotifications';
import { useGeolocation } from '@/hooks/useGeolocation';
import { BottomNav } from '@/components/BottomNav';
import { SyncIndicator } from '@/components/SyncIndicator';
import { NotificationToggle } from '@/components/NotificationToggle';
import { Button } from '@/components/ui/button';
import { Camera, Images, Clock, CheckCircle, AlertCircle, CloudUpload, RefreshCw, BarChart3, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const { notifySyncComplete } = useNotifications();
  const { getPosition } = useGeolocation();
  
  const { data: pendingPhotos = [] } = usePendingPhotos();
  const { data: photoRecords = [] } = usePhotoRecords();
  const syncMutation = useSyncPendingPhotos();

  useEffect(() => {
    const timer = setTimeout(() => {
      getPosition();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [getPosition]);

  const pendingCount = pendingPhotos.filter(p => p.status === 'pending' || p.status === 'error').length;
  const uploadedCount = photoRecords.length;
  const errorCount = pendingPhotos.filter(p => p.status === 'error').length;

  const handleSync = async () => {
    if (!user) return;
    
    try {
      const results = await syncMutation.mutateAsync(user.id);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      notifySyncComplete(results.length, failCount);

      if (successCount > 0) {
        toast({
          title: 'Sincronização concluída',
          description: `${successCount} foto(s) enviada(s) com sucesso.`,
        });
      }
      if (failCount > 0) {
        toast({
          title: 'Algumas fotos falharam',
          description: `${failCount} foto(s) não puderam ser enviadas.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar as fotos.',
        variant: 'destructive',
      });
    }
  };

  const stats = [
    {
      label: 'Pendentes',
      value: pendingCount,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      bgGlow: 'shadow-[0_0_20px_hsl(38,92%,50%,0.3)]',
    },
    {
      label: 'Enviadas',
      value: uploadedCount,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
      bgGlow: 'shadow-[0_0_20px_hsl(160,84%,39%,0.3)]',
    },
    {
      label: 'Erros',
      value: errorCount,
      icon: AlertCircle,
      gradient: 'from-red-500 to-rose-500',
      bgGlow: 'shadow-[0_0_20px_hsl(0,84%,60%,0.3)]',
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="glass-header">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <p className="text-sm text-muted-foreground">Olá,</p>
              <h1 className="text-xl font-display font-bold text-gradient">{profile?.full_name || user?.email}</h1>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-xs text-accent font-medium mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Administrador
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <NotificationToggle />
              <SyncIndicator
                isOnline={isOnline}
                isSyncing={syncMutation.isPending}
                pendingCount={pendingCount}
                onSync={handleSync}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <section className="space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              className="h-auto py-6 flex-col gap-3 capture-btn rounded-2xl border-0 animate-pulse-glow"
              onClick={() => navigate('/capture')}
            >
              <div className="p-3 rounded-xl bg-white/20">
                <Camera className="h-7 w-7" />
              </div>
              <span className="font-display font-semibold">Nova Foto</span>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-auto py-6 flex-col gap-3 glass-card rounded-2xl border-0 hover:scale-[1.02] transition-transform"
              onClick={() => navigate('/pending')}
            >
              <div className="p-3 rounded-xl bg-warning/20">
                <CloudUpload className="h-7 w-7 text-warning" />
              </div>
              <span className="font-display font-semibold">Pendentes ({pendingCount})</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="outline"
              className="h-auto py-4 flex-col gap-2 glass-card rounded-2xl border-border/50 hover:scale-[1.02] transition-transform"
              onClick={handleSync}
              disabled={!isOnline || pendingCount === 0 || syncMutation.isPending}
            >
              <RefreshCw className={`h-5 w-5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Sincronizar</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-auto py-4 flex-col gap-2 glass-card rounded-2xl border-border/50 hover:scale-[1.02] transition-transform"
              onClick={() => navigate('/photos')}
            >
              <Images className="h-5 w-5" />
              <span className="text-sm font-medium">Minhas Fotos</span>
            </Button>
          </div>

          {isAdmin && (
            <Button
              size="lg"
              variant="secondary"
              className="w-full h-auto py-4 flex-row gap-3 glass-card rounded-2xl border-0 hover:scale-[1.01] transition-transform"
              onClick={() => navigate('/admin-dashboard')}
            >
              <div className="p-2 rounded-xl bg-accent/20">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
              <span className="font-display font-semibold">Painel Administrativo</span>
            </Button>
          )}
        </section>

        {/* Stats */}
        <section className="space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Resumo
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.label} 
                  className={`stat-card ${stat.bgGlow}`}
                  style={{ animationDelay: `${(index + 3) * 100}ms` }}
                >
                  <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} mb-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl font-display font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Offline Banner */}
        {!isOnline && (
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 animate-slide-up border-warning/30">
            <div className="p-3 rounded-xl bg-warning/20">
              <WifiOff className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm">Modo Offline</p>
              <p className="text-xs text-muted-foreground">
                Suas fotos serão sincronizadas quando houver conexão.
              </p>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
