import { Button } from '../ui/button';
import { Check } from 'lucide-react';
import type { AutofillStatus } from '@extension/storage';

// =====================
// Types
// =====================

export interface AutofillButtonProps {
  /** 자동 채우기 상태 */
  status: AutofillStatus;
  /** 자동 채우기 실행 핸들러 */
  onExecute: () => Promise<void>;
  /** 다시 실행 핸들러 */
  onReset?: () => Promise<void>;
  /** 버튼 비활성화 여부 */
  disabled?: boolean;
}

// =====================
// Component
// =====================

/**
 * 자동 채우기 버튼 컴포넌트
 * - idle: "자동 채우기 실행" 버튼
 * - filled: "기입 완료" 표시 또는 "다시 입력하기" 버튼
 */
export const AutofillButton = ({ status, onExecute, onReset, disabled }: AutofillButtonProps) => {
  if (status === 'filled') {
    return onReset ? (
      <Button variant="outline" className="w-full" onClick={onReset}>
        다시 입력하기
      </Button>
    ) : (
      <div className="flex items-center justify-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-2.5 text-green-700">
        <Check className="h-4 w-4" />
        <span className="text-sm">기입 완료</span>
      </div>
    );
  }

  return (
    <Button className="w-full" onClick={onExecute} disabled={disabled}>
      자동 채우기 실행
    </Button>
  );
};
