import { MissingFieldItem } from '../popup/MissingFieldItem';
import { Separator } from '../ui/separator';
import { ExternalLink } from 'lucide-react';
import type { MissingField } from '@extension/storage';

// =====================
// Types
// =====================

export interface MissingFieldsPopoverProps {
  /** 미기입 필드 목록 */
  missingFields: MissingField[];
  /** 복사 버튼 클릭 핸들러 */
  onCopy: (fieldId: string) => Promise<boolean>;
  /** 바로 기입 버튼 클릭 핸들러 */
  onInlineFill: (fieldId: string) => Promise<void>;
  /** Popup에서 보기 클릭 핸들러 */
  onViewInPopup?: () => void;
}

// =====================
// Component
// =====================

/**
 * 미기입 필드 Popover 컴포넌트
 * - 플로팅 버튼 클릭 시 표시되는 미기입 필드 목록
 * - 각 필드별 복사 및 바로 기입 기능 제공
 */
export const MissingFieldsPopover = ({
  missingFields,
  onCopy,
  onInlineFill,
  onViewInPopup,
}: MissingFieldsPopoverProps) => {
  if (missingFields.length === 0) {
    return null;
  }

  return (
    <div className="w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <div className="px-4 py-3">
        <h3 className="text-sm font-medium text-gray-900">기입 결과 확인</h3>
      </div>

      <Separator />

      {/* Content */}
      <div className="space-y-3 p-4">
        <p className="text-xs text-gray-500">다음 필드가 누락되었습니다:</p>

        {/* Missing Fields List */}
        <div className="space-y-2">
          {missingFields.map(field => (
            <MissingFieldItem key={field.fieldId} field={field} onCopy={onCopy} onInlineFill={onInlineFill} />
          ))}
        </div>

        {onViewInPopup && (
          <>
            <Separator />

            {/* Footer Link */}
            <button
              onClick={onViewInPopup}
              className="flex w-full items-center gap-1.5 text-xs text-blue-600 transition-colors hover:text-blue-700">
              <span>Popup에서 보기</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
