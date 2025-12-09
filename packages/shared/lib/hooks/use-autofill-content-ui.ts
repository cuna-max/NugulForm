import { useStorage } from './use-storage.js';
import { MESSAGE_TYPES } from '../autofill/types.js';
import { autofillStorage, optionsStorage } from '@extension/storage';
import { useCallback } from 'react';
import type { AutofillExecuteMessage, InlineFillMessage } from '../autofill/types.js';
import type { AutofillStatus, AutofillResult, MissingField, FilledField, UserField } from '@extension/storage';

// =====================
// Types
// =====================

export interface UseAutofillContentUIReturn {
  /** 자동 채우기 상태 */
  status: AutofillStatus;
  /** 자동 채우기 결과 */
  result: AutofillResult | null;
  /** filled 상태인지 여부 */
  isFilled: boolean;
  /** 미기입 필드 목록 */
  missingFields: MissingField[];
  /** 자동 기입된 필드 목록 */
  filledFields: FilledField[];
  /** 자동 채우기 실행 */
  executeAutofill: () => Promise<void>;
  /** 상태 초기화 */
  reset: () => Promise<void>;
  /** 특정 필드 값을 클립보드에 복사 */
  copyFieldValue: (fieldId: string) => Promise<boolean>;
  /** 특정 필드를 폼에 직접 기입 (인라인 필) */
  inlineFill: (fieldId: string) => Promise<void>;
}

// =====================
// Helper Functions
// =====================

/**
 * Content Script에 메시지를 전송
 * Content UI는 Shadow DOM에 주입되므로 현재 활성 탭의 Content Script에 직접 메시지 전송
 */
const sendMessageToContentScript = async <T>(message: T): Promise<unknown> => {
  const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
  if (!tab?.id) {
    throw new Error('No active tab found');
  }
  return chrome.tabs.sendMessage(tab.id, message);
};

/**
 * UserField에서 MissingField 생성
 */
const createMissingField = (field: UserField, detectedLabel: string): MissingField => ({
  fieldId: field.id,
  detectedLabel,
  fieldLabel: field.label,
  value: field.value,
});

// =====================
// Hook Implementation
// =====================

/**
 * Content UI에서 사용하는 자동 채우기 훅
 * Content Script와 직접 통신하여 자동 채우기 기능을 실행
 */
export const useAutofillContentUI = (): UseAutofillContentUIReturn => {
  const autofillState = useStorage(autofillStorage);
  const optionsState = useStorage(optionsStorage);

  const isFilled = autofillState.status === 'filled';
  const missingFields = autofillState.result?.missingFields ?? [];
  const filledFields = autofillState.result?.filledFields ?? [];

  /**
   * 자동 채우기 실행
   * Content Script에 메시지를 보내 폼을 자동으로 채움
   */
  const executeAutofill = useCallback(async () => {
    try {
      const message: AutofillExecuteMessage = {
        type: MESSAGE_TYPES.AUTOFILL_EXECUTE,
        userFields: optionsState.userFields,
        autoOptions: optionsState.autoOptions,
      };

      const response = (await sendMessageToContentScript(message)) as
        | {
            filledCount: number;
            missingFieldIds: string[];
            filledFields: Array<{ fieldId: string; formLabel: string; fieldLabel: string; filledValue: string }>;
          }
        | undefined;

      // 미기입 필드 계산
      const missingFieldIds = response?.missingFieldIds ?? [];
      const missingFields: MissingField[] = optionsState.userFields
        .filter(field => missingFieldIds.includes(field.id))
        .map(field => createMissingField(field, ''));

      // 자동 기입된 필드 변환
      const filledFields: FilledField[] = (response?.filledFields ?? []).map(field => ({
        fieldId: field.fieldId,
        formLabel: field.formLabel,
        fieldLabel: field.fieldLabel,
        filledValue: field.filledValue,
      }));

      // 결과 저장
      const result: AutofillResult = {
        filledCount: response?.filledCount ?? 0,
        missingFields,
        filledFields,
        timestamp: Date.now(),
        tabId: null, // Content UI에서는 tabId를 알 수 없음
      };

      await autofillStorage.setFilled(result);
    } catch (error) {
      console.error('Failed to execute autofill:', error);

      // 오류 시에도 filled 상태로 전환 (빈 결과)
      await autofillStorage.setFilled({
        filledCount: 0,
        missingFields: [],
        filledFields: [],
        timestamp: Date.now(),
        tabId: null,
      });
    }
  }, [optionsState.userFields, optionsState.autoOptions]);

  /**
   * 상태 초기화
   */
  const reset = useCallback(async () => {
    await autofillStorage.reset();
  }, []);

  /**
   * 특정 필드 값을 클립보드에 복사
   */
  const copyFieldValue = useCallback(
    async (fieldId: string): Promise<boolean> => {
      const field = optionsState.userFields.find(f => f.id === fieldId);
      if (!field?.value) return false;

      try {
        await navigator.clipboard.writeText(field.value);
        return true;
      } catch {
        return false;
      }
    },
    [optionsState.userFields],
  );

  /**
   * 특정 필드를 폼에 직접 기입 (인라인 필)
   */
  const inlineFill = useCallback(
    async (fieldId: string): Promise<void> => {
      const field = optionsState.userFields.find(f => f.id === fieldId);
      if (!field?.value) return;

      try {
        const message: InlineFillMessage = {
          type: MESSAGE_TYPES.INLINE_FILL,
          fieldId,
          value: field.value,
        };

        await sendMessageToContentScript(message);

        // 미기입 필드에서 해당 필드 제거하고 filledFields에 추가
        if (autofillState.result) {
          const updatedMissingFields = autofillState.result.missingFields.filter(f => f.fieldId !== fieldId);
          const field = optionsState.userFields.find(f => f.id === fieldId);

          // 이미 filledFields에 있는지 확인
          const isAlreadyFilled = autofillState.result.filledFields.some(f => f.fieldId === fieldId);
          const updatedFilledFields = isAlreadyFilled
            ? autofillState.result.filledFields
            : [
                ...autofillState.result.filledFields,
                {
                  fieldId: fieldId,
                  formLabel: '', // 인라인 필의 경우 formLabel을 알 수 없음
                  fieldLabel: field?.label || '',
                  filledValue: field?.value || '',
                },
              ];

          await autofillStorage.setFilled({
            ...autofillState.result,
            filledCount: autofillState.result.filledCount + 1,
            missingFields: updatedMissingFields,
            filledFields: updatedFilledFields,
          });
        }
      } catch (error) {
        console.error('Failed to inline fill:', error);
      }
    },
    [optionsState.userFields, autofillState.result],
  );

  return {
    status: autofillState.status,
    result: autofillState.result,
    isFilled,
    missingFields,
    filledFields,
    executeAutofill,
    reset,
    copyFieldValue,
    inlineFill,
  };
};
