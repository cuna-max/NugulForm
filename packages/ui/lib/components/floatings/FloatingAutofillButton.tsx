import { Wand2 } from 'lucide-react';

// =====================
// Types
// =====================

export interface FloatingAutofillButtonProps {
  /** 자동 채우기 실행 핸들러 (autofill 후 popup 열기까지 처리) */
  onAutofill?: () => Promise<void>;
}

// =====================
// Component
// =====================

/**
 * 플로팅 자동 채우기 버튼 컴포넌트
 * - 우측 하단에 고정된 위치에 표시
 * - active 상태에서만 표시됨
 * - 클릭 시 자동 채우기 실행 후 popup 자동 열림
 */
export const FloatingAutofillButton = ({ onAutofill }: FloatingAutofillButtonProps) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onAutofill?.();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button
        onClick={handleClick}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
        <Wand2 className="h-6 w-6 text-white" strokeWidth={2} />
      </button>
    </div>
  );
};
