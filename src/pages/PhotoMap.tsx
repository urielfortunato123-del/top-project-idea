import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { usePhotoRecords } from '@/hooks/usePhotos';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Eye, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function PhotoMap() {
  const { data: photos, isLoading } = usePhotoRecords();
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Filter photos that have valid coordinates
  const photosWithLocation = useMemo(() => {
    if (!photos) return [];
    return photos.filter(
      (photo) => photo.latitude && photo.longitude && 
        photo.latitude !== 0 && photo.longitude !== 0
    );
  }, [photos]);

  // Calculate map center based on photos or default to Brazil
  const mapCenter = useMemo(() => {
    if (photosWithLocation.length === 0) {
      return { lat: -15.7801, lng: -47.9292 }; // Brasília default
    }
    const avgLat = photosWithLocation.reduce((sum, p) => sum + (p.latitude || 0), 0) / photosWithLocation.length;
    const avgLng = photosWithLocation.reduce((sum, p) => sum + (p.longitude || 0), 0) / photosWithLocation.length;
    return { lat: avgLat, lng: avgLng };
  }, [photosWithLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-[1000]">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Mapa de Fotos</h1>
            <p className="text-sm text-muted-foreground">
              {photosWithLocation.length} fotos com localização
            </p>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="h-[calc(100vh-140px)] w-full relative">
        {photosWithLocation.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MapPin className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhuma foto com localização</p>
            <p className="text-sm">Capture fotos com GPS ativado para ver no mapa</p>
          </div>
        ) : (
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={12}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {photosWithLocation.map((photo) => (
              <Marker
                key={photo.id}
                position={[photo.latitude!, photo.longitude!]}
                icon={defaultIcon}
                eventHandlers={{
                  click: () => setSelectedPhoto(photo.id),
                }}
              >
                <Popup className="photo-popup" minWidth={280} maxWidth={320}>
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-0">
                      {/* Photo Preview */}
                      <div className="relative w-full h-40 bg-muted rounded-t-lg overflow-hidden">
                        <img
                          src={photo.file_url}
                          alt="Foto capturada"
                          className="w-full h-full object-cover"
                        />
                        <Badge 
                          className="absolute top-2 right-2"
                          variant={photo.status === 'processed' ? 'default' : 'secondary'}
                        >
                          {photo.status === 'processed' ? 'Processada' : 'Pendente'}
                        </Badge>
                      </div>

                      {/* Photo Info */}
                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(photo.device_timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>

                        {photo.company_name && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground font-medium">{photo.company_name}</span>
                          </div>
                        )}

                        {photo.project_name && (
                          <p className="text-sm text-muted-foreground pl-6">
                            {photo.project_name}
                          </p>
                        )}

                        {photo.activity_text && (
                          <p className="text-sm text-foreground line-clamp-2">
                            {photo.activity_text}
                          </p>
                        )}

                        {photo.ocr_confidence != null && photo.ocr_confidence > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">OCR:</span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(photo.ocr_confidence * 100)}%
                            </Badge>
                          </div>
                        )}

                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => navigate(`/photos/${photo.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
