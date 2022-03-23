import {ILanguageKeys} from './i-language-keys';
import {Observable} from 'rxjs';
import {DynamicFieldType} from "../helpers/FBuilder";

export interface IFormFieldOptions {
  decorator?: boolean,
  key: string,
  type?: DynamicFieldType,
  label: keyof ILanguageKeys,
  templateOptions?: {
    rows?: number,
    cols?: number
  },
  validations?: {
    required?: boolean,
    min?: number,
    max?: number,
    maxLength?: number,
    minLength?: number,
    pattern?: string
  },
  dateOptions?: {
    defaultValue?: 'now' | null,
    operator?: string | null,
    value?: string
  },
  selectOptions?: {
    defaultValue?: any,
    options?: any[] | Observable<any[]>,
    loader?: string,
    bindValue?: string,
    bindLabel?: string
  },
  mask?: string
}
