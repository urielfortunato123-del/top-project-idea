import { Wifi, WifiOff, Cloud, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SyncIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  onSync: () => void;
}

export function SyncIndicator({ isOnline, isSyncing, pendingCount, onSync }: SyncIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Online status */}
      <div
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
          isOnline
            ? 'bg-success/10 text-success'
            : 'bg-destructive/10 text-destructive'
        )}
      >
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isOnline ? 'Online' : 'Offline'}
      </div>

      {/* Pending count */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
          <Cloud className="h-3 w-3" />
          {pendingCount}
        </div>
      )}

      {/* Sync button */}
      {isOnline && pendingCount > 0 && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onSync}
          disabled={isSyncing}
          className="h-8 px-2"
        >
          <RefreshCw
            className={cn('h-4 w-4', isSyncing && 'animate-spin')}
          />
        </Button>
      )}
    </div>
  );
}