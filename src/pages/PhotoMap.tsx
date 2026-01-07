import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { usePhotoRecords } from '@/hooks/usePhotos';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, Eye, Calendar, Building2, Filter, X } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';
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

type DateFilter = 'all' | 'today' | '7days' | '30days' | 'thisMonth';

export default function PhotoMap() {
  const { data: photos, isLoading } = usePhotoRecords();
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique companies and projects
  const { companies, projects } = useMemo(() => {
    if (!photos) return { companies: [], projects: [] };
    const companySet = new Set<string>();
    const projectSet = new Set<string>();
    photos.forEach(photo => {
      if (photo.company_name) companySet.add(photo.company_name);
      if (photo.project_name) projectSet.add(photo.project_name);
    });
    return {
      companies: Array.from(companySet).sort(),
      projects: Array.from(projectSet).sort()
    };
  }, [photos]);

  // Filter photos that have valid coordinates and match filters
  const photosWithLocation = useMemo(() => {
    if (!photos) return [];
    
    const now = new Date();
    
    return photos.filter((photo) => {
      // Location filter
      if (!photo.latitude || !photo.longitude || photo.latitude === 0 || photo.longitude === 0) {
        return false;
      }
      
      // Date filter
      const photoDate = new Date(photo.device_timestamp);
      switch (dateFilter) {
        case 'today':
          if (photoDate < startOfDay(now) || photoDate > endOfDay(now)) return false;
          break;
        case '7days':
          if (photoDate < startOfDay(subDays(now, 7))) return false;
          break;
        case '30days':
          if (photoDate < startOfDay(subDays(now, 30))) return false;
          break;
        case 'thisMonth':
          if (photoDate < startOfMonth(now) || photoDate > endOfMonth(now)) return false;
          break;
      }
      
      // Company filter
      if (companyFilter !== 'all' && photo.company_name !== companyFilter) {
        return false;
      }
      
      // Project filter
      if (projectFilter !== 'all' && photo.project_name !== projectFilter) {
        return false;
      }
      
      return true;
    });
  }, [photos, dateFilter, companyFilter, projectFilter]);

  const hasActiveFilters = dateFilter !== 'all' || companyFilter !== 'all' || projectFilter !== 'all';

  const clearFilters = () => {
    setDateFilter('all');
    setCompanyFilter('all');
    setProjectFilter('all');
  };

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Mapa de Fotos</h1>
              <p className="text-sm text-muted-foreground">
                {photosWithLocation.length} fotos com localização
              </p>
            </div>
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Filtrar por:</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Limpar filtros
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Date Filter */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Período</label>
                <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todas as datas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as datas</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="30days">Últimos 30 dias</SelectItem>
                    <SelectItem value="thisMonth">Este mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Company Filter */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Empresa</label>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todas as empresas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Project Filter */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Projeto</label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos os projetos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os projetos</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
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
