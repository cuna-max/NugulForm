import { useExtensionState, useAutofill } from '@extension/shared';

// =====================
// Types
// =====================

export type PanelViewType = 'active' | 'disabled' | 'filled';

// =====================
// Constants
// =====================

const LOGO_ACTIVE = chrome.runtime.getURL('nugul.png');
const LOGO_DISABLED = chrome.runtime.getURL('nugul-disabled.png');

// =====================
// Hook
// =====================

/**
 * Panel의 현재 상태에 따른 View 타입과 로고 URL을 반환하는 hook
 */
export const usePanelView = () => {
  const { isActive } = useExtensionState();
  const { isFilled } = useAutofill();

  const getViewType = (): PanelViewType => {
    if (!isActive) return 'disabled';
    if (isFilled) return 'filled';
    return 'active';
  };

  const getLogoUrl = (viewType: PanelViewType): string => (viewType === 'disabled' ? LOGO_DISABLED : LOGO_ACTIVE);

  const viewType = getViewType();
  const logoUrl = getLogoUrl(viewType);

  return {
    viewType,
    logoUrl,
  };
};
