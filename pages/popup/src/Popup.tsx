import { PopupActive } from './PopupActive';
import { PopupDisabled } from './PopupDisabled';
import { PopupFilled } from './PopupFilled';
import { withErrorBoundary, withSuspense, useExtensionState, useAutofill } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner, ThemeProvider } from '@extension/ui';

// =====================
// Types
// =====================

type PopupViewType = 'active' | 'disabled' | 'filled';

// =====================
// Constants
// =====================

const LOGO_ACTIVE = chrome.runtime.getURL('nugul.png');
const LOGO_DISABLED = chrome.runtime.getURL('nugul-disabled.png');

// =====================
// Helper Functions
// =====================

/**
 * 현재 상태에 따른 View 타입 결정
 */
const getPopupViewType = (isActive: boolean, isFilled: boolean): PopupViewType => {
  if (!isActive) return 'disabled';
  if (isFilled) return 'filled';
  return 'active';
};

/**
 * View 타입에 따른 로고 URL 반환
 */
const getLogoUrl = (viewType: PopupViewType): string => (viewType === 'disabled' ? LOGO_DISABLED : LOGO_ACTIVE);

// =====================
// Component
// =====================

const Popup = () => {
  const { isActive } = useExtensionState();
  const { isFilled } = useAutofill();

  const viewType = getPopupViewType(isActive, isFilled);
  const logoUrl = getLogoUrl(viewType);

  return (
    <ThemeProvider>
      <div className="App bg-background">
        {viewType === 'active' && <PopupActive logoUrl={logoUrl} />}
        {viewType === 'disabled' && <PopupDisabled logoUrl={logoUrl} />}
        {viewType === 'filled' && <PopupFilled logoUrl={logoUrl} />}
      </div>
    </ThemeProvider>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
