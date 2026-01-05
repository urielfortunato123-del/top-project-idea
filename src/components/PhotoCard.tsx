import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Clock } from 'lucide-react';
import { PhotoRecord } from '@/types/photo';
import { StatusBadge } from './StatusBadge';
import { Card } from '@/components/ui/card';
import { COMPANIES } from '@/data/mockData';

interface PhotoCardProps {
  photo: PhotoRecord;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const company = COMPANIES.find(c => c.id === photo.companyId);
  const project = company?.projects.find(p => p.id === photo.projectId);
  const front = project?.fronts.find(f => f.id === photo.frontId);

  return (
    <Card className="overflow-hidden bg-card hover:shadow-lg transition-shadow duration-200">
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src={photo.imageData}
          alt={`Foto ${photo.id}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <StatusBadge status={photo.status} />
        </div>
        
        {/* Overlay with info if timestamp/gps enabled */}
        {(photo.showTimestamp || photo.showGps) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex flex-col gap-1 text-white text-xs">
              {photo.showTimestamp && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(photo.deviceTimestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </div>
              )}
              {photo.showGps && photo.latitude && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {photo.latitude.toFixed(6)}, {photo.longitude?.toFixed(6)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <p className="font-medium text-sm truncate">{front?.name || 'Frente não definida'}</p>
        <p className="text-xs text-muted-foreground truncate">
          {project?.name} • {company?.name}
        </p>
        {photo.activity && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {photo.activity}
          </p>
        )}
      </div>
    </Card>
  );
}