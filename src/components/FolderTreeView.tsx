import { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ConfidenceBadge } from './ConfidenceBadge';
import { PhotoRecord } from '@/hooks/usePhotos';
import { format } from 'date-fns';
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

function TreeNode({ 
  node, 
  level = 0, 
  onPhotoClick 
}: { 
  node: FolderNode; 
  level?: number;
  onPhotoClick?: (photo: PhotoRecord) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;
  
  const handleClick = () => {
    if (node.type === 'photo' && node.data && onPhotoClick) {
      onPhotoClick(node.data);
    } else if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };
  
  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-1.5 py-1 px-1.5 rounded cursor-pointer transition-colors",
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
      </div>
      
      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="animate-fade-in">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onPhotoClick={onPhotoClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function buildUserPhotoTree(photos: PhotoRecord[], userName: string): FolderNode[] {
  if (photos.length === 0) return [];

  // Agrupa por empresa
  const byCompany = new Map<string, PhotoRecord[]>();
  photos.forEach(photo => {
    const key = photo.company_name || 'Sem Empresa';
    if (!byCompany.has(key)) byCompany.set(key, []);
    byCompany.get(key)!.push(photo);
  });

  const userNode: FolderNode = {
    id: 'user-root',
    name: userName,
    type: 'user',
    count: photos.length,
    children: [],
  };

  byCompany.forEach((companyPhotos, companyName) => {
    const companyNode: FolderNode = {
      id: `company-${companyName}`,
      name: companyName,
      type: 'company',
      count: companyPhotos.length,
      children: [],
    };

    // Agrupa por atividade (activity_text ou frente_servico)
    const byActivity = new Map<string, PhotoRecord[]>();
    companyPhotos.forEach(photo => {
      const key = photo.activity_text || photo.frente_servico || 'Atividade Geral';
      if (!byActivity.has(key)) byActivity.set(key, []);
      byActivity.get(key)!.push(photo);
    });

    byActivity.forEach((activityPhotos, activityName) => {
      const activityNode: FolderNode = {
        id: `activity-${companyName}-${activityName}`,
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
          id: `template-${companyName}-${activityName}-${templateName}`,
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
          const monthName = format(date, 'MMMM yyyy', { locale: ptBR });
          if (!byMonth.has(monthKey)) byMonth.set(monthKey, []);
          byMonth.get(monthKey)!.push(photo);
        });

        Array.from(byMonth.entries())
          .sort((a, b) => b[0].localeCompare(a[0]))
          .forEach(([monthKey, monthPhotos]) => {
            const monthDate = new Date(monthPhotos[0].device_timestamp);
            const monthName = format(monthDate, 'MMMM yyyy', { locale: ptBR });
            
            const monthNode: FolderNode = {
              id: `month-${companyName}-${activityName}-${templateName}-${monthKey}`,
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
                  id: `day-${companyName}-${activityName}-${templateName}-${dayKey}`,
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

export function FolderTreeView({ nodes, onPhotoClick }: FolderTreeViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);
  
  const handlePhotoClick = (photo: PhotoRecord) => {
    setSelectedPhoto(photo);
    onPhotoClick?.(photo);
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
