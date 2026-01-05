import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SyncStatus } from '@/types/photo';

interface SyncIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  syncStatus: SyncStatus;
  onSync: () => void;
}

export function SyncIndicator({ isOnline, isSyncing, syncStatus, onSync }: SyncIndicatorProps) {
  const hasPending = syncStatus.pending > 0 || syncStatus.error > 0;

  return (
    <div className="flex items-center gap-3">
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
      {hasPending && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
          {syncStatus.error > 0 ? (
            <CloudOff className="h-3 w-3" />
          ) : (
            <Cloud className="h-3 w-3" />
          )}
          {syncStatus.pending + syncStatus.error} pendentes
        </div>
      )}

      {/* Sync button */}
      {isOnline && hasPending && (
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