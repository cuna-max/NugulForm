import { useAutofillContentUI, isGoogleFormsPage } from '@extension/shared';
import { ThemeProvider, FloatingAutofillButton } from '@extension/ui';
import { useEffect, useState } from 'react';

// =====================
// Component
// =====================

/**
 * Google Forms용 Content UI App
 * - Google Forms 페이지에서만 플로팅 버튼 표시
 * - 자동 채우기 기능 제공
 */
export default function App() {
  const { isFilled, missingFields, executeAutofill, copyFieldValue, inlineFill } = useAutofillContentUI();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isGoogleFormsPage()) {
      setIsActive(true);
      console.log('[NugulForm] Google Forms Content UI loaded');
    }
  }, []);

  // Google Forms 페이지가 아니면 아무것도 렌더링하지 않음
  if (!isActive) {
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
