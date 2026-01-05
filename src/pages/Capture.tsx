import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies, useProjects, useTemplates } from '@/hooks/useProjects';
import { useSavePendingPhoto, useUploadPhoto } from '@/hooks/usePhotos';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, MapPin, Clock, ChevronLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function Capture() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: companies = [] } = useCompanies();
  const { data: allProjects = [] } = useProjects();
  const { data: templates = [] } = useTemplates();
  const { getPosition, isLoading: isGettingLocation } = useGeolocation();
  
  const savePending = useSavePendingPhoto();
  const uploadPhoto = useUploadPhoto();

  const [companyId, setCompanyId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [templateId, setTemplateId] = useState<string>('');
  const [activity, setActivity] = useState<string>('');
  const [showStamp, setShowStamp] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  const selectedCompany = companies.find(c => c.id === companyId);
  const filteredProjects = allProjects.filter(p => p.company_id === companyId);
  const selectedProject = filteredProjects.find(p => p.id === projectId);
  const selectedTemplate = templates.find(t => t.id === templateId);

  const handleCaptureClick = () => {
    if (!companyId || !projectId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Selecione empresa e projeto antes de capturar.',
        variant: 'destructive',
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    setIsCapturing(true);

    try {
      // Get GPS
      const position = await getPosition();
      const deviceTimestamp = new Date();

      // Convert file to blob
      const imageBlob = new Blob([await file.arrayBuffer()], { type: 'image/jpeg' });

      if (isOnline) {
        // Upload directly
        await uploadPhoto.mutateAsync({
          companyId,
          companySlug: selectedCompany?.slug || 'unknown',
          projectId,
          templateId: templateId || null,
          activityText: activity || null,
          deviceTimestamp,
          latitude: position?.latitude ?? null,
          longitude: position?.longitude ?? null,
          accuracy: position?.accuracy ?? null,
          imageBlob,
          showStamp,
          userName: profile.full_name,
          userId: user.id,
        });

        toast({
          title: 'Foto enviada!',
          description: 'A foto foi salva no servidor com sucesso.',
        });
      } else {
        // Save to IndexedDB for later
        await savePending.mutateAsync({
          id: generateId(),
          companyId,
          companyName: selectedCompany?.name || '',
          projectId,
          projectName: selectedProject?.name || '',
          templateId: templateId || null,
          templateName: selectedTemplate?.name || null,
          activityText: activity || null,
          deviceTimestamp: deviceTimestamp.toISOString(),
          latitude: position?.latitude ?? null,
          longitude: position?.longitude ?? null,
          accuracy: position?.accuracy ?? null,
          imageBlob,
          showStamp,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });

        toast({
          title: 'Foto salva offline!',
          description: 'Será sincronizada quando houver conexão.',
        });
      }

      // Reset form
      setActivity('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: 'Erro na captura',
        description: error instanceof Error ? error.message : 'Não foi possível processar a foto.',
        variant: 'destructive',
      });
    } finally {
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
            <p className="text-xs text-muted-foreground">
              {isOnline ? 'Online - envio direto' : 'Offline - salvar local'}
            </p>
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
              <Label>Empresa</Label>
              <Select value={companyId} onValueChange={(v) => { setCompanyId(v); setProjectId(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project */}
            <div className="space-y-2">
              <Label>Projeto/Obra</Label>
              <Select value={projectId} onValueChange={setProjectId} disabled={!companyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template */}
            <div className="space-y-2">
              <Label>Template/Frente (opcional)</Label>
              <Select value={templateId} onValueChange={(v) => setTemplateId(v === "auto" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Automático" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automático</SelectItem>
                  {templates.filter(t => t.id && t.id.trim() !== "").map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.icon} {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Activity */}
            <div className="space-y-2">
              <Label>Atividade (opcional)</Label>
              <Input
                placeholder="Descreva a atividade..."
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
                  <Label className="cursor-pointer">Carimbo na foto</Label>
                  <p className="text-xs text-muted-foreground">Timestamp, GPS, colaborador</p>
                </div>
              </div>
              <Switch checked={showStamp} onCheckedChange={setShowStamp} />
            </div>
          </CardContent>
        </Card>

        {/* Capture Button */}
        <div className="fixed bottom-24 left-4 right-4">
          <Button
            size="lg"
            className="w-full h-16 text-lg capture-btn"
            onClick={handleCaptureClick}
            disabled={isCapturing || uploadPhoto.isPending}
          >
            {isCapturing || uploadPhoto.isPending ? (
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