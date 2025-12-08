import { Button } from '../ui/button';
import { Check, Copy, Pencil } from 'lucide-react';
import { useState } from 'react';
import type { UserField } from '@extension/storage';

// =====================
// Types
// =====================

export interface SavedFieldItemProps {
  /** 필드 데이터 */
  field: UserField;
  /** 복사 버튼 클릭 핸들러 */
  onCopy: (fieldId: string) => Promise<boolean>;
  /** 편집 버튼 클릭 핸들러 */
  onEdit?: (fieldId: string) => void;
}

// =====================
// Constants
// =====================

const COPY_FEEDBACK_DURATION_MS = 1500;

// =====================
// Component
// =====================

/**
 * 저장된 필드 아이템 컴포넌트
 * - 필드 라벨, 값 표시
 * - 복사/편집 액션 버튼
 */
export const SavedFieldItem = ({ field, onCopy, onEdit }: SavedFieldItemProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const success = await onCopy(field.id);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION_MS);
    }
  };

  const handleEdit = () => {
    onEdit?.(field.id);
  };

  // 값이 없으면 표시하지 않음
  if (!field.value) return null;

  return (
    <div className="bg-muted/50 hover:bg-muted group flex items-center justify-between rounded-md p-3 transition-colors">
      <div className="mr-3 min-w-0 flex-1">
        <div className="text-muted-foreground mb-0.5 text-xs">{field.label}</div>
        <div className="text-foreground truncate text-sm">{field.value}</div>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
          {isCopied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
        {onEdit && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
