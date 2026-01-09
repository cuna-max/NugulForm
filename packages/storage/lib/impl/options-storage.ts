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
  ADDRESS: 'address',
  /** 추가 가능한 필드 - 추후 확장용 */
} as const;

export const AUTO_OPTION_IDS = {
  POSITIVE_AUTO_SELECT: 'positiveAutoSelect',
  FALLBACK_AUTO_SELECT: 'fallbackAutoSelect',
  FLOATING_BUTTON: 'floatingButton',
  MATH_AUTO_ANSWER: 'mathAutoAnswer',
} as const;

/**
 * 자동 선택 관련 옵션 ID 목록
 * - radio, checkbox, switch에서 사용
 * - 자동 입력 시에만 실행됨
 */
export const AUTO_SELECT_OPTION_IDS = [
  AUTO_OPTION_IDS.POSITIVE_AUTO_SELECT,
  AUTO_OPTION_IDS.FALLBACK_AUTO_SELECT,
] as const;

/**
 * 수식 자동 계산 관련 옵션 ID 목록
 */
export const MATH_OPTION_IDS = [AUTO_OPTION_IDS.MATH_AUTO_ANSWER] as const;

/**
 * UI 표시 관련 옵션 ID 목록
 */
export const UI_OPTION_IDS = [AUTO_OPTION_IDS.FLOATING_BUTTON] as const;

export type AutoOptionId = (typeof AUTO_OPTION_IDS)[keyof typeof AUTO_OPTION_IDS];
export type AutoSelectOptionId = (typeof AUTO_SELECT_OPTION_IDS)[number];
export type UIOptionId = (typeof UI_OPTION_IDS)[number];
export type MathOptionId = (typeof MATH_OPTION_IDS)[number];

// =====================
// Option Helpers
// =====================

/**
 * 특정 옵션이 활성화되어 있는지 확인
 */
export const isOptionEnabled = (autoOptions: AutoOption[], optionId: string): boolean => {
  const option = autoOptions.find(opt => opt.id === optionId);
  return option?.enabled ?? false;
};

/**
 * 긍정 응답 자동 선택 옵션이 활성화되어 있는지 확인
 * - radio, checkbox, switch에서 긍정 응답(예, Yes, OK 등)을 자동 선택
 */
export const isPositiveAutoSelectEnabled = (autoOptions: AutoOption[]): boolean =>
  isOptionEnabled(autoOptions, AUTO_OPTION_IDS.POSITIVE_AUTO_SELECT);

/**
 * Fallback 자동 선택 옵션이 활성화되어 있는지 확인
 * - 긍정 응답이 없을 때 첫 번째 선택지를 자동 선택
 */
export const isFallbackAutoSelectEnabled = (autoOptions: AutoOption[]): boolean =>
  isOptionEnabled(autoOptions, AUTO_OPTION_IDS.FALLBACK_AUTO_SELECT);

/**
 * 플로팅 버튼 표시 옵션이 활성화되어 있는지 확인
 */
export const isFloatingButtonEnabled = (autoOptions: AutoOption[]): boolean =>
  isOptionEnabled(autoOptions, AUTO_OPTION_IDS.FLOATING_BUTTON);

/**
 * 봇 방지 수식 자동 계산 옵션이 활성화되어 있는지 확인
 */
export const isMathAutoAnswerEnabled = (autoOptions: AutoOption[]): boolean =>
  isOptionEnabled(autoOptions, AUTO_OPTION_IDS.MATH_AUTO_ANSWER);

/**
 * 자동 선택 옵션들 가져오기 (radio, checkbox, switch에서 사용)
 */
export const getAutoSelectOptions = (autoOptions: AutoOption[]) => ({
  enablePositiveSelect: isPositiveAutoSelectEnabled(autoOptions),
  enableFallback: isFallbackAutoSelectEnabled(autoOptions),
});

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
  { id: USER_FIELD_IDS.ADDRESS, label: 'Home Address', value: '', placeholder: '123 Main St, City, State 12345' },
];

const DEFAULT_AUTO_OPTIONS: AutoOption[] = [
  {
    id: AUTO_OPTION_IDS.POSITIVE_AUTO_SELECT,
    title: '긍정 응답 자동 선택',
    description: '긍정적인 선택지를 자동으로 선택합니다. (예: 네, Yes, OK 등)',
    enabled: true,
  },
  {
    id: AUTO_OPTION_IDS.FALLBACK_AUTO_SELECT,
    title: '기본 응답 자동 선택',
    description: '필수 항목이 비어있을 때 첫번째 선택지를 사용합니다.',
    enabled: false,
  },
  {
    id: AUTO_OPTION_IDS.FLOATING_BUTTON,
    title: 'Floating 버튼 표시',
    description: '페이지 우측 하단에 플로팅 버튼을 표시합니다.',
    enabled: true,
  },
  {
    id: AUTO_OPTION_IDS.MATH_AUTO_ANSWER,
    title: '봇 방지 수식 자동 계산',
    description: '수식 문제를 자동으로 계산하여 답변합니다. (예: 2 + 3 = ?)',
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
