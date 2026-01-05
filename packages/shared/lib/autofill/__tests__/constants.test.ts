// =====================
// Constants 테스트
// =====================

import {
  FIELD_KEYWORDS,
  EXCLUSION_KEYWORDS,
  POSITIVE_KEYWORDS,
  FUSE_OPTIONS,
  MATCH_SCORE_THRESHOLDS,
} from '../constants.js';
import { USER_FIELD_IDS } from '@extension/storage';
import { describe, it, expect } from 'vitest';

describe('Constants', () => {
  // =====================
  // A. FIELD_KEYWORDS 구조 검증
  // =====================
  describe('A. FIELD_KEYWORDS 구조 검증', () => {
    it('모든 USER_FIELD_IDS에 대한 키워드가 정의되어 있어야 함', () => {
      const expectedFieldIds = [
        USER_FIELD_IDS.TELEGRAM,
        USER_FIELD_IDS.TWITTER,
        USER_FIELD_IDS.DISCORD,
        USER_FIELD_IDS.EMAIL,
        USER_FIELD_IDS.YOUTUBE,
        USER_FIELD_IDS.PHONE,
        USER_FIELD_IDS.EVM_WALLET,
        USER_FIELD_IDS.SOLANA_WALLET,
      ];

      expectedFieldIds.forEach(fieldId => {
        expect(FIELD_KEYWORDS[fieldId]).toBeDefined();
        expect(Array.isArray(FIELD_KEYWORDS[fieldId])).toBe(true);
        expect(FIELD_KEYWORDS[fieldId].length).toBeGreaterThan(0);
      });
    });

    it('각 필드의 키워드는 배열이어야 함', () => {
      Object.values(FIELD_KEYWORDS).forEach(keywords => {
        expect(Array.isArray(keywords)).toBe(true);
      });
    });

    it('각 필드는 최소 1개 이상의 키워드를 가져야 함', () => {
      Object.values(FIELD_KEYWORDS).forEach(keywords => {
        expect(keywords.length).toBeGreaterThan(0);
      });
    });

    it('키워드는 문자열이어야 함', () => {
      Object.values(FIELD_KEYWORDS).forEach(keywords => {
        keywords.forEach(keyword => {
          expect(typeof keyword).toBe('string');
          expect(keyword.length).toBeGreaterThan(0);
        });
      });
    });

    it('중복 키워드가 없어야 함 (동일 필드 내)', () => {
      Object.entries(FIELD_KEYWORDS).forEach(([_fieldId, keywords]) => {
        const uniqueKeywords = new Set(keywords);
        expect(uniqueKeywords.size).toBe(keywords.length);
      });
    });
  });

  // =====================
  // B. EXCLUSION_KEYWORDS 구조 검증
  // =====================
  describe('B. EXCLUSION_KEYWORDS 구조 검증', () => {
    it('EXCLUSION_KEYWORDS는 객체여야 함', () => {
      expect(typeof EXCLUSION_KEYWORDS).toBe('object');
      expect(EXCLUSION_KEYWORDS).not.toBeNull();
    });

    it('제외 키워드가 있는 필드는 배열이어야 함', () => {
      Object.values(EXCLUSION_KEYWORDS).forEach(keywords => {
        expect(Array.isArray(keywords)).toBe(true);
      });
    });

    it('Twitter 필드에 제외 키워드가 정의되어 있어야 함', () => {
      expect(EXCLUSION_KEYWORDS[USER_FIELD_IDS.TWITTER]).toBeDefined();
      expect(Array.isArray(EXCLUSION_KEYWORDS[USER_FIELD_IDS.TWITTER])).toBe(true);
      expect(EXCLUSION_KEYWORDS[USER_FIELD_IDS.TWITTER].length).toBeGreaterThan(0);
    });

    it('제외 키워드는 문자열이어야 함', () => {
      Object.values(EXCLUSION_KEYWORDS).forEach(keywords => {
        keywords.forEach(keyword => {
          expect(typeof keyword).toBe('string');
          expect(keyword.length).toBeGreaterThan(0);
        });
      });
    });

    it('Twitter 제외 키워드에 link, url이 포함되어야 함', () => {
      const twitterExclusions = EXCLUSION_KEYWORDS[USER_FIELD_IDS.TWITTER];
      const lowerCased = twitterExclusions.map(k => k.toLowerCase());
      expect(lowerCased.some(k => k.includes('link') || k.includes('url'))).toBe(true);
    });
  });

  // =====================
  // C. POSITIVE_KEYWORDS 검증
  // =====================
  describe('C. POSITIVE_KEYWORDS 검증', () => {
    it('POSITIVE_KEYWORDS는 배열이어야 함', () => {
      expect(Array.isArray(POSITIVE_KEYWORDS)).toBe(true);
    });

    it('최소 5개 이상의 긍정 키워드가 있어야 함', () => {
      expect(POSITIVE_KEYWORDS.length).toBeGreaterThanOrEqual(5);
    });

    it('모든 키워드는 문자열이어야 함', () => {
      POSITIVE_KEYWORDS.forEach(keyword => {
        expect(typeof keyword).toBe('string');
        expect(keyword.length).toBeGreaterThan(0);
      });
    });

    it('기본 긍정 키워드(yes, y, ok)가 포함되어야 함', () => {
      const lowerCased = POSITIVE_KEYWORDS.map(k => k.toLowerCase());
      expect(lowerCased).toContain('yes');
      expect(lowerCased).toContain('y');
      expect(lowerCased).toContain('ok');
    });

    it('한글 긍정 키워드(예, 네, 동의)가 포함되어야 함', () => {
      expect(POSITIVE_KEYWORDS).toContain('예');
      expect(POSITIVE_KEYWORDS).toContain('네');
      expect(POSITIVE_KEYWORDS).toContain('동의');
    });

    it('중복 키워드가 없어야 함', () => {
      const uniqueKeywords = new Set(POSITIVE_KEYWORDS);
      expect(uniqueKeywords.size).toBe(POSITIVE_KEYWORDS.length);
    });
  });

  // =====================
  // D. FUSE_OPTIONS 설정 검증
  // =====================
  describe('D. FUSE_OPTIONS 설정 검증', () => {
    it('threshold가 0과 1 사이여야 함', () => {
      expect(FUSE_OPTIONS.threshold).toBeGreaterThanOrEqual(0);
      expect(FUSE_OPTIONS.threshold).toBeLessThanOrEqual(1);
    });

    it('keys 배열이 정의되어 있어야 함', () => {
      expect(Array.isArray(FUSE_OPTIONS.keys)).toBe(true);
      expect(FUSE_OPTIONS.keys.length).toBeGreaterThan(0);
    });

    it('keys에 "keyword"가 포함되어야 함', () => {
      expect(FUSE_OPTIONS.keys).toContain('keyword');
    });

    it('includeScore가 true여야 함', () => {
      expect(FUSE_OPTIONS.includeScore).toBe(true);
    });

    it('isCaseSensitive가 false여야 함', () => {
      expect(FUSE_OPTIONS.isCaseSensitive).toBe(false);
    });

    it('ignoreLocation이 true여야 함', () => {
      expect(FUSE_OPTIONS.ignoreLocation).toBe(true);
    });

    it('minMatchCharLength가 1 이상이어야 함', () => {
      expect(FUSE_OPTIONS.minMatchCharLength).toBeGreaterThanOrEqual(1);
    });
  });

  // =====================
  // E. MATCH_SCORE_THRESHOLDS 검증
  // =====================
  describe('E. MATCH_SCORE_THRESHOLDS 검증', () => {
    it('EXACT가 0이어야 함', () => {
      expect(MATCH_SCORE_THRESHOLDS.EXACT).toBe(0);
    });

    it('PARTIAL이 EXACT보다 커야 함', () => {
      expect(MATCH_SCORE_THRESHOLDS.PARTIAL).toBeGreaterThan(MATCH_SCORE_THRESHOLDS.EXACT);
    });

    it('MAX가 PARTIAL보다 커야 함', () => {
      expect(MATCH_SCORE_THRESHOLDS.MAX).toBeGreaterThan(MATCH_SCORE_THRESHOLDS.PARTIAL);
    });

    it('MAX가 FUSE threshold와 일치해야 함', () => {
      expect(MATCH_SCORE_THRESHOLDS.MAX).toBe(FUSE_OPTIONS.threshold);
    });

    it('모든 임계값이 0과 1 사이여야 함', () => {
      expect(MATCH_SCORE_THRESHOLDS.EXACT).toBeGreaterThanOrEqual(0);
      expect(MATCH_SCORE_THRESHOLDS.EXACT).toBeLessThanOrEqual(1);

      expect(MATCH_SCORE_THRESHOLDS.PARTIAL).toBeGreaterThanOrEqual(0);
      expect(MATCH_SCORE_THRESHOLDS.PARTIAL).toBeLessThanOrEqual(1);

      expect(MATCH_SCORE_THRESHOLDS.MAX).toBeGreaterThanOrEqual(0);
      expect(MATCH_SCORE_THRESHOLDS.MAX).toBeLessThanOrEqual(1);
    });
  });
});
