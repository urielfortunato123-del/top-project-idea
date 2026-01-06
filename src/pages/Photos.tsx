import { useNavigate } from 'react-router-dom';
import { usePhotoRecords } from '@/hooks/usePhotos';
import { BottomNav } from '@/components/BottomNav';
import { PhotoCard } from '@/components/PhotoCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Camera, Images } from 'lucide-react';

export default function Photos() {
  const navigate = useNavigate();
  const { data: photos = [], isLoading } = usePhotoRecords();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Minhas Fotos</h1>
              <p className="text-xs text-muted-foreground">{photos.length} foto(s) no servidor</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Images className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Nenhuma foto ainda</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Capture sua primeira foto para começar.
            </p>
            <Button onClick={() => navigate('/capture')}>
              <Camera className="mr-2 h-4 w-4" />
              Capturar Foto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map(photo => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}