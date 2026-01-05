import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { PhotoRecord } from '@/hooks/usePhotos';
import { PendingPhoto } from '@/lib/indexedDB';

interface PhotoCardProps {
  photo: PhotoRecord | PendingPhoto;
  isPending?: boolean;
}

export function PhotoCard({ photo, isPending = false }: PhotoCardProps) {
  const isPhotoRecord = 'file_url' in photo;
  
  const imageUrl = isPhotoRecord 
    ? photo.file_url 
    : URL.createObjectURL(photo.imageBlob);

  const status = isPhotoRecord ? photo.status as any : photo.status;
  const timestamp = isPhotoRecord ? photo.device_timestamp : photo.deviceTimestamp;
  const projectName = isPhotoRecord ? photo.projects?.name : photo.projectName;
  const companyName = isPhotoRecord ? photo.companies?.name : photo.companyName;
  const templateName = isPhotoRecord ? photo.templates?.name : photo.templateName;
  const latitude = isPhotoRecord ? photo.latitude : photo.latitude;
  const longitude = isPhotoRecord ? photo.longitude : photo.longitude;
  const showStamp = isPhotoRecord ? photo.show_stamp : photo.showStamp;

  return (
    <Card className="overflow-hidden bg-card hover:bg-card/80 transition-colors duration-200">
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src={imageUrl}
          alt="Foto de obra"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
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