import { useState } from 'react';
import { usePhotosWithOCRErrors, useBatchReprocessOCR } from '@/hooks/useBatchOCR';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Loader2 
} from 'lucide-react';

export function BatchOCRPanel() {
  const { toast } = useToast();
  const { data: errorPhotos = [], isLoading } = usePhotosWithOCRErrors();
  const { mutateAsync: batchReprocess, isPending, progress } = useBatchReprocessOCR();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastResults, setLastResults] = useState<{ success: number; failed: number } | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === errorPhotos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(errorPhotos.map(p => p.id)));
    }
  };

  const handleBatchReprocess = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'Nenhuma foto selecionada',
        description: 'Selecione pelo menos uma foto para reprocessar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const results = await batchReprocess(Array.from(selectedIds));
      const success = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      setLastResults({ success, failed });
      setSelectedIds(new Set());

      toast({
        title: 'Batch concluído',
        description: `${success} sucesso, ${failed} falha(s)`,
        variant: failed > 0 ? 'destructive' : 'default',
      });
    } catch (error) {
      toast({
        title: 'Erro no batch',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Batch Reprocessamento OCR
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {errorPhotos.length} foto(s) com erro
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastResults && (
          <div className="flex gap-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">{lastResults.success} sucesso</span>
            </div>
            {lastResults.failed > 0 && (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{lastResults.failed} falha(s)</span>
              </div>
            )}
          </div>
        )}

        {isPending && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processando...</span>
              <span>{progress.current}/{progress.total}</span>
            </div>
            <Progress value={(progress.current / progress.total) * 100} className="h-2" />
          </div>
        )}

        {errorPhotos.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma foto com erro de OCR
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.size === errorPhotos.length && errorPhotos.length > 0}
                  onCheckedChange={selectAll}
                />
                <span className="text-sm">
                  {selectedIds.size > 0 
                    ? `${selectedIds.size} selecionada(s)` 
                    : 'Selecionar todas'}
                </span>
              </div>
              <Button
                size="sm"
                onClick={handleBatchReprocess}
                disabled={isPending || selectedIds.size === 0}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
                Reprocessar
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {errorPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.has(photo.id)}
                    onCheckedChange={() => toggleSelect(photo.id)}
                  />
                  <div className="w-12 h-12 rounded overflow-hidden bg-muted shrink-0">
                    <img
                      src={photo.file_url}
                      alt="Foto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {photo.companies?.name || 'Sem empresa'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(photo.device_timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {photo.processing_error && (
                      <p className="text-xs text-destructive truncate mt-1">
                        {photo.processing_error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
