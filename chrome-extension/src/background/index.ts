import 'webextension-polyfill';
import { exampleThemeStorage, extensionStateStorage, isSupportedUrl } from '@extension/storage';

/**
 * 현재 탭 URL에 따라 익스텐션 상태 업데이트
 */
const updateExtensionState = async (tabId: number, url: string) => {
  const isSupported = isSupportedUrl(url);

  if (isSupported) {
    await extensionStateStorage.setActive(url);
  } else {
    await extensionStateStorage.setDisabled(url);
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
chrome.runtime.onInstalled.addListener(async details => {
  try {
    // 최초 설치 시 Options 페이지 열기
    if (details.reason === 'install') {
      await chrome.runtime.openOptionsPage();
    }

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

/**
 * 메시지 리스너
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Popup 열기 요청 처리
  if (message.type === 'OPEN_POPUP') {
    chrome.action.openPopup();
    sendResponse({ success: true });
    return false;
  }

  // Content UI에서 Content Script로 메시지 전달 요청
  if (message.type === 'FORWARD_TO_CONTENT_SCRIPT' && sender.tab?.id) {
    chrome.tabs
      .sendMessage(sender.tab.id, message.payload)
      .then(response => {
        sendResponse(response);
      })
      .catch(error => {
        console.error('[NugulForm] Error forwarding message to content script:', error);
        sendResponse({ error: String(error) });
      });
    return true; // 비동기 응답을 위해 true 반환
  }

  return false;
});
