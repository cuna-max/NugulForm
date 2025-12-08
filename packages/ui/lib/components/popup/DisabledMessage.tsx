import { AlertCircle } from 'lucide-react';

// =====================
// Types
// =====================

export interface DisabledMessageProps {
  /** 메시지 내용 (기본값 제공) */
  message?: string;
}

// =====================
// Constants
// =====================

const DEFAULT_MESSAGE = '이 페이지에서는 자동 입력을 사용할 수 없습니다.';

// =====================
// Component
// =====================

/**
 * 비활성 상태 메시지 컴포넌트
 * - Disabled 상태일 때 표시되는 안내 메시지
 */
export const DisabledMessage = ({ message = DEFAULT_MESSAGE }: DisabledMessageProps) => (
  <div className="bg-muted/50 border-border flex items-start gap-2.5 rounded-md border p-3">
    <AlertCircle className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
    <p className="text-muted-foreground text-xs leading-relaxed">{message}</p>
  </div>
);
