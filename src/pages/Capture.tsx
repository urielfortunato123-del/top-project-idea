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
import { useToast } from '@/hooks/use-toast';
import { Camera, Clock, ChevronLeft, Loader2, Wifi, WifiOff, MapPin, Building2, FolderKanban, Wrench, FileText } from 'lucide-react';
import { drawStampOnImage } from '@/components/PhotoStamp';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function convertToJpeg(input: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(input);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas indisponível no aparelho.'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        URL.revokeObjectURL(url);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao converter imagem para JPG.'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.9
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível carregar a imagem para conversão.'));
    };

    img.src = url;
  });
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

  const [companyName, setCompanyName] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [frenteServico, setFrenteServico] = useState<string>('');
  const [templateId, setTemplateId] = useState<string>('');
  const [activity, setActivity] = useState<string>('');
  const [showStamp, setShowStamp] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  const selectedTemplate = templates.find(t => t.id === templateId);

  const handleCaptureClick = () => {
    if (!companyName.trim() || !projectName.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha empresa e projeto antes de capturar.',
        variant: 'destructive',
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setCompanyName('');
    setProjectName('');
    setFrenteServico('');
    setTemplateId('');
    setActivity('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    setIsCapturing(true);
    const deviceTimestamp = new Date();
    const trimmedCompany = companyName.trim();
    const trimmedProject = projectName.trim();
    const trimmedFrente = frenteServico.trim() || 'Geral';
    const trimmedActivity = activity || null;
    const selectedTemplateId = templateId || null;

    try {
      // Alguns celulares fracos podem travar se lermos o arquivo inteiro na memória.
      // Então evitamos file.arrayBuffer() aqui.
      const position = await getPosition().catch(() => null);

      // Garantir JPEG (o upload usa contentType image/jpeg e extensão .jpg)
      let imageBlob: Blob = file;

      if (file.type && file.type !== 'image/jpeg') {
        // HEIC/HEIF costuma falhar em WebViews mais antigos
        if (/image\/(heic|heif)/i.test(file.type)) {
          throw new Error('Formato de imagem (HEIC) não suportado neste aparelho. Ative "Salvar como JPG" na câmera ou use outro modo.');
        }

        imageBlob = await convertToJpeg(file);
      }

      if (showStamp) {
        try {
          imageBlob = await drawStampOnImage(imageBlob, {
            timestamp: deviceTimestamp,
            latitude: position?.latitude,
            longitude: position?.longitude,
            userName: profile.full_name,
            projectName: trimmedProject,
            companyName: trimmedCompany,
            frenteServico: trimmedFrente,
          });
        } catch (stampError) {
          console.error('Error applying stamp:', stampError);
        }
      }

      if (isOnline) {
        await uploadPhoto.mutateAsync({
          companySlug: 'manual',
          companyName: trimmedCompany,
          projectName: trimmedProject,
          frenteServico: trimmedFrente,
          templateId: selectedTemplateId,
          activityText: trimmedActivity,
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
          description: 'A foto foi salva no servidor.',
        });
      } else {
        await savePending.mutateAsync({
          id: generateId(),
          companyId: '',
          companyName: trimmedCompany,
          projectId: '',
          projectName: trimmedProject,
          frenteServico: trimmedFrente,
          templateId: selectedTemplateId,
          templateName: selectedTemplate?.name || null,
          activityText: trimmedActivity,
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

      resetForm();
    } catch (error) {
      console.error('[Capture] Erro na captura:', error);
      toast({
        title: 'Erro na captura',
        description: error instanceof Error ? error.message : 'Não foi possível processar a foto.',
        variant: 'destructive',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="glass-header">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl hover:bg-secondary/50"
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="animate-fade-in">
              <h1 className="text-lg font-display font-bold">Nova Captura</h1>
              <div className="flex items-center gap-1.5 text-xs">
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 text-success" />
                    <span className="text-success">Online - envio direto</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-warning" />
                    <span className="text-warning">Offline - salvar local</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-5">
        {/* Location Card */}
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/20">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-display font-semibold">Local da Captura</h2>
          </div>
          
          {/* Company */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" />
              Empresa
            </Label>
            <Input
              placeholder="Digite o nome da empresa..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-secondary/50 border-border/50 rounded-xl focus:border-primary/50"
            />
          </div>

          {/* Project */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <FolderKanban className="h-3.5 w-3.5" />
              Projeto/Obra
            </Label>
            <Input
              placeholder="Digite o nome do projeto..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-secondary/50 border-border/50 rounded-xl focus:border-primary/50"
            />
          </div>

          {/* Frente de Serviço */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Wrench className="h-3.5 w-3.5" />
              Frente de Serviço
            </Label>
            <Input
              placeholder="Ex: Fundação, Concretagem, Alvenaria..."
              value={frenteServico}
              onChange={(e) => setFrenteServico(e.target.value)}
              className="bg-secondary/50 border-border/50 rounded-xl focus:border-primary/50"
            />
          </div>

          {/* Template */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              Template (opcional)
            </Label>
            <Select value={templateId} onValueChange={(v) => setTemplateId(v === "auto" ? "" : v)}>
              <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Automático" />
              </SelectTrigger>
              <SelectContent className="glass-card border-border/50">
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
            <Label className="text-xs text-muted-foreground">Atividade (opcional)</Label>
            <Input
              placeholder="Descreva a atividade..."
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="bg-secondary/50 border-border/50 rounded-xl focus:border-primary/50"
            />
          </div>
        </div>

        {/* Options Card */}
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <Label className="cursor-pointer font-display font-medium">Carimbo na foto</Label>
                <p className="text-xs text-muted-foreground">Timestamp, GPS, colaborador</p>
              </div>
            </div>
            <Switch checked={showStamp} onCheckedChange={setShowStamp} />
          </div>
        </div>

        {/* Capture Button */}
        <div className="fixed bottom-24 left-4 right-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Button
            size="lg"
            className="w-full h-16 text-lg capture-btn rounded-2xl border-0"
            onClick={handleCaptureClick}
            disabled={isCapturing || uploadPhoto.isPending}
          >
            {isCapturing || uploadPhoto.isPending ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <span className="font-display">Processando...</span>
              </>
            ) : (
              <>
                <Camera className="mr-2 h-6 w-6" />
                <span className="font-display font-semibold">Capturar Foto</span>
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
