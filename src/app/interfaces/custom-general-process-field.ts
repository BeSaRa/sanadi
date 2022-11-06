import { ILabel } from './../models/general-process-template';
import { IKeyValue } from '@contracts/i-key-value';
import { FormlyFieldConfig } from '@ngx-formly/core/lib/components/formly.field.config';

export interface CustomGeneralProcessFieldConfig extends FormlyFieldConfig {
  label: ILabel,
  dateOptions?: {
    defaultValue?: 'now' | null,
    operator?: string | null,
    value?: string
  }
  selectOptions?: ISelectOption,
  mask?: string,
  mode?: FieldMode
}
export type FieldMode = 'init' | 'use'
export interface ISelectOption {
  defaultValue?: any,
  options?: IKeyValue[],
  loader?: string,
  loadFrom?: string,
  bindValue?: string,
  bindLabel?: string
}
