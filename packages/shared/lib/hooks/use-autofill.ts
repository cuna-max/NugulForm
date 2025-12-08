import { useStorage } from './use-storage.js';
import { autofillStorage, optionsStorage } from '@extension/storage';
import { useCallback } from 'react';
import type { AutofillStatus, AutofillResult, MissingField, UserField } from '@extension/storage';

// =====================
// Types
// =====================

export interface UseAutofillReturn {
  /** 자동 채우기 상태 */
  status: AutofillStatus;
  /** 자동 채우기 결과 */
  result: AutofillResult | null;
  /** filled 상태인지 여부 */
  isFilled: boolean;
  /** 미기입 필드 목록 */
  missingFields: MissingField[];
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
// Constants
// =====================

const AUTOFILL_MESSAGE_TYPE = 'NUGUL_AUTOFILL_EXECUTE' as const;
const INLINE_FILL_MESSAGE_TYPE = 'NUGUL_INLINE_FILL' as const;

// =====================
// Helper Functions
// =====================

/**
 * 현재 활성 탭에 메시지를 전송
 */
const sendMessageToActiveTab = async <T>(message: T): Promise<unknown> => {
  const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
  if (!tab?.id) {
    throw new Error('No active tab found');
  }
  return chrome.tabs.sendMessage(tab.id, message);
};

/**
 * 현재 활성 탭 ID 가져오기
 */
const getActiveTabId = async (): Promise<number | null> => {
  const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
  return tab?.id ?? null;
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
 * 자동 채우기 기능을 관리하는 훅
 */
export const useAutofill = (): UseAutofillReturn => {
  const autofillState = useStorage(autofillStorage);
  const optionsState = useStorage(optionsStorage);

  const isFilled = autofillState.status === 'filled';
  const missingFields = autofillState.result?.missingFields ?? [];

  /**
   * 자동 채우기 실행
   * Content Script에 메시지를 보내 폼을 자동으로 채움
   */
  const executeAutofill = useCallback(async () => {
    try {
      const tabId = await getActiveTabId();

      // Content Script에 자동 채우기 실행 메시지 전송
      const response = (await sendMessageToActiveTab({
        type: AUTOFILL_MESSAGE_TYPE,
        userFields: optionsState.userFields,
        autoOptions: optionsState.autoOptions,
      })) as { filledCount: number; missingFieldIds: string[] } | undefined;

      // 미기입 필드 계산
      const missingFieldIds = response?.missingFieldIds ?? [];
      const missingFields: MissingField[] = optionsState.userFields
        .filter(field => missingFieldIds.includes(field.id))
        .map(field => createMissingField(field, field.label));

      // 결과 저장
      const result: AutofillResult = {
        filledCount: response?.filledCount ?? 0,
        missingFields,
        timestamp: Date.now(),
        tabId,
      };

      await autofillStorage.setFilled(result);
    } catch (error) {
      console.error('Failed to execute autofill:', error);

      // 오류 시에도 filled 상태로 전환 (빈 결과)
      await autofillStorage.setFilled({
        filledCount: 0,
        missingFields: [],
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
        await sendMessageToActiveTab({
          type: INLINE_FILL_MESSAGE_TYPE,
          fieldId,
          value: field.value,
        });

        // 미기입 필드에서 해당 필드 제거
        if (autofillState.result) {
          const updatedMissingFields = autofillState.result.missingFields.filter(f => f.fieldId !== fieldId);

          await autofillStorage.setFilled({
            ...autofillState.result,
            filledCount: autofillState.result.filledCount + 1,
            missingFields: updatedMissingFields,
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
    executeAutofill,
    reset,
    copyFieldValue,
    inlineFill,
  };
};
