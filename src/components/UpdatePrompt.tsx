import { useEffect, useState } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UpdatePrompt() {
  const { needsRefresh, offlineReady, updateServiceWorker } = useServiceWorker();
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (offlineReady) {
      setShowOfflineToast(true);
      const timer = setTimeout(() => setShowOfflineToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady]);

  const handleUpdate = () => {
    updateServiceWorker();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Offline ready toast
  if (showOfflineToast) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
        <div className="glass-card p-4 flex items-center gap-3 border border-success/30">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Pronto para uso offline!</p>
            <p className="text-xs text-muted-foreground">O app foi salvo para uso sem internet.</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowOfflineToast(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Update available prompt
  if (needsRefresh && !dismissed) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
        <div className="glass-card p-4 border border-primary/30 shadow-glow">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse-glow">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Nova versão disponível!
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Uma atualização do ObraPhoto está pronta para ser instalada.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  className={cn(
                    "flex-1 gap-2",
                    "bg-gradient-to-r from-primary to-accent",
                    "hover:opacity-90 transition-opacity"
                  )}
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar agora
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="px-3"
                >
                  Depois
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
