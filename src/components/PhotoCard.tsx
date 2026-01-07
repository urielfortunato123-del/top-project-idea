import { memo, useMemo, useState } from 'react';
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

export const PhotoCard = memo(function PhotoCard({ photo, isPending = false }: PhotoCardProps) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const isPhotoRecord = 'file_url' in photo;
  
  // Memoize computed values
  const photoData = useMemo(() => {
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

    return {
      imageUrl,
      status,
      timestamp,
      projectName,
      companyName,
      templateName,
      latitude,
      longitude,
      showStamp,
      ocrStatus,
      ocrConfidence,
    };
  }, [photo, isPhotoRecord]);

  const handleClick = () => {
    if (isPhotoRecord) {
      navigate(`/photos/${photo.id}`);
    }
  };

  const formattedDate = useMemo(() => 
    format(new Date(photoData.timestamp), "dd/MM HH:mm", { locale: ptBR }),
    [photoData.timestamp]
  );

  return (
    <div 
      className={cn(
        "glass-card rounded-xl overflow-hidden group",
        isPhotoRecord && "cursor-pointer active:scale-[0.98]"
      )}
      onClick={handleClick}
    >
      <div className="relative aspect-square bg-secondary/50">
        {/* Placeholder while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        <img
          src={photoData.imageUrl}
          alt="Foto de obra"
          loading="lazy"
          decoding="async"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-200",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Status badges */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
          {photoData.ocrStatus === 'completed' && photoData.ocrConfidence && (
            <div className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold",
              photoData.ocrConfidence >= 80 ? "bg-emerald-500/80 text-white" :
              photoData.ocrConfidence >= 60 ? "bg-amber-500/80 text-black" :
              "bg-red-500/80 text-white"
            )}>
              <Sparkles className="h-2.5 w-2.5" />
              {photoData.ocrConfidence}%
            </div>
          )}
          <StatusBadge status={photoData.status} />
        </div>
        
        {/* Timestamp overlay */}
        {photoData.showStamp && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
            <div className="flex flex-col text-white text-[10px] space-y-0.5">
              <div className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5 text-primary" />
                <span className="font-medium">{formattedDate}</span>
              </div>
              {photoData.latitude && photoData.longitude && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 text-accent" />
                  <span className="opacity-80">
                    {photoData.latitude.toFixed(4)}, {photoData.longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Info section */}
      <div className="p-2.5 space-y-0.5">
        <p className="font-display font-semibold text-xs truncate">{photoData.projectName}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {photoData.templateName || 'Geral'} • {photoData.companyName}
        </p>
        {!isPhotoRecord && photo.errorMessage && (
          <p className="text-[10px] text-destructive truncate">{photo.errorMessage}</p>
        )}
      </div>
    </div>
  );
});
