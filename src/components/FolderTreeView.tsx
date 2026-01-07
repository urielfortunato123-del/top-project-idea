import { useState, memo, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  Image, 
  User, 
  Building2, 
  Briefcase, 
  Calendar,
  Clock,
  Trash2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfidenceBadge } from './ConfidenceBadge';
import { PhotoRecord } from '@/hooks/usePhotos';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { ptBR } from 'date-fns/locale';

export interface FolderNode {
  id: string;
  name: string;
  type: 'user' | 'company' | 'activity' | 'template' | 'month' | 'day' | 'photo';
  count: number;
  children?: FolderNode[];
  data?: PhotoRecord;
}

interface FolderTreeViewProps {
  nodes: FolderNode[];
  onPhotoClick?: (photo: PhotoRecord) => void;
  onPhotoDeleted?: () => void;
}

const getIcon = (type: FolderNode['type'], isExpanded: boolean) => {
  switch (type) {
    case 'user':
      return <User className="h-4 w-4 text-blue-400" />;
    case 'company':
      return <Building2 className="h-4 w-4 text-yellow-400" />;
    case 'activity':
      return <Briefcase className="h-4 w-4 text-green-400" />;
    case 'template':
      return isExpanded 
        ? <FolderOpen className="h-4 w-4 text-yellow-500" />
        : <Folder className="h-4 w-4 text-yellow-500" />;
    case 'month':
      return <Calendar className="h-4 w-4 text-purple-400" />;
    case 'day':
      return <Clock className="h-4 w-4 text-orange-400" />;
    case 'photo':
      return <Image className="h-4 w-4 text-muted-foreground" />;
    default:
      return isExpanded 
        ? <FolderOpen className="h-4 w-4 text-yellow-500" />
        : <Folder className="h-4 w-4 text-yellow-500" />;
  }
};

const TreeNode = memo(function TreeNode({ 
  node, 
  level = 0, 
  onPhotoClick,
  onPhotoDeleted
}: { 
  node: FolderNode; 
  level?: number;
  onPhotoClick?: (photo: PhotoRecord) => void;
  onPhotoDeleted?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  
  const handleClick = () => {
    if (node.type === 'photo' && node.data && onPhotoClick) {
      onPhotoClick(node.data);
    } else if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleDeletePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!node.data) return;
    
    setIsDeleting(true);
    try {
      // Delete from storage
      if (node.data.file_path) {
        await supabase.storage.from('photos').remove([node.data.file_path]);
      }
      
      // Delete from database
      const { error } = await supabase
        .from('photo_records')
        .delete()
        .eq('id', node.data.id);
      
      if (error) throw error;
      
      toast.success('Foto excluída com sucesso');
      setShowDeleteConfirm(false);
      onPhotoDeleted?.();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Erro ao excluir foto');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-1.5 py-1 px-1.5 rounded cursor-pointer transition-colors group",
          "hover:bg-muted/50",
          node.type === 'photo' && "hover:bg-primary/10"
        )}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
        onClick={handleClick}
      >
        {/* Chevron for folders */}
        {hasChildren ? (
          <button className="p-0.5 hover:bg-muted rounded flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}
        
        {/* Icon */}
        <span className="flex-shrink-0">
          {getIcon(node.type, isExpanded)}
        </span>
        
        {/* Name */}
        <span className={cn(
          "text-xs truncate flex-1",
          node.type === 'user' && "font-semibold text-blue-300",
          node.type === 'company' && "font-medium text-yellow-300",
          node.type === 'activity' && "text-green-300",
          node.type === 'photo' && "text-muted-foreground"
        )}>
          {node.name}
        </span>
        
        {/* Count badge */}
        {node.count > 0 && node.type !== 'photo' && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            {node.count}
          </Badge>
        )}
        
        {/* Confidence badge for photos */}
        {node.type === 'photo' && node.data?.ocr_confidence !== null && (
          <ConfidenceBadge score={node.data.ocr_confidence || 0} size="sm" />
        )}

        {/* Delete button for photos */}
        {node.type === 'photo' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
            onClick={handleDeletePhoto}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A foto será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="animate-fade-in">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onPhotoClick={onPhotoClick}
              onPhotoDeleted={onPhotoDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// Função para normalizar nomes (remover acentos e normalizar espaços)
function normalizeForComparison(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // normaliza espaços
}

// Função para encontrar o melhor nome representativo de um grupo
function findBestRepresentativeName(names: string[]): string {
  // Retorna o nome mais comum ou o primeiro com acentuação correta
  const countMap = new Map<string, number>();
  names.forEach(name => {
    countMap.set(name, (countMap.get(name) || 0) + 1);
  });
  
  // Ordena por frequência e depois por comprimento (preferir nomes mais completos)
  const sorted = Array.from(countMap.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]; // maior frequência primeiro
    return b[0].length - a[0].length; // nome mais longo primeiro
  });
  
  return sorted[0]?.[0] || names[0];
}

export function buildUserPhotoTree(photos: PhotoRecord[], userName: string): FolderNode[] {
  if (photos.length === 0) return [];

  // Agrupa por empresa normalizada
  const byCompanyNormalized = new Map<string, { photos: PhotoRecord[], names: string[] }>();
  photos.forEach(photo => {
    const originalName = photo.company_name || 'Sem Empresa';
    const normalizedKey = normalizeForComparison(originalName);
    
    if (!byCompanyNormalized.has(normalizedKey)) {
      byCompanyNormalized.set(normalizedKey, { photos: [], names: [] });
    }
    byCompanyNormalized.get(normalizedKey)!.photos.push(photo);
    byCompanyNormalized.get(normalizedKey)!.names.push(originalName);
  });

  const userNode: FolderNode = {
    id: 'user-root',
    name: userName,
    type: 'user',
    count: photos.length,
    children: [],
  };

  byCompanyNormalized.forEach(({ photos: companyPhotos, names }) => {
    const companyName = findBestRepresentativeName(names);
    const companyNode: FolderNode = {
      id: `company-${normalizeForComparison(companyName)}`,
      name: companyName,
      type: 'company',
      count: companyPhotos.length,
      children: [],
    };

    // Agrupa por atividade normalizada
    const byActivityNormalized = new Map<string, { photos: PhotoRecord[], names: string[] }>();
    companyPhotos.forEach(photo => {
      const originalName = photo.activity_text || photo.frente_servico || 'Atividade Geral';
      const normalizedKey = normalizeForComparison(originalName);
      
      if (!byActivityNormalized.has(normalizedKey)) {
        byActivityNormalized.set(normalizedKey, { photos: [], names: [] });
      }
      byActivityNormalized.get(normalizedKey)!.photos.push(photo);
      byActivityNormalized.get(normalizedKey)!.names.push(originalName);
    });

    byActivityNormalized.forEach(({ photos: activityPhotos, names: activityNames }) => {
      const activityName = findBestRepresentativeName(activityNames);
      const activityNode: FolderNode = {
        id: `activity-${normalizeForComparison(companyName)}-${normalizeForComparison(activityName)}`,
        name: activityName,
        type: 'activity',
        count: activityPhotos.length,
        children: [],
      };

      // Agrupa por template (tipo de atividade)
      const byTemplate = new Map<string, PhotoRecord[]>();
      activityPhotos.forEach(photo => {
        const templateName = photo.templates?.name || 'Geral';
        if (!byTemplate.has(templateName)) byTemplate.set(templateName, []);
        byTemplate.get(templateName)!.push(photo);
      });

      byTemplate.forEach((templatePhotos, templateName) => {
        const templateNode: FolderNode = {
          id: `template-${normalizeForComparison(companyName)}-${normalizeForComparison(activityName)}-${templateName}`,
          name: templateName,
          type: 'template',
          count: templatePhotos.length,
          children: [],
        };

        // Agrupa por mês
        const byMonth = new Map<string, PhotoRecord[]>();
        templatePhotos.forEach(photo => {
          const date = new Date(photo.device_timestamp);
          const monthKey = format(date, 'yyyy-MM');
          if (!byMonth.has(monthKey)) byMonth.set(monthKey, []);
          byMonth.get(monthKey)!.push(photo);
        });

        Array.from(byMonth.entries())
          .sort((a, b) => b[0].localeCompare(a[0]))
          .forEach(([monthKey, monthPhotos]) => {
            const monthDate = new Date(monthPhotos[0].device_timestamp);
            const monthName = format(monthDate, 'MMMM yyyy', { locale: ptBR });
            
            const monthNode: FolderNode = {
              id: `month-${normalizeForComparison(companyName)}-${normalizeForComparison(activityName)}-${templateName}-${monthKey}`,
              name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
              type: 'month',
              count: monthPhotos.length,
              children: [],
            };

            // Agrupa por dia
            const byDay = new Map<string, PhotoRecord[]>();
            monthPhotos.forEach(photo => {
              const date = new Date(photo.device_timestamp);
              const dayKey = format(date, 'yyyy-MM-dd');
              if (!byDay.has(dayKey)) byDay.set(dayKey, []);
              byDay.get(dayKey)!.push(photo);
            });

            Array.from(byDay.entries())
              .sort((a, b) => b[0].localeCompare(a[0]))
              .forEach(([dayKey, dayPhotos]) => {
                const dayDate = new Date(dayPhotos[0].device_timestamp);
                const dayName = format(dayDate, "dd 'de' MMMM", { locale: ptBR });
                
                const dayNode: FolderNode = {
                  id: `day-${normalizeForComparison(companyName)}-${normalizeForComparison(activityName)}-${templateName}-${dayKey}`,
                  name: dayName,
                  type: 'day',
                  count: dayPhotos.length,
                  children: dayPhotos
                    .sort((a, b) => new Date(b.device_timestamp).getTime() - new Date(a.device_timestamp).getTime())
                    .map(photo => ({
                      id: photo.id,
                      name: format(new Date(photo.device_timestamp), 'HH:mm:ss'),
                      type: 'photo' as const,
                      count: 0,
                      data: photo,
                    })),
                };

                monthNode.children!.push(dayNode);
              });

            templateNode.children!.push(monthNode);
          });

        activityNode.children!.push(templateNode);
      });

      companyNode.children!.push(activityNode);
    });

    userNode.children!.push(companyNode);
  });

  return [userNode];
}

export const FolderTreeView = memo(function FolderTreeView({ nodes, onPhotoClick, onPhotoDeleted }: FolderTreeViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  
  const handlePhotoClick = useCallback((photo: PhotoRecord) => {
    setSelectedPhoto(photo);
    onPhotoClick?.(photo);
  }, [onPhotoClick]);

  const handleDeleteSelectedPhoto = async () => {
    if (!selectedPhoto) return;
    
    setIsDeleting(true);
    try {
      if (selectedPhoto.file_path) {
        await supabase.storage.from('photos').remove([selectedPhoto.file_path]);
      }
      
      const { error } = await supabase
        .from('photo_records')
        .delete()
        .eq('id', selectedPhoto.id);
      
      if (error) throw error;
      
      toast.success('Foto excluída com sucesso');
      setShowDeleteConfirm(false);
      setSelectedPhoto(null);
      queryClient.invalidateQueries({ queryKey: ['photo_records'] });
      onPhotoDeleted?.();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Erro ao excluir foto');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTreePhotoDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['photo_records'] });
    onPhotoDeleted?.();
  };
  
  return (
    <>
      <div className="bg-card rounded-lg border p-2 overflow-x-auto">
        {nodes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma foto encontrada</p>
          </div>
        ) : (
          nodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              onPhotoClick={handlePhotoClick}
              onPhotoDeleted={handleTreePhotoDeleted}
            />
          ))
        )}
      </div>
      
      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Detalhes da Foto</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-3">
              <img
                src={selectedPhoto.file_url}
                alt="Foto"
                className="w-full rounded-lg max-h-64 object-contain bg-muted"
              />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Empresa</p>
                  <p className="font-medium">{selectedPhoto.company_name || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Projeto</p>
                  <p className="font-medium">{selectedPhoto.project_name || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Atividade</p>
                  <p className="font-medium">{selectedPhoto.activity_text || selectedPhoto.frente_servico || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data/Hora</p>
                  <p className="font-medium">
                    {format(new Date(selectedPhoto.device_timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {selectedPhoto.templates && (
                  <div>
                    <p className="text-muted-foreground">Template</p>
                    <p className="font-medium">
                      {selectedPhoto.templates.icon} {selectedPhoto.templates.name}
                    </p>
                  </div>
                )}
                {selectedPhoto.ocr_confidence !== null && (
                  <div>
                    <p className="text-muted-foreground">Confiança OCR</p>
                    <ConfidenceBadge score={selectedPhoto.ocr_confidence} />
                  </div>
                )}
                {selectedPhoto.latitude && selectedPhoto.longitude && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Localização</p>
                    <p className="font-medium text-[10px]">
                      LAT: {selectedPhoto.latitude.toFixed(6)} | LON: {selectedPhoto.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Foto
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A foto será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelectedPhoto}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
