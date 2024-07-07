import { ILabel } from '../models/template-field';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Observable } from 'rxjs';

export type FieldMode = 'init' | 'use' | 'view';
export interface CustomFormlyFieldConfig extends FormlyFieldConfig {
  label?: ILabel,
  note?: string,
  dateOptions?: {
    defaultValue?: 'now' | null,
    operator?: string | null,
    value?: string
  }
  selectOptions?: ISelectOption,
  mask?: string,
  mode?: FieldMode
}
export interface ISelectOption {
  defaultValue?: any,
  options?: any[] | Observable<any[]>,
  loader?: string,
  loadFrom?: string,
  bindValue?: string,
  bindLabel?: string
}
