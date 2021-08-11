import {ILanguageKeys} from './i-language-keys';
import {Observable} from 'rxjs';
import {CriteriaFieldType} from "../helpers/FBuilder";

export interface IFormField {
  decorator?: boolean,
  key: string,
  type?: CriteriaFieldType,
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
    loadFrom?: string,
    bindValue?: string,
    bindLabel?: string
  },
  mask?: string
}
