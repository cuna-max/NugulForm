import { cn } from '@/lib/utils';
import { exampleThemeStorage } from '@extension/storage';
import type { ComponentPropsWithoutRef } from 'react';

type ToggleButtonProps = ComponentPropsWithoutRef<'button'>;

export const ToggleButton = ({ className, children, ...props }: ToggleButtonProps) => (
  <button
    className={cn(
      'border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground mt-4 rounded-lg border-2 px-4 py-1 font-bold shadow transition-colors hover:scale-105',
      className,
    )}
    onClick={exampleThemeStorage.toggle}
    {...props}>
    {children}
  </button>
);
