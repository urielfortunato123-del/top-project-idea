import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Clock, Sparkles, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { PhotoRecord } from '@/hooks/usePhotos';
import { PendingPhoto } from '@/lib/indexedDB';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PhotoCardProps {
  photo: PhotoRecord | PendingPhoto;
  isPending?: boolean;
}

export function PhotoCard({ photo, isPending = false }: PhotoCardProps) {
  const navigate = useNavigate();
  const isPhotoRecord = 'file_url' in photo;
  
  const imageUrl = isPhotoRecord 
    ? photo.file_url 
    : URL.createObjectURL(photo.imageBlob);

  const status = isPhotoRecord ? photo.status as any : photo.status;
  const timestamp = isPhotoRecord ? photo.device_timestamp : photo.deviceTimestamp;
  const projectName = isPhotoRecord 
    ? (photo.project_name || photo.projects?.name) 
    : photo.projectName;
  const companyName = isPhotoRecord 
    ? (photo.company_name || photo.companies?.name) 
    : photo.companyName;
  const templateName = isPhotoRecord ? photo.templates?.name : photo.templateName;
  const latitude = isPhotoRecord ? photo.latitude : photo.latitude;
  const longitude = isPhotoRecord ? photo.longitude : photo.longitude;
  const showStamp = isPhotoRecord ? photo.show_stamp : photo.showStamp;

  const ocrStatus = isPhotoRecord ? (photo as any).ocr_status : undefined;
  const ocrConfidence = isPhotoRecord ? (photo as any).ocr_confidence : undefined;

  const handleClick = () => {
    if (isPhotoRecord) {
      navigate(`/photos/${photo.id}`);
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden bg-card transition-all duration-200",
        isPhotoRecord && "cursor-pointer hover:bg-card/80 hover:scale-[1.02]"
      )}
      onClick={handleClick}
    >
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src={imageUrl}
          alt="Foto de obra"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {ocrStatus === 'completed' && ocrConfidence && (
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
              ocrConfidence >= 80 ? "bg-green-500/90 text-white" :
              ocrConfidence >= 60 ? "bg-yellow-500/90 text-black" :
              "bg-red-500/90 text-white"
            )}>
              <Sparkles className="h-3 w-3" />
              {ocrConfidence}%
            </div>
          )}
          <StatusBadge status={status} />
        </div>
        
        {showStamp && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex flex-col gap-1 text-white text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </div>
              {latitude && longitude && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </div>
              )}
            </div>
          </div>
        )}

        {isPhotoRecord && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <Eye className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
        )}
      </div>
      
      <div className="p-3 space-y-1">
        <p className="font-medium text-sm truncate">{projectName}</p>
        <p className="text-xs text-muted-foreground truncate">
          {templateName || 'Sem template'} • {companyName}
        </p>
        {!isPhotoRecord && photo.errorMessage && (
          <p className="text-xs text-destructive truncate">{photo.errorMessage}</p>
        )}
      </div>
    </Card>
  );
}