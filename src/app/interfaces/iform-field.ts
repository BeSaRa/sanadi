import {ILanguageKeys} from './i-language-keys';

export interface IFormField {
  key: string,
  type?: string,
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
  }
}
