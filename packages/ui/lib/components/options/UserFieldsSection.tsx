import { UserFieldInput } from './UserFieldInput';
import type { UserField } from '@extension/storage';

interface UserFieldsSectionProps {
  title: string;
  description: string;
  userFields: UserField[];
  onSave: (id: string, value: string) => Promise<void>;
  onCopy: (id: string) => Promise<boolean>;
  onClear: (id: string) => Promise<void>;
}

export const UserFieldsSection = ({
  title,
  description,
  userFields,
  onSave,
  onCopy,
  onClear,
}: UserFieldsSectionProps) => (
  <section className="space-y-4">
    <div>
      <h2 className="text-foreground text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>

    <div className="space-y-3">
      {userFields.map(field => (
        <UserFieldInput
          key={field.id}
          id={field.id}
          label={field.label}
          value={field.value}
          placeholder={field.placeholder}
          onSave={onSave}
          onCopy={onCopy}
          onClear={onClear}
        />
      ))}
    </div>
  </section>
);
