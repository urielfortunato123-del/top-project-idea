import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Clock, Sparkles, Eye } from 'lucide-react';
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
    <div 
      className={cn(
        "glass-card rounded-xl overflow-hidden transition-all duration-300 group",
        isPhotoRecord && "cursor-pointer hover:scale-[1.03] hover:shadow-glow"
      )}
      onClick={handleClick}
    >
      <div className="relative aspect-square bg-secondary/50">
        <img
          src={imageUrl}
          alt="Foto de obra"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status badges */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
          {ocrStatus === 'completed' && ocrConfidence && (
            <div className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold backdrop-blur-md",
              ocrConfidence >= 80 ? "bg-emerald-500/80 text-white" :
              ocrConfidence >= 60 ? "bg-amber-500/80 text-black" :
              "bg-red-500/80 text-white"
            )}>
              <Sparkles className="h-2.5 w-2.5" />
              {ocrConfidence}%
            </div>
          )}
          <StatusBadge status={status} />
        </div>
        
        {/* Timestamp overlay */}
        {showStamp && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
            <div className="flex flex-col text-white text-[10px] space-y-0.5">
              <div className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5 text-primary" />
                <span className="font-medium">
                  {format(new Date(timestamp), "dd/MM HH:mm", { locale: ptBR })}
                </span>
              </div>
              {latitude && longitude && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 text-accent" />
                  <span className="opacity-80">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View icon on hover */}
        {isPhotoRecord && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="p-3 rounded-full bg-primary/90 backdrop-blur-sm shadow-glow">
              <Eye className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>
      
      {/* Info section */}
      <div className="p-2.5 space-y-0.5">
        <p className="font-display font-semibold text-xs truncate">{projectName}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {templateName || 'Geral'} • {companyName}
        </p>
        {!isPhotoRecord && photo.errorMessage && (
          <p className="text-[10px] text-destructive truncate">{photo.errorMessage}</p>
        )}
      </div>
    </div>
  );
}
