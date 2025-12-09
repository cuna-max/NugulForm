import { MissingFieldsPopover } from './MissingFieldsPopover';
import { Popover, PopoverTrigger } from '../ui/popover';
import { PopoverContentShadow } from '../ui/popover-shadow';
import { Wand2, Check } from 'lucide-react';
import { useState } from 'react';
import type { MissingField } from '@extension/storage';

// =====================
// Types
// =====================

export interface FloatingAutofillButtonProps {
  /** 버튼 상태: normal(기본) 또는 filled(기입 완료) */
  state?: 'normal' | 'filled';
  /** 미기입 필드 목록 (filled 상태일 때 표시) */
  missingFields?: MissingField[];
  /** 자동 채우기 실행 핸들러 */
  onAutofill?: () => Promise<void>;
  /** 복사 버튼 클릭 핸들러 */
  onCopy?: (fieldId: string) => Promise<boolean>;
  /** 바로 기입 버튼 클릭 핸들러 */
  onInlineFill?: (fieldId: string) => Promise<void>;
  /** Popup에서 보기 클릭 핸들러 */
  onViewInPopup?: () => void;
}

// =====================
// Constants
// =====================

const TOOLTIP_DELAY_MS = 500;

// =====================
// Component
// =====================

/**
 * 플로팅 자동 채우기 버튼 컴포넌트
 * - 우측 하단에 고정된 위치에 표시
 * - normal 상태: 자동 채우기 실행 버튼
 * - filled 상태: 기입 완료 표시 및 미기입 필드 Popover 제공
 */
export const FloatingAutofillButton = ({
  state = 'normal',
  missingFields = [],
  onAutofill,
  onCopy,
  onInlineFill,
  onViewInPopup,
}: FloatingAutofillButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const hasMissingFields = missingFields.length > 0;
  const canShowPopover = state === 'filled' && hasMissingFields && onCopy && onInlineFill;

  const handleClick = async (e: React.MouseEvent) => {
    if (state === 'normal' && onAutofill) {
      e.preventDefault();
      e.stopPropagation();
      await onAutofill();
    }
    // filled 상태일 때는 PopoverTrigger가 자동으로 처리
  };

  const handlePopoverOpenChange = (open: boolean) => {
    setShowPopover(open);
    if (!open) {
      setShowTooltip(false);
    }
  };

  // Normal 상태: 일반 버튼
  if (state === 'normal') {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onMouseEnter={() => setShowTooltip(false)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={handleClick}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
          <Wand2 className="h-6 w-6 text-white" strokeWidth={2} />
        </button>
      </div>
    );
  }

  // Filled 상태: Popover가 있는 버튼
  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Tooltip */}
      {showTooltip && !showPopover && (
        <div className="animate-in fade-in-0 zoom-in-95 absolute bottom-full right-0 mb-3">
          <div className="relative whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg">
            기입 완료
            <div className="absolute left-1/2 top-full -translate-x-1/2">
              <div className="border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      )}

      {/* Button with Popover */}
      {canShowPopover ? (
        <Popover open={showPopover} onOpenChange={handlePopoverOpenChange}>
          <PopoverTrigger asChild>
            <button
              onMouseEnter={() => {
                setTimeout(() => setShowTooltip(true), TOOLTIP_DELAY_MS);
              }}
              onMouseLeave={() => {
                if (!showPopover) {
                  setShowTooltip(false);
                }
              }}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-green-600 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2">
              <Check className="h-6 w-6 text-white" strokeWidth={2.5} />
            </button>
          </PopoverTrigger>

          <PopoverContentShadow side="top" align="end" className="w-auto p-0">
            <MissingFieldsPopover
              missingFields={missingFields}
              onCopy={onCopy}
              onInlineFill={onInlineFill}
              onViewInPopup={onViewInPopup}
            />
          </PopoverContentShadow>
        </Popover>
      ) : (
        <button
          onMouseEnter={() => {
            setTimeout(() => setShowTooltip(true), TOOLTIP_DELAY_MS);
          }}
          onMouseLeave={() => setShowTooltip(false)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-green-600 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2">
          <Check className="h-6 w-6 text-white" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
