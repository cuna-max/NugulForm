import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Save, Check } from 'lucide-react';
import { useState } from 'react';
import type { UserField } from '@extension/storage';

// =====================
// Types
// =====================

export interface ConfigFieldInputProps {
  /** 필드 데이터 */
  field: UserField;
  /** 저장 핸들러 */
  onSave: (fieldId: string, value: string) => Promise<void>;
}

// =====================
// Constants
// =====================

const SAVE_FEEDBACK_DURATION_MS = 1500;

// =====================
// Component
// =====================

/**
 * 설정 필드 입력 컴포넌트
 * - 라벨, 입력 필드, 저장 버튼
 * - Disabled 상태의 Popup에서 사용
 */
export const ConfigFieldInput = ({ field, onSave }: ConfigFieldInputProps) => {
  const [value, setValue] = useState(field.value);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    await onSave(field.id, value);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), SAVE_FEEDBACK_DURATION_MS);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{field.label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={field.placeholder}
          className="h-9 text-sm"
        />
        <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={handleSave}>
          {isSaved ? <Check className="h-4 w-4 text-green-600" /> : <Save className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
