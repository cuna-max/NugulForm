// =====================
// Field Matcher - Fuse.js 기반 Fuzzy 매칭 엔진
// =====================

import { FIELD_KEYWORDS, FUSE_OPTIONS, MATCH_SCORE_THRESHOLDS, EXCLUSION_KEYWORDS } from './constants.js';
import Fuse from 'fuse.js';
import type { FieldMatchResult, ParsedFormField } from './types.js';

/**
 * Fuse.js용 검색 아이템 구조
 */
interface SearchItem {
  keyword: string;
  fieldId: string;
}

/**
 * 텍스트 전처리
 * - 소문자 변환
 * - 특수문자 제거 (공백은 유지)
 * - 양끪 공백 제거
 */
const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * 매칭 타입 결정
 */
const determineMatchType = (score: number): FieldMatchResult['matchType'] => {
  if (score <= MATCH_SCORE_THRESHOLDS.EXACT) return 'exact';
  if (score <= MATCH_SCORE_THRESHOLDS.PARTIAL) return 'partial';
  return 'fuzzy';
};

/**
 * Fuse.js 인스턴스 생성
 */
const createFuseInstance = (): Fuse<SearchItem> => {
  const searchItems: SearchItem[] = [];

  // 모든 필드의 키워드를 검색 아이템으로 변환
  for (const [fieldId, keywords] of Object.entries(FIELD_KEYWORDS)) {
    for (const keyword of keywords) {
      searchItems.push({
        keyword: normalizeText(keyword),
        fieldId,
      });
    }
  }

  return new Fuse(searchItems, FUSE_OPTIONS);
};

// 싱글톤 Fuse 인스턴스
let fuseInstance: Fuse<SearchItem> | null = null;

const getFuseInstance = (): Fuse<SearchItem> => {
  if (!fuseInstance) {
    fuseInstance = createFuseInstance();
  }
  return fuseInstance;
};

/**
 * 완전 일치 검색
 */
const findExactMatch = (normalizedLabel: string): FieldMatchResult | null => {
  for (const [fieldId, keywords] of Object.entries(FIELD_KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);

      // 완전 일치
      if (normalizedLabel === normalizedKeyword) {
        return {
          userFieldId: fieldId,
          score: 0,
          matchType: 'exact',
          matchedKeyword: keyword,
        };
      }
    }
  }
  return null;
};

/**
 * 부분 문자열 매칭
 */
const findPartialMatch = (normalizedLabel: string): FieldMatchResult | null => {
  let bestMatch: FieldMatchResult | null = null;
  let bestScore = 1;

  for (const [fieldId, keywords] of Object.entries(FIELD_KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);

      // 레이블이 키워드를 포함
      if (normalizedLabel.includes(normalizedKeyword)) {
        // 키워드 길이 비율로 점수 계산 (긴 키워드 = 더 정확한 매칭)
        const score = 1 - normalizedKeyword.length / normalizedLabel.length;
        const adjustedScore = Math.max(0.01, score * 0.2); // 0.01 ~ 0.2 범위

        if (adjustedScore < bestScore) {
          bestScore = adjustedScore;
          bestMatch = {
            userFieldId: fieldId,
            score: adjustedScore,
            matchType: 'partial',
            matchedKeyword: keyword,
          };
        }
      }

      // 키워드가 레이블을 포함
      if (normalizedKeyword.includes(normalizedLabel) && normalizedLabel.length >= 3) {
        const score = 1 - normalizedLabel.length / normalizedKeyword.length;
        const adjustedScore = Math.max(0.05, score * 0.3);

        if (adjustedScore < bestScore) {
          bestScore = adjustedScore;
          bestMatch = {
            userFieldId: fieldId,
            score: adjustedScore,
            matchType: 'partial',
            matchedKeyword: keyword,
          };
        }
      }
    }
  }

  return bestMatch;
};

/**
 * Fuzzy 매칭 (Fuse.js 사용)
 */
const findFuzzyMatch = (normalizedLabel: string): FieldMatchResult | null => {
  const fuse = getFuseInstance();
  const results = fuse.search(normalizedLabel);

  if (results.length === 0) return null;

  const topResult = results[0];
  const score = topResult.score ?? 1;

  if (score > MATCH_SCORE_THRESHOLDS.MAX) return null;

  return {
    userFieldId: topResult.item.fieldId,
    score,
    matchType: determineMatchType(score),
    matchedKeyword: topResult.item.keyword,
  };
};

/**
 * 특정 필드 ID에 대해 제외 키워드가 포함되어 있는지 확인
 * @param fieldId 필드 ID (예: 'twitter')
 * @param searchText 정규화된 검색 텍스트
 * @returns 제외해야 하면 true, 아니면 false
 */
const shouldExcludeField = (fieldId: string, searchText: string): boolean => {
  const exclusionKeywords = EXCLUSION_KEYWORDS[fieldId];
  if (!exclusionKeywords) return false;

  // 제외 키워드 중 하나라도 포함되어 있으면 제외
  return exclusionKeywords.some(keyword => {
    const normalizedKeyword = normalizeText(keyword);
    return searchText.includes(normalizedKeyword);
  });
};

/**
 * 폼 필드에서 매칭할 텍스트 추출
 */
const extractSearchText = (field: ParsedFormField): string => {
  // label > placeholder 우선순위
  const text = field.label || field.placeholder || '';
  return normalizeText(text);
};

/**
 * 폼 필드와 사용자 필드 매칭
 *
 * 매칭 우선순위:
 * 1. 완전 일치 (score = 0)
 * 2. 부분 문자열 매칭 (score < 0.2)
 * 3. Fuzzy 매칭 (score < threshold)
 *
 * 제외 로직:
 * - 매칭 결과가 있어도 제외 키워드가 포함되어 있으면 null 반환
 */
export const matchFormField = (field: ParsedFormField): FieldMatchResult | null => {
  const searchText = extractSearchText(field);

  if (!searchText || searchText.length < 2) return null;

  // 1. 완전 일치 검색
  const exactMatch = findExactMatch(searchText);
  if (exactMatch) {
    // 제외 키워드 체크
    if (shouldExcludeField(exactMatch.userFieldId, searchText)) {
      return null;
    }
    return exactMatch;
  }

  // 2. 부분 문자열 매칭
  const partialMatch = findPartialMatch(searchText);
  if (partialMatch) {
    // 제외 키워드 체크
    if (shouldExcludeField(partialMatch.userFieldId, searchText)) {
      return null;
    }
    return partialMatch;
  }

  // 3. Fuzzy 매칭
  const fuzzyMatch = findFuzzyMatch(searchText);
  if (fuzzyMatch) {
    // 제외 키워드 체크
    if (shouldExcludeField(fuzzyMatch.userFieldId, searchText)) {
      return null;
    }
    return fuzzyMatch;
  }

  return null;
};

/**
 * 여러 폼 필드 일괄 매칭
 */
export const matchFormFields = (fields: ParsedFormField[]): Map<string, FieldMatchResult | null> => {
  const results = new Map<string, FieldMatchResult | null>();

  for (const field of fields) {
    const match = matchFormField(field);
    results.set(field.elementId, match);
  }

  return results;
};

/**
 * 테스트용: Fuse 인스턴스 리셋
 */
export const resetFuseInstance = (): void => {
  fuseInstance = null;
};
