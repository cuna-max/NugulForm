import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

// =====================
// Types
// =====================

/**
 * 자동 채우기 상태
 * - idle: 아직 자동 채우기를 실행하지 않은 상태
 * - filled: 자동 채우기가 완료된 상태
 */
export type AutofillStatus = 'idle' | 'filled';

/**
 * 미기입 필드 정보
 */
export interface MissingField {
  /** 필드 식별자 (userFields의 id와 매칭) */
  fieldId: string;
  /** 폼에서 감지된 레이블 */
  detectedLabel: string;
  /** 저장된 필드 라벨 */
  fieldLabel: string;
  /** 저장된 값 */
  value: string;
}

/**
 * 자동 채우기 실행 결과
 */
export interface AutofillResult {
  /** 채워진 필드 수 */
  filledCount: number;
  /** 미기입 필드 목록 */
  missingFields: MissingField[];
  /** 실행 시간 */
  timestamp: number;
  /** 현재 탭 ID */
  tabId: number | null;
}

export interface AutofillState {
  status: AutofillStatus;
  result: AutofillResult | null;
}

export type AutofillStorageType = BaseStorageType<AutofillState> & {
  /** 자동 채우기 완료 상태로 설정 */
  setFilled: (result: AutofillResult) => Promise<void>;
  /** 상태 초기화 (idle로 리셋) */
  reset: () => Promise<void>;
  /** 현재 상태가 filled인지 확인 */
  isFilled: () => Promise<boolean>;
  /** 미기입 필드 목록 가져오기 */
  getMissingFields: () => Promise<MissingField[]>;
};

// =====================
// Default Values
// =====================

const DEFAULT_AUTOFILL_STATE: AutofillState = {
  status: 'idle',
  result: null,
};

// =====================
// Storage Implementation
// =====================

const storage = createStorage<AutofillState>('nugul-autofill-storage', DEFAULT_AUTOFILL_STATE, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const autofillStorage: AutofillStorageType = {
  ...storage,

  setFilled: async (result: AutofillResult) => {
    await storage.set({
      status: 'filled',
      result,
    });
  },

  reset: async () => {
    await storage.set(DEFAULT_AUTOFILL_STATE);
  },

  isFilled: async () => {
    const state = await storage.get();
    return state.status === 'filled';
  },

  getMissingFields: async () => {
    const state = await storage.get();
    return state.result?.missingFields ?? [];
  },
};
