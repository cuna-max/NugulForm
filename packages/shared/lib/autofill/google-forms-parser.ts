// =====================
// Google Forms DOM Parser
// =====================

import type { ParsedFormField, FormFieldType } from './types.js';

/**
 * Google Forms 선택자 상수
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
  /** 체크박스 컨테이너 */
  CHECKBOX_GROUP: '[role="group"]',
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
 */
const determineFieldType = (element: HTMLElement): FormFieldType => {
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'textarea') return 'textarea';
  if (tagName === 'input') {
    const type = element.getAttribute('type');
    if (type === 'radio') return 'radio';
    if (type === 'checkbox') return 'checkbox';
    return 'text';
  }
  if (element.getAttribute('role') === 'listbox') return 'select';
  if (element.getAttribute('role') === 'radiogroup') return 'radio';
  if (element.getAttribute('role') === 'checkbox') return 'checkbox';

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
 */
const findInputElement = (container: Element): HTMLElement | null => {
  const selectors = [
    SELECTORS.TEXT_INPUT,
    SELECTORS.EMAIL_INPUT,
    SELECTORS.URL_INPUT,
    SELECTORS.NUMBER_INPUT,
    SELECTORS.TEL_INPUT,
    SELECTORS.TEXTAREA,
  ];

  for (const selector of selectors) {
    const element = container.querySelector(selector);
    if (element) return element as HTMLElement;
  }

  // 라디오/체크박스 그룹
  const radioGroup = container.querySelector(SELECTORS.RADIO_GROUP);
  if (radioGroup) return radioGroup as HTMLElement;

  const checkboxGroup = container.querySelector(SELECTORS.CHECKBOX_GROUP);
  if (checkboxGroup) return checkboxGroup as HTMLElement;

  // 드롭다운
  const dropdown = container.querySelector(SELECTORS.DROPDOWN);
  if (dropdown) return dropdown as HTMLElement;

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

    const field: ParsedFormField = {
      element: inputElement,
      label,
      placeholder,
      type: determineFieldType(inputElement),
      required: isRequired(container),
      currentValue: extractCurrentValue(inputElement),
      elementId: generateElementId(inputElement, index),
    };

    fields.push(field);
  });

  return fields;
};

/**
 * 라디오/체크박스 옵션 파싱
 */
export interface FormOption {
  element: HTMLElement;
  text: string;
  selected: boolean;
}

export const parseFormOptions = (container: HTMLElement): FormOption[] => {
  const options: FormOption[] = [];

  // 라디오 옵션
  const radioOptions = container.querySelectorAll(SELECTORS.RADIO_OPTION);
  radioOptions.forEach(option => {
    const element = option as HTMLElement;
    options.push({
      element,
      text: element.textContent?.trim() || '',
      selected: element.getAttribute('aria-checked') === 'true',
    });
  });

  // 체크박스 옵션
  const checkboxOptions = container.querySelectorAll(SELECTORS.CHECKBOX_OPTION);
  checkboxOptions.forEach(option => {
    const element = option as HTMLElement;
    options.push({
      element,
      text: element.textContent?.trim() || '',
      selected: element.getAttribute('aria-checked') === 'true',
    });
  });

  return options;
};

/**
 * 현재 페이지가 Google Forms인지 확인
 */
export const isGoogleFormsPage = (): boolean =>
  window.location.hostname === 'docs.google.com' && window.location.pathname.includes('/forms/');
