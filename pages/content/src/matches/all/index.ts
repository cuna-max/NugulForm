// =====================
// NugulForm Content Script
// Google Forms 자동 채우기 기능
// =====================

import { executeAutofill, inlineFillField, isGoogleFormsPage, MESSAGE_TYPES } from '@extension/shared';
import type { AutofillExecuteMessage, InlineFillMessage } from '@extension/shared';

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
 * 자동 채우기 실행 핸들러
 */
const handleAutofillExecute = (message: AutofillExecuteMessage) => {
  console.log('[NugulForm] Executing autofill with options:', {
    fieldsCount: message.userFields.length,
    autoOptionsCount: message.autoOptions.length,
  });

  const result = executeAutofill({
    userFields: message.userFields,
    autoOptions: message.autoOptions,
  });

  console.log('[NugulForm] Autofill result:', {
    filledCount: result.filledCount,
    missingFieldIds: result.missingFieldIds,
  });

  return {
    filledCount: result.filledCount,
    missingFieldIds: result.missingFieldIds,
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
          const result = handleAutofillExecute(message);
          sendResponse(result);
          return false;
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
