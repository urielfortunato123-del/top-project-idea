import { useState, useRef, useCallback } from 'react';
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
import { Camera, Clock, ChevronLeft, Loader2, Wifi, WifiOff, MapPin, Building2, FolderKanban, Wrench, FileText, Download, X, Check, RotateCcw } from 'lucide-react';
import { drawStampOnImage } from '@/components/PhotoStamp';
import { appLog, downloadAppLog } from '@/lib/appLog';
import { compressImage, convertToJpeg, blobToDataUrl } from '@/lib/imageUtils';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface PreparedPhoto {
  imageBlob: Blob;
  previewUrl: string;
  deviceTimestamp: Date;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}

export default function Capture() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: companies = [] } = useCompanies();
  const { data: projects = [] } = useProjects();
  const { data: templates = [] } = useTemplates();
  const { getPosition, isLoading: isGettingLocation } = useGeolocation();
  
  const savePending = useSavePendingPhoto();
  const uploadPhoto = useUploadPhoto();

  const [companyId, setCompanyId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');

  const [companyName, setCompanyName] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [frenteServico, setFrenteServico] = useState<string>('');
  const [templateId, setTemplateId] = useState<string>('');
  const [activity, setActivity] = useState<string>('');
  const [showStamp, setShowStamp] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const selectedCompany = companies.find(c => c.id === companyId) || null;
  const filteredProjects = projects.filter(p => !companyId || p.company_id === companyId);
  const selectedProject = filteredProjects.find(p => p.id === projectId) || null;

  // Preview state
  const [preparedPhoto, setPreparedPhoto] = useState<PreparedPhoto | null>(null);

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

  const resetForm = () => {
    setCompanyId('');
    setProjectId('');
    setCompanyName('');
    setProjectName('');
    setFrenteServico('');
    setTemplateId('');
    setActivity('');
    setPreparedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const cancelPreview = () => {
    if (preparedPhoto?.previewUrl) {
      URL.revokeObjectURL(preparedPhoto.previewUrl);
    }
    setPreparedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process the photo (compress + stamp) and show preview
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    setIsProcessing(true);
    const deviceTimestamp = new Date();
    const trimmedCompany = companyName.trim();
    const trimmedProject = projectName.trim();
    const trimmedFrente = frenteServico.trim() || 'Geral';

    try {
      appLog.info('[Capture] Iniciando processamento', {
        fileType: file.type,
        fileSize: file.size,
        fileName: file.name,
        ua: navigator.userAgent,
      });

      const position = await getPosition().catch((err) => {
        appLog.warn('[Capture] GPS não disponível', err);
        return null;
      });

      let imageBlob: Blob = file;
      const fileType = file.type?.toLowerCase() || '';

      // HEIC/HEIF check
      if (fileType.includes('heic') || fileType.includes('heif')) {
        throw new Error('Formato HEIC não suportado. Configure a câmera para salvar fotos em JPG.');
      }

      // Convert to JPEG if needed
      if (fileType !== 'image/jpeg' && fileType !== 'image/jpg') {
        appLog.info('[Capture] Convertendo para JPEG...');
        try {
          imageBlob = await convertToJpeg(file);
          appLog.info('[Capture] Conversão OK', { newSize: imageBlob.size });
        } catch (convErr) {
          appLog.error('[Capture] Erro na conversão', convErr);
          imageBlob = file;
        }
      }

      // Compress image
      appLog.info('[Capture] Comprimindo imagem...');
      try {
        imageBlob = await compressImage(imageBlob, { maxDimension: 1920, quality: 0.82 });
      } catch (compErr) {
        appLog.error('[Capture] Erro na compressão', compErr);
        // Continue with original if compression fails
      }

      // Apply stamp if enabled
      if (showStamp) {
        appLog.info('[Capture] Aplicando carimbo...');
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
          appLog.info('[Capture] Carimbo aplicado', { finalSize: imageBlob.size });
        } catch (stampError) {
          appLog.error('[Capture] Erro ao aplicar carimbo', stampError);
        }
      }

      // Create preview URL
      const previewUrl = await blobToDataUrl(imageBlob);
      
      setPreparedPhoto({
        imageBlob,
        previewUrl,
        deviceTimestamp,
        latitude: position?.latitude ?? null,
        longitude: position?.longitude ?? null,
        accuracy: position?.accuracy ?? null,
      });

      appLog.info('[Capture] Preview pronto', { size: imageBlob.size });
    } catch (error) {
      appLog.error('[Capture] ERRO no processamento', error);
      const errorMessage = error instanceof Error
        ? error.message
        : String(error) || 'Não foi possível processar a foto.';

      toast({
        title: 'Erro no processamento',
        description: errorMessage,
        variant: 'destructive',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Save pending photo helper
  const saveAsPending = useCallback(async (photo: PreparedPhoto) => {
    if (!user || !profile) return;

    const trimmedCompany = (selectedCompany?.name || companyName).trim();
    const trimmedProject = (selectedProject?.name || projectName).trim();
    const trimmedFrente = frenteServico.trim() || 'Geral';
    const trimmedActivity = activity || null;
    const selectedTemplateId = templateId || null;

    await savePending.mutateAsync({
      id: generateId(),
      companyId: companyId || '',
      companyName: trimmedCompany,
      projectId: projectId || '',
      projectName: trimmedProject,
      frenteServico: trimmedFrente,
      templateId: selectedTemplateId,
      templateName: selectedTemplate?.name || null,
      activityText: trimmedActivity,
      deviceTimestamp: photo.deviceTimestamp.toISOString(),
      latitude: photo.latitude,
      longitude: photo.longitude,
      accuracy: photo.accuracy,
      imageBlob: photo.imageBlob,
      showStamp,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }, [companyName, projectName, frenteServico, activity, templateId, selectedTemplate, showStamp, user, profile, savePending]);

  // Confirm and send the photo
  const handleConfirmSend = async () => {
    if (!preparedPhoto || !user || !profile) return;

    setIsSending(true);
    const trimmedCompany = (selectedCompany?.name || companyName).trim();
    const trimmedProject = (selectedProject?.name || projectName).trim();
    const trimmedFrente = frenteServico.trim() || 'Geral';
    const trimmedActivity = activity || null;
    const selectedTemplateId = templateId || null;

    try {
      appLog.info('[Capture] Enviando foto', { isOnline });

      if (isOnline) {
        try {
          await uploadPhoto.mutateAsync({
            companyId: companyId || undefined,
            companySlug: selectedCompany?.slug || 'manual',
            companyName: trimmedCompany,
            projectId: projectId || undefined,
            projectName: trimmedProject,
            frenteServico: trimmedFrente,
            templateId: selectedTemplateId,
            activityText: trimmedActivity,
            deviceTimestamp: preparedPhoto.deviceTimestamp,
            latitude: preparedPhoto.latitude,
            longitude: preparedPhoto.longitude,
            accuracy: preparedPhoto.accuracy,
            imageBlob: preparedPhoto.imageBlob,
            showStamp,
            userName: profile.full_name,
            userId: user.id,
          });

          toast({
            title: 'Foto enviada!',
            description: 'A foto foi salva no servidor.',
          });
          appLog.info('[Capture] Upload online OK');
        } catch (uploadError) {
          // FALLBACK: save offline if online upload fails
          appLog.warn('[Capture] Upload online falhou, salvando offline', uploadError);
          
          await saveAsPending(preparedPhoto);
          
          toast({
            title: 'Salva offline (fallback)',
            description: 'O upload falhou, mas a foto foi salva localmente para sincronizar depois.',
            variant: 'default',
          });
        }
      } else {
        await saveAsPending(preparedPhoto);
        
        toast({
          title: 'Foto salva offline!',
          description: 'Será sincronizada quando houver conexão.',
        });
      }

      appLog.info('[Capture] Sucesso!');
      resetForm();
    } catch (error) {
      appLog.error('[Capture] ERRO COMPLETO', error);
      const errorMessage = error instanceof Error
        ? error.message
        : String(error) || 'Não foi possível salvar a foto.';

      toast({
        title: 'Erro ao salvar',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Preview Modal
  if (preparedPhoto) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Preview Header */}
        <header className="glass-header flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={cancelPreview} disabled={isSending}>
            <X className="h-5 w-5" />
          </Button>
          <h1 className="font-display font-semibold">Confirmar Envio</h1>
          <Button variant="ghost" size="icon" onClick={cancelPreview} disabled={isSending}>
            <RotateCcw className="h-5 w-5" />
          </Button>
        </header>

        {/* Photo Preview */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="h-full rounded-2xl overflow-hidden bg-black/20 relative">
            <img
              src={preparedPhoto.previewUrl}
              alt="Preview da foto"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pb-2">
          <div className="glass-card rounded-xl p-3 text-sm space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>{companyName}</span>
              <span className="mx-1">•</span>
              <FolderKanban className="h-3.5 w-3.5" />
              <span>{projectName}</span>
            </div>
            {frenteServico && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wrench className="h-3.5 w-3.5" />
                <span>{frenteServico || 'Geral'}</span>
              </div>
            )}
            <div className="text-xs text-muted-foreground/70">
              Tamanho: {(preparedPhoto.imageBlob.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 rounded-xl"
            onClick={cancelPreview}
            disabled={isSending}
          >
            <X className="mr-2 h-5 w-5" />
            Descartar
          </Button>
          <Button
            size="lg"
            className="flex-1 rounded-xl capture-btn"
            onClick={handleConfirmSend}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Confirmar
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

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

          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl hover:bg-secondary/50"
            onClick={() => {
              appLog.info('[Log] Download solicitado');
              downloadAppLog();
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Log
          </Button>
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
            <Select
              value={companyId || ""}
              onValueChange={(v) => {
                setCompanyId(v);
                const c = companies.find(x => x.id === v);
                setCompanyName(c?.name || '');
                setProjectId('');
                setProjectName('');
              }}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent className="glass-card border-border/50">
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <FolderKanban className="h-3.5 w-3.5" />
              Projeto/Obra
            </Label>
            <Select
              value={projectId || ""}
              onValueChange={(v) => {
                setProjectId(v);
                const p = filteredProjects.find(x => x.id === v);
                setProjectName(p?.name || '');
              }}
              disabled={!companyId}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl">
                <SelectValue placeholder={companyId ? "Selecione o projeto" : "Selecione a empresa primeiro"} />
              </SelectTrigger>
              <SelectContent className="glass-card border-border/50">
                {filteredProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            disabled={isProcessing}
          >
            {isProcessing ? (
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
