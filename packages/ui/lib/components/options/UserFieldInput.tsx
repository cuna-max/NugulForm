import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { Save, Copy, Trash2, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';

interface UserFieldInputProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onSave: (id: string, value: string) => Promise<void>;
  onCopy: (id: string) => Promise<boolean>;
  onClear: (id: string) => Promise<void>;
  className?: string;
}

const FEEDBACK_DISPLAY_MS = 1500;

export const UserFieldInput = ({
  id,
  label,
  value,
  placeholder,
  onSave,
  onCopy,
  onClear,
  className,
}: UserFieldInputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const hasChanges = inputValue !== value;

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSave = useCallback(async () => {
    await onSave(id, inputValue);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), FEEDBACK_DISPLAY_MS);
  }, [id, inputValue, onSave]);

  const handleCopy = useCallback(async () => {
    const success = await onCopy(id);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), FEEDBACK_DISPLAY_MS);
    }
  }, [id, onCopy]);

  const handleClear = useCallback(async () => {
    await onClear(id);
    setInputValue('');
  }, [id, onClear]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && hasChanges) {
        handleSave();
      }
    },
    [hasChanges, handleSave],
  );

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Label className="text-foreground w-32 flex-shrink-0 text-sm">{label}</Label>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1"
      />
      <div className="flex flex-shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          disabled={!hasChanges}
          title="저장"
          tabIndex={-1}
          className={cn(isSaved && 'text-green-500')}>
          {isSaved ? <Check className="h-4 w-4" /> : <Save className="text-primary h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          disabled={!value}
          title="복사"
          tabIndex={-1}
          className={cn(isCopied && 'text-green-500')}>
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="text-muted-foreground h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleClear} disabled={!value} title="삭제" tabIndex={-1}>
          <Trash2 className="text-destructive h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
