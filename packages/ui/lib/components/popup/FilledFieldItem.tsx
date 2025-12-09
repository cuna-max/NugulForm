import { Button } from '../ui/button';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import type { FilledField } from '@extension/storage';

// =====================
// Types
// =====================

export interface FilledFieldItemProps {
  /** 자동 기입된 필드 데이터 */
  field: FilledField;
  /** 복사 버튼 클릭 핸들러 */
  onCopy: (fieldId: string) => Promise<boolean>;
}

// =====================
// Constants
// =====================

const COPY_FEEDBACK_DURATION_MS = 1500;

// =====================
// Component
// =====================

/**
 * 자동 기입된 필드 아이템 컴포넌트
 * - 자동으로 채워진 필드 정보 표시
 * - 복사 액션 버튼 제공
 */
export const FilledFieldItem = ({ field, onCopy }: FilledFieldItemProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const success = await onCopy(field.fieldId);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION_MS);
    }
  };

  return (
    <div className="bg-muted/50 hover:bg-muted flex items-center justify-between rounded-md border p-3 transition-colors">
      <div className="flex flex-col gap-0.5">
        <span className="text-foreground text-sm font-medium">{field.fieldLabel}</span>
        <span className="text-muted-foreground text-xs">{field.formLabel}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground max-w-[120px] truncate text-xs">{field.filledValue}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
          {isCopied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
};
