import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePendingPhotos, useSyncPendingPhotos } from '@/hooks/usePhotos';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { BottomNav } from '@/components/BottomNav';
import { SyncIndicator } from '@/components/SyncIndicator';
import { PhotoCard } from '@/components/PhotoCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CloudUpload, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clearAllPending } from '@/lib/indexedDB';
import { useQueryClient } from '@tanstack/react-query';

export default function Pending() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: pendingPhotos = [], isLoading } = usePendingPhotos();
  const syncMutation = useSyncPendingPhotos();

  const pendingCount = pendingPhotos.filter(p => p.status === 'pending' || p.status === 'error').length;

  const handleSync = async () => {
    if (!user) return;
    
    try {
      const results = await syncMutation.mutateAsync(user.id);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

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

  const handleClearAll = async () => {
    if (confirm('Tem certeza que deseja limpar todas as fotos pendentes? Esta ação não pode ser desfeita.')) {
      await clearAllPending();
      queryClient.invalidateQueries({ queryKey: ['pending_photos'] });
      toast({
        title: 'Fotos removidas',
        description: 'Todas as fotos pendentes foram removidas.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">Fotos Pendentes</h1>
                <p className="text-xs text-muted-foreground">{pendingPhotos.length} foto(s) salvas localmente</p>
              </div>
            </div>
            <SyncIndicator
              isOnline={isOnline}
              isSyncing={syncMutation.isPending}
              pendingCount={pendingCount}
              onSync={handleSync}
            />
          </div>

          {/* Action buttons */}
          {pendingPhotos.length > 0 && (
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleSync}
                disabled={!isOnline || syncMutation.isPending || pendingCount === 0}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                Sincronizar Todas
              </Button>
              <Button variant="destructive" size="icon" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        ) : pendingPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <CloudUpload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Nenhuma foto pendente</h3>
            <p className="text-sm text-muted-foreground">
              Todas as fotos foram sincronizadas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {pendingPhotos.map(photo => (
              <PhotoCard key={photo.id} photo={photo} isPending />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}