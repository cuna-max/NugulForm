import { AutoOptionSwitch } from './AutoOptionSwitch';
import type { AutoOption } from '@extension/storage';

interface AutoOptionsSectionProps {
  title: string;
  description: string;
  autoOptions: AutoOption[];
  onToggle: (id: string) => Promise<void>;
}

export const AutoOptionsSection = ({ title, description, autoOptions, onToggle }: AutoOptionsSectionProps) => (
  <section className="space-y-4">
    <div>
      <h2 className="text-foreground text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>

    <div className="space-y-3">
      {autoOptions.map(option => (
        <AutoOptionSwitch
          key={option.id}
          id={option.id}
          title={option.title}
          description={option.description}
          enabled={option.enabled}
          onToggle={onToggle}
        />
      ))}
    </div>
  </section>
);
