// =====================
// Form Filler - DOM 조작을 통한 폼 채우기
// =====================

import { POSITIVE_KEYWORDS } from './constants.js';
import { parseFormOptions } from './google-forms-parser.js';
import type { FormOption } from './google-forms-parser.js';
import type { ParsedFormField } from './types.js';

/**
 * 이벤트 발생 유틸리티
 * Google Forms는 React로 구성되어 있어 실제 이벤트 발생이 필요
 */
const dispatchInputEvents = (element: HTMLElement): void => {
  // focus
  element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

  // input 이벤트
  element.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
    }),
  );

  // change 이벤트
  element.dispatchEvent(new Event('change', { bubbles: true }));

  // blur
  element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
};

/**
 * 텍스트/textarea 필드 채우기
 */
const fillTextField = (element: HTMLElement, value: string): boolean => {
  try {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      // 기존 값이 있으면 스킵 (덮어쓰기 방지)
      if (element.value && element.value.trim()) {
        return false;
      }

      element.focus();
      element.value = value;
      dispatchInputEvents(element);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[NugulForm] Failed to fill text field:', error);
    return false;
  }
};

/**
 * 긍정 키워드 매칭 확인
 */
const isPositiveOption = (text: string): boolean => {
  const normalizedText = text.toLowerCase().trim();
  return POSITIVE_KEYWORDS.some(keyword => normalizedText.includes(keyword));
};

/**
 * 옵션에서 긍정 응답 찾기
 */
const findPositiveOption = (options: FormOption[]): FormOption | null =>
  options.find(option => isPositiveOption(option.text)) || null;

/**
 * 라디오/체크박스 옵션 클릭
 */
const clickOption = (element: HTMLElement): boolean => {
  try {
    // 이미 선택된 경우 스킵
    if (element.getAttribute('aria-checked') === 'true') {
      return false;
    }

    element.click();

    // 클릭 이벤트 발생
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    return true;
  } catch (error) {
    console.error('[NugulForm] Failed to click option:', error);
    return false;
  }
};

/**
 * 라디오/체크박스 필드 채우기
 * - 긍정 응답 자동 선택 옵션이 켜져있으면 긍정 응답 선택
 * - Fallback 옵션이 켜져있으면 첫 번째 옵션 선택
 */
export const fillSelectionField = (
  element: HTMLElement,
  options: {
    enablePositiveSelect: boolean;
    enableFallback: boolean;
  },
): boolean => {
  const formOptions = parseFormOptions(element);
  if (formOptions.length === 0) return false;

  // 이미 선택된 옵션이 있으면 스킵
  const hasSelected = formOptions.some(opt => opt.selected);
  if (hasSelected) return false;

  // 1. 긍정 응답 자동 선택
  if (options.enablePositiveSelect) {
    const positiveOption = findPositiveOption(formOptions);
    if (positiveOption) {
      return clickOption(positiveOption.element);
    }
  }

  // 2. Fallback: 첫 번째 옵션 선택
  if (options.enableFallback && formOptions.length > 0) {
    return clickOption(formOptions[0].element);
  }

  return false;
};

/**
 * 폼 필드 채우기 (메인 함수)
 */
export const fillFormField = (
  field: ParsedFormField,
  value: string,
  options: {
    enablePositiveSelect: boolean;
    enableFallback: boolean;
  },
): boolean => {
  switch (field.type) {
    case 'text':
    case 'textarea':
      return fillTextField(field.element, value);

    case 'radio':
    case 'checkbox':
      // 라디오/체크박스는 특별 처리
      // value가 있으면 해당 값과 매칭되는 옵션 선택, 없으면 긍정 응답 선택
      if (value) {
        const formOptions = parseFormOptions(field.element);
        const matchingOption = formOptions.find(
          opt =>
            opt.text.toLowerCase().includes(value.toLowerCase()) ||
            value.toLowerCase().includes(opt.text.toLowerCase()),
        );
        if (matchingOption) {
          return clickOption(matchingOption.element);
        }
      }
      return fillSelectionField(field.element, options);

    case 'select':
      // 드롭다운은 추후 구현
      return false;

    default:
      return false;
  }
};

/**
 * 특정 필드에 인라인 필 (미기입 필드에 직접 입력)
 */
export const inlineFillField = (elementId: string, value: string): boolean => {
  // elementId로 해당 필드 찾기
  const containers = document.querySelectorAll('[data-params]');

  for (let i = 0; i < containers.length; i++) {
    const container = containers[i];
    const dataParams = container.getAttribute('data-params');
    if (dataParams) {
      const match = dataParams.match(/\[\[(\d+)/);
      if (match && `field_${match[1]}` === elementId) {
        const input = container.querySelector('input, textarea') as HTMLElement;
        if (input) {
          return fillTextField(input, value);
        }
      }
    }
  }

  return false;
};
