import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useExtractedEntities, useOCRReport, useProcessPhoto, useGenerateReport, TEMPLATE_TYPES } from '@/hooks/useOCR';
import { BottomNav } from '@/components/BottomNav';
import { ConfidenceBadge, ConfidenceSummary } from '@/components/ConfidenceBadge';
import { EntityList } from '@/components/EntityList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  Loader2, 
  Sparkles, 
  FileText, 
  Download,
  MapPin,
  Calendar,
  Building,
  FolderOpen,
  Scan,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PhotoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('civil_geral');

  // Fetch photo record
  const { data: photo, isLoading: isLoadingPhoto } = useQuery({
    queryKey: ['photo_record', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photo_records')
        .select(`
          *,
          companies(name),
          projects(name),
          templates(name, icon)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: entities = [], isLoading: isLoadingEntities } = useExtractedEntities(id || '');
  const { data: ocrReport } = useOCRReport(id || '');
  const processPhoto = useProcessPhoto();
  const generateReport = useGenerateReport();

  const handleProcessOCR = async () => {
    if (!photo) return;
    try {
      await processPhoto.mutateAsync({
        photoRecordId: photo.id,
        imageUrl: photo.file_url,
        templateType: selectedTemplate,
      });
      toast({
        title: 'OCR concluído!',
        description: 'A foto foi processada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro no OCR',
        description: error instanceof Error ? error.message : 'Falha ao processar foto',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadReport = async (format: 'json' | 'html' | 'markdown') => {
    if (!photo) return;
    try {
      const result = await generateReport.mutateAsync({
        photoRecordId: photo.id,
        format,
      });

      // Create download
      const blob = new Blob(
        [typeof result === 'string' ? result : JSON.stringify(result, null, 2)],
        { type: format === 'html' ? 'text/html' : format === 'markdown' ? 'text/markdown' : 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_${photo.id.slice(0, 8)}.${format === 'markdown' ? 'md' : format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Relatório gerado!',
        description: 'O download foi iniciado.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao gerar relatório',
        description: error instanceof Error ? error.message : 'Falha ao gerar relatório',
        variant: 'destructive',
      });
    }
  };

  // Calculate confidence summary
  const confidenceSummary = {
    green: entities.filter(e => e.confidence_level === 'green').length,
    yellow: entities.filter(e => e.confidence_level === 'yellow').length,
    red: entities.filter(e => e.confidence_level === 'red').length,
  };

  if (isLoadingPhoto) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p>Foto não encontrada</p>
        <Button onClick={() => navigate('/photos')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/photos')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">Detalhes da Foto</h1>
            <p className="text-xs text-muted-foreground">
              {format(new Date(photo.device_timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {photo.ocr_status === 'completed' && photo.ocr_confidence && (
              <ConfidenceBadge 
                level={photo.ocr_confidence >= 80 ? 'green' : photo.ocr_confidence >= 60 ? 'yellow' : 'red'} 
                score={photo.ocr_confidence}
              />
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {/* Photo Preview */}
        <Card className="overflow-hidden">
          <div className="aspect-video relative bg-muted">
            <img 
              src={photo.file_url} 
              alt="Foto capturada"
              className="w-full h-full object-cover"
            />
            {photo.ocr_status === 'processing' && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm">Processando OCR...</p>
                </div>
              </div>
            )}
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{photo.companies?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{photo.projects?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(photo.device_timestamp), "dd/MM/yyyy HH:mm")}</span>
              </div>
              {photo.latitude && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">
                    {photo.latitude.toFixed(4)}, {photo.longitude?.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
            {photo.activity_text && (
              <p className="text-sm text-muted-foreground">
                <strong>Atividade:</strong> {photo.activity_text}
              </p>
            )}
          </CardContent>
        </Card>

        {/* OCR Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Scan className="h-4 w-4" />
                OCR & IA
              </CardTitle>
              {photo.ocr_status === 'completed' && (
                <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">
                  Processado
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {photo.ocr_status === 'pending' || photo.ocr_status === 'error' ? (
              <div className="space-y-4">
                {photo.ocr_status === 'error' && photo.processing_error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <strong>Erro:</strong> {photo.processing_error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template de Processamento</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.icon} {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleProcessOCR}
                  disabled={processPhoto.isPending}
                >
                  {processPhoto.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Processar com OCR + IA
                    </>
                  )}
                </Button>
              </div>
            ) : photo.ocr_status === 'processing' ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Processando OCR...</p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="entities">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="entities">Entidades</TabsTrigger>
                  <TabsTrigger value="text">Texto</TabsTrigger>
                  <TabsTrigger value="report">Relatório</TabsTrigger>
                </TabsList>

                <TabsContent value="entities" className="space-y-4">
                  <ConfidenceSummary 
                    {...confidenceSummary}
                    overall={photo.ocr_confidence || undefined}
                  />
                  {isLoadingEntities ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <EntityList entities={entities} editable />
                  )}
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  {photo.ocr_processed_text ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Texto Processado</h4>
                        <pre className="p-3 rounded-lg bg-muted text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                          {photo.ocr_processed_text}
                        </pre>
                      </div>
                      {photo.ocr_raw_text && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Texto Original (OCR)</h4>
                          <pre className="p-3 rounded-lg bg-muted text-xs overflow-auto max-h-40 whitespace-pre-wrap opacity-60">
                            {photo.ocr_raw_text}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      Nenhum texto extraído
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="report" className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => handleDownloadReport('html')}
                      disabled={generateReport.isPending}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Baixar Relatório HTML
                      <Download className="ml-auto h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => handleDownloadReport('markdown')}
                      disabled={generateReport.isPending}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Baixar Relatório Markdown
                      <Download className="ml-auto h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => handleDownloadReport('json')}
                      disabled={generateReport.isPending}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Baixar Dados JSON
                      <Download className="ml-auto h-4 w-4" />
                    </Button>
                  </div>
                  {ocrReport && (
                    <div className="p-3 rounded-lg bg-muted text-sm">
                      <p><strong>Status:</strong> {ocrReport.status}</p>
                      <p><strong>Confiança:</strong> {ocrReport.overall_confidence}%</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
