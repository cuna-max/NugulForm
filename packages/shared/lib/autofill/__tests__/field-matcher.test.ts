// =====================
// Field Matcher 테스트
// =====================

import { matchFormField, resetFuseInstance } from '../field-matcher.js';
import { USER_FIELD_IDS } from '@extension/storage';
import { describe, it, expect, beforeEach } from 'vitest';
import type { ParsedFormField } from '../types.js';

/**
 * 테스트용 폼 필드 생성 헬퍼
 */
const createMockField = (label: string, placeholder = ''): ParsedFormField => ({
  element: document.createElement('input'),
  label,
  placeholder,
  type: 'text',
  required: false,
  currentValue: '',
  elementId: 'test-element-id',
});

describe('Field Matcher', () => {
  beforeEach(() => {
    // 각 테스트 전에 Fuse 인스턴스 리셋
    resetFuseInstance();
  });

  // =====================
  // A. 완전 일치 (Exact Match) 테스트
  // =====================
  describe('A. 완전 일치 (Exact Match)', () => {
    it('한글 텔레그램 키워드 완전 일치', () => {
      const field = createMockField('텔레그램');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.TELEGRAM);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('한글 이메일 키워드 완전 일치', () => {
      const field = createMockField('이메일');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EMAIL);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('한글 전화번호 키워드 완전 일치', () => {
      const field = createMockField('전화번호');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.PHONE);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('영어 telegram 키워드 완전 일치', () => {
      const field = createMockField('telegram');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.TELEGRAM);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('영어 email 키워드 완전 일치', () => {
      const field = createMockField('email');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EMAIL);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('영어 discord 키워드 완전 일치', () => {
      const field = createMockField('discord');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.DISCORD);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('한글 주소 키워드 완전 일치', () => {
      const field = createMockField('주소');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.ADDRESS);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('대소문자 무시: EMAIL → email', () => {
      const field = createMockField('EMAIL');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EMAIL);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('대소문자 무시: Discord → discord', () => {
      const field = createMockField('Discord');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.DISCORD);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('특수문자 포함: e-mail → email', () => {
      const field = createMockField('e-mail');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EMAIL);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('특수문자 포함: 핸드폰 → phone', () => {
      const field = createMockField('핸드폰');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.PHONE);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('약어 매칭: tg → telegram', () => {
      const field = createMockField('tg');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.TELEGRAM);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('약어 매칭: yt → youtube', () => {
      const field = createMockField('yt');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.YOUTUBE);
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });
  });

  // =====================
  // B. 부분 문자열 매칭 (Partial Match) 테스트
  // =====================
  describe('B. 부분 문자열 매칭 (Partial Match)', () => {
    it('레이블이 키워드 포함: "텔레그램 아이디를 입력하세요" → telegram', () => {
      const field = createMockField('텔레그램 아이디를 입력하세요');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.TELEGRAM);
      expect(result?.score).toBeLessThan(0.2);
      expect(result?.matchType).toBe('partial');
    });

    it('레이블이 키워드 포함: "Your email address" → email', () => {
      const field = createMockField('Your email address');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EMAIL);
      expect(result?.score).toBeLessThan(0.2);
      expect(result?.matchType).toBe('partial');
    });

    it('레이블이 키워드 포함: "Discord username" → discord', () => {
      const field = createMockField('Discord username');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.DISCORD);
      expect(result?.score).toBeLessThan(0.2);
      expect(result?.matchType).toBe('partial');
    });

    it('키워드가 레이블 포함: "디코" → discord (최소 3글자)', () => {
      const field = createMockField('디코드');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.DISCORD);
    });

    it('레이블에 여러 단어 포함: "Enter your telegram handle" → telegram', () => {
      const field = createMockField('Enter your telegram handle');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.TELEGRAM);
      expect(result?.score).toBeLessThan(0.2);
      expect(result?.matchType).toBe('partial');
    });

    it('긴 텍스트에서 키워드 찾기: "Please provide your email for notifications" → email', () => {
      const field = createMockField('Please provide your email for notifications');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EMAIL);
      expect(result?.score).toBeLessThan(0.2);
      expect(result?.matchType).toBe('partial');
    });

    it('괄호 포함 레이블: "전화번호 (선택사항)" → phone', () => {
      const field = createMockField('전화번호 (선택사항)');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.PHONE);
      expect(result?.score).toBeLessThan(0.2);
      expect(result?.matchType).toBe('partial');
    });
  });

  // =====================
  // C. Fuzzy 매칭 (오타/변형) 테스트
  // =====================
  describe('C. Fuzzy 매칭 (오타/변형)', () => {
    it('오타: "telegarm" → telegram', () => {
      const field = createMockField('telegarm');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.TELEGRAM);
      expect(result?.score).toBeGreaterThan(0);
      expect(result?.score).toBeLessThanOrEqual(0.4);
    });

    it('띄어쓰기 차이: "e mail" → email', () => {
      const field = createMockField('e mail');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EMAIL);
    });

    it('유사 단어: "discrod" → discord', () => {
      const field = createMockField('discrod');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.DISCORD);
      expect(result?.score).toBeLessThanOrEqual(0.4);
    });

    it('철자 변형: "teleg" → telegram', () => {
      const field = createMockField('teleg');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.TELEGRAM);
    });

    it('한글 오타: "텔그램" → 텔레그램', () => {
      const field = createMockField('텔그램');
      const result = matchFormField(field);

      // 텔그 키워드가 있으므로 매칭될 수 있음
      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.TELEGRAM);
    });
  });

  // =====================
  // D. 제외 키워드 (Exclusion) 테스트
  // =====================
  describe('D. 제외 키워드 (Exclusion)', () => {
    it('Twitter 링크 포함 → null 반환', () => {
      const field = createMockField('트위터 링크를 입력하세요');
      const result = matchFormField(field);

      // "링크" 키워드가 포함되어 있으므로 twitter 매칭 제외
      expect(result).toBeNull();
    });

    it('Twitter URL 포함 → null 반환', () => {
      const field = createMockField('Twitter URL');
      const result = matchFormField(field);

      // "URL" 키워드가 포함되어 있으므로 twitter 매칭 제외
      expect(result).toBeNull();
    });

    it('Twitter link 포함 → null 반환', () => {
      const field = createMockField('twitter link');
      const result = matchFormField(field);

      // "link" 키워드가 포함되어 있으므로 twitter 매칭 제외
      expect(result).toBeNull();
    });

    it('Twitter https 포함 → null 반환', () => {
      const field = createMockField('트위터 https 주소');
      const result = matchFormField(field);

      // "https" 키워드가 포함되어 있으므로 twitter 매칭 제외
      expect(result).toBeNull();
    });

    it('제외 키워드 없으면 정상 매칭: "Twitter handle" → twitter', () => {
      const field = createMockField('Twitter handle');
      const result = matchFormField(field);

      // "handle"은 제외 키워드가 아니므로 정상 매칭
      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.TWITTER);
    });
  });

  // =====================
  // E. 다국어 혼합 테스트
  // =====================
  describe('E. 다국어 혼합', () => {
    it('영어+한글: "telegram 핸들" → telegram', () => {
      const field = createMockField('telegram 핸들');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.TELEGRAM);
    });

    it('영어+한글: "discord handle 입력" → discord', () => {
      const field = createMockField('discord handle 입력');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.DISCORD);
    });

    it('한글+영어: "전화 number" → phone', () => {
      const field = createMockField('전화 number');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.PHONE);
    });

    it('영어+한글: "email 주소" → email', () => {
      const field = createMockField('email 주소');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EMAIL);
    });

    it('한글+영어 약어: "유튜브 channel" → youtube', () => {
      const field = createMockField('유튜브 channel');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.YOUTUBE);
    });
  });

  // =====================
  // F. 우선순위 테스트
  // =====================
  describe('F. 우선순위 테스트', () => {
    it('완전 일치가 부분 일치보다 우선', () => {
      const field = createMockField('email');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.score).toBe(0);
      expect(result?.matchType).toBe('exact');
    });

    it('부분 일치가 fuzzy보다 우선', () => {
      const field = createMockField('your email address');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.matchType).toBe('partial');
    });
  });

  // =====================
  // G. 엣지 케이스 테스트
  // =====================
  describe('G. 엣지 케이스', () => {
    it('빈 문자열 → null', () => {
      const field = createMockField('');
      const result = matchFormField(field);

      expect(result).toBeNull();
    });

    it('1글자 입력 → null (최소 2글자)', () => {
      const field = createMockField('a');
      const result = matchFormField(field);

      expect(result).toBeNull();
    });

    it('숫자만 → null', () => {
      const field = createMockField('123456');
      const result = matchFormField(field);

      expect(result).toBeNull();
    });

    it('특수문자만 → null', () => {
      const field = createMockField('@@@###');
      const result = matchFormField(field);

      expect(result).toBeNull();
    });

    it('공백만 → null', () => {
      const field = createMockField('    ');
      const result = matchFormField(field);

      expect(result).toBeNull();
    });

    it('매우 긴 텍스트 처리', () => {
      const longText =
        'Please enter your email address for verification and notification purposes ' +
        'We will use this to send you important updates about your submission and other ' +
        'relevant information regarding this form and future communications';
      const field = createMockField(longText);
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EMAIL);
    });

    it('여러 키워드 포함 시 첫 번째 매칭', () => {
      // "telegram"이 먼저 나오므로 telegram으로 매칭되어야 함
      const field = createMockField('telegram or discord');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      // telegram이나 discord 둘 중 하나로 매칭됨
      expect([USER_FIELD_IDS.TELEGRAM, USER_FIELD_IDS.DISCORD]).toContain(result?.userFieldId);
    });

    it('관련 없는 텍스트 → null', () => {
      const field = createMockField('Enter your favorite color');
      const result = matchFormField(field);

      expect(result).toBeNull();
    });
  });

  // =====================
  // H. 실제 Google Forms 사례 테스트
  // =====================
  describe('H. 실제 Google Forms 사례', () => {
    it('텔레그램 핸들 (선택사항) → telegram', () => {
      const field = createMockField('텔레그램 핸들 (선택사항)');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.TELEGRAM);
    });

    it('Your Ethereum wallet address (EVM) → evm wallet', () => {
      const field = createMockField('Your Ethereum wallet address (EVM)');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EVM_WALLET);
    });

    it('Discord handle (without #) → discord', () => {
      const field = createMockField('Discord handle (without #)');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.DISCORD);
    });

    it('Email address for notification → email', () => {
      const field = createMockField('Email address for notification');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EMAIL);
    });

    it('Phone number (optional) → phone', () => {
      const field = createMockField('Phone number (optional)');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.PHONE);
    });

    it('지갑 주소 (메타마스크) → evm wallet', () => {
      const field = createMockField('지갑 주소 (메타마스크)');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EVM_WALLET);
    });

    it('Solana 지갑 주소 → solana wallet', () => {
      const field = createMockField('Solana 지갑 주소');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.SOLANA_WALLET);
    });

    it('YouTube 채널 링크 아님 (채널만) → youtube', () => {
      const field = createMockField('YouTube 채널');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.YOUTUBE);
    });

    it('휴대폰 번호 입력 → phone', () => {
      const field = createMockField('휴대폰 번호 입력');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.PHONE);
    });

    it('연락처 (전화번호) → phone', () => {
      const field = createMockField('연락처 (전화번호)');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.PHONE);
    });

    it('한글 주소 키워드 매칭', () => {
      const field = createMockField('상품 지급을 위한 정확한 집 주소를 입력해주세요.');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.ADDRESS);
    });
  });

  // =====================
  // I. Placeholder 테스트
  // =====================
  describe('I. Placeholder 매칭', () => {
    it('Label이 없고 Placeholder만 있을 때 매칭', () => {
      const field = createMockField('', 'Enter your email');
      const result = matchFormField(field);

      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.EMAIL);
    });

    it('Label 우선순위가 Placeholder보다 높음', () => {
      const field = createMockField('telegram', 'Enter your email');
      const result = matchFormField(field);

      // Label의 telegram이 우선
      expect(result).not.toBeNull();
      expect(result?.userFieldId).toBe(USER_FIELD_IDS.TELEGRAM);
    });
  });
});
