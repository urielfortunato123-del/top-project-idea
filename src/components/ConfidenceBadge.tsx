import { cn } from '@/lib/utils';

interface ConfidenceBadgeProps {
  level: 'green' | 'yellow' | 'red';
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export function ConfidenceBadge({ level, score, size = 'md', showScore = true }: ConfidenceBadgeProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const colorClasses = {
    green: 'bg-green-500 shadow-green-500/50',
    yellow: 'bg-yellow-500 shadow-yellow-500/50',
    red: 'bg-red-500 shadow-red-500/50',
  };

  const labelMap = {
    green: 'Alta',
    yellow: 'Média',
    red: 'Baixa',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <span 
        className={cn(
          'rounded-full shadow-lg',
          sizeClasses[size],
          colorClasses[level]
        )}
      />
      {showScore && score !== undefined && (
        <span className="text-xs text-muted-foreground">
          {score}%
        </span>
      )}
    </div>
  );
}

interface ConfidenceSummaryProps {
  green: number;
  yellow: number;
  red: number;
  overall?: number;
}

export function ConfidenceSummary({ green, yellow, red, overall }: ConfidenceSummaryProps) {
  const total = green + yellow + red;

  return (
    <div className="flex flex-col gap-2">
      {overall !== undefined && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Confiança Geral</span>
          <span className={cn(
            'text-lg font-bold',
            overall >= 80 ? 'text-green-500' : overall >= 60 ? 'text-yellow-500' : 'text-red-500'
          )}>
            {overall}%
          </span>
        </div>
      )}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{green}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">{yellow}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-muted-foreground">{red}</span>
        </div>
      </div>
      {total > 0 && (
        <div className="h-2 rounded-full bg-muted overflow-hidden flex">
          {green > 0 && (
            <div 
              className="h-full bg-green-500" 
              style={{ width: `${(green / total) * 100}%` }}
            />
          )}
          {yellow > 0 && (
            <div 
              className="h-full bg-yellow-500" 
              style={{ width: `${(yellow / total) * 100}%` }}
            />
          )}
          {red > 0 && (
            <div 
              className="h-full bg-red-500" 
              style={{ width: `${(red / total) * 100}%` }}
            />
          )}
        </div>
      )}
    </div>
  );
}
