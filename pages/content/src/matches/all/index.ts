// =====================
// NugulForm Content Script
// Google Forms 자동 채우기 기능
// =====================

import { injectFilledFieldStyles } from './filled-field-styles';
import {
  executeAutofill,
  inlineFillField,
  isGoogleFormsPage,
  MESSAGE_TYPES,
  parseGoogleFormFields,
} from '@extension/shared';
import type { AutofillExecuteMessage, InlineFillMessage, FieldFillResult } from '@extension/shared';

console.log('[NugulForm] Content script loaded');

/**
 * 메시지 타입 가드
 */
const isAutofillExecuteMessage = (message: unknown): message is AutofillExecuteMessage =>
  typeof message === 'object' &&
  message !== null &&
  'type' in message &&
  (message as { type: string }).type === MESSAGE_TYPES.AUTOFILL_EXECUTE;

const isInlineFillMessage = (message: unknown): message is InlineFillMessage =>
  typeof message === 'object' &&
  message !== null &&
  'type' in message &&
  (message as { type: string }).type === MESSAGE_TYPES.INLINE_FILL;

/**
 * 자동 기입된 필드에 시각적 표시 추가
 * - text, textarea, radio, checkbox, dropdown 모두 표시
 */
const markFilledFields = (fieldResults: FieldFillResult[]): void => {
  // 기존 표시 제거
  document.querySelectorAll('.nugul-filled').forEach(el => {
    el.classList.remove('nugul-filled');
  });

  // 스타일 주입
  injectFilledFieldStyles();

  // 자동 기입된 필드 찾아서 표시 (filled가 true인 모든 필드)
  const filledResults = fieldResults.filter(result => result.filled);
  const formFields = parseGoogleFormFields();

  for (const result of filledResults) {
    // formLabel로 해당 필드 찾기
    const formField = formFields.find(f => f.label === result.formLabel);
    if (formField && formField.element) {
      // 필드 컨테이너 찾기 (Google Forms 구조에 맞게)
      const container = formField.element.closest('[data-params]');
      if (container) {
        container.classList.add('nugul-filled');
      }
    }
  }
};

/**
 * 자동 채우기 실행 핸들러 (비동기)
 */
const handleAutofillExecute = async (message: AutofillExecuteMessage) => {
  console.log('[NugulForm] Executing autofill with options:', {
    fieldsCount: message.userFields.length,
    autoOptionsCount: message.autoOptions.length,
  });

  const result = await executeAutofill({
    userFields: message.userFields,
    autoOptions: message.autoOptions,
  });

  console.log('[NugulForm] Autofill result:', {
    filledCount: result.filledCount,
    missingFieldIds: result.missingFieldIds,
    filledFieldsCount: result.filledFields.length,
  });

  // 자동 기입된 필드에 시각적 표시 추가
  markFilledFields(result.fieldResults);

  return {
    filledCount: result.filledCount,
    missingFieldIds: result.missingFieldIds,
    filledFields: result.filledFields,
  };
};

/**
 * 인라인 필 핸들러
 */
const handleInlineFill = (message: InlineFillMessage) => {
  console.log('[NugulForm] Inline fill:', {
    fieldId: message.fieldId,
  });

  const success = inlineFillField(message.fieldId, message.value);

  return { success };
};

/**
 * 메시지 리스너 설정
 */
const setupMessageListener = () => {
  chrome.runtime.onMessage.addListener(
    (message: unknown, _sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => {
      // Google Forms 페이지가 아니면 무시
      if (!isGoogleFormsPage()) {
        console.log('[NugulForm] Not a Google Forms page, ignoring message');
        sendResponse({ error: 'Not a Google Forms page' });
        return false;
      }

      try {
        if (isAutofillExecuteMessage(message)) {
          // 비동기 핸들러 - true를 반환하여 비동기 응답 가능하게 함
          handleAutofillExecute(message)
            .then(result => sendResponse(result))
            .catch(error => {
              console.error('[NugulForm] Error in autofill:', error);
              sendResponse({ error: String(error) });
            });
          return true; // 비동기 응답을 위해 true 반환
        }

        if (isInlineFillMessage(message)) {
          const result = handleInlineFill(message);
          sendResponse(result);
          return false;
        }

        // 알 수 없는 메시지 타입
        console.log('[NugulForm] Unknown message type:', message);
        sendResponse({ error: 'Unknown message type' });
        return false;
      } catch (error) {
        console.error('[NugulForm] Error handling message:', error);
        sendResponse({ error: String(error) });
        return false;
      }
    },
  );
};

/**
 * 초기화
 */
const init = () => {
  if (isGoogleFormsPage()) {
    console.log('[NugulForm] Google Forms detected, setting up autofill');
    setupMessageListener();
  } else {
    console.log('[NugulForm] Not a Google Forms page');
    // 다른 페이지에서도 메시지 리스너는 설정해둠 (나중에 상태 확인용)
    setupMessageListener();
  }
};

// 초기화 실행
init();
