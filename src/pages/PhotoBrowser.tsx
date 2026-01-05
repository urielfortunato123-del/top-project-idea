import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAllPhotosWithMeta, buildPhotoTree } from '@/hooks/usePhotoTree';
import { BottomNav } from '@/components/BottomNav';
import { PhotoTreeView } from '@/components/PhotoTreeView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, FolderTree, Search, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function PhotoBrowser() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: photos = [], isLoading } = useAllPhotosWithMeta();
  
  // Filter photos by search term
  const filteredPhotos = useMemo(() => {
    if (!searchTerm.trim()) return photos;
    const lower = searchTerm.toLowerCase();
    return photos.filter(p =>
      p.company_name.toLowerCase().includes(lower) ||
      p.project_name.toLowerCase().includes(lower) ||
      p.user_name.toLowerCase().includes(lower) ||
      p.template_name?.toLowerCase().includes(lower) ||
      p.activity_text?.toLowerCase().includes(lower)
    );
  }, [photos, searchTerm]);
  
  // Build tree
  const tree = useMemo(() => buildPhotoTree(filteredPhotos), [filteredPhotos]);
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Acesso restrito a administradores
            </p>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-primary" />
                Árvore de Fotos
              </h1>
              <p className="text-xs text-muted-foreground">
                {photos.length} foto(s) organizadas por estrutura
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por empresa, projeto, colaborador..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mb-4">
                {filteredPhotos.length} resultado(s) para "{searchTerm}"
              </p>
            )}
            <PhotoTreeView nodes={tree} />
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
