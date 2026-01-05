import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { BottomNav } from '@/components/BottomNav';
import { SyncIndicator } from '@/components/SyncIndicator';
import { PhotoCard } from '@/components/PhotoCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Camera, Images } from 'lucide-react';

export default function Photos() {
  const navigate = useNavigate();
  const { queue, isOnline, isSyncing, syncQueue, getSyncStatus } = useOfflineQueue();
  const syncStatus = getSyncStatus();
  const [filter, setFilter] = useState<'all' | 'pending' | 'synced' | 'error'>('all');

  const filteredPhotos = queue.filter(photo => {
    if (filter === 'all') return true;
    if (filter === 'pending') return photo.status === 'pending' || photo.status === 'syncing';
    return photo.status === filter;
  });

  // Sort by date, newest first
  const sortedPhotos = [...filteredPhotos].sort((a, b) => 
    new Date(b.deviceTimestamp).getTime() - new Date(a.deviceTimestamp).getTime()
  );

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
                <h1 className="text-lg font-bold">Minhas Fotos</h1>
                <p className="text-xs text-muted-foreground">{queue.length} fotos no total</p>
              </div>
            </div>
            <SyncIndicator
              isOnline={isOnline}
              isSyncing={isSyncing}
              syncStatus={syncStatus}
              onSync={syncQueue}
            />
          </div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                Todas ({queue.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">
                Pendentes ({syncStatus.pending + syncStatus.syncing})
              </TabsTrigger>
              <TabsTrigger value="synced" className="text-xs">
                Enviadas ({syncStatus.synced})
              </TabsTrigger>
              <TabsTrigger value="error" className="text-xs">
                Erros ({syncStatus.error})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="px-4 py-6">
        {sortedPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Images className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">
              {filter === 'all' ? 'Nenhuma foto ainda' : `Nenhuma foto ${filter === 'pending' ? 'pendente' : filter === 'synced' ? 'enviada' : 'com erro'}`}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filter === 'all' ? 'Capture sua primeira foto para começar.' : 'Tente outro filtro.'}
            </p>
            {filter === 'all' && (
              <Button onClick={() => navigate('/capture')}>
                <Camera className="mr-2 h-4 w-4" />
                Capturar Foto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sortedPhotos.map(photo => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}