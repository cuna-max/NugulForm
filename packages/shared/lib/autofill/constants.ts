// =====================
// Mapping Dictionary - 필드 매칭용 키워드 사전
// =====================

import { USER_FIELD_IDS } from '@extension/storage';

/**
 * 각 필드 타입별 매칭 키워드 목록
 * - 소문자로 정규화된 상태로 매칭
 * - 다양한 표기법과 약어 지원
 */
export const FIELD_KEYWORDS: Record<string, string[]> = {
  [USER_FIELD_IDS.TELEGRAM]: [
    'telegram',
    'tele',
    'tg',
    'telegram handle',
    'telegram id',
    'telegram username',
    'telegram account',
    '텔레그램',
    '텔레',
    '텔그램',
  ],

  [USER_FIELD_IDS.TWITTER]: [
    'twitter',
    'twit',
    'x',
    'x handle',
    'twitter handle',
    'twitter id',
    'twitter username',
    'twitter account',
    'x account',
    'x id',
    'x username',
    '트위터',
    '엑스',
  ],

  [USER_FIELD_IDS.DISCORD]: [
    'discord',
    'disc',
    'discord handle',
    'discord id',
    'discord username',
    'discord account',
    'discord tag',
    '디스코드',
    '디코',
  ],

  [USER_FIELD_IDS.EMAIL]: [
    'email',
    'e-mail',
    'mail',
    'email address',
    'email id',
    'your email',
    'contact email',
    '이메일',
    '메일',
    '이메일 주소',
  ],

  [USER_FIELD_IDS.YOUTUBE]: [
    'youtube',
    'yt',
    'youtube channel',
    'youtube handle',
    'youtube account',
    'youtube url',
    'youtube link',
    'channel url',
    '유튜브',
    '유튜브 채널',
  ],

  [USER_FIELD_IDS.PHONE]: [
    'phone',
    'phone number',
    'mobile',
    'mobile number',
    'cell',
    'cell phone',
    'telephone',
    'tel',
    'contact number',
    '전화번호',
    '핸드폰',
    '휴대폰',
    '연락처',
  ],

  [USER_FIELD_IDS.EVM_WALLET]: [
    'wallet',
    'evm',
    'evm wallet',
    'evm address',
    'ethereum',
    'eth',
    'eth wallet',
    'eth address',
    'ethereum wallet',
    'ethereum address',
    'wallet address',
    'metamask',
    'crypto wallet',
    '지갑',
    '지갑 주소',
    'evm 지갑',
    '이더리움',
    '이더리움 지갑',
  ],

  [USER_FIELD_IDS.SOLANA_WALLET]: [
    'solana',
    'sol',
    'sol wallet',
    'sol address',
    'solana wallet',
    'solana address',
    'phantom',
    'solflare',
    '솔라나',
    '솔라나 지갑',
  ],
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
  'i agree',
  'i accept',
  'i confirm',
  'true',

  // 한국어
  '예',
  '네',
  '동의',
  '동의합니다',
  '동의함',
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
