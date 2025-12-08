import 'webextension-polyfill';
import { exampleThemeStorage, extensionStateStorage, isSupportedUrl } from '@extension/storage';

/**
 * 아이콘 경로 상수
 */
const ICON_PATHS = {
  active: {
    '16': 'nugul-active-16.png',
    '32': 'nugul-active-32.png',
    '48': 'nugul-active-48.png',
  },
  disabled: {
    '16': 'nugul-disabled-16.png',
    '32': 'nugul-disabled-32.png',
    '48': 'nugul-disabled-48.png',
  },
} as const;

/**
 * 현재 탭 URL에 따라 익스텐션 상태 및 아이콘 업데이트
 */
const updateExtensionState = async (tabId: number, url: string) => {
  const isSupported = isSupportedUrl(url);

  if (isSupported) {
    await extensionStateStorage.setActive(url);
    await chrome.action.setIcon({ tabId, path: ICON_PATHS.active });
  } else {
    await extensionStateStorage.setDisabled(url);
    await chrome.action.setIcon({ tabId, path: ICON_PATHS.disabled });
  }
};

/**
 * 탭 활성화 시 상태 업데이트
 */
chrome.tabs.onActivated.addListener(async activeInfo => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      await updateExtensionState(activeInfo.tabId, tab.url);
    }
  } catch (error) {
    console.error('[NugulForm] Error on tab activated:', error);
  }
});

/**
 * 탭 URL 변경 시 상태 업데이트
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // URL이 변경되고 페이지 로딩이 완료됐을 때만 처리
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      await updateExtensionState(tabId, tab.url);
    } catch (error) {
      console.error('[NugulForm] Error on tab updated:', error);
    }
  }
});

/**
 * 익스텐션 설치/업데이트 시 현재 활성 탭 상태 초기화
 */
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id && activeTab.url) {
      await updateExtensionState(activeTab.id, activeTab.url);
    }
  } catch (error) {
    console.error('[NugulForm] Error on installed:', error);
  }
});

// Theme storage 초기화 (기존 로직 유지)
exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('[NugulForm] Background loaded');
