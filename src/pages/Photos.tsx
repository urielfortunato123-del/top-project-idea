import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotoRecords } from '@/hooks/usePhotos';
import { useAuth } from '@/hooks/useAuth';
import { BottomNav } from '@/components/BottomNav';
import { PhotoCard } from '@/components/PhotoCard';
import { FolderTreeView, buildUserPhotoTree } from '@/components/FolderTreeView';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Camera, Images, Loader2, Grid3X3, FolderTree } from 'lucide-react';

type ViewMode = 'grid' | 'tree';

export default function Photos() {
  const navigate = useNavigate();
  const { data: photos = [], isLoading } = usePhotoRecords();
  const { profile } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('tree');

  // Build the folder tree structure
  const photoTree = useMemo(() => {
    if (!photos.length || !profile?.full_name) return [];
    return buildUserPhotoTree(photos, profile.full_name);
  }, [photos, profile?.full_name]);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="glass-header">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl hover:bg-secondary/50"
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="animate-fade-in flex-1">
              <h1 className="text-lg font-display font-bold">Minhas Fotos</h1>
              <p className="text-xs text-muted-foreground">{photos.length} foto(s) no servidor</p>
            </div>
            
            {/* View Toggle */}
            {photos.length > 0 && (
              <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                <Button
                  variant={viewMode === 'tree' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('tree')}
                  title="Visualização em pastas"
                >
                  <FolderTree className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                  title="Visualização em grade"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="p-4 rounded-2xl bg-primary/10 mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Carregando fotos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-slide-up">
            <div className="p-5 rounded-2xl glass-card mb-5">
              <Images className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Nenhuma foto ainda</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
              Capture sua primeira foto para começar a documentar.
            </p>
            <Button 
              onClick={() => navigate('/capture')}
              className="capture-btn rounded-xl px-6"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capturar Foto
            </Button>
          </div>
        ) : viewMode === 'tree' ? (
          <div className="animate-fade-in">
            <FolderTreeView nodes={photoTree} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 animate-fade-in">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PhotoCard photo={photo} />
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
