import {ILanguageKeys} from '../interfaces/i-language-keys';
import {Localization} from '../models/localization';
import {IAngularMyDpOptions} from 'angular-mydatepicker';
import {AbstractControl} from '@angular/forms';
import {ITabData} from '@app/interfaces/i-tab-data';

export type  LangType = Record<keyof ILanguageKeys, string>;
export type LocalizationMap = Record<keyof ILanguageKeys, Localization>;

export type customValidationTypes =
  'ENG_NUM'
  | 'AR_NUM'
  | 'ENG_ONLY'
  | 'AR_ONLY'
  | 'ENG_NUM_ONLY'
  | 'AR_NUM_ONLY'
  | 'ENG_NUM_ONE_ENG'
  | 'AR_NUM_ONE_AR'
  | 'ENG_AR_ONLY'
  | 'ENG_AR_NUM_ONLY'
  | 'PASSPORT'
  | 'EMAIL'
  | 'NUM_HYPHEN_COMMA'
  | 'PHONE_NUMBER';

export type searchFunctionType<T = any> = (text: string, model: T) => boolean;

export type CanNavigateOptions = 'ALLOW' | 'DISALLOW' | 'CONFIRM_UNSAVED_CHANGES';

export type BulkOperationTypes = 'DELETE' | 'UPDATE' | 'SAVE';

export type BulkResponseTypes = 'SUCCESS' | 'FAIL' | 'PARTIAL_SUCCESS' | 'NONE';

export type DeleteBulkResult<T = any> = { result: BulkResponseTypes, fails: T[], success: T[] };

export type FilterEventTypes = 'OPEN' | 'CLEAR' | 'RESET';

export type ISearchFieldsMap<T = any> = { [key: string]: (string | searchFunctionType<T>) };

export type ReadinessStatus = 'READY' | 'NOT_READY';

export type DatepickerOptionsMap = { [key: string]: IAngularMyDpOptions };

export type DatepickerControlsMap = { [key: string]: AbstractControl };
export type TabMap = { [key: string]: ITabData };


type info = 'Info';
type InfoProperty<T> = T extends `${infer S}${info}` ? T : never;
export type OnlyInfoProperty<T> = {
  [P in InfoProperty<keyof T>]: T[P]
}
