// =====================
// Google Forms DOM Parser
// =====================

import { extractMathExpression, calculateExpression } from './math-solver.js';
import type { ParsedFormField, FormFieldType } from './types.js';

/**
 * Google Forms 선택자 상수
 * - Google Forms 2025 UI 구조 기준
 */
const SELECTORS = {
  /** 질문 컨테이너 */
  QUESTION_CONTAINER: '[data-params]',
  /** 텍스트 입력 */
  TEXT_INPUT: 'input[type="text"]',
  /** 이메일 입력 */
  EMAIL_INPUT: 'input[type="email"]',
  /** URL 입력 */
  URL_INPUT: 'input[type="url"]',
  /** 숫자 입력 */
  NUMBER_INPUT: 'input[type="number"]',
  /** 전화번호 입력 */
  TEL_INPUT: 'input[type="tel"]',
  /** Textarea */
  TEXTAREA: 'textarea',
  /** 라디오 버튼 컨테이너 */
  RADIO_GROUP: '[role="radiogroup"]',
  /** 개별 라디오 버튼 */
  RADIO_OPTION: '[role="radio"]',
  /**
   * 체크박스 컨테이너
   * - Google Forms는 체크박스를 role="list" > listitem > checkbox 구조로 사용
   */
  CHECKBOX_GROUP: '[role="list"]',
  /** 개별 체크박스 */
  CHECKBOX_OPTION: '[role="checkbox"]',
  /** 드롭다운 */
  DROPDOWN: '[role="listbox"]',
  /** 드롭다운 옵션 */
  DROPDOWN_OPTION: '[role="option"]',
  /** 질문 제목 */
  QUESTION_TITLE: '[role="heading"]',
  /** 필수 표시 */
  REQUIRED_MARKER: '[aria-label*="필수"]',
  /** 필수 표시 (영어) */
  REQUIRED_MARKER_EN: '[aria-label*="Required"]',
} as const;

/**
 * 고유 ID 생성
 */
const generateElementId = (element: HTMLElement, index: number): string => {
  const dataParams = element.closest('[data-params]')?.getAttribute('data-params');
  if (dataParams) {
    // data-params에서 고유 ID 추출 시도
    const match = dataParams.match(/\[\[(\d+)/);
    if (match) return `field_${match[1]}`;
  }
  return `field_${index}_${Date.now()}`;
};

/**
 * 필드 타입 결정
 * - Google Forms의 실제 DOM 구조 기반
 */
const determineFieldType = (element: HTMLElement): FormFieldType => {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');

  if (tagName === 'textarea') return 'textarea';
  if (tagName === 'input') {
    const type = element.getAttribute('type');
    if (type === 'radio') return 'radio';
    if (type === 'checkbox') return 'checkbox';
    return 'text';
  }

  // role 기반 타입 결정
  if (role === 'listbox') return 'select';
  if (role === 'radiogroup') return 'radio';

  // 체크박스 그룹 감지: role="list"이고 내부에 checkbox가 있는 경우
  if (role === 'list') {
    const hasCheckbox = element.querySelector(SELECTORS.CHECKBOX_OPTION);
    if (hasCheckbox) return 'checkbox';
  }

  return 'text';
};

/**
 * 질문 컨테이너에서 레이블 추출
 */
const extractLabel = (container: Element): string => {
  // 1. role="heading" 요소에서 추출
  const heading = container.querySelector(SELECTORS.QUESTION_TITLE);
  if (heading?.textContent) {
    return heading.textContent.replace(/\*$/, '').trim();
  }

  // 2. data-params 속성에서 추출 시도
  const dataParams = container.getAttribute('data-params');
  if (dataParams) {
    try {
      // Google Forms의 data-params는 특수 형식이므로 텍스트 추출 시도
      const match = dataParams.match(/\["([^"]+)"/);
      if (match?.[1]) return match[1];
    } catch {
      // 파싱 실패 무시
    }
  }

  // 3. 첫 번째 span에서 추출
  const firstSpan = container.querySelector('span');
  if (firstSpan?.textContent) {
    return firstSpan.textContent.replace(/\*$/, '').trim();
  }

  return '';
};

/**
 * placeholder 추출
 */
const extractPlaceholder = (input: HTMLElement): string => {
  if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
    return input.placeholder || '';
  }
  return input.getAttribute('placeholder') || '';
};

/**
 * 필수 여부 확인
 */
const isRequired = (container: Element): boolean => {
  // aria-label로 확인
  const hasRequiredLabel =
    container.querySelector(SELECTORS.REQUIRED_MARKER) || container.querySelector(SELECTORS.REQUIRED_MARKER_EN);
  if (hasRequiredLabel) return true;

  // required 속성 확인
  const input = container.querySelector('input, textarea');
  if (input?.hasAttribute('required')) return true;

  // * 표시 확인
  const heading = container.querySelector(SELECTORS.QUESTION_TITLE);
  if (heading?.textContent?.includes('*')) return true;

  return false;
};

/**
 * 현재 값 추출
 */
const extractCurrentValue = (element: HTMLElement): string => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }

  // 라디오/체크박스의 경우 선택된 값 확인
  const checkedOption = element.querySelector('[aria-checked="true"]');
  if (checkedOption) {
    return checkedOption.textContent?.trim() || '';
  }

  return '';
};

/**
 * 입력 가능한 요소 찾기
 * - Google Forms의 실제 DOM 구조 기반으로 우선순위 결정
 */
const findInputElement = (container: Element): HTMLElement | null => {
  // 1. 라디오 그룹 (객관식 질문 - 단일 선택)
  const radioGroup = container.querySelector(SELECTORS.RADIO_GROUP);
  if (radioGroup) return radioGroup as HTMLElement;

  // 2. 드롭다운 (단일 선택)
  const dropdown = container.querySelector(SELECTORS.DROPDOWN);
  if (dropdown) return dropdown as HTMLElement;

  // 3. 체크박스 그룹 (다중 선택)
  // - role="list" 내에 checkbox가 있는 경우
  const lists = container.querySelectorAll(SELECTORS.CHECKBOX_GROUP);
  for (const list of Array.from(lists)) {
    const hasCheckbox = list.querySelector(SELECTORS.CHECKBOX_OPTION);
    if (hasCheckbox) return list as HTMLElement;
  }

  // 4. 텍스트 입력 필드
  const textSelectors = [
    SELECTORS.TEXT_INPUT,
    SELECTORS.EMAIL_INPUT,
    SELECTORS.URL_INPUT,
    SELECTORS.NUMBER_INPUT,
    SELECTORS.TEL_INPUT,
    SELECTORS.TEXTAREA,
  ];

  for (const selector of textSelectors) {
    const element = container.querySelector(selector);
    if (element) return element as HTMLElement;
  }

  return null;
};

/**
 * Google Forms 페이지에서 모든 폼 필드 파싱
 */
export const parseGoogleFormFields = (): ParsedFormField[] => {
  const fields: ParsedFormField[] = [];
  const containers = document.querySelectorAll(SELECTORS.QUESTION_CONTAINER);

  containers.forEach((container, index) => {
    const inputElement = findInputElement(container);
    if (!inputElement) return;

    const label = extractLabel(container);
    const placeholder = extractPlaceholder(inputElement);

    // 레이블이나 placeholder가 없으면 스킵
    if (!label && !placeholder) return;

    // 수식 감지 및 계산
    const mathExpression = label ? extractMathExpression(label) : null;
    const mathResult = mathExpression ? calculateExpression(mathExpression) : null;

    const field: ParsedFormField = {
      element: inputElement,
      label,
      placeholder,
      type: determineFieldType(inputElement),
      required: isRequired(container),
      currentValue: extractCurrentValue(inputElement),
      elementId: generateElementId(inputElement, index),
      mathExpression: mathExpression || undefined,
      mathResult: mathResult !== null ? mathResult : undefined,
    };

    fields.push(field);
  });

  return fields;
};

/**
 * 라디오/체크박스/드롭다운 옵션 파싱
 */
export interface FormOption {
  element: HTMLElement;
  text: string;
  selected: boolean;
}

/**
 * 옵션 요소에서 텍스트 추출
 * - Google Forms는 name 속성 또는 aria-label에 옵션 텍스트를 저장
 */
const extractOptionText = (element: HTMLElement): string => {
  // 1. name 속성에서 추출 (대부분의 경우)
  const name = element.getAttribute('name');
  if (name) return name.trim();

  // 2. aria-label에서 추출
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.trim();

  // 3. textContent에서 추출 (fallback)
  return element.textContent?.trim() || '';
};

/**
 * 폼 옵션 파싱 (라디오/체크박스/드롭다운)
 * - Google Forms의 실제 DOM 구조 기반
 */
export const parseFormOptions = (container: HTMLElement): FormOption[] => {
  const options: FormOption[] = [];
  const role = container.getAttribute('role');

  // 1. 드롭다운 옵션 (role="listbox")
  if (role === 'listbox') {
    const dropdownOptions = container.querySelectorAll(SELECTORS.DROPDOWN_OPTION);
    dropdownOptions.forEach(option => {
      const element = option as HTMLElement;
      const text = extractOptionText(element);

      // "선택" 같은 placeholder 옵션은 제외
      if (text && !isPlaceholderOption(text)) {
        options.push({
          element,
          text,
          selected: element.getAttribute('aria-selected') === 'true',
        });
      }
    });
    return options;
  }

  // 2. 라디오 옵션 (role="radiogroup")
  if (role === 'radiogroup') {
    const radioOptions = container.querySelectorAll(SELECTORS.RADIO_OPTION);
    radioOptions.forEach(option => {
      const element = option as HTMLElement;
      const text = extractOptionText(element);

      if (text) {
        options.push({
          element,
          text,
          selected: element.getAttribute('aria-checked') === 'true',
        });
      }
    });
    return options;
  }

  // 3. 체크박스 옵션 (role="list" 내 checkbox)
  if (role === 'list') {
    const checkboxOptions = container.querySelectorAll(SELECTORS.CHECKBOX_OPTION);
    checkboxOptions.forEach(option => {
      const element = option as HTMLElement;
      const text = extractOptionText(element);

      if (text) {
        options.push({
          element,
          text,
          selected: element.getAttribute('aria-checked') === 'true',
        });
      }
    });
    return options;
  }

  // 4. Fallback: 모든 라디오/체크박스 옵션 검색
  const radioOptions = container.querySelectorAll(SELECTORS.RADIO_OPTION);
  radioOptions.forEach(option => {
    const element = option as HTMLElement;
    const text = extractOptionText(element);
    if (text) {
      options.push({
        element,
        text,
        selected: element.getAttribute('aria-checked') === 'true',
      });
    }
  });

  const checkboxOptions = container.querySelectorAll(SELECTORS.CHECKBOX_OPTION);
  checkboxOptions.forEach(option => {
    const element = option as HTMLElement;
    const text = extractOptionText(element);
    if (text) {
      options.push({
        element,
        text,
        selected: element.getAttribute('aria-checked') === 'true',
      });
    }
  });

  return options;
};

/**
 * 플레이스홀더 옵션인지 확인
 * - 드롭다운의 "선택" 같은 기본값은 제외
 */
const isPlaceholderOption = (text: string): boolean => {
  const placeholders = ['선택', 'select', 'choose', '선택하세요', '-- 선택 --'];
  return placeholders.some(p => text.toLowerCase() === p.toLowerCase());
};

/**
 * 현재 페이지가 Google Forms인지 확인
 */
export const isGoogleFormsPage = (): boolean =>
  window.location.hostname === 'docs.google.com' && window.location.pathname.includes('/forms/');
