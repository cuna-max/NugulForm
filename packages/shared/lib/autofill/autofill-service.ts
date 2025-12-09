// =====================
// Autofill Service - 자동 채우기 핵심 서비스
// =====================

import { matchFormField } from './field-matcher.js';
import { fillFormField, fillSelectionField } from './form-filler.js';
import { parseGoogleFormFields, isGoogleFormsPage } from './google-forms-parser.js';
import { AUTO_OPTION_IDS } from '@extension/storage';
import type { AutofillExecuteOptions, AutofillExecuteResult, FieldFillResult, FieldMapping } from './types.js';
import type { UserField, AutoOption } from '@extension/storage';

/**
 * 옵션에서 특정 옵션 활성화 여부 확인
 */
const isOptionEnabled = (autoOptions: AutoOption[], optionId: string): boolean => {
  const option = autoOptions.find(opt => opt.id === optionId);
  return option?.enabled ?? false;
};

/**
 * 폼 필드와 사용자 필드 매핑 생성
 */
const createFieldMappings = (userFields: UserField[]): FieldMapping[] => {
  const parsedFields = parseGoogleFormFields();
  const mappings: FieldMapping[] = [];

  for (const formField of parsedFields) {
    const matchResult = matchFormField(formField);

    let userField: UserField | null = null;
    if (matchResult) {
      userField = userFields.find(f => f.id === matchResult.userFieldId) || null;
    }

    mappings.push({
      formField,
      userField,
      matchResult,
    });
  }

  return mappings;
};

/**
 * 자동 채우기 실행
 */
export const executeAutofill = (options: AutofillExecuteOptions): AutofillExecuteResult => {
  const { userFields, autoOptions } = options;

  // Google Forms 페이지가 아니면 빈 결과 반환
  if (!isGoogleFormsPage()) {
    return {
      filledCount: 0,
      missingFieldIds: [],
      fieldResults: [],
      filledFields: [],
    };
  }

  const enablePositiveSelect = isOptionEnabled(autoOptions, AUTO_OPTION_IDS.POSITIVE_AUTO_SELECT);
  const enableFallback = isOptionEnabled(autoOptions, AUTO_OPTION_IDS.FALLBACK_AUTO_SELECT);

  const mappings = createFieldMappings(userFields);
  const fieldResults: FieldFillResult[] = [];
  const missingFieldIds: string[] = [];
  const filledFields: Array<{
    fieldId: string;
    formLabel: string;
    fieldLabel: string;
    filledValue: string;
  }> = [];
  let filledCount = 0;

  // 각 필드 처리
  for (const mapping of mappings) {
    const { formField, userField, matchResult } = mapping;

    // 텍스트 필드: 매칭된 사용자 필드 값으로 채우기
    if (formField.type === 'text' || formField.type === 'textarea') {
      if (userField && userField.value) {
        const filled = fillFormField(formField, userField.value, {
          enablePositiveSelect,
          enableFallback,
        });

        fieldResults.push({
          formLabel: formField.label,
          userFieldId: userField.id,
          filled,
          filledValue: filled ? userField.value : '',
          failReason: filled ? undefined : 'Field already has value',
        });

        if (filled) {
          filledCount++;
          // 자동 기입된 필드 정보 추가
          filledFields.push({
            fieldId: userField.id,
            formLabel: formField.label,
            fieldLabel: userField.label,
            filledValue: userField.value,
          });
        } else if (matchResult) {
          // 매칭은 됐지만 채우기 실패 (기존 값 존재 등)
          missingFieldIds.push(userField.id);
        }
      } else if (matchResult && !userField?.value) {
        // 매칭됐지만 값이 없음
        if (matchResult) {
          missingFieldIds.push(matchResult.userFieldId);
        }
        fieldResults.push({
          formLabel: formField.label,
          userFieldId: matchResult?.userFieldId || null,
          filled: false,
          filledValue: '',
          failReason: 'No saved value for matched field',
        });
      } else {
        // 매칭 실패
        fieldResults.push({
          formLabel: formField.label,
          userFieldId: null,
          filled: false,
          filledValue: '',
          failReason: 'No matching user field found',
        });
      }
    }

    // 라디오/체크박스: 긍정 응답 또는 Fallback 선택
    if (formField.type === 'radio' || formField.type === 'checkbox') {
      const filled = fillSelectionField(formField.element, {
        enablePositiveSelect,
        enableFallback,
      });

      fieldResults.push({
        formLabel: formField.label,
        userFieldId: null,
        filled,
        filledValue: filled ? '[auto-selected]' : '',
        failReason: filled ? undefined : 'Selection skipped or failed',
      });

      if (filled) {
        filledCount++;
        // 라디오/체크박스는 userFieldId가 없지만, formLabel은 있음
        // 자동 선택된 필드로 표시 (userFieldId는 null로 처리)
      }
    }
  }

  // 값이 있는 userFields 중 매칭되지 않은 것들 추가
  const matchedUserFieldIds = new Set(mappings.filter(m => m.matchResult).map(m => m.matchResult!.userFieldId));

  for (const userField of userFields) {
    if (userField.value && !matchedUserFieldIds.has(userField.id)) {
      // 값은 있지만 폼에서 매칭되는 필드가 없음
      // missingFieldIds에는 추가하지 않음 (폼에 해당 필드가 없는 것)
    }
  }

  return {
    filledCount,
    missingFieldIds: [...new Set(missingFieldIds)], // 중복 제거
    fieldResults,
    filledFields,
  };
};

/**
 * 특정 필드에 인라인 필
 */
export { inlineFillField } from './form-filler.js';
