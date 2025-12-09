// =====================
// Autofill Module Exports
// =====================

// Types
export * from './types.js';

// Constants
export { FIELD_KEYWORDS, POSITIVE_KEYWORDS, FUSE_OPTIONS, MATCH_SCORE_THRESHOLDS } from './constants.js';

// Field Matcher
export { matchFormField, matchFormFields, resetFuseInstance } from './field-matcher.js';

// Google Forms Parser
export { parseGoogleFormFields, parseFormOptions, isGoogleFormsPage, type FormOption } from './google-forms-parser.js';

// Form Filler
export {
  fillFormField,
  fillFormFieldAsync,
  fillSelectionField,
  fillSelectionFieldAsync,
  inlineFillField,
} from './form-filler.js';

// Autofill Service
export { executeAutofill } from './autofill-service.js';
