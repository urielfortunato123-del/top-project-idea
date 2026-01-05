import { cn } from '@/lib/utils';
import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';

type Status = 'pending' | 'syncing' | 'synced' | 'error';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  syncing: {
    label: 'Enviando...',
    icon: Loader2,
    className: 'bg-info/10 text-info border-info/30',
  },
  synced: {
    label: 'Enviado',
    icon: Check,
    className: 'bg-success/10 text-success border-success/30',
  },
  error: {
    label: 'Erro',
    icon: AlertCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', status === 'syncing' && 'animate-spin')} />
      {config.label}
    </span>
  );
}