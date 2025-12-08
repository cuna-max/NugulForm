import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

/**
 * 익스텐션 활성화 상태 타입
 * - active: Google Forms 페이지일 때 (지원 사이트)
 * - disabled: 비지원 페이지일 때
 */
export type ExtensionStateType = 'active' | 'disabled';

export interface ExtensionStateDataType {
  state: ExtensionStateType;
  currentUrl: string;
}

export type ExtensionStateStorageType = BaseStorageType<ExtensionStateDataType> & {
  setActive: (url: string) => Promise<void>;
  setDisabled: (url: string) => Promise<void>;
  isActive: () => Promise<boolean>;
};

/**
 * Google Forms URL 패턴 목록
 * SCHEME.md에 정의된 지원 사이트
 */
const SUPPORTED_URL_PATTERNS = ['https://docs.google.com/forms/'];

/**
 * URL이 지원 사이트인지 확인
 */
export const isSupportedUrl = (url: string): boolean => SUPPORTED_URL_PATTERNS.some(pattern => url.startsWith(pattern));

const storage = createStorage<ExtensionStateDataType>(
  'extension-state-storage-key',
  {
    state: 'disabled',
    currentUrl: '',
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const extensionStateStorage: ExtensionStateStorageType = {
  ...storage,

  setActive: async (url: string) => {
    await storage.set({
      state: 'active',
      currentUrl: url,
    });
  },

  setDisabled: async (url: string) => {
    await storage.set({
      state: 'disabled',
      currentUrl: url,
    });
  },

  isActive: async () => {
    const data = await storage.get();
    return data.state === 'active';
  },
};
