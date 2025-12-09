import { useUserFields, useExtensionState, useAutofill } from '@extension/shared';
import { PopupHeader, DisabledMessage, ConfigFieldInput } from '@extension/ui';

// =====================
// Types
// =====================

export interface SidePanelDisabledProps {
  /** 로고 이미지 URL */
  logoUrl: string;
}

// =====================
// Component
// =====================

/**
 * Disabled 상태 SidePanel 컴포넌트
 * - 비지원 페이지에서 표시
 * - 필드 설정 기능만 제공
 */
export const SidePanelDisabled = ({ logoUrl }: SidePanelDisabledProps) => {
  const { state } = useExtensionState();
  const { emptyFields, updateField } = useUserFields();
  const { status } = useAutofill();

  return (
    <div className="bg-background flex h-full flex-col overflow-hidden">
      <PopupHeader extensionState={state} autofillStatus={status} logoUrl={logoUrl} />

      <div className="flex flex-1 flex-col space-y-4 overflow-y-auto p-4">
        {/* 비활성 안내 메시지 */}
        <DisabledMessage />

        {/* 작성하지 않은 필드 */}
        {emptyFields.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm">작성하지 않은 필드</h3>
            <div className="space-y-3">
              {emptyFields.map(field => (
                <ConfigFieldInput key={field.id} field={field} onSave={updateField} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
