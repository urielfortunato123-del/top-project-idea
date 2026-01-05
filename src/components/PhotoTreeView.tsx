import { useState } from 'react';
import { ChevronRight, ChevronDown, Building2, User, Calendar, FolderOpen, Image, Eye } from 'lucide-react';
import { PhotoTreeNode, PhotoWithMeta } from '@/hooks/usePhotoTree';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfidenceBadge } from './ConfidenceBadge';

interface PhotoTreeViewProps {
  nodes: PhotoTreeNode[];
  onPhotoClick?: (photo: PhotoWithMeta) => void;
}

const iconMap = {
  company: Building2,
  user: User,
  month: Calendar,
  day: Calendar,
  template: FolderOpen,
  photo: Image,
};

function TreeNode({ 
  node, 
  level = 0, 
  onPhotoClick 
}: { 
  node: PhotoTreeNode; 
  level?: number;
  onPhotoClick?: (photo: PhotoWithMeta) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const Icon = iconMap[node.type];
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
          "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
          node.type === 'photo' && "hover:bg-primary/10"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <button className="p-0.5 hover:bg-muted rounded">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        
        <Icon className={cn(
          "h-4 w-4",
          node.type === 'company' && "text-primary",
          node.type === 'user' && "text-info",
          node.type === 'month' && "text-warning",
          node.type === 'day' && "text-accent",
          node.type === 'template' && "text-success",
          node.type === 'photo' && "text-muted-foreground"
        )} />
        
        <span className={cn(
          "text-sm flex-1",
          node.type === 'company' && "font-semibold",
          node.type === 'photo' && "text-muted-foreground"
        )}>
          {node.name}
        </span>
        
        {node.count > 0 && node.type !== 'photo' && (
          <Badge variant="secondary" className="text-xs">
            {node.count}
          </Badge>
        )}
        
        {node.type === 'photo' && node.data?.ocr_confidence !== null && (
          <ConfidenceBadge score={node.data.ocr_confidence} size="sm" />
        )}
        
        {node.type === 'photo' && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
            e.stopPropagation();
            if (node.data && onPhotoClick) onPhotoClick(node.data);
          }}>
            <Eye className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {isExpanded && hasChildren && (
        <div className="animate-slide-up">
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

export function PhotoTreeView({ nodes, onPhotoClick }: PhotoTreeViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithMeta | null>(null);
  
  const handlePhotoClick = (photo: PhotoWithMeta) => {
    setSelectedPhoto(photo);
    onPhotoClick?.(photo);
  };
  
  return (
    <>
      <div className="bg-card rounded-lg border p-2">
        {nodes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma foto encontrada</p>
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
      
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Foto</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <img
                src={selectedPhoto.file_url}
                alt="Foto"
                className="w-full rounded-lg max-h-80 object-contain bg-muted"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Empresa</p>
                  <p className="font-medium">{selectedPhoto.company_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Projeto</p>
                  <p className="font-medium">{selectedPhoto.project_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Colaborador</p>
                  <p className="font-medium">{selectedPhoto.user_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data/Hora</p>
                  <p className="font-medium">
                    {new Date(selectedPhoto.device_timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
                {selectedPhoto.template_name && (
                  <div>
                    <p className="text-muted-foreground">Template</p>
                    <p className="font-medium">
                      {selectedPhoto.template_icon} {selectedPhoto.template_name}
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
                    <p className="font-medium">
                      {selectedPhoto.latitude.toFixed(6)}, {selectedPhoto.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
                {selectedPhoto.activity_text && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Atividade</p>
                    <p className="font-medium">{selectedPhoto.activity_text}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`/photos/${selectedPhoto.id}`, '_blank')}
                >
                  Ver Detalhes Completos
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
