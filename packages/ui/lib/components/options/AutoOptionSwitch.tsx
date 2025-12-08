import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

interface AutoOptionSwitchProps {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (id: string) => Promise<void>;
  className?: string;
}

export const AutoOptionSwitch = ({ id, title, description, enabled, onToggle, className }: AutoOptionSwitchProps) => {
  const handleToggle = useCallback(async () => {
    await onToggle(id);
  }, [id, onToggle]);

  return (
    <div
      className={cn(
        'border-border hover:bg-accent/50 flex items-center justify-between rounded-lg border p-4 transition-colors',
        className,
      )}>
      <div className="flex-1 pr-4">
        <div className="text-foreground text-sm font-medium">{title}</div>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={handleToggle} />
    </div>
  );
};
