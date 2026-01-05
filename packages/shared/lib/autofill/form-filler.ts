// =====================
// Form Filler - DOM 조작을 통한 폼 채우기
// =====================

import { POSITIVE_KEYWORDS } from './constants.js';
import { parseFormOptions } from './google-forms-parser.js';
import { extractNumberFromOption, numberToKoreanVariants } from './math-solver.js';
import type { FormOption } from './google-forms-parser.js';
import type { ParsedFormField } from './types.js';

/**
 * 지정된 시간(ms) 동안 대기
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/** 드롭다운이 열리는데 필요한 대기 시간 (ms) */
const DROPDOWN_OPEN_DELAY_MS = 150;

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
 * 드롭다운 옵션 선택 (비동기)
 * - Google Forms의 드롭다운은 listbox/option 구조 사용
 * - 드롭다운을 먼저 열고, 옵션을 선택해야 함
 */
const selectDropdownOptionAsync = async (listbox: HTMLElement, optionElement: HTMLElement): Promise<boolean> => {
  try {
    // 이미 선택된 경우 스킵 (aria-selected)
    if (optionElement.getAttribute('aria-selected') === 'true') {
      return false;
    }

    // 1. 드롭다운 열기 (listbox 클릭)
    listbox.focus();
    listbox.click();

    // 2. 드롭다운이 열릴 때까지 대기
    await delay(DROPDOWN_OPEN_DELAY_MS);

    // 3. 옵션 선택
    optionElement.focus();
    optionElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    optionElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    optionElement.click();

    return true;
  } catch (error) {
    console.error('[NugulForm] Failed to select dropdown option:', error);
    return false;
  }
};

/**
 * 라디오/체크박스 필드 채우기 (비동기)
 * - 긍정 응답 자동 선택 옵션이 켜져있으면 긍정 응답 선택
 * - Fallback 옵션이 켜져있으면 첫 번째 옵션 선택
 */
export const fillSelectionFieldAsync = async (
  element: HTMLElement,
  options: {
    enablePositiveSelect: boolean;
    enableFallback: boolean;
  },
): Promise<boolean> => {
  const formOptions = parseFormOptions(element);
  if (formOptions.length === 0) return false;

  // 이미 선택된 옵션이 있으면 스킵
  const hasSelected = formOptions.some(opt => opt.selected);
  if (hasSelected) return false;

  // 드롭다운인지 확인
  const isDropdown = element.getAttribute('role') === 'listbox';

  // 1. 긍정 응답 자동 선택
  if (options.enablePositiveSelect) {
    const positiveOption = findPositiveOption(formOptions);
    if (positiveOption) {
      if (isDropdown) {
        return selectDropdownOptionAsync(element, positiveOption.element);
      }
      return clickOption(positiveOption.element);
    }
  }

  // 2. Fallback: 첫 번째 옵션 선택
  if (options.enableFallback && formOptions.length > 0) {
    if (isDropdown) {
      return selectDropdownOptionAsync(element, formOptions[0].element);
    }
    return clickOption(formOptions[0].element);
  }

  return false;
};

/**
 * 라디오/체크박스 필드 채우기 (동기 - 드롭다운이 아닌 경우만)
 * @deprecated 드롭다운 지원을 위해 fillSelectionFieldAsync 사용 권장
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

  // 드롭다운인 경우 비동기 함수 호출 (fire-and-forget)
  const isDropdown = element.getAttribute('role') === 'listbox';
  if (isDropdown) {
    // 비동기로 실행하고 true 반환 (실제 결과는 나중에 완료됨)
    void fillSelectionFieldAsync(element, options);
    return true;
  }

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
 * 드롭다운 필드 채우기 (비동기)
 * - 긍정 응답 자동 선택 또는 Fallback 선택
 */
export const fillDropdownFieldAsync = async (
  element: HTMLElement,
  options: {
    enablePositiveSelect: boolean;
    enableFallback: boolean;
  },
): Promise<boolean> => fillSelectionFieldAsync(element, options);

/**
 * 폼 필드 채우기 (비동기 - 메인 함수)
 */
export const fillFormFieldAsync = async (
  field: ParsedFormField,
  value: string,
  options: {
    enablePositiveSelect: boolean;
    enableFallback: boolean;
  },
): Promise<boolean> => {
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
      return fillSelectionFieldAsync(field.element, options);

    case 'select':
      // 드롭다운 처리
      // value가 있으면 해당 값과 매칭되는 옵션 선택, 없으면 긍정 응답/Fallback 선택
      if (value) {
        const formOptions = parseFormOptions(field.element);
        const matchingOption = formOptions.find(
          opt =>
            opt.text.toLowerCase().includes(value.toLowerCase()) ||
            value.toLowerCase().includes(opt.text.toLowerCase()),
        );
        if (matchingOption) {
          return selectDropdownOptionAsync(field.element, matchingOption.element);
        }
      }
      return fillDropdownFieldAsync(field.element, options);

    default:
      return false;
  }
};

/**
 * 폼 필드 채우기 (동기 - 호환성 유지)
 * @deprecated 드롭다운 지원을 위해 fillFormFieldAsync 사용 권장
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
      // 드롭다운은 비동기로 처리 (fire-and-forget)
      void fillFormFieldAsync(field, value, options);
      return true;

    default:
      return false;
  }
};

/**
 * 이메일 응답 수집 체크박스 자동 선택
 * - Google Forms의 이메일 수집 동의 체크박스를 자동으로 선택
 * - 자동 선택 옵션이 켜져있을 때 동작 (긍정 응답 또는 기본 응답)
 */
export const autoSelectEmailResponseCheckbox = (options: {
  enablePositiveSelect: boolean;
  enableFallback: boolean;
}): boolean => {
  if (!options.enablePositiveSelect && !options.enableFallback) return false;

  try {
    // Google Forms의 이메일 응답 수집 체크박스 찾기
    // 구조: role="checkbox" with aria-label containing "이메일" or "email"
    const checkboxes = document.querySelectorAll('[role="checkbox"]');

    for (const checkbox of Array.from(checkboxes)) {
      const element = checkbox as HTMLElement;
      const ariaLabel = element.getAttribute('aria-label') || '';
      const parentText = element.closest('[jscontroller]')?.textContent || '';

      // 이메일 응답 수집 체크박스 감지
      // - aria-label에 "이메일" 또는 "email" 포함
      // - 텍스트에 "응답" 또는 "response" 포함
      const isEmailCheckbox =
        (ariaLabel.toLowerCase().includes('email') || ariaLabel.includes('이메일')) &&
        (parentText.includes('응답') ||
          parentText.toLowerCase().includes('response') ||
          parentText.includes('기록') ||
          parentText.toLowerCase().includes('record'));

      if (isEmailCheckbox) {
        // 이미 선택된 경우 스킵
        if (element.getAttribute('aria-checked') === 'true') {
          return false;
        }

        // 체크박스 클릭
        element.click();
        element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('[NugulForm] Failed to auto-select email response checkbox:', error);
    return false;
  }
};

/**
 * 수식 답변 채우기 (비동기)
 * - 텍스트 필드: 계산 결과를 문자열로 입력
 * - 선택 필드 (radio/checkbox/select): 옵션에서 계산 결과와 일치하는 항목 선택
 */
export const fillMathAnswerAsync = async (
  field: ParsedFormField,
  options: {
    enableMathAutoAnswer: boolean;
  },
): Promise<boolean> => {
  // 옵션이 비활성화되어 있거나 수식 결과가 없으면 스킵
  if (!options.enableMathAutoAnswer || field.mathResult === undefined) {
    return false;
  }

  const result = field.mathResult;

  // 텍스트 필드: 숫자를 문자열로 입력
  if (field.type === 'text' || field.type === 'textarea') {
    return fillTextField(field.element, String(result));
  }

  // 선택 필드: 옵션에서 일치하는 항목 찾기
  if (field.type === 'radio' || field.type === 'checkbox' || field.type === 'select') {
    const formOptions = parseFormOptions(field.element);
    if (formOptions.length === 0) return false;

    // 이미 선택된 옵션이 있으면 스킵
    const hasSelected = formOptions.some(opt => opt.selected);
    if (hasSelected) return false;

    // 결과와 일치하는 옵션 찾기
    // 1. 정확한 숫자 매칭
    // 2. 한글 숫자 매칭
    const resultVariants = numberToKoreanVariants(result);

    for (const option of formOptions) {
      const optionNumber = extractNumberFromOption(option.text);

      // 숫자 추출 성공 시 비교
      if (optionNumber !== null && optionNumber === result) {
        // 드롭다운인지 확인
        const isDropdown = field.element.getAttribute('role') === 'listbox';
        if (isDropdown) {
          return selectDropdownOptionAsync(field.element, option.element);
        }
        return clickOption(option.element);
      }

      // 한글 매칭 (정확한 일치)
      const normalizedOptionText = option.text.trim();
      for (const variant of resultVariants) {
        if (normalizedOptionText === variant || normalizedOptionText.includes(variant)) {
          const isDropdown = field.element.getAttribute('role') === 'listbox';
          if (isDropdown) {
            return selectDropdownOptionAsync(field.element, option.element);
          }
          return clickOption(option.element);
        }
      }
    }

    return false;
  }

  return false;
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
