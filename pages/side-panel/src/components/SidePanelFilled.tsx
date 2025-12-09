import { useExtensionState, useAutofill } from '@extension/shared';
import { PopupHeader, MissingFieldItem, AutofillButton } from '@extension/ui';

// =====================
// Types
// =====================

export interface SidePanelFilledProps {
  /** 로고 이미지 URL */
  logoUrl: string;
}

// =====================
// Component
// =====================

/**
 * Filled 상태 SidePanel 컴포넌트
 * - 자동 채우기가 완료된 후 표시
 * - 미기입 필드 목록 및 바로 기입 기능 제공
 */
export const SidePanelFilled = ({ logoUrl }: SidePanelFilledProps) => {
  const { state } = useExtensionState();
  const { status, missingFields, copyFieldValue, inlineFill, reset } = useAutofill();

  const hasMissingFields = missingFields.length > 0;

  return (
    <div className="bg-background flex h-full flex-col overflow-hidden">
      <PopupHeader extensionState={state} autofillStatus={status} logoUrl={logoUrl} />

      <div className="flex flex-1 flex-col space-y-4 overflow-y-auto p-4">
        {/* 미기입 필드 섹션 */}
        {hasMissingFields ? (
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm">빠뜨린 항목이 있나요?</h3>
            <div className="space-y-2">
              {missingFields.map(field => (
                <MissingFieldItem key={field.fieldId} field={field} onCopy={copyFieldValue} onInlineFill={inlineFill} />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm">모든 필드가 성공적으로 입력되었습니다!</p>
          </div>
        )}

        {/* 다시 입력하기 버튼 */}
        <AutofillButton status={status} onExecute={reset} onReset={reset} />
      </div>
    </div>
  );
};
