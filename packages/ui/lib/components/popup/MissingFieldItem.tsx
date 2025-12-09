import { Button } from '../ui/button';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import type { MissingField } from '@extension/storage';

// =====================
// Types
// =====================

export interface MissingFieldItemProps {
  /** 미기입 필드 데이터 */
  field: MissingField;
  /** 복사 버튼 클릭 핸들러 */
  onCopy: (fieldId: string) => Promise<boolean>;
  /** 바로 기입 버튼 클릭 핸들러 */
  onInlineFill: (fieldId: string) => Promise<void>;
}

// =====================
// Constants
// =====================

const COPY_FEEDBACK_DURATION_MS = 1500;

// =====================
// Component
// =====================

/**
 * 미기입 필드 아이템 컴포넌트
 * - 누락된 필드 정보 표시
 * - 복사/바로기입 액션 버튼
 */
export const MissingFieldItem = ({ field, onCopy, onInlineFill }: MissingFieldItemProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const success = await onCopy(field.fieldId);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION_MS);
    }
  };

  const handleInlineFill = async () => {
    await onInlineFill(field.fieldId);
  };

  return (
    <div className="bg-accent/50 hover:bg-accent/70 flex items-center justify-between rounded-md border p-3 transition-colors">
      <span className="text-foreground text-sm">{field.fieldLabel}</span>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
          {isCopied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleInlineFill}>
          바로 기입
        </Button>
      </div>
    </div>
  );
};
