// =====================
// Autofill Module Types
// =====================

import type { UserField, AutoOption } from '@extension/storage';

/**
 * 폼 필드 타입
 */
export type FormFieldType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select';

/**
 * 파싱된 폼 필드 정보
 */
export interface ParsedFormField {
  /** 필드 DOM 요소 */
  element: HTMLElement;
  /** 폼에서 감지된 레이블 텍스트 */
  label: string;
  /** placeholder 텍스트 */
  placeholder: string;
  /** 필드 타입 */
  type: FormFieldType;
  /** 필수 여부 */
  required: boolean;
  /** 현재 값 */
  currentValue: string;
  /** 고유 식별자 (DOM 기반) */
  elementId: string;
}

/**
 * 매칭 결과
 */
export interface FieldMatchResult {
  /** 매칭된 사용자 필드 ID */
  userFieldId: string;
  /** 매칭 점수 (0 = 완벽 일치, 1 = 완전 불일치) */
  score: number;
  /** 매칭 방식 */
  matchType: 'exact' | 'partial' | 'fuzzy';
  /** 매칭된 키워드 */
  matchedKeyword: string;
}

/**
 * 폼 필드와 사용자 필드 매핑
 */
export interface FieldMapping {
  /** 파싱된 폼 필드 */
  formField: ParsedFormField;
  /** 매칭된 사용자 필드 */
  userField: UserField | null;
  /** 매칭 결과 */
  matchResult: FieldMatchResult | null;
}

/**
 * 자동 채우기 실행 옵션
 */
export interface AutofillExecuteOptions {
  /** 저장된 사용자 필드 목록 */
  userFields: UserField[];
  /** 자동 옵션 설정 */
  autoOptions: AutoOption[];
}

/**
 * 자동 채우기 실행 결과
 */
export interface AutofillExecuteResult {
  /** 채워진 필드 수 */
  filledCount: number;
  /** 미기입된 필드 ID 목록 */
  missingFieldIds: string[];
  /** 필드별 상세 결과 */
  fieldResults: FieldFillResult[];
  /** 자동 기입된 필드 정보 목록 */
  filledFields: Array<{
    fieldId: string;
    formLabel: string;
    fieldLabel: string;
    filledValue: string;
  }>;
}

/**
 * 개별 필드 채우기 결과
 */
export interface FieldFillResult {
  /** 폼 필드 레이블 */
  formLabel: string;
  /** 매칭된 사용자 필드 ID (없으면 null) */
  userFieldId: string | null;
  /** 채우기 성공 여부 */
  filled: boolean;
  /** 채워진 값 */
  filledValue: string;
  /** 실패 이유 (실패 시) */
  failReason?: string;
}

/**
 * 메시지 타입 정의
 */
export const MESSAGE_TYPES = {
  AUTOFILL_EXECUTE: 'NUGUL_AUTOFILL_EXECUTE',
  INLINE_FILL: 'NUGUL_INLINE_FILL',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

/**
 * 자동 채우기 실행 메시지
 */
export interface AutofillExecuteMessage {
  type: typeof MESSAGE_TYPES.AUTOFILL_EXECUTE;
  userFields: UserField[];
  autoOptions: AutoOption[];
}

/**
 * 인라인 필 메시지
 */
export interface InlineFillMessage {
  type: typeof MESSAGE_TYPES.INLINE_FILL;
  fieldId: string;
  value: string;
}

export type AutofillMessage = AutofillExecuteMessage | InlineFillMessage;
