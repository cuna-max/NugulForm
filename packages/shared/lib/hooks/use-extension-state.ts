import { useStorage } from './use-storage.js';
import { extensionStateStorage, isSupportedUrl } from '@extension/storage';
import { useCallback, useEffect } from 'react';
import type { ExtensionStateType } from '@extension/storage';

// =====================
// Types
// =====================

export interface UseExtensionStateReturn {
  /** 현재 익스텐션 상태 */
  state: ExtensionStateType;
  /** 현재 URL */
  currentUrl: string;
  /** active 상태인지 여부 */
  isActive: boolean;
  /** disabled 상태인지 여부 */
  isDisabled: boolean;
  /** 상태를 active로 설정 */
  setActive: (url: string) => Promise<void>;
  /** 상태를 disabled로 설정 */
  setDisabled: (url: string) => Promise<void>;
  /** 현재 탭 URL 기반으로 상태 업데이트 */
  updateFromCurrentTab: () => Promise<void>;
}

// =====================
// Hook Implementation
// =====================

/**
 * 익스텐션 활성화 상태를 관리하는 훅
 * - active: Google Forms 페이지 (지원 사이트)
 * - disabled: 비지원 페이지
 */
export const useExtensionState = (): UseExtensionStateReturn => {
  const stateData = useStorage(extensionStateStorage);

  const isActive = stateData.state === 'active';
  const isDisabled = stateData.state === 'disabled';

  const setActive = useCallback(async (url: string) => {
    await extensionStateStorage.setActive(url);
  }, []);

  const setDisabled = useCallback(async (url: string) => {
    await extensionStateStorage.setDisabled(url);
  }, []);

  const updateFromCurrentTab = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
      const url = tab?.url ?? '';

      if (isSupportedUrl(url)) {
        await setActive(url);
      } else {
        await setDisabled(url);
      }
    } catch {
      await setDisabled('');
    }
  }, [setActive, setDisabled]);

  // 팝업이 열릴 때 현재 탭 상태 확인
  useEffect(() => {
    updateFromCurrentTab();
  }, [updateFromCurrentTab]);

  return {
    state: stateData.state,
    currentUrl: stateData.currentUrl,
    isActive,
    isDisabled,
    setActive,
    setDisabled,
    updateFromCurrentTab,
  };
};
