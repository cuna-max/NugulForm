import { useUserFields, useExtensionState, useAutofill } from '@extension/shared';
import { PopupHeader, SavedFieldItem, AutofillButton } from '@extension/ui';

// =====================
// Types
// =====================

export interface PopupActiveProps {
  /** 로고 이미지 URL */
  logoUrl: string;
}

// =====================
// Component
// =====================

/**
 * Active 상태 Popup 컴포넌트
 * - Google Forms 페이지에서 표시
 * - 저장된 필드 목록 및 자동 채우기 기능 제공
 */
export const PopupActive = ({ logoUrl }: PopupActiveProps) => {
  const { state } = useExtensionState();
  const { filledFields, copyToClipboard } = useUserFields();
  const { status, executeAutofill } = useAutofill();

  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="bg-background w-[360px] overflow-hidden rounded-lg border shadow-lg">
      <PopupHeader extensionState={state} autofillStatus={status} logoUrl={logoUrl} />

      <div className="space-y-4 p-4">
        {/* 자동 채우기 버튼 */}
        <AutofillButton status={status} onExecute={executeAutofill} disabled={filledFields.length === 0} />

        {/* 저장된 필드 섹션 */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm">저장된 필드</h3>
          {filledFields.length > 0 ? (
            <div className="space-y-2">
              {filledFields.map(field => (
                <SavedFieldItem key={field.id} field={field} onCopy={copyToClipboard} onEdit={handleOpenOptions} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              저장된 필드가 없습니다.{' '}
              <button onClick={handleOpenOptions} className="text-primary underline">
                설정에서 추가
              </button>
              하세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupActive;
