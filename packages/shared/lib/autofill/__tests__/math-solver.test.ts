// =====================
// Math Solver 테스트
// =====================

import {
  convertKoreanNumber,
  extractMathExpression,
  calculateExpression,
  extractAndCalculate,
  extractNumberFromOption,
  numberToKoreanVariants,
} from '../math-solver.js';
import { describe, it, expect } from 'vitest';

describe('Math Solver', () => {
  // =====================
  // A. 숫자 변환 (convertKoreanNumber) 테스트
  // =====================
  describe('A. 숫자 변환 (convertKoreanNumber)', () => {
    it('아라비아 숫자: "5" → 5', () => {
      expect(convertKoreanNumber('5')).toBe(5);
    });

    it('아라비아 숫자: "10" → 10', () => {
      expect(convertKoreanNumber('10')).toBe(10);
    });

    it('아라비아 숫자: "0" → 0', () => {
      expect(convertKoreanNumber('0')).toBe(0);
    });

    it('한글 일반: "오" → 5', () => {
      expect(convertKoreanNumber('오')).toBe(5);
    });

    it('한글 일반: "십" → 10', () => {
      expect(convertKoreanNumber('십')).toBe(10);
    });

    it('한글 일반: "일" → 1', () => {
      expect(convertKoreanNumber('일')).toBe(1);
    });

    it('한글 일반: "구" → 9', () => {
      expect(convertKoreanNumber('구')).toBe(9);
    });

    it('한글 고유어: "다섯" → 5', () => {
      expect(convertKoreanNumber('다섯')).toBe(5);
    });

    it('한글 고유어: "열" → 10', () => {
      expect(convertKoreanNumber('열')).toBe(10);
    });

    it('한글 고유어: "하나" → 1', () => {
      expect(convertKoreanNumber('하나')).toBe(1);
    });

    it('한글 고유어: "아홉" → 9', () => {
      expect(convertKoreanNumber('아홉')).toBe(9);
    });

    it('영어: "five" → 5', () => {
      expect(convertKoreanNumber('five')).toBe(5);
    });

    it('영어: "ten" → 10', () => {
      expect(convertKoreanNumber('ten')).toBe(10);
    });

    it('영어: "zero" → 0', () => {
      expect(convertKoreanNumber('zero')).toBe(0);
    });

    it('영어: "twenty" → 20', () => {
      expect(convertKoreanNumber('twenty')).toBe(20);
    });

    it('공백 처리: " 다섯 " → 5', () => {
      expect(convertKoreanNumber(' 다섯 ')).toBe(5);
    });

    it('대소문자 무시: "FIVE" → 5', () => {
      expect(convertKoreanNumber('FIVE')).toBe(5);
    });

    it('변환 불가능한 텍스트 → null', () => {
      expect(convertKoreanNumber('not a number')).toBeNull();
    });

    it('빈 문자열 → null', () => {
      expect(convertKoreanNumber('')).toBeNull();
    });

    it('한글 영(zero): "영" → 0', () => {
      expect(convertKoreanNumber('영')).toBe(0);
    });

    it('한글 공(zero): "공" → 0', () => {
      expect(convertKoreanNumber('공')).toBe(0);
    });
  });

  // =====================
  // B. 수식 추출 (extractMathExpression) 테스트
  // =====================
  describe('B. 수식 추출 (extractMathExpression)', () => {
    it('단순 수식: "2 + 3은 몇인가요?" → "2 + 3"', () => {
      expect(extractMathExpression('2 + 3은 몇인가요?')).toBe('2 + 3');
    });

    it('복잡 수식: "(10 - 2) / 4는?" → "(10 - 2) / 4"', () => {
      expect(extractMathExpression('(10 - 2) / 4는?')).toBe('(10 - 2) / 4');
    });

    it('여러 연산자: "3 * 4 + 5" → "3 * 4 + 5"', () => {
      expect(extractMathExpression('3 * 4 + 5는 몇인가요?')).toBe('3 * 4 + 5');
    });

    it('곱셈: "5 * 6" → "5 * 6"', () => {
      expect(extractMathExpression('5 * 6의 값은?')).toBe('5 * 6');
    });

    it('나눗셈: "20 / 4" → "20 / 4"', () => {
      expect(extractMathExpression('20 / 4의 결과는?')).toBe('20 / 4');
    });

    it('뺄셈: "15 - 7" → "15 - 7"', () => {
      expect(extractMathExpression('15 - 7은?')).toBe('15 - 7');
    });

    it('수식 없음: "숫자를 입력하세요" → null', () => {
      expect(extractMathExpression('숫자를 입력하세요')).toBeNull();
    });

    it('숫자만 있음: "123" → null (연산자 없음)', () => {
      expect(extractMathExpression('123')).toBeNull();
    });

    it('공백 제거: "2  +  3" → "2 + 3"', () => {
      const result = extractMathExpression('2  +  3은?');
      expect(result).toBeTruthy();
      expect(result?.replace(/\s+/g, ' ')).toBe('2 + 3');
    });

    it('괄호 포함: "(5 + 3) * 2" → "(5 + 3) * 2"', () => {
      expect(extractMathExpression('계산: (5 + 3) * 2')).toBe('(5 + 3) * 2');
    });
  });

  // =====================
  // C. 수식 계산 (calculateExpression) 테스트
  // =====================
  describe('C. 수식 계산 (calculateExpression)', () => {
    it('덧셈: "2 + 3" → 5', () => {
      expect(calculateExpression('2 + 3')).toBe(5);
    });

    it('뺄셈: "10 - 4" → 6', () => {
      expect(calculateExpression('10 - 4')).toBe(6);
    });

    it('곱셈: "3 * 4" → 12', () => {
      expect(calculateExpression('3 * 4')).toBe(12);
    });

    it('나눗셈: "10 / 2" → 5', () => {
      expect(calculateExpression('10 / 2')).toBe(5);
    });

    it('괄호: "(2 + 3) * 4" → 20', () => {
      expect(calculateExpression('(2 + 3) * 4')).toBe(20);
    });

    it('복잡한 수식: "(10 - 2) / 4" → 2', () => {
      expect(calculateExpression('(10 - 2) / 4')).toBe(2);
    });

    it('소수점: "10 / 3" → 3.33 (반올림)', () => {
      const result = calculateExpression('10 / 3');
      expect(result).toBeCloseTo(3.33, 2);
    });

    it('소수점: "7 / 2" → 3.5', () => {
      expect(calculateExpression('7 / 2')).toBe(3.5);
    });

    it('연산 순서: "2 + 3 * 4" → 14', () => {
      expect(calculateExpression('2 + 3 * 4')).toBe(14);
    });

    it('괄호 우선순위: "(2 + 3) * 4" → 20', () => {
      expect(calculateExpression('(2 + 3) * 4')).toBe(20);
    });

    it('잘못된 수식: "2 +" → null', () => {
      expect(calculateExpression('2 +')).toBeNull();
    });

    it('잘못된 수식: "abc" → null', () => {
      expect(calculateExpression('abc')).toBeNull();
    });

    it('괄호 불균형: "(2 + 3" → null', () => {
      expect(calculateExpression('(2 + 3')).toBeNull();
    });

    it('괄호 역순: "2 + 3)" → null', () => {
      expect(calculateExpression('2 + 3)')).toBeNull();
    });

    it('빈 괄호: "()" → null', () => {
      expect(calculateExpression('()')).toBeNull();
    });

    it('0으로 나누기: "5 / 0" → Infinity (처리됨)', () => {
      // Infinity는 유효한 숫자가 아니므로 null 반환
      expect(calculateExpression('5 / 0')).toBeNull();
    });

    it('음수 결과: "5 - 10" → -5', () => {
      expect(calculateExpression('5 - 10')).toBe(-5);
    });

    it('큰 숫자: "100 * 100" → 10000', () => {
      expect(calculateExpression('100 * 100')).toBe(10000);
    });
  });

  // =====================
  // D. 텍스트에서 수식 추출 및 계산 (extractAndCalculate) 테스트
  // =====================
  describe('D. 텍스트에서 수식 추출 및 계산 (extractAndCalculate)', () => {
    it('"2 + 3은 몇인가요?" → 5', () => {
      expect(extractAndCalculate('2 + 3은 몇인가요?')).toBe(5);
    });

    it('"계산하세요: 10 - 4" → 6', () => {
      expect(extractAndCalculate('계산하세요: 10 - 4')).toBe(6);
    });

    it('"(5 + 3) * 2의 값은?" → 16', () => {
      expect(extractAndCalculate('(5 + 3) * 2의 값은?')).toBe(16);
    });

    it('수식 없음 → null', () => {
      expect(extractAndCalculate('This has no math')).toBeNull();
    });

    it('잘못된 수식 → null', () => {
      expect(extractAndCalculate('2 + + 3은?')).toBeNull();
    });
  });

  // =====================
  // E. 옵션에서 숫자 추출 (extractNumberFromOption) 테스트
  // =====================
  describe('E. 옵션에서 숫자 추출 (extractNumberFromOption)', () => {
    it('"5번" → 5', () => {
      expect(extractNumberFromOption('5번')).toBe(5);
    });

    it('"답: 다섯" → 5', () => {
      expect(extractNumberFromOption('답: 다섯')).toBe(5);
    });

    it('"answer: five" → 5', () => {
      expect(extractNumberFromOption('answer: five')).toBe(5);
    });

    it('"10" → 10', () => {
      expect(extractNumberFromOption('10')).toBe(10);
    });

    it('"열" → 10', () => {
      expect(extractNumberFromOption('열')).toBe(10);
    });

    it('"ten" → 10', () => {
      expect(extractNumberFromOption('ten')).toBe(10);
    });

    it('"Option 3" → 3', () => {
      expect(extractNumberFromOption('Option 3')).toBe(3);
    });

    it('"3번째 선택" → 3', () => {
      expect(extractNumberFromOption('3번째 선택')).toBe(3);
    });

    it('숫자 없음 → null', () => {
      expect(extractNumberFromOption('no number here')).toBeNull();
    });

    it('소수점: "3.14" → 3.14', () => {
      expect(extractNumberFromOption('3.14')).toBe(3.14);
    });
  });

  // =====================
  // F. 숫자를 다국어로 변환 (numberToKoreanVariants) 테스트
  // =====================
  describe('F. 숫자를 다국어로 변환 (numberToKoreanVariants)', () => {
    it('5 → ["5", "오", "다섯", "five"]', () => {
      const result = numberToKoreanVariants(5);
      expect(result).toContain('5');
      expect(result).toContain('오');
      expect(result).toContain('다섯');
      expect(result).toContain('five');
    });

    it('10 → ["10", "십", "열", "ten"]', () => {
      const result = numberToKoreanVariants(10);
      expect(result).toContain('10');
      expect(result).toContain('십');
      expect(result).toContain('열');
      expect(result).toContain('ten');
    });

    it('0 → ["0", "영", "공", "zero"]', () => {
      const result = numberToKoreanVariants(0);
      expect(result).toContain('0');
      expect(result).toContain('영');
      expect(result).toContain('공');
      expect(result).toContain('zero');
    });

    it('1 → ["1", "일", "하나", "one"]', () => {
      const result = numberToKoreanVariants(1);
      expect(result).toContain('1');
      expect(result).toContain('일');
      expect(result).toContain('하나');
      expect(result).toContain('one');
    });

    it('15 → ["15", "fifteen"]', () => {
      const result = numberToKoreanVariants(15);
      expect(result).toContain('15');
      expect(result).toContain('fifteen');
    });

    it('100 → ["100"] (범위 초과)', () => {
      const result = numberToKoreanVariants(100);
      expect(result).toContain('100');
      // 100은 매핑에 없으므로 숫자만 반환
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });
});
