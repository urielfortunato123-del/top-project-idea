import { useAuth } from '@/contexts/AuthContext';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { BottomNav } from '@/components/BottomNav';
import { SyncIndicator } from '@/components/SyncIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Images, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { isOnline, isSyncing, syncQueue, getSyncStatus } = useOfflineQueue();
  const syncStatus = getSyncStatus();
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Pendentes',
      value: syncStatus.pending,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Enviadas',
      value: syncStatus.synced,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Erros',
      value: syncStatus.error,
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border pwa-safe-area">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Olá,</p>
              <h1 className="text-xl font-bold">{user?.name}</h1>
            </div>
            <SyncIndicator
              isOnline={isOnline}
              isSyncing={isSyncing}
              syncStatus={syncStatus}
              onSync={syncQueue}
            />
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
              onClick={() => navigate('/photos')}
            >
              <Images className="h-8 w-8" />
              <span className="font-semibold">Minhas Fotos</span>
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Hoje
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

        {/* Recent Activity */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Atividade Recente
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/photos')}>
              Ver todas
            </Button>
          </div>
          <Card className="bg-card">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-full bg-muted mb-3">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Capture sua primeira foto do dia para ver a atividade aqui.
              </p>
              <Button className="mt-4" onClick={() => navigate('/capture')}>
                <Camera className="mr-2 h-4 w-4" />
                Capturar Agora
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}