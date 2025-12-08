import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

// =====================
// Types
// =====================

export interface UserField {
  id: string;
  label: string;
  value: string;
  placeholder: string;
}

export interface AutoOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface OptionsState {
  userFields: UserField[];
  autoOptions: AutoOption[];
}

export type OptionsStorageType = BaseStorageType<OptionsState> & {
  // User Fields
  updateUserField: (id: string, value: string) => Promise<void>;
  clearUserField: (id: string) => Promise<void>;
  // Auto Options
  toggleAutoOption: (id: string) => Promise<void>;
  setAutoOption: (id: string, enabled: boolean) => Promise<void>;
};

// =====================
// Constants
// =====================

export const USER_FIELD_IDS = {
  TELEGRAM: 'telegram',
  TWITTER: 'twitter',
  DISCORD: 'discord',
  EMAIL: 'email',
  YOUTUBE: 'youtube',
  PHONE: 'phone',
  EVM_WALLET: 'evm_wallet',
  SOLANA_WALLET: 'solana_wallet',
} as const;

export const AUTO_OPTION_IDS = {
  POSITIVE_AUTO_SELECT: 'positiveAutoSelect',
  FALLBACK_AUTO_SELECT: 'fallbackAutoSelect',
  FLOATING_BUTTON: 'floatingButton',
} as const;

// =====================
// Default Values
// =====================

const DEFAULT_USER_FIELDS: UserField[] = [
  { id: USER_FIELD_IDS.TELEGRAM, label: 'Telegram', value: '', placeholder: '@username' },
  { id: USER_FIELD_IDS.TWITTER, label: 'Twitter', value: '', placeholder: '@username' },
  { id: USER_FIELD_IDS.DISCORD, label: 'Discord', value: '', placeholder: '@username' },
  { id: USER_FIELD_IDS.EMAIL, label: 'Email', value: '', placeholder: 'email@example.com' },
  {
    id: USER_FIELD_IDS.EVM_WALLET,
    label: 'EVM Wallet',
    value: '',
    placeholder: '0x...',
  },
  {
    id: USER_FIELD_IDS.SOLANA_WALLET,
    label: 'Solana Wallet',
    value: '',
    placeholder: 'solana wallet address',
  },
  { id: USER_FIELD_IDS.YOUTUBE, label: 'YouTube Channel', value: '', placeholder: '@channelname' },
  { id: USER_FIELD_IDS.PHONE, label: 'Phone Number', value: '', placeholder: '010-1234-5678' },
];

const DEFAULT_AUTO_OPTIONS: AutoOption[] = [
  {
    id: AUTO_OPTION_IDS.POSITIVE_AUTO_SELECT,
    title: '긍정 응답 자동 선택',
    description: '긍정적인 선택지를 자동으로 선택합니다. (예: 네, 예, Yes, Y, OK)',
    enabled: true,
  },
  {
    id: AUTO_OPTION_IDS.FALLBACK_AUTO_SELECT,
    title: '기본 응답 자동 선택',
    description: '필수 항목이 비어있을 때 기본값을 사용합니다.',
    enabled: false,
  },
  {
    id: AUTO_OPTION_IDS.FLOATING_BUTTON,
    title: 'Floating 버튼 표시',
    description: '페이지 우측 하단에 플로팅 버튼을 표시합니다.',
    enabled: true,
  },
];

const DEFAULT_OPTIONS_STATE: OptionsState = {
  userFields: DEFAULT_USER_FIELDS,
  autoOptions: DEFAULT_AUTO_OPTIONS,
};

// =====================
// Storage Implementation
// =====================

const storage = createStorage<OptionsState>('nugul-options-storage', DEFAULT_OPTIONS_STATE, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const optionsStorage: OptionsStorageType = {
  ...storage,

  updateUserField: async (id: string, value: string) => {
    await storage.set(currentState => ({
      ...currentState,
      userFields: currentState.userFields.map(field => (field.id === id ? { ...field, value } : field)),
    }));
  },

  clearUserField: async (id: string) => {
    await storage.set(currentState => ({
      ...currentState,
      userFields: currentState.userFields.map(field => (field.id === id ? { ...field, value: '' } : field)),
    }));
  },

  toggleAutoOption: async (id: string) => {
    await storage.set(currentState => ({
      ...currentState,
      autoOptions: currentState.autoOptions.map(option =>
        option.id === id ? { ...option, enabled: !option.enabled } : option,
      ),
    }));
  },

  setAutoOption: async (id: string, enabled: boolean) => {
    await storage.set(currentState => ({
      ...currentState,
      autoOptions: currentState.autoOptions.map(option => (option.id === id ? { ...option, enabled } : option)),
    }));
  },
};
