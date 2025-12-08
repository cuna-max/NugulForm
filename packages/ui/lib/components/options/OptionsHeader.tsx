import { ThemeToggle } from './ThemeToggle';
import { CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';

interface OptionsHeaderProps {
  logoSrc: string;
  title: string;
  description: string;
  className?: string;
}

export const OptionsHeader = ({ logoSrc, title, description, className }: OptionsHeaderProps) => (
  <CardHeader className={cn('border-border border-b', className)}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={logoSrc} alt="NugulForm" className="h-10 w-10" />
        <div>
          <CardTitle className="text-foreground">{title}</CardTitle>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
      </div>
      <ThemeToggle />
    </div>
  </CardHeader>
);
