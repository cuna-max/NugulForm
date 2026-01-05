// =====================
// Mapping Dictionary - 필드 매칭용 키워드 사전
// =====================

import { USER_FIELD_IDS } from '@extension/storage';

/**
 * 각 필드 타입별 매칭 키워드 목록
 * - 소문자로 정규화된 상태로 매칭
 * - 부분 문자열 매칭을 사용하므로 기본 키워드만 포함
 *   (예: 'discord'가 있으면 'discord handle', 'discord id' 등도 자동 매칭)
 * - 약어와 다국어 표기만 별도 추가
 */
export const FIELD_KEYWORDS: Record<string, string[]> = {
  [USER_FIELD_IDS.TELEGRAM]: ['telegram', 'tele', 'tg', '텔레그램', '텔레', '텔그'],

  [USER_FIELD_IDS.TWITTER]: ['twitter', 'twit', 'x', '트위터', '트윗', '엑스'],

  [USER_FIELD_IDS.DISCORD]: ['discord', 'disc', '디스코드', '디코'],

  [USER_FIELD_IDS.EMAIL]: ['email', 'e-mail', 'mail', '이메일', '메일'],

  [USER_FIELD_IDS.YOUTUBE]: ['youtube', 'yt', 'channel', '유튜브', '유튭', '채널'],

  [USER_FIELD_IDS.PHONE]: ['phone', 'mobile', 'cell', 'telephone', 'tel', '전화번호', '핸드폰', '휴대폰', '연락처'],

  [USER_FIELD_IDS.EVM_WALLET]: ['evm', 'ethereum', 'eth', 'wallet', 'metamask', '지갑', '이더리움'],

  [USER_FIELD_IDS.SOLANA_WALLET]: ['solana', 'sol', 'phantom', 'solflare', '솔라나', '팬텀'],
};

/**
 * 특정 필드 타입에서 제외할 키워드 목록
 * - 레이블에 이 키워드가 포함되어 있으면 해당 필드 타입으로 매칭하지 않음
 * - 예: 트위터 링크를 요구하는 필드는 트위터 핸들로 매칭하지 않음
 */
export const EXCLUSION_KEYWORDS: Record<string, string[]> = {
  [USER_FIELD_IDS.TWITTER]: ['link', 'url', 'http', 'https', '링크', '주소'],
};


/**
 * 긍정 응답 키워드 목록
 * 체크박스/라디오 버튼 자동 선택에 사용
 */
export const POSITIVE_KEYWORDS: string[] = [
  // 영어
  'yes',
  'y',
  'ok',
  'okay',
  'agree',
  'accept',
  'confirm',
  'true',

  // 한국어
  '예',
  '네',
  '동의',
  '수락',
  '확인',
  '승인',
];

/**
 * Fuzzy 매칭 설정
 */
export const FUSE_OPTIONS = {
  /** 매칭 threshold (0 = 완벽 일치, 1 = 모든 것 매칭) */
  threshold: 0.4,
  /** 검색할 키 */
  keys: ['keyword'] as string[],
  /** 점수 포함 */
  includeScore: true,
  /** 대소문자 구분 안함 */
  isCaseSensitive: false,
  /** 위치 무시 (어디서든 매칭) */
  ignoreLocation: true,
  /** 최소 매칭 문자 길이 */
  minMatchCharLength: 2,
};

/**
 * 매칭 점수 기준
 */
export const MATCH_SCORE_THRESHOLDS = {
  /** 완전 일치로 간주할 점수 */
  EXACT: 0.0,
  /** 부분 일치로 간주할 점수 */
  PARTIAL: 0.2,
  /** 최대 허용 점수 (이 이상은 매칭 실패) */
  MAX: 0.4,
} as const;
