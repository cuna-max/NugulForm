import { useAutofillContentUI, isGoogleFormsPage, useAutoOptions } from '@extension/shared';
import { ThemeProvider, FloatingAutofillButton } from '@extension/ui';
import { useEffect, useState } from 'react';

// =====================
// Component
// =====================

/**
 * Google Forms용 Content UI App
 * - Google Forms 페이지에서만 플로팅 버튼 표시
 * - 자동 채우기 기능 제공
 * - FLOATING_BUTTON 옵션에 따라 표시 여부 결정
 */
export default function App() {
  const { isFilled, missingFields, executeAutofill, copyFieldValue, inlineFill } = useAutofillContentUI();
  const { isFloatingButtonEnabled } = useAutoOptions();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isGoogleFormsPage()) {
      setIsActive(true);
      console.log('[NugulForm] Google Forms Content UI loaded');
    }
  }, []);

  // Google Forms 페이지가 아니거나 플로팅 버튼이 비활성화된 경우 렌더링하지 않음
  if (!isActive || !isFloatingButtonEnabled) {
    return null;
  }

  const handleViewInPopup = () => {
    // Popup 열기
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  };

  return (
    <ThemeProvider>
      <FloatingAutofillButton
        state={isFilled ? 'filled' : 'normal'}
        missingFields={missingFields}
        onAutofill={executeAutofill}
        onCopy={copyFieldValue}
        onInlineFill={inlineFill}
        onViewInPopup={handleViewInPopup}
      />
    </ThemeProvider>
  );
}
