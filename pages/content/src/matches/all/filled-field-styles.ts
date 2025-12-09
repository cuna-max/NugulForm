/**
 * 자동 기입된 필드에 적용되는 스타일
 */

const FILLED_FIELD_STYLES = `
  .nugul-filled {
    position: relative;
  }
  .nugul-filled::before {
    content: '✓';
    position: absolute;
    top: 8px;
    right: 8px;
    color: #10b981;
    font-weight: bold;
    font-size: 14px;
    z-index: 1000;
    background: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .nugul-filled input,
  .nugul-filled textarea {
    background-color: #f0fdf4 !important;
    border-color: #10b981 !important;
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
