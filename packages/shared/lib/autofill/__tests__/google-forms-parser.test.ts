// =====================
// Google Forms Parser 테스트
// =====================

import { parseGoogleFormFields, parseFormOptions, isGoogleFormsPage } from '../google-forms-parser.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Google Forms Parser', () => {
  beforeEach(() => {
    // DOM 초기화
    document.body.innerHTML = '';

    // Google Forms 페이지로 설정
    vi.stubGlobal('location', {
      hostname: 'docs.google.com',
      pathname: '/forms/d/test/viewform',
    });
  });

  // =====================
  // A. 페이지 감지 테스트
  // =====================
  describe('A. 페이지 감지 (isGoogleFormsPage)', () => {
    it('Google Forms 페이지에서 true를 반환해야 함', () => {
      const result = isGoogleFormsPage();
      expect(result).toBe(true);
    });

    it('docs.google.com이지만 forms 경로가 아니면 false를 반환해야 함', () => {
      vi.stubGlobal('location', {
        hostname: 'docs.google.com',
        pathname: '/sheets/d/test/edit',
      });

      const result = isGoogleFormsPage();
      expect(result).toBe(false);
    });

    it('docs.google.com이 아니면 false를 반환해야 함', () => {
      vi.stubGlobal('location', {
        hostname: 'example.com',
        pathname: '/form',
      });

      const result = isGoogleFormsPage();
      expect(result).toBe(false);
    });
  });

  // =====================
  // B. 필드 파싱 테스트
  // =====================
  describe('B. 필드 파싱 (parseGoogleFormFields)', () => {
    it('텍스트 입력 필드를 올바르게 파싱해야 함', () => {
      const container = document.createElement('div');
      container.setAttribute('data-params', '[[1234567890,["텍스트 입력"],null,0]]');

      const input = document.createElement('input');
      input.type = 'text';
      container.appendChild(input);

      document.body.appendChild(container);

      const fields = parseGoogleFormFields();

      expect(fields.length).toBe(1);
      expect(fields[0].type).toBe('text');
      expect(fields[0].label).toBe('텍스트 입력');
    });

    it('수식 포함 질문에서 수식을 추출해야 함', () => {
      const container = document.createElement('div');
      container.setAttribute('data-params', '[[1552499373,["봇 방지\\n\\n1+1= ?"],null,2]]');

      const radiogroup = document.createElement('div');
      radiogroup.setAttribute('role', 'radiogroup');
      container.appendChild(radiogroup);

      document.body.appendChild(container);

      const fields = parseGoogleFormFields();

      expect(fields.length).toBe(1);
      expect(fields[0].label).toBe('봇 방지\n\n1+1= ?');
      expect(fields[0].mathExpression).toBe('1+1');
      expect(fields[0].mathResult).toBe(2);
    });

    it('필수 표시(*)가 있는 필드를 필수로 표시해야 함', () => {
      const container = document.createElement('div');
      container.setAttribute('data-params', '[[1234567890,["필수 질문*"],null,0]]');

      const input = document.createElement('input');
      input.type = 'text';
      container.appendChild(input);

      document.body.appendChild(container);

      const fields = parseGoogleFormFields();

      expect(fields[0].required).toBe(true);
    });
  });

  // =====================
  // C. 옵션 파싱 테스트
  // =====================
  describe('C. 옵션 파싱 (parseFormOptions)', () => {
    it('라디오 버튼 옵션을 올바르게 파싱해야 함', () => {
      const radiogroup = document.createElement('div');
      radiogroup.setAttribute('role', 'radiogroup');

      // 옵션 1
      const radio1 = document.createElement('div');
      radio1.setAttribute('role', 'radio');
      radio1.setAttribute('aria-label', '4');
      radio1.setAttribute('data-value', '4');
      radiogroup.appendChild(radio1);

      // 옵션 2
      const radio2 = document.createElement('div');
      radio2.setAttribute('role', 'radio');
      radio2.setAttribute('aria-label', '3');
      radio2.setAttribute('data-value', '3');
      radiogroup.appendChild(radio2);

      // 옵션 3 (정답)
      const radio3 = document.createElement('div');
      radio3.setAttribute('role', 'radio');
      radio3.setAttribute('aria-label', '2');
      radio3.setAttribute('data-value', '2');
      radiogroup.appendChild(radio3);

      // 옵션 4
      const radio4 = document.createElement('div');
      radio4.setAttribute('role', 'radio');
      radio4.setAttribute('aria-label', '5');
      radio4.setAttribute('data-value', '5');
      radiogroup.appendChild(radio4);

      const options = parseFormOptions(radiogroup);

      expect(options.length).toBe(4);
      expect(options[0].text).toBe('4');
      expect(options[1].text).toBe('3');
      expect(options[2].text).toBe('2');
      expect(options[3].text).toBe('5');
    });

    it('선택된 라디오 옵션을 올바르게 표시해야 함', () => {
      const radiogroup = document.createElement('div');
      radiogroup.setAttribute('role', 'radiogroup');

      const radio = document.createElement('div');
      radio.setAttribute('role', 'radio');
      radio.setAttribute('aria-label', '2');
      radio.setAttribute('aria-checked', 'true');
      radiogroup.appendChild(radio);

      const options = parseFormOptions(radiogroup);

      expect(options.length).toBe(1);
      expect(options[0].selected).toBe(true);
    });

    it('봇 방지 수식 답변 옵션이 올바르게 파싱되어야 함', () => {
      const radiogroup = document.createElement('div');
      radiogroup.setAttribute('role', 'radiogroup');

      // 봇 방지 예시 옵션들
      const options = ['4', '3', '2', '5'];
      options.forEach((value, index) => {
        const radio = document.createElement('div');
        radio.setAttribute('role', 'radio');
        radio.setAttribute('aria-label', value);
        radio.setAttribute('data-value', value);
        // 세 번째 옵션(인덱스 2)은 정답이므로 선택되지 않은 상태로 설정
        if (index !== 2) {
          radio.setAttribute('aria-checked', 'false');
        }
        radiogroup.appendChild(radio);
      });

      const parsedOptions = parseFormOptions(radiogroup);

      expect(parsedOptions.length).toBe(4);
      expect(parsedOptions.map(o => o.text)).toEqual(['4', '3', '2', '5']);
      expect(parsedOptions[2].text).toBe('2'); // 정답 옵션
    });
  });

  // =====================
  // D. 봇 방지 수식 답변 테스트
  // =====================
  describe('D. 봇 방지 수식 답변', () => {
    it('1+1=2 수식 답변을 올바르게 처리해야 함', () => {
      // 봇 방지 질문 컨테이너 생성
      const container = document.createElement('div');
      container.setAttribute('data-params', '[[1552499373,["봇 방지\\n\\n1+1= ?"],null,2]]');

      // 라디오 그룹 생성
      const radiogroup = document.createElement('div');
      radiogroup.setAttribute('role', 'radiogroup');

      // 봇 방지 옵션들 생성 (4, 3, 2, 5)
      const optionsData = [
        { value: '4', selected: false },
        { value: '3', selected: false },
        { value: '2', selected: false }, // 정답
        { value: '5', selected: false },
      ];

      optionsData.forEach(({ value, selected }) => {
        const radio = document.createElement('div');
        radio.setAttribute('role', 'radio');
        radio.setAttribute('aria-label', value);
        radio.setAttribute('data-value', value);
        if (selected) {
          radio.setAttribute('aria-checked', 'true');
        }
        radiogroup.appendChild(radio);
      });

      container.appendChild(radiogroup);
      document.body.appendChild(container);

      // 필드 파싱
      const fields = parseGoogleFormFields();
      const botProtectionField = fields.find(f => f.label.includes('봇 방지'));

      expect(botProtectionField).toBeDefined();
      expect(botProtectionField?.mathExpression).toBe('1+1');
      expect(botProtectionField?.mathResult).toBe(2);

      // 옵션 파싱
      const options = parseFormOptions(radiogroup);
      expect(options.length).toBe(4);

      // 정답 옵션(2)이 있는지 확인
      const answerOption = options.find(o => o.text === '2');
      expect(answerOption).toBeDefined();
      expect(answerOption?.text).toBe('2');
      expect(answerOption?.selected).toBe(false); // 아직 선택되지 않음
    });

    it('다양한 수식 답변 옵션이 올바르게 처리되어야 함', () => {
      const testCases = [
        { expression: '1+1', result: 2, options: ['1', '2', '3', '4'] },
        { expression: '2+2', result: 4, options: ['2', '3', '4', '5'] },
        { expression: '3*3', result: 9, options: ['6', '7', '8', '9'] },
        { expression: '10-3', result: 7, options: ['5', '6', '7', '8'] },
      ];

      testCases.forEach(({ expression, result, options: optionTexts }) => {
        const container = document.createElement('div');
        container.setAttribute('data-params', `[[1234567890,["${expression}= ?"],null,2]]`);

        const radiogroup = document.createElement('div');
        radiogroup.setAttribute('role', 'radiogroup');

        optionTexts.forEach(text => {
          const radio = document.createElement('div');
          radio.setAttribute('role', 'radio');
          radio.setAttribute('aria-label', text);
          radio.setAttribute('data-value', text);
          radiogroup.appendChild(radio);
        });

        container.appendChild(radiogroup);
        document.body.appendChild(container);

        const fields = parseGoogleFormFields();
        const mathField = fields[0];

        expect(mathField.mathExpression).toBe(expression);
        expect(mathField.mathResult).toBe(result);

        const parsedOptions = parseFormOptions(radiogroup);
        expect(parsedOptions.map(o => o.text)).toEqual(optionTexts);

        // 정답 옵션이 포함되어 있는지 확인
        const correctOption = parsedOptions.find(o => o.text === result.toString());
        expect(correctOption).toBeDefined();

        document.body.removeChild(container);
      });
    });
  });
});
