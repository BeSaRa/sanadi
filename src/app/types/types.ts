import {ILanguageKeys} from '../interfaces/i-language-keys';
import {Localization} from '../models/localization';

export type  LangType = Record<keyof ILanguageKeys, string>;
export type LocalizationMap = Record<keyof ILanguageKeys, Localization>;

export type customValidationTypes =
  'ENG_NUM'
  | 'AR_NUM'
  | 'ENG_ONLY'
  | 'AR_ONLY'
  | 'ENG_NUM_ONLY'
  | 'AR_NUM_ONLY'
  | 'ENG_AR_ONLY'
  | 'ENG_AR_NUM_ONLY'
  | 'PASSPORT'
  | 'EMAIL'
  | 'NUM_HYPHEN_COMMA';

export type searchFunctionType<T = any> = (text: string, model: T) => boolean;

export type CanNavigateOptions = 'ALLOW' | 'DISALLOW' | 'CONFIRM_UNSAVED_CHANGES';

export type BulkOperationTypes = 'DELETE' | 'UPDATE';

export type BulkResponseTypes = 'SUCCESS' | 'FAIL' | 'PARTIAL_SUCCESS' | 'NONE';

export type FilterEventTypes = 'OPEN' | 'CLEAR' | 'RESET';

export type ISearchFieldsMap<T = any> = { [key: string]: (string | searchFunctionType<T>) };

export type ReadinessStatus = 'READY' | 'NOT_READY';
