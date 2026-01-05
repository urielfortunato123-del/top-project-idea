import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStats } from '@/hooks/usePhotoTree';
import { usePhotoRecords } from '@/hooks/usePhotos';
import { BottomNav } from '@/components/BottomNav';
import { BatchOCRPanel } from '@/components/BatchOCRPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  BarChart3, 
  Users, 
  Building2, 
  FolderOpen, 
  Camera, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  FolderTree,
  FileText,
  Loader2
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data: stats, isLoading } = useAdminStats();
  const { data: recentPhotos = [] } = usePhotoRecords();
  
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const processedPercent = stats?.totalPhotos 
    ? Math.round((stats.processedPhotos / stats.totalPhotos) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Dashboard Admin
            </h1>
            <p className="text-xs text-muted-foreground">
              Visão consolidada do sistema
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Overview Stats */}
        <section className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalPhotos || 0}</p>
                <p className="text-xs text-muted-foreground">Total Fotos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.photosToday || 0}</p>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.userCount || 0}</p>
                <p className="text-xs text-muted-foreground">Colaboradores</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Building2 className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.companyCount || 0}</p>
                <p className="text-xs text-muted-foreground">Empresas</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* OCR Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status OCR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processadas</span>
                <span className="font-medium">{processedPercent}%</span>
              </div>
              <Progress value={processedPercent} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
                <p className="text-lg font-bold">{stats?.processedPhotos || 0}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning mx-auto mb-1" />
                <p className="text-lg font-bold">{stats?.pendingPhotos || 0}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
                <p className="text-lg font-bold">{stats?.errorPhotos || 0}</p>
                <p className="text-xs text-muted-foreground">Erros</p>
              </div>
            </div>
            
            {stats?.avgConfidence !== undefined && stats.avgConfidence > 0 && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Confiança média OCR</span>
                <span className={`text-lg font-bold ${
                  stats.avgConfidence >= 80 ? 'text-success' :
                  stats.avgConfidence >= 60 ? 'text-warning' : 'text-destructive'
                }`}>
                  {stats.avgConfidence}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch OCR Reprocessing */}
        <BatchOCRPanel />

        {/* Quick Actions */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Ferramentas Admin
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/photo-browser')}
            >
              <FolderTree className="h-6 w-6" />
              <span className="text-sm">Árvore de Fotos</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/reports')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Relatórios</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/admin')}
            >
              <Building2 className="h-6 w-6" />
              <span className="text-sm">Empresas/Projetos</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/photos')}
            >
              <Camera className="h-6 w-6" />
              <span className="text-sm">Todas as Fotos</span>
            </Button>
          </div>
        </section>

        {/* Recent Photos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fotos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPhotos.slice(0, 6).length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {recentPhotos.slice(0, 6).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/photos/${photo.id}`)}
                  >
                    <img
                      src={photo.file_url}
                      alt="Foto recente"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma foto ainda
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
