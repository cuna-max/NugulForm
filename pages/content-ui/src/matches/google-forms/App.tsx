import { useAutofillContentUI, isGoogleFormsPage, useAutoOptions } from '@extension/shared';
import { ThemeProvider, FloatingAutofillButton } from '@extension/ui';
import { useEffect, useState } from 'react';

// =====================
// Component
// =====================

/**
 * Google Forms용 Content UI App
 * - Google Forms 페이지에서만 플로팅 버튼 표시
 * - active 상태에서만 wand 버튼 표시
 * - filled 상태에서는 플로팅 버튼 숨김
 * - 자동 채우기 실행 후 popup 자동 열림
 */
export default function App() {
  const { isFilled, executeAutofill } = useAutofillContentUI();
  const { isFloatingButtonEnabled } = useAutoOptions();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isGoogleFormsPage()) {
      setIsActive(true);
      console.log('[NugulForm] Google Forms Content UI loaded');
    }
  }, []);

  // 플로팅 버튼 표시 조건:
  // 1. Google Forms 페이지 (isActive)
  // 2. 플로팅 버튼 옵션 활성화
  // 3. 아직 autofill 실행 전 (!isFilled)
  if (!isActive || !isFloatingButtonEnabled || isFilled) {
    return null;
  }

  const handleAutofill = async () => {
    await executeAutofill();
    // autofill 완료 후 popup 자동 열기
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  };

  return (
    <ThemeProvider>
      <FloatingAutofillButton onAutofill={handleAutofill} />
    </ThemeProvider>
  );
}
