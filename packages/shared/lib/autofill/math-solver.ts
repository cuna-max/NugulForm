// =====================
// Math Solver - 수식 계산 및 한글 숫자 변환
// =====================

/**
 * 한글 숫자 매핑
 * - 일반 숫자 표현: 일, 이, 삼, 사, 오, 육, 칠, 팔, 구, 십
 * - 고유어 숫자 표현: 하나, 둘, 셋, 넷, 다섯, 여섯, 일곱, 여덟, 아홉, 열
 */
const KOREAN_NUMBER_MAP: Record<string, number> = {
  // 일반 숫자 (한자 기반)
  영: 0,
  공: 0,
  일: 1,
  이: 2,
  삼: 3,
  사: 4,
  오: 5,
  육: 6,
  칠: 7,
  팔: 8,
  구: 9,
  십: 10,

  // 고유어 숫자
  하나: 1,
  둘: 2,
  셋: 3,
  넷: 4,
  다섯: 5,
  여섯: 6,
  일곱: 7,
  여덟: 8,
  아홉: 9,
  열: 10,
};

/**
 * 영어 숫자 매핑
 * - 0~20까지 지원
 */
const ENGLISH_NUMBER_MAP: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

/**
 * 숫자를 다국어 표현으로 변환
 * - 0~20까지 지원 (봇 방지 질문에서 일반적으로 사용되는 범위)
 * - 각 숫자에 대해 가능한 모든 표현 반환 (아라비아 숫자, 한글, 영어)
 */
export const numberToKoreanVariants = (num: number): string[] => {
  const variants: string[] = [];

  // 숫자 그대로
  variants.push(String(num));

  // 한글 변환
  const koreanMap: Record<number, string[]> = {
    0: ['영', '공'],
    1: ['일', '하나'],
    2: ['이', '둘'],
    3: ['삼', '셋'],
    4: ['사', '넷'],
    5: ['오', '다섯'],
    6: ['육', '여섯'],
    7: ['칠', '일곱'],
    8: ['팔', '여덟'],
    9: ['구', '아홉'],
    10: ['십', '열'],
  };

  if (koreanMap[num]) {
    variants.push(...koreanMap[num]);
  }

  // 영어 변환
  const englishMap: Record<number, string> = {
    0: 'zero',
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
    10: 'ten',
    11: 'eleven',
    12: 'twelve',
    13: 'thirteen',
    14: 'fourteen',
    15: 'fifteen',
    16: 'sixteen',
    17: 'seventeen',
    18: 'eighteen',
    19: 'nineteen',
    20: 'twenty',
  };

  if (englishMap[num]) {
    variants.push(englishMap[num]);
  }

  return variants;
};

/**
 * 다국어 숫자를 아라비아 숫자로 변환
 * - "다섯" → 5
 * - "오" → 5
 * - "five" → 5
 * - "5" → 5
 */
export const convertKoreanNumber = (text: string): number | null => {
  const normalized = text.trim().toLowerCase();

  // 이미 숫자인 경우
  const numValue = Number(normalized);
  if (!isNaN(numValue)) {
    return numValue;
  }

  // 한글 숫자 변환
  if (KOREAN_NUMBER_MAP[normalized] !== undefined) {
    return KOREAN_NUMBER_MAP[normalized];
  }

  // 영어 숫자 변환
  if (ENGLISH_NUMBER_MAP[normalized] !== undefined) {
    return ENGLISH_NUMBER_MAP[normalized];
  }

  return null;
};

/**
 * 텍스트에서 수식 추출
 * - 패턴: 숫자와 연산자(+, -, *, /, 괄호)로 구성된 수식
 * - 예: "2 + 3은 몇인가요?" → "2 + 3"
 * - 예: "(10 - 2) / 4는?" → "(10 - 2) / 4"
 */
export const extractMathExpression = (text: string): string | null => {
  // 수식 패턴: 숫자, 연산자, 괄호, 공백으로 구성
  // 최소 2개 이상의 숫자와 1개 이상의 연산자 필요
  const mathPattern = /[\d\s+\-*/()]+/g;
  const matches = text.match(mathPattern);

  if (!matches) return null;

  // 가장 긴 매치를 찾아서 반환 (수식이 여러 개 있을 수 있음)
  let longestMatch = '';
  for (const match of matches) {
    const trimmed = match.trim();
    // 최소한 "숫자 연산자 숫자" 형태여야 함
    if (trimmed.length > longestMatch.length && /\d+\s*[+\-*/]\s*\d+/.test(trimmed)) {
      longestMatch = trimmed;
    }
  }

  if (!longestMatch) return null;

  // 수식 정리: 앞뒤 공백 제거, 연속된 공백 제거
  return longestMatch.trim().replace(/\s+/g, ' ');
};

/**
 * 수식 계산
 * - 사칙연산 + 괄호 지원
 * - eval() 대신 안전한 방식으로 계산
 */
export const calculateExpression = (expression: string): number | null => {
  try {
    // 공백 제거
    const normalized = expression.replace(/\s+/g, '');

    // 유효한 수식인지 검증 (숫자, 연산자, 괄호만 허용)
    if (!/^[\d+\-*/().]+$/.test(normalized)) {
      return null;
    }

    // 괄호 균형 확인
    let balance = 0;
    for (const char of normalized) {
      if (char === '(') balance++;
      if (char === ')') balance--;
      if (balance < 0) return null; // 닫는 괄호가 먼저 나옴
    }
    if (balance !== 0) return null; // 괄호 불균형

    // Function 생성자를 사용한 안전한 계산
    // eval()보다 안전하며, 수식만 계산 가능
    const result = new Function(`'use strict'; return (${normalized})`)();

    // 결과가 유효한 숫자인지 확인
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      // 소수점 처리: 소수점 2자리까지만 반올림
      return Math.round(result * 100) / 100;
    }

    return null;
  } catch (error) {
    console.error('[NugulForm] Math calculation error:', error);
    return null;
  }
};

/**
 * 텍스트에서 수식을 찾아 계산
 * - 텍스트에서 수식 추출 → 계산 → 결과 반환
 */
export const extractAndCalculate = (text: string): number | null => {
  const expression = extractMathExpression(text);
  if (!expression) return null;

  return calculateExpression(expression);
};

/**
 * 옵션 텍스트에서 숫자 추출 (한글/영어 숫자 포함)
 * - "5" → 5
 * - "다섯" → 5
 * - "five" → 5
 * - "5번" → 5
 * - "답: 다섯" → 5
 * - "answer: five" → 5
 */
export const extractNumberFromOption = (text: string): number | null => {
  const normalized = text.trim();
  const normalizedLower = normalized.toLowerCase();

  // 1. 아라비아 숫자 찾기
  const numberMatch = normalized.match(/\d+(\.\d+)?/);
  if (numberMatch) {
    const num = Number(numberMatch[0]);
    if (!isNaN(num)) return num;
  }

  // 2. 한글 숫자 찾기
  for (const [korean, value] of Object.entries(KOREAN_NUMBER_MAP)) {
    if (normalized.includes(korean)) {
      return value;
    }
  }

  // 3. 영어 숫자 찾기
  for (const [english, value] of Object.entries(ENGLISH_NUMBER_MAP)) {
    // 단어 경계를 고려한 매칭 (예: "one"이 "someone"에 매칭되지 않도록)
    const wordPattern = new RegExp(`\\b${english}\\b`, 'i');
    if (wordPattern.test(normalizedLower)) {
      return value;
    }
  }

  return null;
};
