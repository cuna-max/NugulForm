import { useUserFields, useExtensionState, useAutofill } from '@extension/shared';
import { PopupHeader, DisabledMessage, ConfigFieldInput } from '@extension/ui';

// =====================
// Types
// =====================

export interface PopupDisabledProps {
  /** 로고 이미지 URL */
  logoUrl: string;
}

// =====================
// Component
// =====================

/**
 * Disabled 상태 Popup 컴포넌트
 * - 비지원 페이지에서 표시
 * - 필드 설정 기능만 제공
 */
export const PopupDisabled = ({ logoUrl }: PopupDisabledProps) => {
  const { state } = useExtensionState();
  const { userFields, updateField } = useUserFields();
  const { status } = useAutofill();

  return (
    <div className="bg-background w-[360px] overflow-hidden rounded-lg border shadow-lg">
      <PopupHeader extensionState={state} autofillStatus={status} logoUrl={logoUrl} />

      <div className="space-y-4 p-4">
        {/* 비활성 안내 메시지 */}
        <DisabledMessage />

        {/* 설정 폼 */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm">작성하지 않은 필드</h3>
          <div className="space-y-3">
            {userFields.map(field => (
              <ConfigFieldInput key={field.id} field={field} onSave={updateField} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupDisabled;
