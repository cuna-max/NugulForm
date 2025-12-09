/**
 * 자동 기입된 필드에 적용되는 스타일
 * - 체크 아이콘만 표시 (입력 필드 색상 변경 제거)
 * - checkbox, dropdown, radio button에도 적용
 */

const FILLED_FIELD_STYLES = `
  .nugul-filled {
    position: relative;
  }
  .nugul-filled::before {
    content: '✓';
    position: absolute;
    top: 12px;
    right: 12px;
    color: white;
    font-weight: bold;
    font-size: 16px;
    z-index: 1000;
    background: #10b981;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
`;

const STYLE_ID = 'nugul-filled-styles';

/**
 * 자동 기입된 필드 스타일을 문서에 주입
 */
export const injectFilledFieldStyles = (): void => {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = FILLED_FIELD_STYLES;
  document.head.appendChild(style);
};
