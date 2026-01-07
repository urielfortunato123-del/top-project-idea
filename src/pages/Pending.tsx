import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePendingPhotos, useSyncPendingPhotos, useUploadPhoto } from '@/hooks/usePhotos';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useNotifications } from '@/hooks/useNotifications';
import { BottomNav } from '@/components/BottomNav';
import { SyncIndicator } from '@/components/SyncIndicator';
import { PhotoCard } from '@/components/PhotoCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CloudUpload, RefreshCw, Trash2, Image, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clearAllPending, PendingPhoto, deletePendingPhoto, updatePendingPhotoStatus } from '@/lib/indexedDB';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { blobToDataUrl } from '@/lib/imageUtils';
import { appLog } from '@/lib/appLog';

export default function Pending() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { notifySyncComplete } = useNotifications();
  
  const { data: pendingPhotos = [], isLoading } = usePendingPhotos();
  const syncMutation = useSyncPendingPhotos();
  const uploadPhoto = useUploadPhoto();

  const [selectedPhoto, setSelectedPhoto] = useState<PendingPhoto | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const pendingCount = pendingPhotos.filter(p => p.status === 'pending').length;
  const errorCount = pendingPhotos.filter(p => p.status === 'error').length;

  // Load preview when a photo is selected
  useEffect(() => {
    if (selectedPhoto) {
      blobToDataUrl(selectedPhoto.imageBlob).then(setPreviewUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedPhoto]);

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

  const handleRetryOne = async (photo: PendingPhoto) => {
    if (!user || !isOnline) return;

    setIsRetrying(true);
    appLog.info('[Pending] Retry individual', { photoId: photo.id });

    try {
      await updatePendingPhotoStatus(photo.id, 'uploading');
      queryClient.invalidateQueries({ queryKey: ['pending_photos'] });

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      await uploadPhoto.mutateAsync({
        companySlug: 'manual',
        companyName: photo.companyName,
        projectName: photo.projectName,
        frenteServico: photo.frenteServico || '',
        templateId: photo.templateId,
        activityText: photo.activityText,
        deviceTimestamp: new Date(photo.deviceTimestamp),
        latitude: photo.latitude,
        longitude: photo.longitude,
        accuracy: photo.accuracy,
        imageBlob: photo.imageBlob,
        showStamp: photo.showStamp,
        userName: profile?.full_name || 'unknown',
        userId: user.id,
      });

      await deletePendingPhoto(photo.id);
      queryClient.invalidateQueries({ queryKey: ['pending_photos'] });
      setSelectedPhoto(null);

      toast({
        title: 'Foto enviada!',
        description: 'Sincronização individual concluída.',
      });

      appLog.info('[Pending] Retry OK', { photoId: photo.id });
    } catch (error) {
      appLog.error('[Pending] Retry falhou', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      await updatePendingPhotoStatus(photo.id, 'error', message);
      queryClient.invalidateQueries({ queryKey: ['pending_photos'] });

      toast({
        title: 'Falha no envio',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsRetrying(false);
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

  const handleDeleteOne = async (photo: PendingPhoto) => {
    await deletePendingPhoto(photo.id);
    queryClient.invalidateQueries({ queryKey: ['pending_photos'] });
    setSelectedPhoto(null);
    toast({ title: 'Foto removida' });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="glass-header sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate('/dashboard')}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-display font-bold">Fotos Pendentes</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{pendingPhotos.length} foto(s)</span>
                  {errorCount > 0 && (
                    <span className="text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errorCount} erro(s)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <SyncIndicator
              isOnline={isOnline}
              isSyncing={syncMutation.isPending}
              pendingCount={pendingCount + errorCount}
              onSync={handleSync}
            />
          </div>

          {/* Action buttons */}
          {pendingPhotos.length > 0 && (
            <div className="flex gap-2">
              <Button
                className="flex-1 rounded-xl"
                onClick={handleSync}
                disabled={!isOnline || syncMutation.isPending || (pendingCount + errorCount) === 0}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                Sincronizar Todas
              </Button>
              <Button variant="destructive" size="icon" className="rounded-xl" onClick={handleClearAll}>
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
            <div className="p-4 rounded-full bg-success/20 mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-display font-medium mb-1">Tudo sincronizado!</h3>
            <p className="text-sm text-muted-foreground">
              Nenhuma foto pendente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {pendingPhotos.map(photo => (
              <div key={photo.id} onClick={() => setSelectedPhoto(photo)}>
                <PhotoCard photo={photo} isPending onRetry={handleRetryOne} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Photo Detail Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="font-display">Detalhes da Foto</DialogTitle>
          </DialogHeader>
          
          {selectedPhoto && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="aspect-square bg-black/20 relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-muted-foreground animate-pulse" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empresa</span>
                  <span className="font-medium">{selectedPhoto.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projeto</span>
                  <span className="font-medium">{selectedPhoto.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frente</span>
                  <span className="font-medium">{selectedPhoto.frenteServico || 'Geral'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${selectedPhoto.status === 'error' ? 'text-destructive' : ''}`}>
                    {selectedPhoto.status === 'pending' ? 'Pendente' : 
                     selectedPhoto.status === 'uploading' ? 'Enviando...' : 'Erro'}
                  </span>
                </div>
                {selectedPhoto.errorMessage && (
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
                    {selectedPhoto.errorMessage}
                  </div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tamanho</span>
                  <span>{(selectedPhoto.imageBlob.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-2 flex gap-2">
                <Button
                  variant="destructive"
                  className="flex-1 rounded-xl"
                  onClick={() => handleDeleteOne(selectedPhoto)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover
                </Button>
                <Button
                  className="flex-1 rounded-xl"
                  onClick={() => handleRetryOne(selectedPhoto)}
                  disabled={!isOnline || isRetrying}
                >
                  {isRetrying ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CloudUpload className="mr-2 h-4 w-4" />
                  )}
                  Reenviar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
