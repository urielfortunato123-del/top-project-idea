import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePendingPhotos, usePhotoRecords, useSyncPendingPhotos } from '@/hooks/usePhotos';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useNotifications } from '@/hooks/useNotifications';
import { BottomNav } from '@/components/BottomNav';
import { SyncIndicator } from '@/components/SyncIndicator';
import { NotificationToggle } from '@/components/NotificationToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Images, Clock, CheckCircle, AlertCircle, CloudUpload, RefreshCw, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const { notifySyncComplete } = useNotifications();
  
  const { data: pendingPhotos = [] } = usePendingPhotos();
  const { data: photoRecords = [] } = usePhotoRecords();
  const syncMutation = useSyncPendingPhotos();

  const pendingCount = pendingPhotos.filter(p => p.status === 'pending' || p.status === 'error').length;
  const uploadedCount = photoRecords.length;
  const errorCount = pendingPhotos.filter(p => p.status === 'error').length;

  const handleSync = async () => {
    if (!user) return;
    
    try {
      const results = await syncMutation.mutateAsync(user.id);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      // Send push notification
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
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Enviadas',
      value: uploadedCount,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Erros',
      value: errorCount,
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground">Olá,</p>
              <h1 className="text-xl font-bold">{profile?.full_name || user?.email}</h1>
              {isAdmin && (
                <span className="text-xs text-primary font-medium">Administrador</span>
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
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              className="h-auto py-6 flex-col gap-2 capture-btn animate-pulse-glow"
              onClick={() => navigate('/capture')}
            >
              <Camera className="h-8 w-8" />
              <span className="font-semibold">Nova Foto</span>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-auto py-6 flex-col gap-2"
              onClick={() => navigate('/pending')}
            >
              <CloudUpload className="h-8 w-8" />
              <span className="font-semibold">Pendentes ({pendingCount})</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={handleSync}
              disabled={!isOnline || pendingCount === 0 || syncMutation.isPending}
            >
              <RefreshCw className={`h-6 w-6 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              <span className="text-sm">Sincronizar</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/photos')}
            >
              <Images className="h-6 w-6" />
              <span className="text-sm">Minhas Fotos</span>
            </Button>
          </div>

          {isAdmin && (
            <Button
              size="lg"
              variant="secondary"
              className="w-full h-auto py-4 flex-row gap-3"
              onClick={() => navigate('/admin-dashboard')}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="font-semibold">Painel Administrativo</span>
            </Button>
          )}
        </section>

        {/* Stats */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Resumo
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="bg-card">
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-2`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Offline Banner */}
        {!isOnline && (
          <Card className="bg-warning/10 border-warning/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-sm">Modo Offline</p>
                <p className="text-xs text-muted-foreground">
                  Suas fotos serão sincronizadas quando houver conexão.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}