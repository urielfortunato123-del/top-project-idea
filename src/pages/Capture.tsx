import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useGeolocation } from '@/hooks/useGeolocation';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { COMPANIES, TEMPLATES } from '@/data/mockData';
import { PhotoRecord } from '@/types/photo';
import { Camera, MapPin, Clock, ChevronLeft, Loader2 } from 'lucide-react';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function Capture() {
  const { user } = useAuth();
  const { addToQueue } = useOfflineQueue();
  const { getPosition, isLoading: isGettingLocation } = useGeolocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyId, setCompanyId] = useState<string>(user?.companyId || '');
  const [projectId, setProjectId] = useState<string>('');
  const [frontId, setFrontId] = useState<string>('');
  const [activity, setActivity] = useState<string>('');
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [showGps, setShowGps] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  const selectedCompany = COMPANIES.find(c => c.id === companyId);
  const selectedProject = selectedCompany?.projects.find(p => p.id === projectId);
  const selectedFront = selectedProject?.fronts.find(f => f.id === frontId);
  const selectedTemplate = TEMPLATES.find(t => t.id === selectedFront?.templateId);

  const handleCaptureClick = () => {
    if (!companyId || !projectId || !frontId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Selecione empresa, obra e frente antes de capturar.',
        variant: 'destructive',
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);

    try {
      // Get GPS if enabled
      let position = null;
      if (showGps) {
        position = await getPosition();
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;

        const photo: PhotoRecord = {
          id: generateId(),
          companyId,
          projectId,
          userId: user?.id || '',
          frontId,
          activity: activity || undefined,
          deviceTimestamp: new Date().toISOString(),
          latitude: position?.latitude,
          longitude: position?.longitude,
          accuracy: position?.accuracy,
          filePath: `/${companyId}/COLABORADORES/${user?.name?.replace(/\s/g, '_')}/${new Date().toISOString().slice(0, 7)}/${new Date().toISOString().slice(0, 10)}/${frontId}/`,
          imageData,
          status: 'pending',
          showTimestamp,
          showGps,
        };

        addToQueue(photo);

        toast({
          title: 'Foto capturada!',
          description: 'A foto foi salva e será sincronizada automaticamente.',
        });

        setIsCapturing(false);
        
        // Reset form for next capture
        setActivity('');
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Erro na captura',
        description: 'Não foi possível processar a foto.',
        variant: 'destructive',
      });
      setIsCapturing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Nova Captura</h1>
            <p className="text-xs text-muted-foreground">Configure e tire a foto</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Local da Captura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company */}
            <div className="space-y-2">
              <Label>Empresa/Contrato</Label>
              <Select value={companyId} onValueChange={(v) => { setCompanyId(v); setProjectId(''); setFrontId(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANIES.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project */}
            <div className="space-y-2">
              <Label>Obra/Local</Label>
              <Select value={projectId} onValueChange={(v) => { setProjectId(v); setFrontId(''); }} disabled={!companyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCompany?.projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Front */}
            <div className="space-y-2">
              <Label>Frente</Label>
              <Select value={frontId} onValueChange={setFrontId} disabled={!projectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frente" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProject?.fronts.map(front => (
                    <SelectItem key={front.id} value={front.id}>
                      {front.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template indicator */}
            {selectedTemplate && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <span className="text-xl">{selectedTemplate.icon}</span>
                <div>
                  <p className="text-sm font-medium">{selectedTemplate.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </div>
            )}

            {/* Activity */}
            <div className="space-y-2">
              <Label>Atividade (opcional)</Label>
              <Input
                placeholder="Descreva brevemente a atividade..."
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Options Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Label className="cursor-pointer">Carimbo de data/hora</Label>
                  <p className="text-xs text-muted-foreground">Mostra timestamp na foto</p>
                </div>
              </div>
              <Switch checked={showTimestamp} onCheckedChange={setShowTimestamp} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Label className="cursor-pointer">Localização GPS</Label>
                  <p className="text-xs text-muted-foreground">Registra coordenadas</p>
                </div>
              </div>
              <Switch checked={showGps} onCheckedChange={setShowGps} />
            </div>
          </CardContent>
        </Card>

        {/* Capture Button */}
        <div className="fixed bottom-24 left-4 right-4">
          <Button
            size="lg"
            className="w-full h-16 text-lg capture-btn"
            onClick={handleCaptureClick}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-6 w-6" />
                Capturar Foto
              </>
            )}
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </main>

      <BottomNav />
    </div>
  );
}